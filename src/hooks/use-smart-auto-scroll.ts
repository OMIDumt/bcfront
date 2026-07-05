import { useEffect, useRef } from "react";

/**
 * Auto-scrolls a container to the bottom on dependency changes,
 * but ONLY when the user is already near the bottom (won't fight scroll-up).
 */
export function useSmartAutoScroll<T extends HTMLElement>(deps: unknown[], threshold = 120) {
  const ref = useRef<T>(null);
  const stuckRef = useRef(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
      stuckRef.current = dist < threshold;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [threshold]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !stuckRef.current) return;
    // rAF so layout is settled before measuring
    requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
