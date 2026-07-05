import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

// Public, no-auth demo chat endpoint. Limited turns & no memory.
export const Route = createFileRoute("/api/public/demo-chat")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }),
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          messages?: UIMessage[];
          language?: string;
        };
        const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : null;
        if (!messages) return new Response("Messages required", { status: 400 });

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const provider = createOpenAICompatible({
          name: "lovable",
          baseURL: "https://ai.gateway.lovable.dev/v1",
          headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
        });
        const model = provider("google/gemini-2.5-flash");

        const langName =
          body.language === "ar" ? "Arabic" : body.language === "fa" ? "Persian (Farsi)" : "English";

        const system = `You are Morshed — a premium AI Executive Coach demo for CEOs, founders, and senior managers.

This is a FREE no-signup demo session. The user has not created an account.

Style:
- Respond in ${langName}.
- Warm, direct, ICF-aligned coaching. Ask one sharp question, then offer 2–3 concrete actions.
- Keep replies under ~180 words.
- After 3–4 exchanges, gently invite them to create a free account to unlock personalized memory, OKRs, KPIs, action plans, and accountability tracking.

Never claim to remember past sessions — this demo has no memory.`;

        const result = streamText({
          model,
          system,
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({
          headers: { "Access-Control-Allow-Origin": "*" },
        });
      },
    },
  },
});
