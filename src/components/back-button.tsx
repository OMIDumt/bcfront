import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";

type Props = {
  to?: string;
  label?: string;
  className?: string;
  variant?: "ghost" | "solid";
};

export function BackButton({ to, label, className = "", variant = "ghost" }: Props) {
  const router = useRouter();
  const { t, lang } = useI18n();
  const isRtl = lang === "ar" || lang === "fa";
  const Icon = isRtl ? ArrowRight : ArrowLeft;
  const text = label ?? t("common.back") ?? "Back";

  const base =
    "inline-flex items-center gap-1.5 text-sm font-medium rounded-full px-3.5 h-9 transition-colors";
  const styles =
    variant === "solid"
      ? "bg-deep text-cream hover:bg-deep/90"
      : "bg-cream/60 backdrop-blur text-deep hover:bg-cream border border-deep/10";

  if (to) {
    return (
      <Link to={to} className={`${base} ${styles} ${className}`}>
        <Icon className="size-4" />
        <span>{text}</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) router.history.back();
        else router.navigate({ to: "/" });
      }}
      className={`${base} ${styles} ${className}`}
    >
      <Icon className="size-4" />
      <span>{text}</span>
    </button>
  );
}
