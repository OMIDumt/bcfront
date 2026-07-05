import logo from "@/assets/morshed-logo.png";

export function Logo({ size = 32, withText = true, textClass = "" }: { size?: number; withText?: boolean; textClass?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="rounded-full bg-gold flex items-center justify-center shrink-0"
        style={{ width: size, height: size }}
      >
        <img src={logo} alt="Morshed" width={size} height={size} className="object-contain" style={{ width: size * 0.7, height: size * 0.7 }} />
      </div>
      {withText && <span className={`font-bold tracking-tight ${textClass}`}>Morshed</span>}
    </div>
  );
}
