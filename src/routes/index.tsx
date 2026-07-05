import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { LangSwitcher } from "@/components/lang-switcher";
import { useI18n } from "@/lib/i18n";
import { Clock, BarChart3, Award, Check, Star, MessageCircle, Linkedin, Instagram, Mail, ClipboardCheck, HelpCircle, ChevronDown, PlayCircle } from "lucide-react";
import { AnimatedLogo } from "@/components/animated-logo";
import morshedLogo from "@/assets/morshed-logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Morshed — Executive AI Coaching for GCC Leaders" },
      { name: "description", content: "AI-powered executive coaching platform. ICF-aligned methodologies, KPI tracking, and 24/7 smart mentoring for managers across the GCC." },
      { property: "og:title", content: "Morshed — Executive AI Coaching" },
      { property: "og:description", content: "AI-powered executive coaching platform for GCC leaders." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-cream">
      {/* Trust bar */}
      <div className="bg-deep text-cream/90 text-xs">
        <div className="container mx-auto px-4 py-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
          <span className="flex items-center gap-1.5"><span className="size-1 rounded-full bg-gold" />{t("trust.gcc")}</span>
          <span className="flex items-center gap-1.5"><span className="size-1 rounded-full bg-gold" />{t("trust.icf")}</span>
          <span className="flex items-center gap-1.5"><span className="size-1 rounded-full bg-gold" />{t("trust.private")}</span>
          <span className="flex items-center gap-1.5"><span className="size-1 rounded-full bg-gold" />{t("trust.arabic")}</span>
        </div>
      </div>

      {/* Header */}
      <header className="bg-deep sticky top-0 z-50 border-b border-cream/10">
        <div className="container mx-auto px-4 h-16 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <Link to="/" className="text-cream justify-self-start"><Logo size={32} textClass="text-cream" /></Link>
          <nav className="hidden lg:flex items-center gap-8 text-sm text-cream/80 justify-self-center">
            <a href="#how" className="hover:text-cream transition-colors">{t("nav.how")}</a>
            <a href="#plans" className="hover:text-cream transition-colors">{t("nav.plans")}</a>
            <a href="#assessment" className="hover:text-cream transition-colors">{t("nav.assessment")}</a>
            <a href="#faq" className="hover:text-cream transition-colors">{t("nav.faq")}</a>
            <a href="#contact" className="hover:text-cream transition-colors">{t("nav.contact")}</a>
          </nav>
          <div className="flex items-center gap-3 justify-self-end">
            <div className="hidden md:block"><LangSwitcher /></div>
            <Link to="/login" className="text-sm text-cream/90 hover:text-cream">{t("nav.signin")}</Link>
            <Button asChild className="bg-gold text-gold-foreground hover:bg-gold/90 rounded-full">
              <Link to="/signup">{t("nav.start")}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero — animated brand mark */}
      <section className="container mx-auto px-4 pt-16 pb-4">
        <div className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden bg-gradient-to-br from-deep via-deep to-[#1a1a2e] py-16 px-4 shadow-elegant">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, rgba(212,170,82,0.25) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(212,170,82,0.2) 0%, transparent 50%)" }} />
          <div className="relative">
            <AnimatedLogo size={380} />
            <p className="text-center text-cream/70 mt-6 text-sm tracking-[0.3em] uppercase">Morshed · مرشد</p>
          </div>
        </div>
      </section>


      {/* Hero CTA */}
      <section className="bg-deep py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: "radial-gradient(60% 60% at 50% 0%, rgba(212,170,82,0.18) 0%, transparent 70%), radial-gradient(40% 40% at 80% 100%, rgba(212,170,82,0.10) 0%, transparent 70%)" }} />
        <div className="container mx-auto px-4 text-center relative">
          <h1 className="hero-display text-5xl md:text-7xl max-w-5xl mx-auto">
            {t("hero.title")}
          </h1>
          <p className="text-cream/75 mt-7 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">{t("hero.subtitle")}</p>
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <Button asChild size="lg" className="btn-luxe-gold rounded-full px-8 h-12 font-semibold">
              <Link to="/signup">{t("hero.cta1")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-8 h-12 border-cream/30 text-cream hover:bg-cream/10 hover:text-cream bg-transparent">
              <Link to="/try">{t("hero.cta2")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="how" className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { Icon: Clock, t: "feature.coach.title", b: "feature.coach.body" },
            { Icon: BarChart3, t: "feature.tracking.title", b: "feature.tracking.body" },
            { Icon: Award, t: "feature.quality.title", b: "feature.quality.body" },
          ].map(({ Icon, t: tk, b }) => (
            <div key={tk} className="bg-deep rounded-2xl p-8 text-center shadow-elegant">
              <div className="mx-auto size-14 rounded-full bg-gold flex items-center justify-center mb-5">
                <Icon className="size-7 text-deep" />
              </div>
              <h3 className="text-cream font-semibold text-lg mb-2">{t(tk)}</h3>
              <p className="text-cream/70 text-sm leading-relaxed">{t(b)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The Science Behind */}
      <section className="bg-cream py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-4xl md:text-5xl font-bold text-deep tracking-tight">
              {t("science.title.a") || "THE "}<span className="text-gold">{t("science.title.b") || "SCIENCE"}</span>{t("science.title.c") || " BEHIND"}
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              {t("science.subtitle") || "The game-changer for personal development at individual, leadership and organisational level is powered by behavioral science and AI Natural Language Understanding."}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                accent: "bg-[#e0a85a]",
                emoji: "🧠",
                title: t("science.c1.title") || "POSITIVE PSYCHOLOGY & ENGAGEMENT MODEL",
                items: [
                  t("science.c1.i1") || "Cultivates positive emotions, relationships, engagement, meaning, accomplishment and life-balance (PERMA).",
                  t("science.c1.i2") || "Gamification elements drive high engagement and consistent usage by your workforce.",
                  t("science.c1.i3") || "Evidence-based frameworks from Seligman, Csikszentmihalyi and Harvard Business School.",
                ],
              },
              {
                accent: "bg-[#5cb6b3]",
                emoji: "🎯",
                title: t("science.c2.title") || "MICRO-COACHING & SOLUTION-FOCUSED REFLECTION",
                items: [
                  t("science.c2.i1") || "Interactive AI chatbot for daily executive reflection and decision quality.",
                  t("science.c2.i2") || "Soft-skill exercises supported with curated articles and best practices from McKinsey, BCG, HBR.",
                  t("science.c2.i3") || "Increases self-awareness and promotes continuous learning aligned with ICF coaching standards.",
                ],
              },
              {
                accent: "bg-[#9b8cd4]",
                emoji: "🤖",
                title: t("science.c3.title") || "AI NATURAL LANGUAGE UNDERSTANDING",
                items: [
                  t("science.c3.i1") || "Engaging questions and topics tailored to your role, industry and personal development goals.",
                  t("science.c3.i2") || "Detects feelings, challenges, victories and goals — automatically tracked across your journey.",
                  t("science.c3.i3") || "Personal and unique conversations that adapt to your daily mood, KPIs and OKRs.",
                ],
              },
            ].map((card) => (
              <div key={card.title} className="flex flex-col items-center text-center">
                <div className={`${card.accent} rounded-2xl p-6 shadow-elegant w-full max-w-[280px]`}>
                  <div className="bg-cream rounded-xl aspect-[4/3] flex items-center justify-center text-6xl">
                    {card.emoji}
                  </div>
                </div>
                <h3 className="font-bold text-deep text-base tracking-wide mt-6 mb-4 max-w-[260px]">{card.title}</h3>
                <ul className="space-y-3 text-sm text-muted-foreground max-w-[280px]">
                  {card.items.map((it) => (
                    <li key={it} className="flex gap-2 text-start"><span className="size-2 rounded-full bg-deep mt-1.5 shrink-0" /><span>{it}</span></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Outcomes strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { n: "87%", l: t("science.stat1") || "report better decision quality" },
              { n: "3.2×", l: t("science.stat2") || "faster goal achievement" },
              { n: "92%", l: t("science.stat3") || "increase in self-awareness" },
              { n: "24/7", l: t("science.stat4") || "executive support, on demand" },
            ].map((s) => (
              <div key={s.l} className="text-center p-5 rounded-2xl bg-deep/[0.03] border border-deep/10">
                <div className="text-3xl md:text-4xl font-bold text-gold-gradient">{s.n}</div>
                <div className="text-xs text-muted-foreground mt-2 leading-snug">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Social proof */}
      <section className="bg-deep py-6">
        <p className="text-cream/80 text-center text-sm">{t("social.proof")}</p>
      </section>

      {/* Plans */}
      <section id="plans" className="bg-deep py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-cream text-center mb-12">{t("plans.title")}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {([
              { name: "free", price: "Free", popular: false, features: ["Basic management assessment", "3 AI coaching sessions", "Strengths report"] },
              { name: "basic", price: "$29/mo", popular: false, features: ["Full management assessment", "Unlimited AI coaching", "Regional benchmark analysis"] },
              { name: "pro", price: "$79/mo", popular: true, features: ["All Basic features", "Advanced KPI & OKR", "Micro-learning + Experience bank"] },
              { name: "vip", price: "$199/mo", popular: false, features: ["All Pro features", "Personal coach + priority support", "Confidential reports + Team mgmt", "Data export + 10 simultaneous challenges", "Unlimited experience bank"] },
            ] as const).map((p) => (
              <div key={p.name} className={`relative rounded-2xl p-6 border ${p.popular ? "border-gold bg-deep shadow-gold" : "border-cream/15 bg-deep/40"}`}>
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-gold-foreground text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="size-3 fill-current" /> {t("plans.popular")}
                  </div>
                )}
                <h3 className="text-cream text-center font-bold text-lg">{t(`plans.${p.name}`)}</h3>
                <p className="text-gold text-center text-2xl font-bold mt-2 mb-5">{p.price}</p>
                <ul className="space-y-2 mb-6 min-h-[180px]">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2 text-cream/80 text-sm">
                      <Check className="size-4 text-gold shrink-0 mt-0.5" /><span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className={`w-full rounded-full ${p.popular ? "bg-gold text-gold-foreground hover:bg-gold/90" : "bg-cream/10 text-cream hover:bg-cream/20"}`}>
                  <Link to="/signup">{t("plans.get")}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Assessment */}
      <section id="assessment" className="container mx-auto px-4 py-20 scroll-mt-20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 border border-gold/30 px-3 py-1 text-xs font-semibold text-deep mb-4">
              <ClipboardCheck className="size-3.5 text-gold" /> {t("nav.assessment")}
            </div>
            <h2 className="font-display text-4xl md:text-5xl text-deep tracking-tight mb-4">
              {t("assess.title") !== "assess.title" ? t("assess.title") : "Discover your leadership profile"}
            </h2>
            <p className="text-foreground/70 leading-relaxed mb-6">
              {t("assess.body") !== "assess.body" ? t("assess.body") : "A 7-minute ICF-aligned assessment that maps your strengths, blind spots, and growth edges across decision-making, delegation, communication, and resilience. Your personalized coaching path is built from the result."}
            </p>
            <ul className="space-y-2 mb-7 text-sm text-foreground/80">
              {[
                "12 dimensions of executive performance",
                "Regional benchmark for GCC leaders",
                "Personalized 30-day coaching roadmap",
              ].map((f) => (
                <li key={f} className="flex gap-2"><Check className="size-4 text-gold mt-0.5 shrink-0" />{f}</li>
              ))}
            </ul>
            <Button asChild size="lg" className="btn-luxe-gold rounded-full px-7 h-12 font-semibold">
              <Link to="/signup">{t("assess.cta") !== "assess.cta" ? t("assess.cta") : "Take the assessment"}</Link>
            </Button>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-gold/15 via-transparent to-deep/10 blur-2xl" />
            <div className="relative rounded-3xl border border-gold/20 bg-gradient-to-br from-cream to-white p-8 shadow-elegant">
              <div className="flex items-center gap-3 mb-5">
                <img src={morshedLogo} alt="" className="size-10" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Sample report</div>
                  <div className="font-display text-lg text-deep">Leadership Profile</div>
                </div>
              </div>
              {[
                { k: "Decision-making", v: 82, c: "bg-emerald-500" },
                { k: "Delegation", v: 64, c: "bg-gold" },
                { k: "Difficult conversations", v: 48, c: "bg-rose-500" },
                { k: "Strategic thinking", v: 76, c: "bg-emerald-500" },
                { k: "Resilience under pressure", v: 71, c: "bg-gold" },
              ].map((row) => (
                <div key={row.k} className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-deep">{row.k}</span>
                    <span className="font-semibold text-deep">{row.v}/100</span>
                  </div>
                  <div className="h-2 rounded-full bg-deep/8 overflow-hidden">
                    <div className={`h-full ${row.c} rounded-full transition-all`} style={{ width: `${row.v}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sample chat preview */}
      <section className="bg-deep py-16 border-y border-cream/10">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-gold/15 border border-gold/30 px-3 py-1 text-xs font-semibold text-cream mb-5">
            <PlayCircle className="size-3.5 text-gold" /> Live demo
          </div>
          <h2 className="font-display text-3xl md:text-4xl text-cream tracking-tight mb-3">
            See a real coaching conversation
          </h2>
          <p className="text-cream/70 mb-7 leading-relaxed">
            Walk through a fully-rendered Morshed session — including stage badges, coach memory, next actions and micro-learning triggers.
          </p>
          <Button asChild size="lg" variant="outline" className="rounded-full px-8 h-12 border-gold/50 text-cream hover:bg-gold/10 hover:text-cream bg-transparent">
            <Link to="/demo">Open sample chat</Link>
          </Button>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container mx-auto px-4 py-20 scroll-mt-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 border border-gold/30 px-3 py-1 text-xs font-semibold text-deep mb-3">
              <HelpCircle className="size-3.5 text-gold" /> {t("nav.faq")}
            </div>
            <h2 className="font-display text-4xl md:text-5xl text-deep tracking-tight">Questions, answered</h2>
          </div>
          <div className="space-y-3">
            {[
              { q: "Is Morshed a replacement for a human coach?", a: "No — Morshed complements human coaching by providing 24/7 reflection, accountability and micro-learning between sessions. For executive-level engagements, we recommend pairing Morshed with periodic human coach reviews." },
              { q: "Is my data private?", a: "Yes. Conversations are encrypted, stored in your private workspace, and never used to train shared models. You can export or delete your data at any time." },
              { q: "Which languages are supported?", a: "Morshed responds fluently in Arabic, English and Persian — including code-switching mid-conversation." },
              { q: "Is the methodology evidence-based?", a: "Morshed follows ICF-aligned coaching principles (mirroring, pattern reflection, one powerful question) combined with established leadership frameworks (GROW, situational leadership, Immunity to Change)." },
              { q: "Can my organization deploy it for a whole team?", a: "Yes — the VIP plan includes team rollout, confidential aggregate reporting, and admin controls. Contact us for enterprise pricing." },
            ].map((item, i) => (
              <details key={i} className="group rounded-2xl border border-deep/10 bg-card p-5 shadow-sm open:border-gold/40 open:shadow-elegant transition-all">
                <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-deep">
                  <span>{item.q}</span>
                  <ChevronDown className="size-5 text-gold transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm text-foreground/75 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-deep py-20 border-t border-cream/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-cream mb-6">{t("cta.bottom.title")}</h2>
          <Button asChild size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90 rounded-full px-8 h-12">
            <Link to="/signup">{t("cta.bottom.btn")}</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-deep border-t border-cream/10 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Logo size={32} textClass="text-cream" />
              <p className="text-cream/60 text-sm mt-4 leading-relaxed">{t("footer.disclaimer")}</p>
              <div className="flex gap-3 mt-4">
                {[MessageCircle, Linkedin, Instagram, Mail].map((I, i) => (
                  <a key={i} href="#" className="size-8 rounded-full border border-cream/20 flex items-center justify-center text-cream/70 hover:text-gold hover:border-gold">
                    <I className="size-4" />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-cream font-semibold mb-3">{t("footer.product")}</h4>
              <ul className="space-y-2 text-cream/70 text-sm">
                <li><a href="#how">How It Works</a></li>
                <li><a href="#plans">Plans & Pricing</a></li>
                <li><a href="#assessment">Management Assessment</a></li>
                <li><a href="#faq">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-cream font-semibold mb-3">{t("footer.company")}</h4>
              <ul className="space-y-2 text-cream/70 text-sm">
                <li><a href="#">About Morshed</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Partnerships</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-cream font-semibold mb-3">{t("footer.legal")}</h4>
              <ul className="space-y-2 text-cream/70 text-sm">
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms & Conditions</a></li>
                <li><a href="#">Disclaimer</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-cream/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-center text-cream/50 text-xs">
            <div>© 2026 Morshed — All rights reserved</div>
            <div className="flex items-center gap-2">
              <span className="text-cream/40">Designed by</span>
              <span className="text-gold font-semibold">Mahdi Pourabdollah</span>
              <span className="text-cream/30">·</span>
              <a href="mailto:mahdi.poorabdollah@gmail.com" className="text-cream/70 hover:text-gold transition-colors">
                mahdi.poorabdollah@gmail.com
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
