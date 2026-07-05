import { useI18n, LANGS, type Lang } from "@/lib/i18n";

export function LangSwitcher({ variant = "default" }: { variant?: "default" | "compact" }) {
  const { lang, setLang } = useI18n();
  return (
    <div className={`inline-flex rounded-full p-1 gap-1 ${variant === "compact" ? "bg-secondary" : "bg-cream/10 border border-cream/20"}`}>
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code as Lang)}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
            lang === l.code
              ? "bg-gold text-gold-foreground"
              : variant === "compact"
                ? "text-foreground/70 hover:text-foreground"
                : "text-cream/80 hover:text-cream"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
