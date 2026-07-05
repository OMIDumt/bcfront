import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import { useServerFn } from "@tanstack/react-start";
import { updateProfile } from "@/lib/profile.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/logo";
import { LangSwitcher } from "@/components/lang-switcher";
import { BackButton } from "@/components/back-button";
import { ChevronLeft, ChevronRight, Globe, Sparkles, Target, Briefcase, User, Check } from "lucide-react";
import logo from "@/assets/morshed-logo.png";
import coachFemale from "@/assets/coach-female.png.asset.json";
import coachMale from "@/assets/coach-male.png.asset.json";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Welcome — Morshed" }] }),
  component: Onboarding,
});

function Onboarding() {
  const { t, dir, lang, setLang } = useI18n();
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const save = useServerFn(updateProfile);

  const [step, setStep] = useState(0);
  const [coach, setCoach] = useState<"female" | "male" | "morshed">("morshed");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [goal, setGoal] = useState("");
  const [challenge, setChallenge] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (!loading && !user) nav({ to: "/login" }); }, [user, loading, nav]);

  const finish = async () => {
    setSaving(true);
    try {
      await save({ data: { name, coach_choice: coach, role_title: role, language: lang, onboarded: true } });
      toast.success(lang === "fa" ? "به مرشد خوش آمدید!" : lang === "ar" ? "أهلاً بك في مرشد!" : "Welcome to Morshed!");
      nav({ to: "/dashboard" });
    } finally { setSaving(false); }
  };

  const total = 5;
  const ChevPrev = dir === "rtl" ? ChevronRight : ChevronLeft;
  const ChevNext = dir === "rtl" ? ChevronLeft : ChevronRight;

  const stepTitles = [
    lang === "fa" ? "زبان و خوش‌آمدگویی" : lang === "ar" ? "اللغة والترحيب" : "Language & welcome",
    t("onboarding.coach"),
    t("onboarding.role"),
    t("onboarding.goal"),
    lang === "fa" ? "تأیید نهایی" : lang === "ar" ? "التأكيد النهائي" : "Final confirmation",
  ];

  const StepIcon = [Globe, Sparkles, Briefcase, Target, Check][step];

  const canAdvance =
    step === 0 ? !!lang :
    step === 1 ? !!coach && !!name.trim() :
    step === 2 ? !!role :
    step === 3 ? !!goal :
    true;

  return (
    <div className="min-h-screen bg-cream flex flex-col relative overflow-hidden">
      {/* ambient gold orbs */}
      <div className="absolute -top-40 -end-40 size-96 rounded-full bg-gold/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -start-40 size-96 rounded-full bg-deep/10 blur-3xl pointer-events-none" />

      <header className="py-4 px-4 flex items-center justify-between gap-3 relative">
        <div className="flex items-center gap-3">
          <BackButton to="/" />
          <Logo />
        </div>
        <LangSwitcher variant="compact" />
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-8 relative">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-5">
              <div className="size-24 rounded-full bg-gradient-to-br from-gold via-gold to-amber-300 mx-auto flex items-center justify-center shadow-gold-glow coach-halo-glow">
                <img src={logo} alt="" width={64} height={64} className="size-16" />
              </div>
              <div className="absolute -top-1 -end-1 size-8 rounded-full bg-deep flex items-center justify-center shadow-elegant">
                <StepIcon className="size-4 text-gold" />
              </div>
            </div>
            <h1 className="font-display text-3xl md:text-4xl text-deep mb-2 tracking-tight">{stepTitles[step]}</h1>
            <p className="text-foreground/70 max-w-md mx-auto text-sm">
              {step === 0 ? t("onboarding.hello") : `${lang === "fa" ? "گام" : lang === "ar" ? "خطوة" : "Step"} ${step + 1} / ${total}`}
            </p>

            {/* Premium progress bar */}
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: total }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    i === step ? "w-12 bg-gradient-to-r from-gold to-amber-400 shadow-gold-glow" :
                    i < step ? "w-2 bg-gold" : "w-2 bg-deep/15"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Card */}
          <div key={step} className="bg-card border border-gold/20 rounded-3xl p-8 shadow-elegant animate-fade-up backdrop-blur">
            {step === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { id: "en", flag: "🇬🇧", label: "English", sub: "International" },
                    { id: "ar", flag: "🇸🇦", label: "العربية", sub: "Arabic" },
                    { id: "fa", flag: "🇮🇷", label: "فارسی", sub: "Persian" },
                  ] as const).map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setLang(l.id)}
                      className={`p-5 rounded-2xl border-2 transition-all hover:-translate-y-0.5 ${
                        lang === l.id ? "border-gold bg-gold/10 shadow-gold-glow" : "border-border hover:border-gold/40"
                      }`}
                    >
                      <div className="text-4xl mb-2">{l.flag}</div>
                      <div className="font-semibold text-deep">{l.label}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{l.sub}</div>
                    </button>
                  ))}
                </div>
                <div className="rounded-2xl bg-gold/5 border border-gold/20 p-4 text-sm text-foreground/80 leading-relaxed">
                  <Sparkles className="size-4 text-gold inline me-2" />
                  {lang === "fa" ? "مرشد به‌صورت یکپارچه به سه زبان عربی، انگلیسی و فارسی پاسخ می‌دهد. می‌توانید زبان را هر زمان تغییر دهید." :
                   lang === "ar" ? "يستجيب مرشد بسلاسة بثلاث لغات: العربية، الإنجليزية، والفارسية. يمكنك تغيير اللغة في أي وقت." :
                   "Morshed replies fluently in Arabic, English, and Persian. You can switch language any time."}
                </div>
              </div>
            )}

            {step === 1 && (
              <>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {([
                    { id: "female", label: t("onboarding.female"), img: coachFemale.url },
                    { id: "male", label: t("onboarding.male"), img: coachMale.url },
                    { id: "morshed", label: t("onboarding.morshed"), img: logo },
                  ] as const).map((c) => (
                    <button key={c.id} onClick={() => setCoach(c.id)}
                      className={`p-4 rounded-2xl border-2 transition-all hover:-translate-y-0.5 ${coach === c.id ? "border-gold bg-gold/10 shadow-gold-glow" : "border-border hover:border-gold/40"}`}>
                      <div className={`size-20 rounded-full mx-auto flex items-center justify-center mb-3 overflow-hidden ring-2 ${coach === c.id ? "ring-gold animate-pulse-gold" : "ring-transparent"} bg-secondary`}>
                        <img src={c.img} alt={c.label} className="size-full object-cover" />
                      </div>
                      <p className="text-sm font-medium">{c.label}</p>
                    </button>
                  ))}
                </div>
                <label className="text-sm font-medium block mb-2 flex items-center gap-2">
                  <User className="size-4 text-gold" /> {t("onboarding.name")}
                </label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("onboarding.namePh")} className="h-12 text-base" autoFocus />
              </>
            )}

            {step === 2 && (
              <div className="grid grid-cols-2 gap-3">
                {["Team Lead", "Manager", "Senior Manager", "Director", "VP", "C-Level"].map((r) => (
                  <button key={r} onClick={() => setRole(r)}
                    className={`p-4 rounded-2xl border-2 text-sm font-medium transition-all hover:-translate-y-0.5 ${role === r ? "border-gold bg-gold/10 shadow-gold-glow" : "border-border hover:border-gold/40"}`}>
                    {r}
                  </button>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                {["Become a stronger leader", "Improve team performance", "Better strategic thinking", "Work-life balance", "Career advancement"].map((g) => (
                  <button key={g} onClick={() => setGoal(g)}
                    className={`w-full p-4 rounded-2xl border-2 text-start transition-all hover:-translate-y-0.5 flex items-center justify-between ${goal === g ? "border-gold bg-gold/10 shadow-gold-glow" : "border-border hover:border-gold/40"}`}>
                    <span>{g}</span>
                    {goal === g && <Check className="size-5 text-gold" />}
                  </button>
                ))}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5">
                <p className="text-sm text-muted-foreground text-center">
                  {lang === "fa" ? "پروفایل کوچ شما آماده است. در یک نگاه:" :
                   lang === "ar" ? "ملف الكوتشينغ الخاص بك جاهز. لمحة سريعة:" :
                   "Your coaching profile is ready. At a glance:"}
                </p>
                <div className="rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 via-cream to-cream p-6 space-y-3">
                  <SummaryRow icon={<Globe className="size-4" />} k={lang === "fa" ? "زبان" : lang === "ar" ? "اللغة" : "Language"} v={lang.toUpperCase()} />
                  <SummaryRow icon={<Sparkles className="size-4" />} k={lang === "fa" ? "کوچ" : lang === "ar" ? "المدرب" : "Coach"} v={coach === "female" ? t("onboarding.female") : coach === "male" ? t("onboarding.male") : t("onboarding.morshed")} />
                  <SummaryRow icon={<User className="size-4" />} k={lang === "fa" ? "نام" : lang === "ar" ? "الاسم" : "Name"} v={name || "—"} />
                  <SummaryRow icon={<Briefcase className="size-4" />} k={lang === "fa" ? "سطح" : lang === "ar" ? "المستوى" : "Level"} v={role || "—"} />
                  <SummaryRow icon={<Target className="size-4" />} k={lang === "fa" ? "هدف" : lang === "ar" ? "الهدف" : "Goal"} v={goal || "—"} />
                </div>
                <label className="text-sm font-medium block mt-2">
                  {lang === "fa" ? "بزرگ‌ترین چالش فعلی (اختیاری)" : lang === "ar" ? "أكبر تحدٍّ حالي (اختياري)" : "Biggest current challenge (optional)"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["Difficult conversations", "Managing up", "Delegation", "Decision pressure", "Building strategy"].map((c) => (
                    <button key={c} onClick={() => setChallenge(c)}
                      className={`p-3 rounded-xl border text-xs text-start ${challenge === c ? "border-gold bg-gold/10" : "border-border hover:border-gold/30"}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer nav */}
          <div className="flex justify-between mt-6">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>
              <ChevPrev className="size-4 me-1" />{t("onboarding.prev")}
            </Button>
            {step < total - 1 ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canAdvance}
                className="btn-luxe-gold rounded-full px-8 h-11 font-semibold disabled:opacity-50">
                {t("onboarding.next")}<ChevNext className="size-4 ms-1" />
              </Button>
            ) : (
              <Button onClick={finish} disabled={saving} className="btn-luxe-gold rounded-full px-8 h-11 font-semibold">
                {saving ? "…" : t("onboarding.finish")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ icon, k, v }: { icon: React.ReactNode; k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="text-gold">{icon}</span>
        <span className="font-medium">{k}</span>
      </div>
      <span className="text-deep font-semibold text-end">{v}</span>
    </div>
  );
}
