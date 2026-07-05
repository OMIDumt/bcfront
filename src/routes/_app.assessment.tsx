import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/_app/assessment")({
  head: () => ({ meta: [{ title: "Management Assessment" }] }),
  component: AssessmentPage,
});

const QUESTIONS = [
  { cat: "Leadership", q: "How clearly do you communicate the business vision to your team?" },
  { cat: "Leadership", q: "How effectively do you inspire your team during difficult times?" },
  { cat: "Leadership", q: "How well do you model the behavior you expect from others?" },
  { cat: "Leadership", q: "How comfortable are you making unpopular decisions?" },
  { cat: "Leadership", q: "How effectively do you develop other leaders on your team?" },
  { cat: "Leadership", q: "How well do you balance authority with empathy?" },
  { cat: "Communication", q: "How clear is your written communication with stakeholders?" },
  { cat: "Communication", q: "How effectively do you give difficult feedback?" },
  { cat: "Communication", q: "How well do you listen actively in meetings?" },
  { cat: "Communication", q: "How well do you adapt your message to different audiences?" },
  { cat: "Communication", q: "How effectively do you handle conflict conversations?" },
  { cat: "Communication", q: "How clearly do you set expectations with your team?" },
  { cat: "Strategy", q: "How well do you connect daily tasks to long-term goals?" },
  { cat: "Strategy", q: "How effectively do you prioritize competing initiatives?" },
  { cat: "Strategy", q: "How well do you anticipate market and industry changes?" },
  { cat: "Strategy", q: "How systematic is your strategic planning process?" },
  { cat: "Strategy", q: "How well do you allocate resources to highest-impact areas?" },
  { cat: "Strategy", q: "How effectively do you say no to non-strategic requests?" },
  { cat: "Execution", q: "How consistently do you hit committed deadlines?" },
  { cat: "Execution", q: "How well do you break down ambiguous goals into action plans?" },
  { cat: "Execution", q: "How effectively do you remove blockers for your team?" },
  { cat: "Execution", q: "How disciplined is your follow-through on commitments?" },
  { cat: "Execution", q: "How well do you measure and report progress on KPIs?" },
  { cat: "Execution", q: "How effectively do you recover when projects go off-track?" },
  { cat: "People", q: "How well do you understand each team member's motivations?" },
  { cat: "People", q: "How effectively do you delegate meaningful work?" },
  { cat: "People", q: "How well do you recognize and reward strong performance?" },
  { cat: "People", q: "How comfortable are you addressing underperformance promptly?" },
  { cat: "People", q: "How effectively do you coach team members for growth?" },
  { cat: "People", q: "How well do you build psychological safety in your team?" },
];

function AssessmentPage() {
  const { t, dir } = useI18n();
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [done, setDone] = useState(false);

  const ChevPrev = dir === "rtl" ? ChevronRight : ChevronLeft;
  const ChevNext = dir === "rtl" ? ChevronLeft : ChevronRight;

  if (!started) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="bg-card border rounded-3xl p-10 text-center shadow-elegant">
          <div className="size-16 rounded-full bg-gold/15 mx-auto flex items-center justify-center mb-4">
            <BarChart3 className="size-7 text-deep" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{t("assessment.start.title")}</h1>
          <p className="text-muted-foreground mb-8">{t("assessment.start.sub")}</p>
          <Button onClick={() => setStarted(true)} size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90 rounded-full px-8">{t("assessment.start.btn")}</Button>
        </div>
      </div>
    );
  }

  if (done) {
    const cats = ["Leadership", "Communication", "Strategy", "Execution", "People"];
    const scores = cats.map((c) => {
      const qs = QUESTIONS.map((q, i) => ({ ...q, i })).filter((q) => q.cat === c);
      const sum = qs.reduce((s, q) => s + (answers[q.i] ?? 3), 0);
      return { cat: c, score: Math.round((sum / (qs.length * 5)) * 100) };
    });
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{t("assessment.result")}</h1>
        <div className="bg-card border rounded-3xl p-8 space-y-5">
          {scores.map((s) => (
            <div key={s.cat}>
              <div className="flex justify-between mb-1.5">
                <span className="font-medium">{s.cat}</span>
                <span className="text-gold font-bold">{s.score}%</span>
              </div>
              <Progress value={s.score} className="h-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const q = QUESTIONS[idx];
  const progress = ((idx + 1) / QUESTIONS.length) * 100;
  const subIdx = QUESTIONS.slice(0, idx + 1).filter((x) => x.cat === q.cat).length;
  const subTot = QUESTIONS.filter((x) => x.cat === q.cat).length;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t("assessment.title")}</h1>
      <div className="flex justify-between text-sm text-muted-foreground mb-2">
        <span>{t("assessment.q")} {idx + 1} {t("assessment.of")} {QUESTIONS.length}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2 mb-8" />

      <div className="bg-card border rounded-3xl p-8">
        <p className="text-gold text-sm font-medium mb-2">{q.cat} — {t("assessment.q")} {subIdx}/{subTot}</p>
        <h2 className="text-xl font-bold mb-8">{q.q}</h2>
        <div className="grid grid-cols-5 gap-3">
          {([1, 2, 3, 4, 5] as const).map((v) => (
            <button key={v} onClick={() => setAnswers({ ...answers, [idx]: v })}
              className={`p-5 rounded-2xl border-2 transition ${answers[idx] === v ? "border-gold bg-gold/10" : "border-border hover:border-gold/40"}`}>
              <div className="text-2xl font-bold">{v}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {t(["scale.veryweak", "scale.weak", "scale.average", "scale.good", "scale.excellent"][v - 1])}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <Button variant="ghost" disabled={idx === 0} onClick={() => setIdx(idx - 1)}><ChevPrev className="size-4 me-1" />{t("assessment.prev")}</Button>
        {idx < QUESTIONS.length - 1 ? (
          <Button disabled={!answers[idx]} onClick={() => setIdx(idx + 1)} className="bg-deep text-cream hover:bg-deep/90 rounded-full px-6">{t("assessment.next")}<ChevNext className="size-4 ms-1" /></Button>
        ) : (
          <Button disabled={!answers[idx]} onClick={() => setDone(true)} className="bg-gold text-gold-foreground hover:bg-gold/90 rounded-full px-6">{t("assessment.done")}</Button>
        )}
      </div>
    </div>
  );
}
