import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

/**
 * Summarize a coaching thread into:
 *  - memory: what the coach "knows" (goal, current reality, obstacle, last commitment)
 *  - nextActions: concrete commitments to capture
 *  - recap: a short session recap (clarified[], nextFocus)
 *
 * Calls the AI gateway and returns strict JSON. Designed to be cheap and idempotent.
 */
export const generateInsights = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      threadId: z.string().uuid(),
      language: z.enum(["en", "fa", "ar"]).default("en"),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: msgs } = await supabase
      .from("messages")
      .select("role,parts")
      .eq("thread_id", data.threadId)
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    const transcript = (msgs ?? [])
      .map((m) => {
        const text = Array.isArray(m.parts)
          ? (m.parts as Array<{ type?: string; text?: string }>)
              .filter((p) => p?.type === "text" && typeof p.text === "string")
              .map((p) => p.text!)
              .join("")
          : "";
        return text.trim() ? `${m.role === "user" ? "USER" : "COACH"}: ${text.trim()}` : "";
      })
      .filter(Boolean)
      .join("\n\n")
      .slice(-12000);

    if (!transcript) {
      return {
        memory: { goal: "", currentReality: "", obstacle: "", lastCommitment: "" },
        nextActions: [] as string[],
        recap: { clarified: [] as string[], nextFocus: "" },
        clarity: { score: 5, trend: "same" as "up" | "same" | "down" },
        patterns: [] as string[],
        strengths: [] as string[],
        growthEdges: [] as string[],
        emotionalTone: "",
      };
    }

    const langName = data.language === "fa" ? "Persian (Farsi)" : data.language === "ar" ? "Arabic" : "English";
    const key = process.env.LOVABLE_API_KEY;
    if (!key) {
      return {
        memory: { goal: "", currentReality: "", obstacle: "", lastCommitment: "" },
        nextActions: [],
        recap: { clarified: [], nextFocus: "" },
        clarity: { score: 5, trend: "same" as "up" | "same" | "down" },
        patterns: [], strengths: [], growthEdges: [], emotionalTone: "",
        error: "AI gateway not configured",
      };
    }

    const system = `You are a master executive coaching analyst (ICF PCC level). Read the coaching transcript and extract a precise, useful structured summary in ${langName}.
Return STRICT JSON only — no prose, no markdown fences. Schema:
{
  "memory": {
    "goal": string,               // the user's outcome / what success looks like
    "currentReality": string,     // where they are now
    "obstacle": string,           // main blocker
    "lastCommitment": string      // the most recent thing the user committed to (or "")
  },
  "nextActions": string[],        // 2-5 short, concrete, verb-led actions for the user this week
  "recap": {
    "clarified": string[],        // 2-5 bullets of what got clarified so far
    "nextFocus": string           // one sentence: next coaching focus
  },
  "clarity": {
    "score": number,              // 1-10 integer — how clear is the user about their situation, goal and next step
    "trend": "up" | "same" | "down" // compared to the start of the conversation
  },
  "patterns": string[],           // 1-3 recurring behavioral or thinking patterns observed (e.g., "Defaults to action before exploring root cause")
  "strengths": string[],          // 1-3 leadership strengths visible in how the user shows up
  "growthEdges": string[],        // 1-3 specific growth edges worth coaching toward next
  "emotionalTone": string         // one short phrase describing the user's emotional state (e.g., "anxious but engaged", "frustrated, seeking clarity")
}
If something is unknown, return an empty string or empty array. Keep every string under 140 characters. Be specific and concrete — no generic platitudes.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "raw",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: `TRANSCRIPT:\n${transcript}` },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });

    if (!res.ok) {
      return {
        memory: { goal: "", currentReality: "", obstacle: "", lastCommitment: "" },
        nextActions: [],
        recap: { clarified: [], nextFocus: "" },
        clarity: { score: 5, trend: "same" as "up" | "same" | "down" },
        patterns: [], strengths: [], growthEdges: [], emotionalTone: "",
        error: `AI ${res.status}`,
      };
    }
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const raw = json.choices?.[0]?.message?.content ?? "{}";
    try {
      const parsed = JSON.parse(raw) as {
        memory?: { goal?: string; currentReality?: string; obstacle?: string; lastCommitment?: string };
        nextActions?: string[];
        recap?: { clarified?: string[]; nextFocus?: string };
        clarity?: { score?: number; trend?: string };
        patterns?: string[];
        strengths?: string[];
        growthEdges?: string[];
        emotionalTone?: string;
      };
      const score = Math.max(1, Math.min(10, Math.round(Number(parsed.clarity?.score ?? 5)) || 5));
      const trend: "up" | "same" | "down" =
        parsed.clarity?.trend === "up" || parsed.clarity?.trend === "down" ? parsed.clarity.trend : "same";

      // Persist clarity to the linked challenge (if any) — best-effort
      const { data: thread } = await supabase
        .from("threads")
        .select("challenge_id")
        .eq("id", data.threadId)
        .eq("user_id", userId)
        .maybeSingle();
      if (thread?.challenge_id) {
        await supabase
          .from("challenges")
          .update({ clarity_score: score, clarity_trend: trend })
          .eq("id", thread.challenge_id)
          .eq("user_id", userId);
      }

      const arr = (x: unknown, n: number) => (Array.isArray(x) ? (x as string[]).filter((s) => typeof s === "string" && s.trim()).slice(0, n) : []);
      return {
        memory: {
          goal: parsed.memory?.goal ?? "",
          currentReality: parsed.memory?.currentReality ?? "",
          obstacle: parsed.memory?.obstacle ?? "",
          lastCommitment: parsed.memory?.lastCommitment ?? "",
        },
        nextActions: arr(parsed.nextActions, 6),
        recap: {
          clarified: arr(parsed.recap?.clarified, 6),
          nextFocus: parsed.recap?.nextFocus ?? "",
        },
        clarity: { score, trend },
        patterns: arr(parsed.patterns, 3),
        strengths: arr(parsed.strengths, 3),
        growthEdges: arr(parsed.growthEdges, 3),
        emotionalTone: parsed.emotionalTone ?? "",
      };
    } catch {
      return {
        memory: { goal: "", currentReality: "", obstacle: "", lastCommitment: "" },
        nextActions: [],
        recap: { clarified: [], nextFocus: "" },
        clarity: { score: 5, trend: "same" as "up" | "same" | "down" },
        patterns: [], strengths: [], growthEdges: [], emotionalTone: "",
        error: "parse_failed",
      };
    }
  });

// Timeline events for challenges page
export const listTimeline = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: ch }, { data: thr }, { data: ai }, { data: ck }] = await Promise.all([
      supabase.from("challenges").select("id,title,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
      supabase.from("threads").select("id,title,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
      supabase.from("action_items").select("id,title,status,updated_at,created_at").eq("user_id", userId).order("updated_at", { ascending: false }).limit(30),
      supabase.from("accountability_checkins").select("id,status,note,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
    ]);

    type Ev = { id: string; kind: "challenge" | "session" | "commitment" | "completed" | "checkin"; date: string; label: string };
    const events: Ev[] = [];
    (ch ?? []).forEach((c) => events.push({ id: `c-${c.id}`, kind: "challenge", date: c.created_at, label: `Challenge created: ${c.title}` }));
    (thr ?? []).forEach((th) => events.push({ id: `t-${th.id}`, kind: "session", date: th.created_at, label: `Session started: ${th.title}` }));
    (ai ?? []).forEach((a) => {
      events.push({ id: `ai-${a.id}-c`, kind: "commitment", date: a.created_at, label: `Commitment saved: ${a.title}` });
      if (a.status === "done") events.push({ id: `ai-${a.id}-d`, kind: "completed", date: a.updated_at, label: `Action completed: ${a.title}` });
    });
    (ck ?? []).forEach((c) => events.push({ id: `ck-${c.id}`, kind: "checkin", date: c.created_at, label: `Check-in (${c.status})${c.note ? `: ${c.note}` : ""}` }));

    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return events.slice(0, 40);
  });
