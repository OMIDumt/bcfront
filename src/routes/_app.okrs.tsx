import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listOkrs, updateKeyResult } from "@/lib/coaching.functions";
import { Target } from "lucide-react";

export const Route = createFileRoute("/_app/okrs")({
  head: () => ({ meta: [{ title: "OKRs — Morshed" }] }),
  component: OkrsPage,
});

function OkrsPage() {
  const qc = useQueryClient();
  const fn = useServerFn(listOkrs);
  const upd = useServerFn(updateKeyResult);
  const { data, isLoading } = useQuery({ queryKey: ["okrs"], queryFn: () => fn() });
  const m = useMutation({ mutationFn: (v: { id: string; current: number }) => upd({ data: v }), onSuccess: () => qc.invalidateQueries({ queryKey: ["okrs"] }) });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-widest text-gold-foreground font-bold">Objectives & Key Results</p>
        <h1 className="text-3xl font-bold mt-1 text-gold-gradient">OKRs</h1>
      </header>
      {isLoading ? <div className="text-muted-foreground">Loading…</div> : !data || data.okrs.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gold/40 p-12 text-center bg-gold/5">
          <Target className="size-10 text-gold-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Ask the OKR Coach to design your first objective.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.okrs.map((o) => {
            const krs = data.keyResults.filter((k) => k.okr_id === o.id);
            const progress = krs.length ? Math.round(krs.reduce((acc, k) => acc + Math.min(100, (Number(k.current) / Math.max(1, Number(k.target))) * 100), 0) / krs.length) : 0;
            return (
              <div key={o.id} className="bg-card border-2 border-gold/20 rounded-2xl p-5 shadow-elegant">
                <div className="flex items-start gap-4">
                  <div className="relative size-16 shrink-0">
                    <svg className="size-16 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15" stroke="hsl(var(--secondary))" strokeWidth="3" fill="none" />
                      <circle cx="18" cy="18" r="15" stroke="hsl(var(--gold))" strokeWidth="3" fill="none" strokeDasharray={`${progress * 0.9425} 100`} strokeLinecap="round" className="transition-all duration-700" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-deep">{progress}%</div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-deep">{o.objective}</h3>
                    {o.quarter && <span className="text-xs bg-gold/10 text-gold-foreground px-2 py-0.5 rounded-full font-semibold">{o.quarter}</span>}
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  {krs.map((kr) => {
                    const pct = Math.min(100, Math.round((Number(kr.current) / Math.max(1, Number(kr.target))) * 100));
                    return (
                      <div key={kr.id} className="bg-secondary/40 rounded-lg p-3">
                        <div className="flex justify-between items-center gap-2 text-sm">
                          <span className="font-medium flex-1">{kr.name}</span>
                          <input
                            type="number"
                            defaultValue={Number(kr.current)}
                            onBlur={(e) => { const v = Number(e.target.value); if (v !== Number(kr.current)) m.mutate({ id: kr.id, current: v }); }}
                            className="w-20 text-end bg-card border rounded px-2 py-1 text-xs font-semibold"
                          />
                          <span className="text-xs text-muted-foreground w-16 text-end">/ {kr.target} {kr.unit}</span>
                        </div>
                        <div className="h-2 bg-card rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-gradient-gold rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
