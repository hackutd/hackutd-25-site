import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import AppHeader from '../AppHeader';
import Image from 'next/image';

const useHeroImageCache = () => {
  const [cachedImages, setCachedImages] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const cachedImagesRef = useRef<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(true);

  const MOBILE_LAYERS = ['/assets/topDrawing/mobileBG-optimized.jpg'];

  const DESKTOP_LAYERS = [
    '/assets/topDrawing/frontSideTrees.webp',
    '/assets/topDrawing/fox.webp',
    '/assets/topDrawing/deer.webp',
    '/assets/topDrawing/cat.webp',
    '/assets/topDrawing/bird.webp',
    '/assets/topDrawing/bgGrass.webp',
    '/assets/topDrawing/bgTrees.webp',
    '/assets/topDrawing/foreground.webp',
    '/assets/topDrawing/bg.webp',
    '/assets/topDrawing/bgClouds.webp',
    '/assets/topDrawing/moon.webp',
    '/assets/topDrawing/sky.webp',
  ];

  // Detect mobile on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(max-width: 768px)');
    setIsMobile(mql.matches);

    const update = () => setIsMobile(mql.matches);
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  const preloadImages = useCallback(
    async (imageUrls: string[]) => {
      // Only preload images for current device type to reduce initial load
      const currentLayers = isMobile ? MOBILE_LAYERS : DESKTOP_LAYERS;
      const imagesToLoad = imageUrls.filter((url) => currentLayers.includes(url));

      const newCachedImages = new Set(cachedImagesRef.current);
      const uncachedImages = imagesToLoad.filter((url) => !newCachedImages.has(url));

      if (uncachedImages.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        // Load images with priority for mobile
        const loadPromises = uncachedImages.map((url) => {
          return new Promise<void>((resolve, reject) => {
            const img = new window.Image();
            img.onload = () => {
              newCachedImages.add(url);
              cachedImagesRef.current.add(url);
              resolve();
            };
            img.onerror = () => {
              console.warn(`Failed to load image: ${url}`);
              resolve();
            };
            img.src = url;
          });
        });

        await Promise.all(loadPromises);
        setCachedImages(newCachedImages);
      } catch (error) {
        console.error('Error preloading images:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [isMobile],
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Only preload current device images initially
    const currentLayers = isMobile ? MOBILE_LAYERS : DESKTOP_LAYERS;
    preloadImages(currentLayers);
  }, [isMobile, preloadImages]);

  return {
    cachedImages,
    isLoading,
    MOBILE_LAYERS,
    DESKTOP_LAYERS,
    isMobile,
    preloadImages,
  };
};

export default function HomeHero() {
  const { cachedImages, isLoading, MOBILE_LAYERS, DESKTOP_LAYERS, isMobile } = useHeroImageCache();

  const layers = isMobile ? MOBILE_LAYERS : DESKTOP_LAYERS;

  const bgStyle = useMemo<React.CSSProperties>(() => {
    if (isLoading) {
      return {
        backgroundColor: '#2a2342',
      };
    }

    // Mobile optimization: use lightweight background for better performance
    if (isMobile) {
      return {
        backgroundImage: `url('${layers[0]}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'scroll',
        backgroundColor: '#2a2342', // fallback color
      };
    }

    // Desktop: use layered backgrounds
    const urls = layers.map((u) => `url('${u}')`).join(', ');
    const repeats = layers.map(() => 'no-repeat').join(', ');
    const sizes = layers.map(() => 'cover').join(', ');
    const positions = layers.map(() => 'center').join(', ');

    return {
      backgroundImage: urls,
      backgroundRepeat: repeats,
      backgroundSize: sizes,
      backgroundPosition: positions,
      backgroundAttachment: 'scroll',
    };
  }, [layers, isLoading, isMobile]);

  return (
    <section className="min-h-[100svh] bg-white flex flex-col-reverse md:flex-col">
      {/* Header above the hero */}
      {/* <AppHeader /> */}
      {/* <AppHeader /> */}

      <div className="relative w-full min-h-[100svh]" style={bgStyle}>
        {/* MLH sticker */}
        <div className="relative z-10 shrink-0 w-full flex">
          <div className="absolute top-0 right-4 z-20 transition-all">
            <a
              id="mlh-trust-badge"
              style={{
                display: 'block',
                maxWidth: '100px',
                minWidth: '60px',
                width: '10%',
              }}
              href="https://mlh.io/na?utm_source=na-hackathon&utm_medium=TrustBadge&utm_campaign=2026-season&utm_content=gray"
              target="_blank"
            >
              <img
                src="https://s3.amazonaws.com/logged-assets/trust-badge/2026/mlh-trust-badge-2026-gray.svg"
                alt="Major League Hacking 2026 Hackathon Season"
                style={{ width: '100%' }}
              />
            </a>
          </div>
        </div>

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
            className={`w-full h-auto ${isMobile ? '' : 'drop-shadow-2xl'}`}
          />

          {/* Date SVG */}
          <div className="text-center mt-6 mb-4">
            <Image
              src="/assets/topDrawing/Nov-8-9.svg"
              alt="Nov 8-9"
              width={92}
              height={99}
              priority
              className="w-auto h-6 md:h-8 mx-auto"
            />
          </div>

          {/* Apply Button */}
          <div className={`${isMobile ? 'mt-24' : 'mt-8'} text-center`}>
            <button
              onClick={() => (window.location.href = '/auth')}
              className={`relative overflow-hidden font-bold py-3 px-10 rounded-full shadow-2xl transform transition-all duration-300 backdrop-blur-sm group ${
                isMobile ? 'hover:scale-100' : 'hover:scale-105'
              }`}
              style={{
                background: isMobile
                  ? '#EABF73'
                  : 'linear-gradient(135deg, #EABF73 0%, #D4A574 100%)',
                color: '#1e1b4b',
                border: isMobile ? '1px solid #EABF73' : '1px solid rgba(234, 191, 115, 0.4)',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                boxShadow: isMobile
                  ? '0 4px 6px rgba(0,0,0,0.1)'
                  : '0 10px 40px rgba(234, 191, 115, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}
            >
              {!isMobile && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              )}
              <span className="relative text-lg md:text-xl font-bold tracking-wider uppercase">
                Apply Now
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
