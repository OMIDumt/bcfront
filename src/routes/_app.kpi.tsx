import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { Progress } from "@/components/ui/progress";

const SAMPLE = [
  { name: "Team engagement", current: 78, target: 85, unit: "%" },
  { name: "Quarterly OKR completion", current: 62, target: 90, unit: "%" },
  { name: "1-on-1s held this month", current: 8, target: 12, unit: "" },
  { name: "Strategic time allocation", current: 35, target: 50, unit: "%" },
];

export const Route = createFileRoute("/_app/kpi")({
  head: () => ({ meta: [{ title: "KPI Dashboard" }] }),
  component: () => {
    const { t } = useI18n();
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{t("kpi.title")}</h1>
        <div className="grid sm:grid-cols-2 gap-4">
          {SAMPLE.map((k) => {
            const pct = Math.round((k.current / k.target) * 100);
            return (
              <div key={k.name} className="bg-card border rounded-2xl p-6">
                <p className="text-sm text-muted-foreground mb-1">{k.name}</p>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-3xl font-bold text-deep">{k.current}{k.unit}</span>
                  <span className="text-sm text-muted-foreground">/ {k.target}{k.unit}</span>
                </div>
                <Progress value={pct} className="h-2" />
                <p className="text-xs text-gold font-medium mt-2">{pct}% of target</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
});
