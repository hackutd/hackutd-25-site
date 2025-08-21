import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import AppHeader from '../AppHeader';

export default function HomeHero() {
  // Default to "mobile" on first paint to keep memory low on iOS before JS runs.
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  const MOBILE_LAYERS = [
    '/assets/topDrawing/foreground.webp',
    '/assets/topDrawing/bg.webp',
    '/assets/topDrawing/bgGrass.webp',
    '/assets/topDrawing/moon.webp',
    '/assets/topDrawing/sky.webp',
  ];

  const DESKTOP_LAYERS = [
    '/assets/topDrawing/fox.webp',
    '/assets/topDrawing/deer.webp',
    '/assets/topDrawing/cat.webp',
    '/assets/topDrawing/bird.webp',
    // Foreground elements
    '/assets/topDrawing/frontSideTrees.webp',
    '/assets/topDrawing/foreground.webp',
    // Background elements
    '/assets/topDrawing/bgGrass.webp',
    '/assets/topDrawing/bgTrees.webp',
    '/assets/topDrawing/bg.webp',
    '/assets/topDrawing/bgClouds.webp',
    '/assets/topDrawing/moon.webp',
    // Sky at bottom (first in array = bottom layer)
    '/assets/topDrawing/sky.webp',
  ];

  const layers = isMobile ? MOBILE_LAYERS : DESKTOP_LAYERS;

  const bgStyle = useMemo<React.CSSProperties>(() => {
    const urls = layers.map((u) => `url('${u}')`).join(', ');
    const repeats = layers.map(() => 'no-repeat').join(', ');
    // Using 'cover' for all keeps your visual look; mobile list is tiny so it's safe.
    const sizes = layers.map(() => 'cover').join(', ');
    const positions = layers.map(() => 'center').join(', ');

    return {
      backgroundImage: urls,
      backgroundRepeat: repeats,
      backgroundSize: sizes,
      backgroundPosition: positions,
      backgroundAttachment: 'scroll',
    };
  }, [layers]);

  return (
    <section className="min-h-[100svh] bg-white flex flex-col-reverse md:flex-col">
      {/* Header above the hero */}
      <AppHeader />

      <div className="relative w-full min-h-[100svh]" style={bgStyle}>
        {/* Title lockup */}
        <div
          className="absolute left-1/2 z-10 w-full max-w-[600px] md:max-w-[800px] px-4"
          style={{ top: '33%', transform: 'translate(-50%, -50%)' }}
        >
          <Image
            src="/assets/Vectorized-Title.svg"
            alt="HACKPORTAL"
            width={800}
            height={200}
            priority
            className="w-full h-auto drop-shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}
