import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDashboardData } from "@/lib/coaching.functions";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { MessageCircle, Target, AlertTriangle, Shield, Brain, CalendarCheck, ListChecks, TrendingUp, Sparkles, Flame } from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Executive OS — Morshed" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { t } = useI18n();
  const { user } = useAuth();
  const name = user?.email?.split("@")[0] || "leader";

  const fn = useServerFn(getDashboardData);
  const { data } = useQuery({ queryKey: ["dashboard"], queryFn: () => fn() });

  const activeChallenges = (data?.challenges ?? []).filter((c) => c.status === "active");
  const closedChallenges = (data?.challenges ?? []).filter((c) => c.status !== "active");
  const openRisks = (data?.risks ?? []).filter((r) => r.status !== "closed" && r.status !== "mitigated");
  const pendingDecisions = (data?.decisions ?? []).filter((d) => d.status === "pending");
  const lastReview = data?.reviews?.[0];
  const items = data?.items ?? [];
  const done = items.filter((i) => i.status === "done").length;
  const itemsPct = items.length ? Math.round((done / items.length) * 100) : 0;
  const okrAvg = (() => {
    const okrs = data?.okrs ?? [];
    const krs = data?.keyResults ?? [];
    if (!okrs.length) return 0;
    const perOkr = okrs.map((o) => {
      const k = krs.filter((x) => x.okr_id === o.id);
      if (!k.length) return 0;
      return k.reduce((a, b) => a + Math.min(100, (Number(b.current) / Math.max(1, Number(b.target))) * 100), 0) / k.length;
    });
    return Math.round(perOkr.reduce((a, b) => a + b, 0) / perOkr.length);
  })();
  const streak = (data?.reviews ?? []).length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-widest text-gold-foreground font-bold">{t("os.welcome")}</p>
          <h1 className="text-4xl font-bold mt-1 capitalize text-gold-gradient">{name}</h1>
          <p className="text-muted-foreground mt-1">Your Executive Operating System</p>
        </div>
        <Button asChild className="btn-luxe-gold rounded-full px-6 h-12 font-semibold gap-2">
          <Link to="/coaches"><Sparkles className="size-4" />New Coaching Session</Link>
        </Button>
      </div>

      {/* Hero */}
      <div className="bg-gradient-deep rounded-3xl p-8 mb-6 shadow-elegant relative overflow-hidden">
        <div className="absolute -top-20 -end-20 size-64 rounded-full bg-gold/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -start-20 size-64 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative flex items-center justify-between gap-6 flex-wrap">
          <div>
            <h2 className="text-cream text-2xl font-semibold mb-1">{t("os.today")}</h2>
            <p className="text-cream/70 max-w-lg">{activeChallenges.length > 0 ? `You have ${activeChallenges.length} active challenge${activeChallenges.length>1?"s":""}. Time to move the needle.` : "Open a new session — your coach is ready."}</p>
          </div>
          <Button asChild className="bg-gold text-gold-foreground hover:bg-gold/90 rounded-full px-6">
            <Link to="/chat"><MessageCircle className="size-4 me-2" />{t("os.startchat")}</Link>
          </Button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat to="/challenges" Icon={AlertTriangle} label="Active Challenges" value={activeChallenges.length} accent="text-amber-600" />
        <Stat to="/okrs" Icon={Target} label="OKR Progress" value={`${okrAvg}%`} accent="text-violet-600" />
        <Stat to="/action-plans" Icon={ListChecks} label="Actions Done" value={`${done}/${items.length}`} sub={`${itemsPct}%`} accent="text-emerald-600" />
        <Stat to="/reviews" Icon={Flame} label="Review Streak" value={`${streak}w`} accent="text-orange-600" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active challenges */}
        <Panel title="Active Challenges" Icon={AlertTriangle} to="/challenges">
          {activeChallenges.length === 0 ? <Empty msg="No active challenges. Start a coaching session." /> : (
            <ul className="space-y-2">
              {activeChallenges.slice(0, 5).map((c) => (
                <li key={c.id} className="bg-secondary/40 rounded-lg p-2.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-deep truncate flex-1">{c.title}</span>
                    <span className="text-xs text-muted-foreground capitalize ms-2 shrink-0">{c.urgency}</span>
                  </div>
                  <div className="h-1.5 bg-card rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-gradient-gold rounded-full" style={{ width: `${c.progress}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* OKRs */}
        <Panel title="Top OKRs" Icon={Target} to="/okrs">
          {(data?.okrs ?? []).length === 0 ? <Empty msg="No OKRs yet." /> : (
            <ul className="space-y-3">
              {(data?.okrs ?? []).slice(0, 4).map((o) => {
                const krs = (data?.keyResults ?? []).filter((k) => k.okr_id === o.id);
                const pct = krs.length ? Math.round(krs.reduce((a, b) => a + Math.min(100, (Number(b.current) / Math.max(1, Number(b.target))) * 100), 0) / krs.length) : 0;
                return (
                  <li key={o.id}>
                    <div className="flex justify-between text-sm"><span className="font-medium text-deep truncate flex-1 pe-2">{o.objective}</span><span className="font-bold text-gold-foreground">{pct}%</span></div>
                    <div className="h-1.5 bg-secondary rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-gradient-gold rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        {/* Risks */}
        <Panel title="Strategic Risks" Icon={Shield} to="/risks">
          {openRisks.length === 0 ? <Empty msg="No open risks." /> : (
            <ul className="space-y-2">
              {openRisks.slice(0, 5).map((r) => (
                <li key={r.id} className="flex justify-between text-sm bg-red-50/50 rounded-lg p-2">
                  <span className="truncate flex-1 font-medium text-deep">{r.title}</span>
                  <span className="text-[10px] uppercase font-bold text-red-700 ms-2 shrink-0">{r.impact}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Decisions */}
        <Panel title="Pending Decisions" Icon={Brain} to="/decisions">
          {pendingDecisions.length === 0 ? <Empty msg="No pending decisions." /> : (
            <ul className="space-y-2">
              {pendingDecisions.slice(0, 4).map((d) => (
                <li key={d.id} className="text-sm bg-indigo-50/50 rounded-lg p-2 font-medium text-deep truncate">{d.title}</li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Last review */}
        <Panel title="Last Weekly Review" Icon={CalendarCheck} to="/reviews">
          {!lastReview ? <Empty msg="Run your first weekly review." /> : (
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-full bg-gradient-gold flex items-center justify-center font-bold text-deep text-2xl shadow-gold-glow shrink-0">{lastReview.score}</div>
              <div className="text-sm">
                <div className="text-xs text-muted-foreground">Week of {new Date(lastReview.week_start).toLocaleDateString()}</div>
                {Array.isArray(lastReview.wins) && lastReview.wins.length > 0 && <div className="mt-1"><span className="text-[10px] font-bold uppercase text-emerald-700">Top win · </span>{(lastReview.wins as string[])[0]}</div>}
              </div>
            </div>
          )}
        </Panel>

        {/* Closed challenges trophies */}
        <Panel title="Completed" Icon={TrendingUp} to="/challenges">
          {closedChallenges.length === 0 ? <Empty msg="Complete your first challenge." /> : (
            <ul className="space-y-1.5">
              {closedChallenges.slice(0, 4).map((c) => (
                <li key={c.id} className="text-sm flex items-center gap-2 text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  <span className="truncate">{c.title}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Stat({ to, Icon, label, value, sub, accent }: { to: string; Icon: typeof Target; label: string; value: string | number; sub?: string; accent: string }) {
  return (
    <Link to={to} className="bg-card border rounded-2xl p-4 hover:shadow-gold-glow hover:border-gold/40 transition-all group">
      <div className="flex items-center justify-between mb-2">
        <Icon className={`size-5 ${accent}`} />
        {sub && <span className="text-xs font-bold text-gold-foreground">{sub}</span>}
      </div>
      <div className="text-2xl font-bold text-deep group-hover:text-gold-foreground transition-colors">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </Link>
  );
}

function Panel({ title, Icon, to, children }: { title: string; Icon: typeof Target; to: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border rounded-2xl p-5 shadow-sm hover:shadow-elegant transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-gold-foreground" />
          <h3 className="font-bold text-deep text-sm uppercase tracking-wider">{title}</h3>
        </div>
        <Link to={to} className="text-xs text-gold-foreground hover:underline font-semibold">View →</Link>
      </div>
      {children}
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="text-sm text-muted-foreground italic py-2">{msg}</div>;
}
