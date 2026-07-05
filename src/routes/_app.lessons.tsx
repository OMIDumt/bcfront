import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useI18n } from "@/lib/i18n";
import { Clock, BookOpen, X } from "lucide-react";

const LESSONS = [
  { t: "Giving feedback that lands",         c: "Communication", m: 5, tags: ["feedback", "communication"] },
  { t: "The GROW coaching framework",        c: "Leadership",    m: 7, tags: ["coaching", "leadership", "grow"] },
  { t: "Setting effective OKRs",             c: "Strategy",      m: 8, tags: ["okrs", "goals", "strategy"] },
  { t: "Delegation without micromanaging",   c: "People",        m: 6, tags: ["delegation", "trust", "leadership"] },
  { t: "Running 25-min decision meetings",   c: "Execution",     m: 4, tags: ["decision", "meetings", "execution"] },
  { t: "Difficult conversations toolkit",    c: "Communication", m: 9, tags: ["conflict", "communication", "feedback"] },
  { t: "Building trust on a remote team",    c: "Leadership",    m: 6, tags: ["trust", "remote", "leadership"] },
  { t: "Prioritization with the Eisenhower Matrix", c: "Strategy", m: 5, tags: ["prioritization", "strategy"] },
  { t: "Holding people accountable, kindly", c: "Leadership",    m: 7, tags: ["accountability", "leadership"] },
];

const searchSchema = z.object({ topic: z.string().optional() });

export const Route = createFileRoute("/_app/lessons")({
  head: () => ({ meta: [{ title: "Micro Lessons" }] }),
  validateSearch: searchSchema,
  component: LessonsPage,
});

function LessonsPage() {
  const { t } = useI18n();
  const { topic } = Route.useSearch();
  const q = (topic ?? "").toLowerCase().trim();

  const filtered = q
    ? LESSONS.filter(
        (l) =>
          l.tags.some((tag) => tag.toLowerCase().includes(q) || q.includes(tag.toLowerCase())) ||
          l.t.toLowerCase().includes(q) ||
          l.c.toLowerCase().includes(q),
      )
    : LESSONS;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-2xl font-bold">{t("lessons.title")}</h1>
        {q && (
          <Link
            to="/lessons"
            search={{}}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-gold/40 bg-gold/10 text-deep hover:bg-gold/20"
          >
            <span>Filtered: <span className="font-semibold">{topic}</span></span>
            <X className="size-3.5" />
          </Link>
        )}
      </div>
      {filtered.length === 0 ? (
        <div className="text-sm text-muted-foreground">No lessons matching “{topic}” yet.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((l, i) => (
            <div key={i} className="bg-card border rounded-2xl p-5 hover:shadow-elegant transition-shadow cursor-pointer">
              <div className="size-10 rounded-lg bg-gold/15 flex items-center justify-center mb-3"><BookOpen className="size-5 text-deep" /></div>
              <p className="text-xs text-gold font-medium mb-1">{l.c}</p>
              <h3 className="font-semibold mb-3">{l.t}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="size-3" />{l.m} {t("lessons.minutes")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
