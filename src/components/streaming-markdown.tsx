import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Smooth, throttled "typewriter" reveal for streaming markdown.
 * Buffers the latest server text and reveals it character-by-character
 * with rAF so even chunky network bursts feel like real typing.
 * When `isStreaming` flips to false, it fast-forwards to the full text.
 */
export function StreamingMarkdown({
  text,
  isStreaming,
  charsPerFrame = 2,
}: {
  text: string;
  isStreaming: boolean;
  charsPerFrame?: number;
}) {
  const [shown, setShown] = useState(isStreaming ? "" : text);
  const targetRef = useRef(text);
  const rafRef = useRef<number | null>(null);

  useEffect(() => { targetRef.current = text; }, [text]);

  useEffect(() => {
    if (!isStreaming) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setShown(text);
      return;
    }
    const tick = () => {
      setShown((cur) => {
        const target = targetRef.current;
        if (cur.length >= target.length) {
          rafRef.current = requestAnimationFrame(tick);
          return cur;
        }
        // dynamic catch-up: if we're far behind, type faster
        const gap = target.length - cur.length;
        const step = Math.max(charsPerFrame, Math.ceil(gap / 24));
        return target.slice(0, cur.length + step);
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isStreaming, text, charsPerFrame]);

  return (
    <>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{shown || "…"}</ReactMarkdown>
      {isStreaming && (
        <span className="inline-block w-[3px] h-[1.1em] -mb-[2px] bg-gold align-baseline ms-0.5 animate-cursor-blink rounded-sm" />
      )}
    </>
  );
}
