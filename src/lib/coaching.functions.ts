import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// =============== Threads (extend) ===============
export const setThreadCoach = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ threadId: z.string().uuid(), coachId: z.string(), challengeId: z.string().uuid().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const upd: { coach_id: string; challenge_id?: string } = { coach_id: data.coachId };
    if (data.challengeId) upd.challenge_id = data.challengeId;
    await supabase.from("threads").update(upd).eq("id", data.threadId).eq("user_id", userId);
    return { ok: true };
  });

export const createCoachThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ coachId: z.string(), title: z.string().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("threads")
      .insert({ user_id: userId, coach_id: data.coachId, title: data.title || "New coaching session" })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const getThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ threadId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row } = await supabase.from("threads").select("*").eq("id", data.threadId).eq("user_id", userId).maybeSingle();
    return row;
  });

// =============== Challenges ===============
export const listChallenges = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase.from("challenges").select("*").eq("user_id", userId).order("updated_at", { ascending: false });
    return data ?? [];
  });

export const getChallenge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row } = await supabase.from("challenges").select("*").eq("id", data.id).eq("user_id", userId).maybeSingle();
    return row;
  });

export const updateChallenge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    id: z.string().uuid(),
    status: z.string().optional(),
    phase: z.string().optional(),
    progress: z.number().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { id, ...patch } = data;
    await supabase.from("challenges").update(patch).eq("id", id).eq("user_id", userId);
    return { ok: true };
  });

export const deleteChallenge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await supabase.from("challenges").delete().eq("id", data.id).eq("user_id", userId);
    return { ok: true };
  });

// =============== Action plans / items ===============
export const listActionPlans = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: plans } = await supabase.from("action_plans").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    const { data: items } = await supabase.from("action_items").select("*").eq("user_id", userId).order("priority");
    return { plans: plans ?? [], items: items ?? [] };
  });

export const updateActionItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), status: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await supabase.from("action_items").update({ status: data.status }).eq("id", data.id).eq("user_id", userId);
    return { ok: true };
  });

// =============== OKRs ===============
export const listOkrs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: okrs } = await supabase.from("okrs").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    const { data: krs } = await supabase.from("key_results").select("*").eq("user_id", userId);
    return { okrs: okrs ?? [], keyResults: krs ?? [] };
  });

export const updateKeyResult = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), current: z.number() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await supabase.from("key_results").update({ current: data.current, last_check_in: new Date().toISOString() }).eq("id", data.id).eq("user_id", userId);
    return { ok: true };
  });

export const createOkrManual = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    objective: z.string().min(1),
    quarter: z.string().optional(),
    keyResults: z.array(z.object({ name: z.string(), target: z.number(), unit: z.string().optional() })).min(1),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: okr, error } = await supabase.from("okrs").insert({ user_id: userId, objective: data.objective, quarter: data.quarter }).select().single();
    if (error) throw new Error(error.message);
    await supabase.from("key_results").insert(data.keyResults.map((kr) => ({
      user_id: userId, okr_id: okr.id, name: kr.name, target: kr.target, unit: kr.unit ?? "",
    })));
    return okr;
  });

// =============== Decisions ===============
export const listDecisions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase.from("decisions").select("*").eq("user_id", userId).order("updated_at", { ascending: false });
    return data ?? [];
  });

export const updateDecision = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), chosen_option: z.string().optional(), outcome: z.string().optional(), status: z.string().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { id, ...patch } = data;
    await supabase.from("decisions").update(patch).eq("id", id).eq("user_id", userId);
    return { ok: true };
  });

// =============== Risks ===============
export const listRisks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase.from("risks").select("*").eq("user_id", userId).order("updated_at", { ascending: false });
    return data ?? [];
  });

export const updateRisk = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), status: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await supabase.from("risks").update({ status: data.status }).eq("id", data.id).eq("user_id", userId);
    return { ok: true };
  });

// =============== Weekly reviews ===============
export const listReviews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase.from("weekly_reviews").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    return data ?? [];
  });

export const createReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    score: z.number().min(0).max(100),
    wins: z.array(z.string()).default([]),
    blockers: z.array(z.string()).default([]),
    next_priorities: z.array(z.string()).default([]),
    summary: z.string().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase.from("weekly_reviews").insert({ user_id: userId, ...data }).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

// =============== Board sessions ===============
export const listBoardSessions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase.from("board_sessions").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    return data ?? [];
  });

// =============== Dashboard aggregate ===============
export const getDashboardData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [chRes, okrRes, krRes, planRes, itemRes, decRes, riskRes, revRes, boardRes] = await Promise.all([
      supabase.from("challenges").select("*").eq("user_id", userId).order("updated_at", { ascending: false }).limit(20),
      supabase.from("okrs").select("*").eq("user_id", userId).limit(20),
      supabase.from("key_results").select("*").eq("user_id", userId),
      supabase.from("action_plans").select("*").eq("user_id", userId).limit(20),
      supabase.from("action_items").select("*").eq("user_id", userId),
      supabase.from("decisions").select("*").eq("user_id", userId).limit(20),
      supabase.from("risks").select("*").eq("user_id", userId).limit(20),
      supabase.from("weekly_reviews").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(12),
      supabase.from("board_sessions").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
    ]);
    return {
      challenges: chRes.data ?? [],
      okrs: okrRes.data ?? [],
      keyResults: krRes.data ?? [],
      plans: planRes.data ?? [],
      items: itemRes.data ?? [],
      decisions: decRes.data ?? [],
      risks: riskRes.data ?? [],
      reviews: revRes.data ?? [],
      boardSessions: boardRes.data ?? [],
    };
  });
