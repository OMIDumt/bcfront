import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { COACHES } from "@/lib/coaches";
import { createCoachThread } from "@/lib/coaching.functions";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_app/coaches")({
  head: () => ({ meta: [{ title: "AI Coaches — Morshed" }] }),
  component: CoachesPage,
});

function CoachesPage() {
  const { lang } = useI18n();
  const nav = useNavigate();
  const qc = useQueryClient();
  const create = useServerFn(createCoachThread);

  const start = useMutation({
    mutationFn: async (coachId: string) => create({ data: { coachId } }),
    onSuccess: (th) => {
      qc.invalidateQueries({ queryKey: ["threads"] });
      nav({ to: "/chat/$threadId", params: { threadId: th.id } });
    },
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-gold-foreground font-bold">Specialist Lineup</p>
        <h1 className="text-3xl font-bold mt-1 text-gold-gradient">Choose your AI Coach</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">Each coach has its own methodology, frameworks, and tools. Pick the right advisor for your current challenge — switch anytime.</p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {COACHES.map((c) => (
          <button
            key={c.id}
            onClick={() => start.mutate(c.id)}
            disabled={start.isPending}
            className="group text-start bg-card border-2 border-border hover:border-gold rounded-2xl p-5 hover:shadow-gold-glow transition-all duration-300 hover:-translate-y-1"
          >
            <div className={`size-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors ${c.accent}`}>
              <c.Icon className="size-6" />
            </div>
            <div className="font-bold text-deep">{c.name[lang as "en" | "fa" | "ar"] ?? c.name.en}</div>
            <div className="text-xs text-gold-foreground/80 font-semibold mt-0.5">{c.title[lang as "en" | "fa" | "ar"] ?? c.title.en}</div>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{c.description[lang as "en" | "fa" | "ar"] ?? c.description.en}</p>
            <div className="mt-4 text-xs font-semibold text-gold-foreground opacity-0 group-hover:opacity-100 transition-opacity">Start session →</div>
          </button>
        ))}
      </div>
    </div>
  );
}
