import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const listThreads = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase.from("threads").select("*").eq("user_id", userId).order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ title: z.string().optional() }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase.from("threads").insert({ user_id: userId, title: data.title || "New conversation" }).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await context.supabase.from("threads").delete().eq("id", data.id).eq("user_id", userId);
    void supabase;
    return { ok: true };
  });

export const loadMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ threadId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: rows } = await supabase.from("messages").select("*").eq("thread_id", data.threadId).eq("user_id", userId).order("created_at");
    return (rows ?? []).map((r) => ({
      id: r.id,
      role: r.role as "user" | "assistant",
      parts: r.parts as Array<{ type: string; text?: string }>,
    }));
  });

export const saveMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    threadId: z.string().uuid(),
    messages: z.array(z.object({ role: z.string(), parts: z.any() })),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Replace strategy: delete then insert
    await supabase.from("messages").delete().eq("thread_id", data.threadId).eq("user_id", userId);
    if (data.messages.length) {
      await supabase.from("messages").insert(data.messages.map((m) => ({
        thread_id: data.threadId, user_id: userId, role: m.role, parts: m.parts,
      })));
    }
    await supabase.from("threads").update({ updated_at: new Date().toISOString() }).eq("id", data.threadId).eq("user_id", userId);
    return { ok: true };
  });

export const renameThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), title: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await supabase.from("threads").update({ title: data.title }).eq("id", data.id).eq("user_id", userId);
    return { ok: true };
  });

export const archiveThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), archived: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await supabase.from("threads").update({ archived: data.archived }).eq("id", data.id).eq("user_id", userId);
    return { ok: true };
  });
