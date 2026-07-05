import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listBoardSessions } from "@/lib/coaching.functions";
import { Users } from "lucide-react";

export const Route = createFileRoute("/_app/board")({
  head: () => ({ meta: [{ title: "AI Board — Morshed" }] }),
  component: BoardPage,
});

function BoardPage() {
  const fn = useServerFn(listBoardSessions);
  const { data, isLoading } = useQuery({ queryKey: ["board"], queryFn: () => fn() });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-widest text-gold-foreground font-bold">7 Perspectives · 1 Consensus</p>
        <h1 className="text-3xl font-bold mt-1 text-gold-gradient">AI Board of Advisors</h1>
      </header>
      {isLoading ? <div className="text-muted-foreground">Loading…</div> : !data || data.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gold/40 p-12 text-center bg-gold/5">
          <Users className="size-10 text-gold-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Start a session with the AI Board coach to convene your virtual advisors.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((s) => (
            <div key={s.id} className="bg-card border-2 border-gold/30 rounded-2xl p-5 shadow-elegant">
              <h3 className="font-bold text-deep text-lg mb-2">{s.topic}</h3>
              <div className="bg-gradient-to-r from-gold/15 to-amber-100/30 rounded-xl p-3 border border-gold/30 mb-3">
                <div className="text-[10px] font-bold uppercase text-deep mb-1">Consensus</div>
                <div className="text-sm text-deep">{s.consensus}</div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <div className="text-[10px] font-bold uppercase text-emerald-800 mb-1">Top Recommendation</div>
                <div className="text-sm">{s.top_recommendation}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
