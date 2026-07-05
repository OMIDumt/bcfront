import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, tool, stepCountIs, type UIMessage } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { getCoach } from "@/lib/coaches";

export const Route = createFileRoute("https://web-production-8fe14.up.railway.app/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          messages?: UIMessage[];
          language?: string;
          coach?: string;
          name?: string;
          threadId?: string;
          challengeId?: string;
        };
        const messages = body.messages;
        if (!Array.isArray(messages)) return new Response("Messages required", { status: 400 });

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        // Server-side Supabase using bearer token from request (so RLS scopes writes to user)
        const supabaseUrl = process.env.SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY!;
        const authHeader = request.headers.get("authorization") ?? "";
        const supabase = createClient(supabaseUrl, supabaseKey, {
          global: { headers: { Authorization: authHeader } },
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;
        if (!userId) return new Response("Unauthorized", { status: 401 });

        const threadId = body.threadId;
        const challengeIdHint = body.challengeId;

        const provider = createOpenAICompatible({
          name: "lovable",
          baseURL: "https://ai.gateway.lovable.dev/v1",
          headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
        });
        const model = provider("google/gemini-3-flash-preview");

        const coach = getCoach(body.coach);
        const langName = body.language === "ar" ? "Arabic" : body.language === "fa" ? "Persian (Farsi)" : "English";
        const userName = body.name || "the executive";

        // Long-term memory: last 3 challenges + active OKRs + recent negative feedback
        const [{ data: pastCh }, { data: activeOkrs }, { data: negFeedback }] = await Promise.all([
          supabase.from("challenges").select("title,status,phase,urgency").eq("user_id", userId).order("updated_at", { ascending: false }).limit(3),
          supabase.from("okrs").select("objective,progress,status").eq("user_id", userId).eq("status", "active").limit(5),
          supabase.from("message_feedback").select("rating,comment").eq("user_id", userId).eq("rating", -1).order("created_at", { ascending: false }).limit(10),
        ]);
        const memory = [
          pastCh && pastCh.length ? `RECENT CHALLENGES:\n${pastCh.map((c) => `- ${c.title} (${c.phase}, ${c.urgency})`).join("\n")}` : "",
          activeOkrs && activeOkrs.length ? `ACTIVE OKRS:\n${activeOkrs.map((o) => `- ${o.objective} (${o.progress}%)`).join("\n")}` : "",
          negFeedback && negFeedback.length ? `USER FEEDBACK TO LEARN FROM (previous responses they disliked — avoid these patterns):\n${negFeedback.map((f) => `- ${f.comment || "(no comment, just disliked)"}`).join("\n")}` : "",
        ].filter(Boolean).join("\n\n");

        const system = `${coach.system}

USER CONTEXT:
- Name: ${userName}
- Response language: ${langName}
- Coach role: ${coach.name.en}

LONG-TERM MEMORY:
${memory || "(no prior history)"}

When you call tools, write what the user will see in your text response BEFORE the tool call (1-2 sentences of context), then call the tool. The tool output renders as a structured card in the UI.`;

        const result = streamText({
          model,
          system,
          stopWhen: stepCountIs(50),
          messages: await convertToModelMessages(messages),
          tools: {
            diagnose_challenge: tool({
              description: "Diagnose the user's challenge: primary, secondary issues, root causes, urgency, impact, risks. Call this on the FIRST user message in a new thread.",
              inputSchema: z.object({
                title: z.string().describe("Short title for the challenge (max 80 chars)"),
                primary_challenge: z.string(),
                secondary_challenges: z.array(z.string()).default([]),
                root_causes: z.array(z.string()).min(1),
                urgency: z.enum(["low", "medium", "high", "critical"]),
                impact: z.enum(["low", "medium", "high", "critical"]),
                strategic_risks: z.array(z.string()).default([]),
                executive_summary: z.string().describe("3-5 sentence executive summary"),
              }),
              execute: async (input) => {
                const { data, error } = await supabase.from("challenges").insert({
                  user_id: userId,
                  title: input.title,
                  description: input.primary_challenge,
                  urgency: input.urgency,
                  impact: input.impact,
                  root_causes: input.root_causes,
                  secondary_challenges: input.secondary_challenges,
                  executive_summary: input.executive_summary,
                  diagnosis: input,
                  phase: "diagnosis",
                  status: "active",
                }).select().single();
                if (error) return { ok: false, error: error.message };
                if (threadId) {
                  await supabase.from("threads").update({ challenge_id: data.id, phase: "diagnosis" }).eq("id", threadId).eq("user_id", userId);
                }
                return { ok: true, challenge_id: data.id, ...input };
              },
            }),

            create_action_plan: tool({
              description: "Create a 30/60/90-day action plan with specific items, owners, due dates. Use after diagnosis.",
              inputSchema: z.object({
                title: z.string(),
                challenge_id: z.string().uuid().optional(),
                items: z.array(z.object({
                  title: z.string(),
                  description: z.string().optional(),
                  horizon: z.enum(["30", "60", "90"]),
                  owner: z.string().optional(),
                  priority: z.number().min(1).max(5).default(3),
                })).min(1),
              }),
              execute: async (input) => {
                const cid = input.challenge_id || challengeIdHint;
                const { data: plan, error } = await supabase.from("action_plans").insert({
                  user_id: userId, title: input.title, challenge_id: cid ?? null,
                }).select().single();
                if (error) return { ok: false, error: error.message };
                const itemsRows = input.items.map((it) => ({
                  user_id: userId, plan_id: plan.id, title: it.title, description: it.description,
                  horizon: it.horizon, owner: it.owner, priority: it.priority, status: "todo",
                }));
                const { data: items } = await supabase.from("action_items").insert(itemsRows).select();
                if (cid) await supabase.from("challenges").update({ phase: "action_plan" }).eq("id", cid).eq("user_id", userId);
                if (threadId) await supabase.from("threads").update({ phase: "action_plan" }).eq("id", threadId).eq("user_id", userId);
                return { ok: true, plan_id: plan.id, title: input.title, items: items ?? [] };
              },
            }),

            create_okrs: tool({
              description: "Create an objective with 3 measurable key results.",
              inputSchema: z.object({
                objective: z.string(),
                quarter: z.string().optional(),
                key_results: z.array(z.object({
                  name: z.string(),
                  target: z.number(),
                  current: z.number().default(0),
                  unit: z.string().default(""),
                })).min(1).max(5),
                challenge_id: z.string().uuid().optional(),
              }),
              execute: async (input) => {
                const cid = input.challenge_id || challengeIdHint;
                const { data: okr, error } = await supabase.from("okrs").insert({
                  user_id: userId, objective: input.objective, quarter: input.quarter, challenge_id: cid ?? null,
                }).select().single();
                if (error) return { ok: false, error: error.message };
                const { data: krs } = await supabase.from("key_results").insert(input.key_results.map((kr) => ({
                  user_id: userId, okr_id: okr.id, name: kr.name, target: kr.target, current: kr.current, unit: kr.unit,
                }))).select();
                return { ok: true, okr_id: okr.id, objective: input.objective, quarter: input.quarter, key_results: krs ?? [] };
              },
            }),

            decision_analysis: tool({
              description: "Run a structured decision analysis: options, criteria, scores, recommendation.",
              inputSchema: z.object({
                title: z.string(),
                context: z.string().optional(),
                options: z.array(z.object({
                  name: z.string(),
                  pros: z.array(z.string()).default([]),
                  cons: z.array(z.string()).default([]),
                  score: z.number().min(0).max(10).optional(),
                })).min(2),
                criteria: z.array(z.string()).default([]),
                recommendation: z.string(),
                challenge_id: z.string().uuid().optional(),
              }),
              execute: async (input) => {
                const cid = input.challenge_id || challengeIdHint;
                const { data, error } = await supabase.from("decisions").insert({
                  user_id: userId, title: input.title, context: input.context, options: input.options,
                  criteria: input.criteria, recommendation: input.recommendation, challenge_id: cid ?? null, status: "pending",
                }).select().single();
                if (error) return { ok: false, error: error.message };
                return { ok: true, decision_id: data.id, ...input };
              },
            }),

            risk_assessment: tool({
              description: "Log a strategic risk with likelihood, impact, and mitigation.",
              inputSchema: z.object({
                risks: z.array(z.object({
                  title: z.string(),
                  description: z.string().optional(),
                  likelihood: z.enum(["low", "medium", "high"]),
                  impact: z.enum(["low", "medium", "high"]),
                  mitigation: z.string(),
                })).min(1),
                challenge_id: z.string().uuid().optional(),
              }),
              execute: async (input) => {
                const cid = input.challenge_id || challengeIdHint;
                const rows = input.risks.map((r) => ({
                  user_id: userId, ...r, challenge_id: cid ?? null, status: "open",
                }));
                const { data, error } = await supabase.from("risks").insert(rows).select();
                if (error) return { ok: false, error: error.message };
                return { ok: true, risks: data ?? [] };
              },
            }),

            weekly_review: tool({
              description: "Capture a weekly executive review with score, wins, blockers, next priorities.",
              inputSchema: z.object({
                score: z.number().min(0).max(100),
                wins: z.array(z.string()).default([]),
                blockers: z.array(z.string()).default([]),
                next_priorities: z.array(z.string()).default([]),
                summary: z.string().optional(),
              }),
              execute: async (input) => {
                const { data, error } = await supabase.from("weekly_reviews").insert({
                  user_id: userId, ...input,
                }).select().single();
                if (error) return { ok: false, error: error.message };
                return { ok: true, review_id: data.id, ...input };
              },
            }),

            board_consensus: tool({
              description: "Produce AI Board of Advisors output: 7 perspectives + consensus + top recommendation + risks + immediate actions.",
              inputSchema: z.object({
                topic: z.string(),
                perspectives: z.array(z.object({
                  persona: z.enum(["CEO", "CFO", "COO", "Investor", "Strategy Consultant", "Sales Director", "HR Leader"]),
                  view: z.string(),
                })).length(7),
                consensus: z.string(),
                top_recommendation: z.string(),
                major_risks: z.array(z.string()).default([]),
                immediate_actions: z.array(z.string()).default([]),
                challenge_id: z.string().uuid().optional(),
              }),
              execute: async (input) => {
                const cid = input.challenge_id || challengeIdHint;
                const { data, error } = await supabase.from("board_sessions").insert({
                  user_id: userId, topic: input.topic, perspectives: input.perspectives,
                  consensus: input.consensus, top_recommendation: input.top_recommendation,
                  major_risks: input.major_risks, immediate_actions: input.immediate_actions,
                  challenge_id: cid ?? null,
                }).select().single();
                if (error) return { ok: false, error: error.message };
                return { ok: true, session_id: data.id, ...input };
              },
            }),
          },
        });

        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});
