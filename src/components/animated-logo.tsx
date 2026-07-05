import logo from "@/assets/morshed-logo.png";

type Props = {
  size?: number;
  showRays?: boolean;
  className?: string;
};

/**
 * Premium animated brand mark for hero sections.
 * Pure CSS animations — slow rotation of the compass, gentle float,
 * pulsing gold halo, rotating accent rings, and radiating light beams.
 */
export function AnimatedLogo({ size = 360, showRays = true, className = "" }: Props) {
  return (
    <div
      className={`relative mx-auto ${className}`}
      style={{ width: size, height: size }}
      aria-label="Morshed compass"
    >
      {/* radial glow */}
      <div
        className="absolute inset-0 rounded-full blur-3xl opacity-60 morshed-pulse"
        style={{
          background:
            "radial-gradient(circle at center, rgba(212,170,82,0.55) 0%, rgba(212,170,82,0.15) 40%, transparent 70%)",
        }}
      />

      {/* light rays */}
      {showRays && (
        <div
          className="absolute inset-0 morshed-rays opacity-40"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgba(212,170,82,0.35) 6deg, transparent 12deg, transparent 30deg, rgba(212,170,82,0.25) 36deg, transparent 42deg, transparent 60deg, rgba(212,170,82,0.3) 66deg, transparent 72deg, transparent 90deg, rgba(212,170,82,0.2) 96deg, transparent 102deg, transparent 360deg)",
            maskImage: "radial-gradient(circle, black 30%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(circle, black 30%, transparent 75%)",
          }}
        />
      )}

      {/* outer ring */}
      <div className="absolute inset-4 rounded-full border border-gold/30 morshed-spin-slow" />
      {/* mid ring with tick marks */}
      <div
        className="absolute inset-10 rounded-full morshed-spin-reverse"
        style={{
          background:
            "repeating-conic-gradient(rgba(212,170,82,0.55) 0deg 1deg, transparent 1deg 15deg)",
          maskImage:
            "radial-gradient(circle, transparent 60%, black 61%, black 64%, transparent 65%)",
          WebkitMaskImage:
            "radial-gradient(circle, transparent 60%, black 61%, black 64%, transparent 65%)",
        }}
      />
      {/* inner dashed ring */}
      <div
        className="absolute inset-16 rounded-full border-2 border-dashed border-gold/40 morshed-spin-mid"
      />

      {/* the compass itself with float */}
      <div className="absolute inset-0 flex items-center justify-center morshed-float">
        <img
          src={logo}
          alt=""
          className="morshed-spin-very-slow drop-shadow-[0_10px_40px_rgba(212,170,82,0.45)]"
          style={{ width: size * 0.72, height: size * 0.72, objectFit: "contain" }}
        />
      </div>

      {/* sparkles */}
      <span className="absolute top-[12%] left-[18%] size-1.5 rounded-full bg-gold morshed-twinkle" />
      <span className="absolute top-[20%] right-[14%] size-1 rounded-full bg-gold morshed-twinkle-d1" />
      <span className="absolute bottom-[18%] left-[22%] size-1 rounded-full bg-gold morshed-twinkle-d2" />
      <span className="absolute bottom-[14%] right-[20%] size-2 rounded-full bg-gold morshed-twinkle-d3" />
    </div>
  );
}
