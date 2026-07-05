import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listDecisions } from "@/lib/coaching.functions";
import { Brain } from "lucide-react";

export const Route = createFileRoute("/_app/decisions")({
  head: () => ({ meta: [{ title: "Decisions — Morshed" }] }),
  component: DecisionsPage,
});

function DecisionsPage() {
  const fn = useServerFn(listDecisions);
  const { data, isLoading } = useQuery({ queryKey: ["decisions"], queryFn: () => fn() });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-widest text-gold-foreground font-bold">High-Stakes</p>
        <h1 className="text-3xl font-bold mt-1 text-gold-gradient">Decision Tracker</h1>
      </header>
      {isLoading ? <div className="text-muted-foreground">Loading…</div> : !data || data.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gold/40 p-12 text-center bg-gold/5">
          <Brain className="size-10 text-gold-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Ask the Decision Coach to analyze your next big decision.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((d) => (
            <div key={d.id} className="bg-card border rounded-2xl p-5">
              <div className="flex justify-between items-start gap-3">
                <h3 className="font-bold text-deep">{d.title}</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 font-semibold capitalize">{d.status}</span>
              </div>
              {d.context && <p className="text-sm text-muted-foreground mt-1">{d.context}</p>}
              {d.recommendation && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 mt-3">
                  <div className="text-[10px] font-bold uppercase text-indigo-900 mb-1">Recommendation</div>
                  <div className="text-sm text-deep">{d.recommendation}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
