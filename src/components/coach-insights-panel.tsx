import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { generateInsights } from "@/lib/insights.functions";
import { Brain, Target, Compass, AlertTriangle, CheckCircle2, ListChecks, Sparkles, RefreshCw, TrendingUp, TrendingDown, Minus, Gauge, Repeat, Trophy, Mountain, Heart } from "lucide-react";

type Lang = "en" | "fa" | "ar";

const STRINGS: Record<Lang, Record<string, string>> = {
  en: {
    title: "Coach Memory",
    goal: "Goal", reality: "Current reality", obstacle: "Main obstacle", commitment: "Last commitment",
    nextActions: "Next actions", recap: "Session recap", clarified: "You clarified", nextFocus: "Next coaching focus",
    refresh: "Refresh", empty: "Send a few messages and your coach memory will appear here.",
    loading: "Reading your session…", clarity: "Clarity",
    patterns: "Patterns observed", strengths: "Your strengths", growthEdges: "Growth edges", tone: "Emotional tone",
  },
  fa: {
    title: "حافظهٔ مرشد",
    goal: "هدف", reality: "وضعیت فعلی", obstacle: "مانع اصلی", commitment: "آخرین تعهد",
    nextActions: "گام‌های بعدی", recap: "خلاصهٔ جلسه", clarified: "شفاف شد", nextFocus: "تمرکز بعدی",
    refresh: "به‌روزرسانی", empty: "چند پیام بفرستید تا حافظهٔ مرشد ساخته شود.",
    loading: "در حال خواندن گفت‌وگو…", clarity: "شفافیت",
    patterns: "الگوهای مشاهده‌شده", strengths: "نقاط قوت شما", growthEdges: "لبه‌های رشد", tone: "حال‌وهوای ذهنی",
  },
  ar: {
    title: "ذاكرة المرشد",
    goal: "الهدف", reality: "الواقع الحالي", obstacle: "العائق الرئيسي", commitment: "آخر التزام",
    nextActions: "الخطوات التالية", recap: "ملخص الجلسة", clarified: "ما توضّح", nextFocus: "تركيز الجلسة القادمة",
    refresh: "تحديث", empty: "أرسل بعض الرسائل لتظهر هنا ذاكرة المرشد.",
    loading: "نقرأ جلستك…", clarity: "الوضوح",
    patterns: "الأنماط الملاحظة", strengths: "نقاط قوتك", growthEdges: "حواف النمو", tone: "الحالة الشعورية",
  },
};

export function CoachInsightsPanel({
  threadId,
  language,
  messageCount,
}: {
  threadId: string;
  language: Lang;
  messageCount: number;
}) {
  const t = STRINGS[language] ?? STRINGS.en;
  const gen = useServerFn(generateInsights);

  // Auto-refresh every 8 settled messages (per spec: session recap & clarity every 8 msgs).
  const bucket = useMemo(() => Math.floor(messageCount / 8), [messageCount]);
  const enabled = messageCount >= 2;

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["insights", threadId, bucket],
    queryFn: () => gen({ data: { threadId, language } }),
    enabled,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const hasAny =
    data &&
    (data.memory.goal ||
      data.memory.currentReality ||
      data.memory.obstacle ||
      data.memory.lastCommitment ||
      data.nextActions.length > 0 ||
      data.recap.clarified.length > 0 ||
      data.recap.nextFocus);

  return (
    <aside className="w-80 shrink-0 border-s bg-card/60 backdrop-blur overflow-y-auto hidden xl:block">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-gold" />
            <h3 className="font-semibold text-deep text-sm">{t.title}</h3>
          </div>
          <button
            onClick={() => refetch()}
            disabled={!enabled || isFetching}
            className="p-1.5 rounded-md text-muted-foreground hover:text-deep hover:bg-gold/10 disabled:opacity-40"
            title={t.refresh}
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>

        {!enabled && (
          <p className="text-xs text-muted-foreground leading-relaxed">{t.empty}</p>
        )}

        {enabled && isFetching && !data && (
          <p className="text-xs text-muted-foreground italic">{t.loading}</p>
        )}

        {data && (
          <>
            {/* Clarity tracker */}
            {data.clarity && (() => {
              const score = data.clarity.score;
              const trend = data.clarity.trend;
              const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
              const trendColor = trend === "up" ? "text-emerald-600" : trend === "down" ? "text-destructive" : "text-muted-foreground";
              const barColor = score >= 7 ? "bg-emerald-500" : score >= 4 ? "bg-gold" : "bg-destructive";
              return (
                <div className="rounded-2xl border border-deep/15 bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-deep">
                      <Gauge className="size-3.5 text-gold" /> {t.clarity}
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
                      <TrendIcon className="size-3.5" />
                      <span>{score}/10</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className={`h-full ${barColor} transition-all duration-700`} style={{ width: `${score * 10}%` }} />
                  </div>
                </div>
              );
            })()}

            {/* Emotional tone pill */}
            {data.emotionalTone && (
              <div className="rounded-full border border-rose-300/40 bg-rose-50/50 px-3 py-1.5 flex items-center gap-2 text-xs">
                <Heart className="size-3.5 text-rose-500 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700/80">{t.tone}:</span>
                <span className="text-rose-900 font-medium truncate">{data.emotionalTone}</span>
              </div>
            )}

            {/* Memory card */}
            <div className="rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/5 to-transparent p-4 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-deep">
                <Brain className="size-3.5 text-gold" /> {t.title}
              </div>
              <MemoryRow icon={<Target className="size-3.5" />} label={t.goal} value={data.memory.goal} />
              <MemoryRow icon={<Compass className="size-3.5" />} label={t.reality} value={data.memory.currentReality} />
              <MemoryRow icon={<AlertTriangle className="size-3.5" />} label={t.obstacle} value={data.memory.obstacle} />
              <MemoryRow icon={<CheckCircle2 className="size-3.5" />} label={t.commitment} value={data.memory.lastCommitment} />
              {!hasAny && (
                <p className="text-xs text-muted-foreground italic">{t.empty}</p>
              )}
            </div>

            {/* Next actions */}
            {data.nextActions.length > 0 && (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
                  <ListChecks className="size-3.5" /> {t.nextActions}
                </div>
                <ul className="space-y-1.5">
                  {data.nextActions.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground leading-snug">
                      <span className="mt-1 size-3 shrink-0 rounded-[4px] border border-emerald-500/50" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recap */}
            {(data.recap.clarified.length > 0 || data.recap.nextFocus) && (
              <div className="rounded-2xl border border-deep/15 bg-deep/[0.03] p-4 space-y-3 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-deep">
                  <Sparkles className="size-3.5 text-gold" /> {t.recap}
                </div>
                {data.recap.clarified.length > 0 && (
                  <div>
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">{t.clarified}</div>
                    <ul className="space-y-1">
                      {data.recap.clarified.map((c, i) => (
                        <li key={i} className="text-sm text-foreground flex gap-1.5"><span className="text-emerald-600">✓</span>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {data.recap.nextFocus && (
                  <div>
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">{t.nextFocus}</div>
                    <p className="text-sm text-deep font-medium leading-snug">→ {data.recap.nextFocus}</p>
                  </div>
                )}
              </div>
            )}

            {/* Strengths */}
            {data.strengths.length > 0 && (
              <ListCard color="amber" icon={<Trophy className="size-3.5" />} title={t.strengths} items={data.strengths} />
            )}

            {/* Patterns */}
            {data.patterns.length > 0 && (
              <ListCard color="indigo" icon={<Repeat className="size-3.5" />} title={t.patterns} items={data.patterns} />
            )}

            {/* Growth edges */}
            {data.growthEdges.length > 0 && (
              <ListCard color="violet" icon={<Mountain className="size-3.5" />} title={t.growthEdges} items={data.growthEdges} />
            )}
          </>
        )}
      </div>
    </aside>
  );
}

function MemoryRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {icon} {label}
      </div>
      <p className="text-sm text-foreground leading-snug mt-0.5">
        {value || <span className="text-muted-foreground italic">—</span>}
      </p>
    </div>
  );
}

const COLOR_MAP = {
  amber: { border: "border-amber-400/30", bg: "bg-amber-50/60", text: "text-amber-800", dot: "bg-amber-500" },
  indigo: { border: "border-indigo-400/25", bg: "bg-indigo-50/50", text: "text-indigo-800", dot: "bg-indigo-500" },
  violet: { border: "border-violet-400/25", bg: "bg-violet-50/50", text: "text-violet-800", dot: "bg-violet-500" },
} as const;

function ListCard({ color, icon, title, items }: { color: keyof typeof COLOR_MAP; icon: React.ReactNode; title: string; items: string[] }) {
  const c = COLOR_MAP[color];
  return (
    <div className={`rounded-2xl border ${c.border} ${c.bg} p-4 space-y-2 shadow-sm`}>
      <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${c.text}`}>
        {icon} {title}
      </div>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground leading-snug">
            <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${c.dot}`} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
