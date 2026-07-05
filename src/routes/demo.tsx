import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ArrowLeft, Sparkles, Target, Brain, ListChecks, BookOpen, Gauge, TrendingUp, Heart, Trophy, Repeat, Mountain, CheckCircle2, Compass, AlertTriangle, MessageCircle } from "lucide-react";
import morshedLogo from "@/assets/morshed-logo.png";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Sample Coaching Session — Morshed" },
      { name: "description", content: "See a real Morshed coaching conversation: stage badges, coach memory, next actions, and micro-learning triggers." },
      { property: "og:title", content: "Sample Coaching Session — Morshed" },
      { property: "og:description", content: "A fully-rendered Morshed coaching session preview." },
    ],
  }),
  component: DemoChat,
});

type Stage = "Goal" | "Reality" | "Options" | "Actions";
type Msg = {
  role: "user" | "coach";
  text: string;
  stage?: Stage;
  learn?: string;
};

const CONVERSATION: Msg[] = [
  {
    role: "user",
    text: "I keep avoiding a difficult conversation with my team lead about missed deadlines. Every time I plan to bring it up, I find a reason to postpone. I'm starting to lose credibility with the rest of the team.",
  },
  {
    role: "coach",
    stage: "Goal",
    text: "There's real weight in what you're carrying — the avoidance is heavier than the conversation itself would be.\n\nI notice a pattern: the longer you wait, the higher the stakes feel, which makes waiting feel safer in the short term but more costly over time.\n\n**What would a successful version of this conversation actually look like for you — one week from now?**",
  },
  {
    role: "user",
    text: "Honestly? I'd want my team lead to understand the impact without feeling attacked, and we'd leave with a clear agreement on how to handle deadline slippage going forward.",
  },
  {
    role: "coach",
    stage: "Reality",
    text: "That's a clear, mature outcome — *understanding without attack, agreement on a process*.\n\nThe pattern I'm seeing: you already know what good looks like. The block isn't clarity, it's the emotional weight of being the one who initiates discomfort.\n\n**What specifically are you afraid will happen if the conversation doesn't go well?**",
    learn: "Difficult conversations",
  },
  {
    role: "user",
    text: "That they'll get defensive, the relationship will get tense, and the rest of the team will feel the awkwardness for weeks. Or worse, they'll go to my manager and frame it as me being unfair.",
  },
  {
    role: "coach",
    stage: "Options",
    text: "Those fears are real, and they're also predictions — not facts yet. Notice how each one assumes the worst version of the other person.\n\nThere's a meaningful pattern here: you're protecting the relationship by avoiding the conversation, but the avoidance itself is the thing eroding the relationship.\n\n**If you trusted that your team lead is also a professional who wants this resolved, what's the smallest first step you could take this week?**",
    learn: "Trust",
  },
  {
    role: "user",
    text: "I could send a calendar invite for a 30-minute 1:1, framed as 'process check-in, not blame.' And I could send a one-line agenda ahead so they're not blindsided.",
  },
  {
    role: "coach",
    stage: "Actions",
    text: "That's an executive-level move. Framing + agenda + private setting removes the three biggest triggers for defensiveness.\n\nLet's lock it in:\n\n- **This week:** Send the invite and agenda by Wednesday EOD.\n- **Before the meeting:** Write down the one outcome you want, in one sentence.\n- **In the meeting:** Open with *\"I want us to be aligned on how we handle deadline slippage going forward\"* — not with the missed deadlines themselves.\n\n**What's your commitment to yourself about following through?**",
  },
  {
    role: "user",
    text: "I'll send the invite tomorrow morning, first thing. And I'll text you — I mean, log it here — once it's done.",
  },
  {
    role: "coach",
    text: "That accountability matters. I'll be here.\n\nOne last reflection: notice that the conversation we just had is the same shape as the one you're about to have — direct, respectful, focused on the process not the person.\n\nYou already know how to do this.",
  },
];

const INSIGHTS = {
  clarity: { score: 8, trend: "up" as const },
  tone: "Anxious but engaged, moving toward clarity",
  memory: {
    goal: "Have a productive 1:1 with team lead about deadline slippage",
    reality: "Avoiding the conversation despite knowing it's needed",
    obstacle: "Fear of defensiveness and relationship damage",
    commitment: "Send calendar invite + agenda by Wednesday EOD",
  },
  nextActions: [
    "Send 1:1 invite and one-line agenda by Wed EOD",
    "Write the desired outcome in one sentence beforehand",
    "Open the meeting with the process framing, not the missed deadlines",
    "Log a check-in here within 24h after the meeting",
  ],
  recap: {
    clarified: [
      "The block is emotional weight, not clarity",
      "Avoidance is eroding the relationship more than the conversation would",
      "A specific, framed first step is achievable this week",
    ],
    nextFocus: "Post-conversation reflection and pattern reinforcement",
  },
  strengths: ["Self-awareness", "Emotional honesty", "Process thinking"],
  patterns: ["Protects relationships through avoidance", "Predicts worst-case before checking reality"],
  growthEdges: ["Initiating discomfort earlier", "Separating fears from facts"],
};

function DemoChat() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-deep border-b border-cream/10 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="text-cream"><Logo size={32} textClass="text-cream" /></Link>
          <div className="flex items-center gap-2 text-cream/80 text-sm">
            <Sparkles className="size-4 text-gold" />
            <span className="font-medium">Sample Coaching Session</span>
            <span className="hidden sm:inline text-cream/40">·</span>
            <span className="hidden sm:inline text-cream/60">read-only preview</span>
          </div>
          <Button asChild className="bg-gold text-gold-foreground hover:bg-gold/90 rounded-full">
            <Link to="/signup">Start Free</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 grid lg:grid-cols-[1fr_360px] gap-8 max-w-7xl">
        {/* Conversation */}
        <div className="space-y-1">
          {/* Session header */}
          <div className="rounded-3xl bg-gradient-to-br from-deep via-deep to-[#1a1a2e] p-6 mb-6 text-cream relative overflow-hidden shadow-elegant">
            <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, rgba(212,170,82,0.25) 0%, transparent 50%)" }} />
            <div className="relative flex items-center gap-4">
              <div className="size-14 rounded-full bg-gold flex items-center justify-center shadow-gold-glow coach-halo-glow">
                <img src={morshedLogo} alt="" className="size-10" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold/90">Challenge</div>
                <div className="font-display text-xl mt-0.5">Difficult conversation with my team lead</div>
                <div className="text-cream/60 text-xs mt-1 flex items-center gap-3">
                  <span className="flex items-center gap-1"><MessageCircle className="size-3" /> 10 messages</span>
                  <span>·</span>
                  <span>4 min read</span>
                </div>
              </div>
            </div>
          </div>

          {CONVERSATION.map((m, i) => (
            <MessageBubble key={i} msg={m} />
          ))}

          {/* CTA at bottom */}
          <div className="mt-10 rounded-3xl border border-gold/30 bg-gradient-to-br from-gold/5 to-transparent p-8 text-center">
            <h3 className="font-display text-2xl text-deep mb-2">Your first session is free</h3>
            <p className="text-foreground/70 text-sm mb-5">No credit card. Start a real coaching session in your language, on your real challenge.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="btn-luxe-gold rounded-full px-7 h-12 font-semibold">
                <Link to="/signup">Create my account</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-7 h-12 border-deep/20">
                <Link to="/try">Try without signup</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Coach insights panel */}
        <aside className="space-y-4">
          <div className="sticky top-24 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-gold" />
              <h3 className="font-semibold text-deep text-sm">Coach Memory</h3>
            </div>

            {/* Clarity */}
            <Card>
              <CardHeader icon={<Gauge className="size-3.5 text-gold" />} title="Clarity">
                <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <TrendingUp className="size-3.5" /> {INSIGHTS.clarity.score}/10
                </div>
              </CardHeader>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${INSIGHTS.clarity.score * 10}%` }} />
              </div>
            </Card>

            {/* Tone */}
            <div className="rounded-full border border-rose-300/40 bg-rose-50/50 px-3 py-1.5 flex items-center gap-2 text-xs">
              <Heart className="size-3.5 text-rose-500 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700/80">Tone:</span>
              <span className="text-rose-900 font-medium truncate">{INSIGHTS.tone}</span>
            </div>

            {/* Memory */}
            <Card border="gold">
              <CardHeader icon={<Brain className="size-3.5 text-gold" />} title="Coach Memory" />
              <Row icon={<Target className="size-3.5" />} label="Goal" value={INSIGHTS.memory.goal} />
              <Row icon={<Compass className="size-3.5" />} label="Current reality" value={INSIGHTS.memory.reality} />
              <Row icon={<AlertTriangle className="size-3.5" />} label="Obstacle" value={INSIGHTS.memory.obstacle} />
              <Row icon={<CheckCircle2 className="size-3.5" />} label="Last commitment" value={INSIGHTS.memory.commitment} />
            </Card>

            {/* Next actions */}
            <Card border="emerald">
              <CardHeader icon={<ListChecks className="size-3.5" />} title="Next actions" color="text-emerald-700" />
              <ul className="space-y-1.5">
                {INSIGHTS.nextActions.map((a) => (
                  <li key={a} className="flex items-start gap-2 text-sm leading-snug">
                    <span className="mt-1 size-3 shrink-0 rounded-[4px] border border-emerald-500/50" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Strengths */}
            <Card border="amber">
              <CardHeader icon={<Trophy className="size-3.5" />} title="Strengths" color="text-amber-800" />
              <List items={INSIGHTS.strengths} dot="bg-amber-500" />
            </Card>

            {/* Patterns */}
            <Card border="indigo">
              <CardHeader icon={<Repeat className="size-3.5" />} title="Patterns observed" color="text-indigo-800" />
              <List items={INSIGHTS.patterns} dot="bg-indigo-500" />
            </Card>

            {/* Growth edges */}
            <Card border="violet">
              <CardHeader icon={<Mountain className="size-3.5" />} title="Growth edges" color="text-violet-800" />
              <List items={INSIGHTS.growthEdges} dot="bg-violet-500" />
            </Card>
          </div>
        </aside>
      </div>

      <div className="border-t border-deep/10 bg-cream/50">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between text-xs text-muted-foreground">
          <Link to="/" className="inline-flex items-center gap-1 hover:text-deep"><ArrowLeft className="size-3.5" /> Back to home</Link>
          <span>Sample session · Morshed</span>
        </div>
      </div>
    </div>
  );
}

const STAGE_STYLES: Record<Stage, string> = {
  Goal: "bg-blue-100 text-blue-800 border-blue-300/50",
  Reality: "bg-amber-100 text-amber-800 border-amber-300/50",
  Options: "bg-purple-100 text-purple-800 border-purple-300/50",
  Actions: "bg-emerald-100 text-emerald-800 border-emerald-300/50",
};

function MessageBubble({ msg }: { msg: Msg }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end mb-4 animate-fade-up">
        <div className="max-w-[80%] rounded-2xl rounded-tr-md bg-deep text-cream px-5 py-3 shadow-elegant">
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3 mb-4 animate-fade-up">
      <div className="size-10 rounded-full bg-gold shrink-0 flex items-center justify-center shadow-gold-glow coach-halo-glow">
        <img src={morshedLogo} alt="Morshed" className="size-7" />
      </div>
      <div className="flex-1 max-w-[85%]">
        {msg.stage && (
          <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${STAGE_STYLES[msg.stage]} mb-1.5`}>
            {msg.stage}
          </span>
        )}
        <div className="rounded-2xl rounded-tl-md bg-card border border-gold/15 px-5 py-3.5 shadow-sm">
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-foreground" dangerouslySetInnerHTML={{ __html: formatMd(msg.text) }} />
        </div>
        {msg.learn && (
          <Link to="/lessons" search={{ topic: msg.learn }} className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-xs font-medium text-deep hover:bg-gold/20 transition-colors">
            <BookOpen className="size-3 text-gold" /> 2-min lesson: {msg.learn}
          </Link>
        )}
      </div>
    </div>
  );
}

// Minimal **bold** and *italic* -> HTML
function formatMd(t: string): string {
  return t
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-deep">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<span class="block ps-4 relative before:content-[\'•\'] before:absolute before:start-0 before:text-gold">$1</span>');
}

function Card({ children, border = "deep" }: { children: React.ReactNode; border?: "deep" | "gold" | "emerald" | "amber" | "indigo" | "violet" }) {
  const borderClass = {
    deep: "border-deep/15 bg-card",
    gold: "border-gold/30 bg-gradient-to-br from-gold/5 to-transparent",
    emerald: "border-emerald-500/20 bg-emerald-500/5",
    amber: "border-amber-400/30 bg-amber-50/60",
    indigo: "border-indigo-400/25 bg-indigo-50/50",
    violet: "border-violet-400/25 bg-violet-50/50",
  }[border];
  return <div className={`rounded-2xl border ${borderClass} p-4 space-y-2 shadow-sm`}>{children}</div>;
}

function CardHeader({ icon, title, color = "text-deep", children }: { icon: React.ReactNode; title: string; color?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-1">
      <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${color}`}>
        {icon} {title}
      </div>
      {children}
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="pt-2">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {icon} {label}
      </div>
      <p className="text-sm text-foreground leading-snug mt-0.5">{value}</p>
    </div>
  );
}

function List({ items, dot }: { items: string[]; dot: string }) {
  return (
    <ul className="space-y-1.5">
      {items.map((it) => (
        <li key={it} className="flex items-start gap-2 text-sm leading-snug">
          <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${dot}`} />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}
