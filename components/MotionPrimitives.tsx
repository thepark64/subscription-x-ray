"use client";

import { useEffect, useRef, useState } from "react";

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}

export function RevealSection({
  children,
  className = "",
  delayMs = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setVisible(true);
      return;
    }

    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -32px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <div
      ref={ref}
      className={`reveal-block${visible ? " is-visible" : ""}${className ? ` ${className}` : ""}`}
      style={
        delayMs > 0 && !reducedMotion
          ? { transitionDelay: `${delayMs}ms` }
          : undefined
      }
    >
      {children}
    </div>
  );
}

export function TaglineReveal({
  lines,
  eyebrow,
}: {
  lines: string[];
  eyebrow?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [activeCount, setActiveCount] = useState<number>(0);
  const reducedMotion = usePrefersReducedMotion();

  const tokenizedLines = lines.map((line) => line.trim().split(/\s+/));
  const totalWords = tokenizedLines.reduce((sum, words) => sum + words.length, 0);

  useEffect(() => {
    if (reducedMotion) {
      setActiveCount(totalWords);
      return;
    }

    let rafId = 0;

    const evaluateWords = () => {
      rafId = 0;
      const vh = window.innerHeight || 800;
      const triggerY = vh * 0.72;
      let lit = 0;

      for (let i = 0; i < totalWords; i++) {
        const el = wordRefs.current[i];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= triggerY) {
          lit = i + 1;
        }
      }

      setActiveCount((prev) => (lit > prev ? lit : prev));
    };

    const scheduleCheck = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(evaluateWords);
    };

    evaluateWords();

    const container = containerRef.current;
    let observer: IntersectionObserver | null = null;
    if (container && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            scheduleCheck();
          }
        },
        { threshold: [0, 0.25, 0.5, 0.75, 1] }
      );
      observer.observe(container);
    }

    window.addEventListener("scroll", scheduleCheck, { passive: true });
    window.addEventListener("resize", scheduleCheck, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      if (observer) observer.disconnect();
      window.removeEventListener("scroll", scheduleCheck);
      window.removeEventListener("resize", scheduleCheck);
    };
  }, [reducedMotion, totalWords]);

  let runningIndex = 0;

  return (
    <div ref={containerRef} className="tagline-reveal-wrap">
      {eyebrow && <p className="eyebrow caption-3">{eyebrow}</p>}
      <h2 className="tagline-reveal-text heading-2">
        {tokenizedLines.map((words, lineIndex) => (
          <span key={lineIndex} className="tagline-line">
            {words.map((word, wordIndex) => {
              const currentIndex = runningIndex++;
              const isLit = reducedMotion || currentIndex < activeCount;
              return (
                <span
                  key={`${lineIndex}-${wordIndex}`}
                  ref={(el) => {
                    wordRefs.current[currentIndex] = el;
                  }}
                  className={`tagline-word${isLit ? " is-lit" : ""}`}
                >
                  {word}
                  {wordIndex < words.length - 1 ? " " : ""}
                </span>
              );
            })}
          </span>
        ))}
      </h2>
    </div>
  );
}
