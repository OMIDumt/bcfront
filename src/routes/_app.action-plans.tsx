import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listActionPlans, updateActionItem } from "@/lib/coaching.functions";
import { CheckCircle2, Circle, Loader2, ListChecks } from "lucide-react";

export const Route = createFileRoute("/_app/action-plans")({
  head: () => ({ meta: [{ title: "Action Plans — Morshed" }] }),
  component: PlansPage,
});

const STATUS_FLOW = ["todo", "in_progress", "done"] as const;

function PlansPage() {
  const qc = useQueryClient();
  const fn = useServerFn(listActionPlans);
  const upd = useServerFn(updateActionItem);
  const { data, isLoading } = useQuery({ queryKey: ["plans"], queryFn: () => fn() });
  const m = useMutation({ mutationFn: (v: { id: string; status: string }) => upd({ data: v }), onSuccess: () => qc.invalidateQueries({ queryKey: ["plans"] }) });

  const cycle = (s: string) => {
    const i = STATUS_FLOW.indexOf(s as typeof STATUS_FLOW[number]);
    return STATUS_FLOW[(i + 1) % STATUS_FLOW.length];
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-widest text-gold-foreground font-bold">Execution</p>
        <h1 className="text-3xl font-bold mt-1 text-gold-gradient">30 · 60 · 90 Action Plans</h1>
      </header>
      {isLoading ? <div className="text-muted-foreground">Loading…</div> : !data || data.plans.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gold/40 p-12 text-center bg-gold/5">
          <ListChecks className="size-10 text-gold-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Your coach will build your first 30/60/90 plan during the action-plan phase.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {data.plans.map((plan) => {
            const items = data.items.filter((i) => i.plan_id === plan.id);
            const grouped: Record<string, typeof items> = { "30": [], "60": [], "90": [] };
            items.forEach((it) => { (grouped[it.horizon] ?? grouped["30"]).push(it); });
            return (
              <div key={plan.id} className="bg-card border-2 border-gold/20 rounded-2xl p-5 shadow-elegant">
                <h3 className="font-bold text-deep text-lg mb-4">{plan.title}</h3>
                <div className="grid lg:grid-cols-3 gap-4">
                  {(["30", "60", "90"] as const).map((h) => (
                    <div key={h} className="bg-secondary/30 rounded-xl p-3">
                      <div className="text-xs font-bold uppercase tracking-widest text-gold-foreground mb-2">{h} days</div>
                      <div className="space-y-2">
                        {grouped[h].length === 0 && <div className="text-xs text-muted-foreground italic">No items</div>}
                        {grouped[h].map((it) => (
                          <div key={it.id} className="bg-card rounded-lg p-2 flex items-start gap-2 border">
                            <button onClick={() => m.mutate({ id: it.id, status: cycle(it.status) })} className="mt-0.5 shrink-0">
                              {it.status === "done" ? <CheckCircle2 className="size-4 text-emerald-600" /> :
                                it.status === "in_progress" ? <Loader2 className="size-4 text-amber-600 animate-spin" /> :
                                <Circle className="size-4 text-muted-foreground" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm font-medium ${it.status === "done" ? "line-through text-muted-foreground" : "text-deep"}`}>{it.title}</div>
                              {it.owner && <div className="text-[10px] text-muted-foreground">Owner: {it.owner}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
