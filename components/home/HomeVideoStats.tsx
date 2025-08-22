import { useEffect, useMemo, useRef, useState } from 'react';

interface StatItem {
  data: string;
  object: string;
}

const stats: StatItem[] = [
  { data: '1000+', object: 'Hackers' },
  { data: '24', object: 'Hours' },
  { data: '$120,000', object: 'Prizes' },
  { data: '200+', object: 'Projects' },
];

export default function HomeVideoStats() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  const targets = useMemo(() => {
    return stats.map((s) => {
      const numeric = parseInt(s.data.replace(/[^0-9]/g, ''), 10);
      return Number.isFinite(numeric) ? numeric : 0;
    });
  }, []);

  const [animatedNumbers, setAnimatedNumbers] = useState<number[]>(stats.map(() => 0));

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasStarted) {
            setHasStarted(true);
          }
        });
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    let rafId = 0;
    const durationMs = 900;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / durationMs);
      setAnimatedNumbers(targets.map((t) => Math.floor(t * progress)));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [hasStarted, targets]);

  const formatDisplay = (current: number, original: string) => {
    const hasDollar = original.trim().startsWith('$');
    const hasPlus = original.trim().endsWith('+');
    const prefix = hasDollar ? '$' : '';
    const suffix = hasPlus ? '+' : '';
    return `${prefix}${Math.floor(current).toLocaleString()}${suffix}`;
  };

  return (
    <section ref={sectionRef} className="relative">
      <div className="flex flex-col justify-center items-center mx-auto py-[3rem] space-y-8">
        {/* Section Title with bordered text */}
        <div className="relative w-full max-w-[360px] sm:max-w-[420px] mx-auto">
          <img
            src="/assets/border.webp"
            alt="Stats border"
            className="relative top-5 sm:top-5 md:top-6 w-full h-auto select-none pointer-events-none"
            aria-hidden
          />
          <div className="absolute inset-0 grid place-items-center">
            <h2 className="text-[#351918] font-fredokaOne text-3xl sm:text-4xl">Stats</h2>
          </div>
        </div>

        {/* Stats stacked vertically (top to bottom) */}
        <div className="w-full flex flex-col items-center">
          {stats.map((stat, index) => {
            const value = formatDisplay(animatedNumbers[index] || 0, stat.data);
            return (
              <div key={stat.data} className="my-3 text-center">
                <p className="text-3xl text-white lg:text-4xl">
                  {value} {stat.object}
                </p>
              </div>
            );
          })}
        </div>

        {/* Video */}
        <div className="w-full aspect-video flex justify-center">
          <iframe
            className="w-7/8 mt-8 md:w-[800px] md:h-[450px]"
            src="https://www.youtube.com/embed/dMVtL2OmB60?si=ZKpc1VRAM6i-XmQQ"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </section>
  );
}
