import { AlertTriangle, CheckCircle2, Target, ListChecks, Brain, Shield, CalendarCheck, Users } from "lucide-react";
import type { ReactNode } from "react";

function Card({ title, Icon, accent, children }: { title: string; Icon: typeof Target; accent: string; children: ReactNode }) {
  return (
    <div className={`rounded-2xl border-2 bg-card overflow-hidden shadow-elegant my-3 ${accent}`}>
      <div className="px-4 py-2.5 flex items-center gap-2 border-b bg-gradient-to-r from-gold/10 to-transparent">
        <Icon className="size-4 text-gold-foreground" />
        <span className="text-xs font-bold tracking-wide uppercase text-deep">{title}</span>
      </div>
      <div className="p-4 text-sm space-y-2">{children}</div>
    </div>
  );
}

function Pill({ children, color = "muted" }: { children: ReactNode; color?: "muted" | "red" | "amber" | "green" | "blue" }) {
  const map: Record<string, string> = {
    muted: "bg-muted text-muted-foreground",
    red: "bg-red-100 text-red-800",
    amber: "bg-amber-100 text-amber-800",
    green: "bg-emerald-100 text-emerald-800",
    blue: "bg-blue-100 text-blue-800",
  };
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${map[color]}`}>{children}</span>;
}

function urgencyColor(u: string): "red" | "amber" | "green" {
  if (u === "critical" || u === "high") return "red";
  if (u === "medium") return "amber";
  return "green";
}

type Out = Record<string, unknown> | undefined;

export function ToolResultCard({ name, output }: { name: string; output: Out }) {
  if (!output) return null;
  const o = output as Record<string, unknown>;
  if (o.ok === false) {
    return <div className="rounded-xl border border-destructive/30 bg-destructive/10 text-destructive p-3 text-xs">Tool error: {String(o.error)}</div>;
  }

  if (name === "diagnose_challenge") {
    return (
      <Card title="Challenge Diagnosis" Icon={AlertTriangle} accent="border-gold/50">
        <div className="font-bold text-deep text-base">{String(o.title)}</div>
        <div className="flex gap-2 flex-wrap">
          <Pill color={urgencyColor(String(o.urgency))}>Urgency: {String(o.urgency)}</Pill>
          <Pill color={urgencyColor(String(o.impact))}>Impact: {String(o.impact)}</Pill>
        </div>
        <div><div className="text-xs font-semibold text-muted-foreground mb-1">Primary</div><div>{String(o.primary_challenge)}</div></div>
        {Array.isArray(o.secondary_challenges) && o.secondary_challenges.length > 0 && (
          <div><div className="text-xs font-semibold text-muted-foreground mb-1">Secondary</div>
            <ul className="list-disc ps-5">{(o.secondary_challenges as string[]).map((s, i) => <li key={i}>{s}</li>)}</ul></div>
        )}
        <div><div className="text-xs font-semibold text-muted-foreground mb-1">Root causes</div>
          <ul className="list-disc ps-5">{(o.root_causes as string[] ?? []).map((s, i) => <li key={i}>{s}</li>)}</ul></div>
        {Array.isArray(o.strategic_risks) && o.strategic_risks.length > 0 && (
          <div><div className="text-xs font-semibold text-muted-foreground mb-1">Strategic risks</div>
            <ul className="list-disc ps-5">{(o.strategic_risks as string[]).map((s, i) => <li key={i}>{s}</li>)}</ul></div>
        )}
        <div className="bg-gold/10 rounded-xl p-3 border border-gold/30 mt-2">
          <div className="text-xs font-bold text-gold-foreground uppercase mb-1">Executive summary</div>
          <div className="text-deep">{String(o.executive_summary)}</div>
        </div>
      </Card>
    );
  }

  if (name === "create_action_plan") {
    const items = (o.items as Array<Record<string, unknown>> ?? []);
    const grouped: Record<string, typeof items> = { "30": [], "60": [], "90": [] };
    items.forEach((it) => { const h = String(it.horizon ?? "30"); (grouped[h] ?? grouped["30"]).push(it); });
    return (
      <Card title="30/60/90 Action Plan" Icon={ListChecks} accent="border-emerald-400/50">
        <div className="font-bold text-deep">{String(o.title)}</div>
        {(["30", "60", "90"] as const).map((h) => grouped[h].length > 0 && (
          <div key={h} className="mt-2">
            <div className="text-xs font-bold text-emerald-700 uppercase mb-1">{h} days</div>
            <ul className="space-y-1">
              {grouped[h].map((it, i) => (
                <li key={i} className="flex items-start gap-2 bg-emerald-50/50 rounded-lg p-2">
                  <CheckCircle2 className="size-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium">{String(it.title)}</div>
                    {it.description ? <div className="text-xs text-muted-foreground">{String(it.description)}</div> : null}
                    {it.owner ? <div className="text-xs mt-0.5">Owner: <span className="font-semibold">{String(it.owner)}</span></div> : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Card>
    );
  }

  if (name === "create_okrs") {
    const krs = (o.key_results as Array<Record<string, unknown>> ?? []);
    return (
      <Card title="OKR" Icon={Target} accent="border-violet-400/50">
        <div className="font-bold text-deep text-base">🎯 {String(o.objective)}</div>
        {o.quarter ? <Pill color="blue">{String(o.quarter)}</Pill> : null}
        <div className="space-y-2 mt-2">
          {krs.map((kr, i) => {
            const target = Number(kr.target) || 1;
            const current = Number(kr.current) || 0;
            const pct = Math.min(100, Math.round((current / target) * 100));
            return (
              <div key={i} className="bg-violet-50/50 rounded-lg p-2">
                <div className="flex justify-between text-sm"><span className="font-medium">{String(kr.name)}</span><span className="text-xs text-muted-foreground">{current}/{target} {String(kr.unit ?? "")}</span></div>
                <div className="h-2 bg-violet-100 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  }

  if (name === "decision_analysis") {
    const opts = (o.options as Array<Record<string, unknown>> ?? []);
    return (
      <Card title="Decision Analysis" Icon={Brain} accent="border-indigo-400/50">
        <div className="font-bold text-deep">{String(o.title)}</div>
        {o.context ? <div className="text-sm text-muted-foreground">{String(o.context)}</div> : null}
        <div className="grid sm:grid-cols-2 gap-2 mt-2">
          {opts.map((op, i) => (
            <div key={i} className="border rounded-lg p-2 bg-indigo-50/40">
              <div className="font-semibold flex justify-between"><span>{String(op.name)}</span>{op.score !== undefined ? <Pill color="blue">{String(op.score)}/10</Pill> : null}</div>
              {Array.isArray(op.pros) && op.pros.length > 0 && <div className="mt-1 text-xs"><span className="text-emerald-700 font-semibold">✓ </span>{(op.pros as string[]).join(" · ")}</div>}
              {Array.isArray(op.cons) && op.cons.length > 0 && <div className="text-xs"><span className="text-red-700 font-semibold">✗ </span>{(op.cons as string[]).join(" · ")}</div>}
            </div>
          ))}
        </div>
        <div className="bg-indigo-100 rounded-xl p-3 border border-indigo-300 mt-2">
          <div className="text-xs font-bold text-indigo-900 uppercase mb-1">Recommendation</div>
          <div className="text-deep">{String(o.recommendation)}</div>
        </div>
      </Card>
    );
  }

  if (name === "risk_assessment") {
    const risks = (o.risks as Array<Record<string, unknown>> ?? []);
    return (
      <Card title="Risk Assessment" Icon={Shield} accent="border-red-400/50">
        <div className="space-y-2">
          {risks.map((r, i) => (
            <div key={i} className="border rounded-lg p-2 bg-red-50/40">
              <div className="flex justify-between"><span className="font-semibold">{String(r.title)}</span>
                <div className="flex gap-1"><Pill color={urgencyColor(String(r.likelihood))}>L: {String(r.likelihood)}</Pill><Pill color={urgencyColor(String(r.impact))}>I: {String(r.impact)}</Pill></div></div>
              {r.description ? <div className="text-xs text-muted-foreground mt-1">{String(r.description)}</div> : null}
              <div className="text-xs mt-1"><span className="font-semibold">Mitigation:</span> {String(r.mitigation)}</div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (name === "weekly_review") {
    return (
      <Card title="Weekly Review" Icon={CalendarCheck} accent="border-blue-400/50">
        <div className="flex items-center gap-3">
          <div className="size-16 rounded-full bg-gradient-gold flex items-center justify-center font-bold text-deep text-xl shadow-gold-glow">{String(o.score)}</div>
          <div className="text-xs text-muted-foreground">Weekly Performance Score</div>
        </div>
        {Array.isArray(o.wins) && o.wins.length > 0 && <div><div className="text-xs font-bold text-emerald-700 uppercase">Wins</div><ul className="list-disc ps-5">{(o.wins as string[]).map((s, i) => <li key={i}>{s}</li>)}</ul></div>}
        {Array.isArray(o.blockers) && o.blockers.length > 0 && <div><div className="text-xs font-bold text-red-700 uppercase">Blockers</div><ul className="list-disc ps-5">{(o.blockers as string[]).map((s, i) => <li key={i}>{s}</li>)}</ul></div>}
        {Array.isArray(o.next_priorities) && o.next_priorities.length > 0 && <div><div className="text-xs font-bold text-blue-700 uppercase">Next priorities</div><ul className="list-disc ps-5">{(o.next_priorities as string[]).map((s, i) => <li key={i}>{s}</li>)}</ul></div>}
      </Card>
    );
  }

  if (name === "board_consensus") {
    const persp = (o.perspectives as Array<Record<string, unknown>> ?? []);
    return (
      <Card title="AI Board of Advisors" Icon={Users} accent="border-amber-500/60">
        <div className="font-bold text-deep">{String(o.topic)}</div>
        <div className="grid sm:grid-cols-2 gap-2 mt-2">
          {persp.map((p, i) => (
            <div key={i} className="border rounded-lg p-2 bg-amber-50/40">
              <div className="text-xs font-bold text-amber-800 uppercase mb-1">{String(p.persona)}</div>
              <div className="text-sm">{String(p.view)}</div>
            </div>
          ))}
        </div>
        <div className="bg-gradient-to-r from-gold/20 to-amber-100/40 rounded-xl p-3 border border-gold/40 mt-2">
          <div className="text-xs font-bold text-deep uppercase mb-1">Board Consensus</div>
          <div className="text-deep">{String(o.consensus)}</div>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-300">
          <div className="text-xs font-bold text-emerald-800 uppercase mb-1">Top Recommendation</div>
          <div>{String(o.top_recommendation)}</div>
        </div>
        {Array.isArray(o.major_risks) && o.major_risks.length > 0 && <div><div className="text-xs font-bold text-red-700 uppercase">Major risks</div><ul className="list-disc ps-5">{(o.major_risks as string[]).map((s, i) => <li key={i}>{s}</li>)}</ul></div>}
        {Array.isArray(o.immediate_actions) && o.immediate_actions.length > 0 && <div><div className="text-xs font-bold text-blue-700 uppercase">Immediate actions</div><ul className="list-disc ps-5">{(o.immediate_actions as string[]).map((s, i) => <li key={i}>{s}</li>)}</ul></div>}
      </Card>
    );
  }

  return null;
}
