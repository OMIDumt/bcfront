import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const listFeedback = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ threadId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: rows } = await supabase
      .from("message_feedback")
      .select("message_id,rating,comment")
      .eq("user_id", userId)
      .eq("thread_id", data.threadId);
    return rows ?? [];
  });

export const setFeedback = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    threadId: z.string().uuid(),
    messageId: z.string().min(1).max(200),
    rating: z.union([z.literal(-1), z.literal(1)]),
    comment: z.string().max(2000).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await supabase.from("message_feedback").upsert({
      user_id: userId,
      thread_id: data.threadId,
      message_id: data.messageId,
      rating: data.rating,
      comment: data.comment ?? null,
    }, { onConflict: "user_id,message_id" });
    return { ok: true };
  });

export const clearFeedback = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ messageId: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await supabase.from("message_feedback").delete().eq("user_id", userId).eq("message_id", data.messageId);
    return { ok: true };
  });
