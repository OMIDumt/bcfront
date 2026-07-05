import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { listChallenges, deleteChallenge } from "@/lib/coaching.functions";
import { listTimeline } from "@/lib/insights.functions";
import { AlertTriangle, Flag, MessageSquare, ListChecks, CheckCircle2, ClipboardCheck, Trash2, ChevronDown, type LucideIcon } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/challenges")({
  head: () => ({ meta: [{ title: "Challenges — Morshed" }] }),
  component: ChallengesPage,
});

const urgencyColor: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-300",
  high: "bg-orange-100 text-orange-800 border-orange-300",
  medium: "bg-amber-100 text-amber-800 border-amber-300",
  low: "bg-emerald-100 text-emerald-800 border-emerald-300",
};

const kindMeta: Record<string, { Icon: LucideIcon; color: string }> = {
  challenge:  { Icon: Flag,            color: "text-amber-600 bg-amber-100 border-amber-300" },
  session:    { Icon: MessageSquare,   color: "text-blue-600  bg-blue-100  border-blue-300" },
  commitment: { Icon: ListChecks,      color: "text-violet-600 bg-violet-100 border-violet-300" },
  completed:  { Icon: CheckCircle2,    color: "text-emerald-600 bg-emerald-100 border-emerald-300" },
  checkin:    { Icon: ClipboardCheck,  color: "text-deep bg-gold/15 border-gold/40" },
};

function ChallengesPage() {
  const fn = useServerFn(listChallenges);
  const tlFn = useServerFn(listTimeline);
  const delFn = useServerFn(deleteChallenge);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["challenges"], queryFn: () => fn() });
  const { data: timeline } = useQuery({ queryKey: ["challenge-timeline"], queryFn: () => tlFn() });

  const [expanded, setExpanded] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<string | null>(null);

  const deleteM = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["challenges"] }); qc.invalidateQueries({ queryKey: ["challenge-timeline"] }); toast.success("Challenge deleted"); },
    onError: () => toast.error("Could not delete challenge"),
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-widest text-gold-foreground font-bold">Diagnosed</p>
        <h1 className="text-3xl font-bold mt-1 text-gold-gradient">Strategic Challenges</h1>
      </header>
      {isLoading ? <div className="text-muted-foreground">Loading…</div> : !data || data.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gold/40 p-12 text-center bg-gold/5">
          <AlertTriangle className="size-10 text-gold-foreground mx-auto mb-3" />
          <h3 className="font-bold text-deep">No challenges yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Start a coaching session — your coach will diagnose your first challenge automatically.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {data.map((c) => {
            const isOpen = expanded === c.id;
            const c2 = c as typeof c & { root_cause?: string | null; desired_outcome?: string | null; success_metric?: string | null; stakeholders?: string[] | null; constraints?: string[] | null };
            return (
              <div key={c.id} className={`bg-card border rounded-2xl p-5 transition-all ${isOpen ? "shadow-elegant border-gold/40" : "hover:shadow-elegant"}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <button onClick={() => setExpanded(isOpen ? null : c.id)} className="font-bold text-deep flex-1 text-start hover:text-gold-foreground transition-colors flex items-start gap-2">
                    <ChevronDown className={`size-4 mt-0.5 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    <span>{c.title}</span>
                  </button>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border shrink-0 ${urgencyColor[c.urgency ?? "medium"] ?? urgencyColor.medium}`}>{c.urgency}</span>
                  <button
                    onClick={() => setToDelete(c.id)}
                    className="p-1.5 -m-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                    title="Delete challenge"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                {c.executive_summary && <p className={`text-sm text-muted-foreground ${isOpen ? "" : "line-clamp-3"}`}>{c.executive_summary}</p>}

                {isOpen && (
                  <div className="mt-4 space-y-3 animate-fade-up">
                    {c2.root_cause && (
                      <div className="rounded-xl bg-rose-50 border border-rose-200 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700 mb-1">Root cause</p>
                        <p className="text-sm text-rose-900">{c2.root_cause}</p>
                      </div>
                    )}
                    {c2.desired_outcome && (
                      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1">Desired outcome</p>
                        <p className="text-sm text-emerald-900">{c2.desired_outcome}</p>
                      </div>
                    )}
                    {c2.success_metric && (
                      <div className="rounded-xl bg-blue-50 border border-blue-200 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700 mb-1">Success metric</p>
                        <p className="text-sm text-blue-900">{c2.success_metric}</p>
                      </div>
                    )}
                    {Array.isArray(c2.stakeholders) && c2.stakeholders.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Stakeholders</p>
                        <div className="flex flex-wrap gap-1.5">
                          {c2.stakeholders.map((s, i) => <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 border border-violet-200">{s}</span>)}
                        </div>
                      </div>
                    )}
                    {Array.isArray(c2.constraints) && c2.constraints.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Constraints</p>
                        <ul className="text-sm text-foreground space-y-1">
                          {c2.constraints.map((s, i) => <li key={i} className="flex gap-2"><span className="text-gold-foreground">•</span>{s}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs mt-3">
                  <span className="text-muted-foreground capitalize">Phase: <span className="font-semibold text-deep">{c.phase}</span></span>
                  <span className="text-gold-foreground font-bold">{c.progress}%</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-gradient-gold rounded-full transition-all" style={{ width: `${c.progress}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this challenge?</AlertDialogTitle>
            <AlertDialogDescription>This permanently removes the challenge and its diagnosis. Action plans and timeline events stay intact.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (toDelete) { deleteM.mutate(toDelete); setToDelete(null); } }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Timeline */}
      {timeline && timeline.length > 0 && (
        <section className="mt-12">
          <header className="mb-4">
            <p className="text-xs uppercase tracking-widest text-gold-foreground font-bold">Recent activity</p>
            <h2 className="text-2xl font-bold mt-1 text-deep">Challenge Timeline</h2>
          </header>
          <div className="bg-card border rounded-2xl p-6">
            <ol className="relative space-y-5 ms-3 border-s border-gold/30 ps-6">
              {timeline.map((ev) => {
                const meta = kindMeta[ev.kind] ?? kindMeta.session;
                const I = meta.Icon;
                const dt = new Date(ev.date);
                return (
                  <li key={ev.id} className="relative">
                    <span className={`absolute -start-[34px] flex size-7 items-center justify-center rounded-full border ${meta.color}`}>
                      <I className="size-3.5" />
                    </span>
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm text-foreground leading-snug">{ev.label}</p>
                      <time className="text-xs text-muted-foreground shrink-0" dateTime={ev.date}>
                        {dt.toLocaleDateString()} · {dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </time>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      )}
    </div>
  );
}
