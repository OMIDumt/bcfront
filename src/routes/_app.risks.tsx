import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listRisks, updateRisk } from "@/lib/coaching.functions";
import { Shield } from "lucide-react";

export const Route = createFileRoute("/_app/risks")({
  head: () => ({ meta: [{ title: "Risks — Morshed" }] }),
  component: RisksPage,
});

const sev: Record<string, string> = { high: "bg-red-100 text-red-800", medium: "bg-amber-100 text-amber-800", low: "bg-emerald-100 text-emerald-800" };

function RisksPage() {
  const qc = useQueryClient();
  const fn = useServerFn(listRisks);
  const upd = useServerFn(updateRisk);
  const { data, isLoading } = useQuery({ queryKey: ["risks"], queryFn: () => fn() });
  const m = useMutation({ mutationFn: (v: { id: string; status: string }) => upd({ data: v }), onSuccess: () => qc.invalidateQueries({ queryKey: ["risks"] }) });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-widest text-gold-foreground font-bold">Risk Register</p>
        <h1 className="text-3xl font-bold mt-1 text-gold-gradient">Strategic Risks</h1>
      </header>
      {isLoading ? <div className="text-muted-foreground">Loading…</div> : !data || data.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gold/40 p-12 text-center bg-gold/5">
          <Shield className="size-10 text-gold-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No risks logged. Your coach will surface strategic risks during diagnosis.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((r) => (
            <div key={r.id} className="bg-card border rounded-2xl p-5">
              <div className="flex justify-between items-start gap-3 mb-2">
                <h3 className="font-bold text-deep flex-1">{r.title}</h3>
                <div className="flex gap-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${sev[r.likelihood] ?? sev.medium}`}>L: {r.likelihood}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${sev[r.impact] ?? sev.medium}`}>I: {r.impact}</span>
                </div>
              </div>
              {r.description && <p className="text-sm text-muted-foreground">{r.description}</p>}
              {r.mitigation && <div className="text-sm mt-2"><span className="font-semibold text-deep">Mitigation:</span> <span className="text-muted-foreground">{r.mitigation}</span></div>}
              <div className="flex gap-2 mt-3">
                {(["open", "monitoring", "mitigated", "closed"] as const).map((s) => (
                  <button key={s} onClick={() => m.mutate({ id: r.id, status: s })} className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize transition-colors ${r.status === s ? "bg-gold text-gold-foreground" : "bg-secondary text-muted-foreground hover:bg-gold/20"}`}>{s}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
