type Props = {
  src: string;
  name?: string;
  size?: number;
  online?: boolean;
  speaking?: boolean;
  className?: string;
};

/**
 * Premium animated avatar for the AI coach.
 * - Rotating gold conic halo
 * - Soft pulsing glow
 * - Optional "speaking" mic waveform overlay
 */
export function CoachAvatar({ src, name = "Coach", size = 44, online = true, speaking = false, className = "" }: Props) {
  return (
    <div className={`relative inline-flex ${className}`} style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full coach-halo-orbit coach-halo-glow" />
      <div
        className="relative rounded-full overflow-hidden ring-2 ring-gold/70 bg-card"
        style={{ width: size, height: size }}
      >
        <img src={src} alt={name} className="size-full object-cover" />
      </div>
      {online && (
        <span className="absolute bottom-0 end-0 size-3 rounded-full bg-emerald-500 ring-2 ring-card animate-pulse" />
      )}
      {speaking && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-end gap-[2px] h-3">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="block w-[2px] bg-gold rounded-full mic-wave-bar"
              style={{ height: "100%", animationDelay: `${i * 110}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
