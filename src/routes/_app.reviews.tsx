import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listReviews } from "@/lib/coaching.functions";
import { CalendarCheck } from "lucide-react";

export const Route = createFileRoute("/_app/reviews")({
  head: () => ({ meta: [{ title: "Weekly Reviews — Morshed" }] }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const fn = useServerFn(listReviews);
  const { data, isLoading } = useQuery({ queryKey: ["reviews"], queryFn: () => fn() });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-widest text-gold-foreground font-bold">Cadence</p>
        <h1 className="text-3xl font-bold mt-1 text-gold-gradient">Weekly Executive Reviews</h1>
      </header>
      {isLoading ? <div className="text-muted-foreground">Loading…</div> : !data || data.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gold/40 p-12 text-center bg-gold/5">
          <CalendarCheck className="size-10 text-gold-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Run a weekly review in chat to start tracking your accountability streak.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((r) => (
            <div key={r.id} className="bg-card border rounded-2xl p-5 grid sm:grid-cols-[auto_1fr] gap-4">
              <div className="size-20 rounded-full bg-gradient-gold flex flex-col items-center justify-center font-bold text-deep shadow-gold-glow shrink-0">
                <span className="text-2xl leading-none">{r.score}</span>
                <span className="text-[9px] uppercase tracking-wider opacity-70">score</span>
              </div>
              <div className="text-sm space-y-2">
                <div className="text-xs text-muted-foreground">Week of {new Date(r.week_start).toLocaleDateString()}</div>
                {Array.isArray(r.wins) && r.wins.length > 0 && <div><span className="text-[10px] font-bold uppercase text-emerald-700">Wins · </span>{(r.wins as string[]).join(" · ")}</div>}
                {Array.isArray(r.blockers) && r.blockers.length > 0 && <div><span className="text-[10px] font-bold uppercase text-red-700">Blockers · </span>{(r.blockers as string[]).join(" · ")}</div>}
                {Array.isArray(r.next_priorities) && r.next_priorities.length > 0 && <div><span className="text-[10px] font-bold uppercase text-blue-700">Next · </span>{(r.next_priorities as string[]).join(" · ")}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
