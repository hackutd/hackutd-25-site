import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import AppHeader from '../AppHeader';
import Image from 'next/image';
import HomeAboutText from './about/HomeAboutText';
import HomeVideoStats from './HomeVideoStats';
import HackUTDCountdown from './countdown';
import KeynoteSpeaker from './speakers';

const useHeroImageCache = () => {
  const [cachedImages, setCachedImages] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const cachedImagesRef = useRef<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(true);

  const MOBILE_LAYERS = ['/assets/topDrawing/mobileBG-optimized.jpg'];

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
      const currentLayers = MOBILE_LAYERS;
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
    const currentLayers = MOBILE_LAYERS;
    preloadImages(currentLayers);
  }, [isMobile, preloadImages]);

  return {
    cachedImages,
    isLoading,
    MOBILE_LAYERS,
    isMobile,
    preloadImages,
  };
};

export default function HomeHero() {
  const { cachedImages, isLoading, MOBILE_LAYERS, isMobile } = useHeroImageCache();

  return (
    <div
      className="overflow-x-hidden w-full bg-fallback"
      style={{
        backgroundImage: `url("/assets/bgConnected.webp")`,
        backgroundColor: 'transparent',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center top',
        backgroundAttachment: 'scroll',
        zIndex: 2,
      }}
    >
      <section className="min-h-[100svh] flex flex-col-reverse md:flex-col">
        {/* Header above the hero */}
        {/* <AppHeader /> */}
        {/* <AppHeader /> */}

        <div className="relative w-full min-h-[100svh] max-h-[100svh] overflow-hidden">
          <div
            className="absolute inset-0 z-0 hidden xl:block pointer-events-none"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              contain: 'layout style paint',
              isolation: 'isolate',
            }}
          >
            <Image
              src="/assets/topDrawing/fox.webp"
              alt="Fox"
              fill
              className="object-contain object-center"
              priority
              sizes="100vw"
              style={{
                position: 'absolute',
                inset: 0,
                objectFit: 'contain',
                objectPosition: 'center',
              }}
            />
            <Image
              src="/assets/topDrawing/deer.webp"
              alt="Deer"
              fill
              className="object-contain object-center"
              priority
              sizes="100vw"
              style={{
                position: 'absolute',
                inset: 0,
                objectFit: 'contain',
                objectPosition: 'center',
              }}
            />
            <Image
              src="/assets/topDrawing/cat.webp"
              alt="Cat"
              fill
              className="object-contain object-center"
              priority
              sizes="100vw"
              style={{
                position: 'absolute',
                inset: 0,
                objectFit: 'contain',
                objectPosition: 'center',
                transform: 'translateY(8%)',
              }}
            />
            <Image
              src="/assets/topDrawing/bird.webp"
              alt="Bird"
              fill
              className="object-contain object-center"
              priority
              sizes="100vw"
              style={{
                position: 'absolute',
                inset: 0,
                objectFit: 'contain',
                objectPosition: 'center',
              }}
            />
          </div>

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

      {/* Other components that use the same background */}
      <div className={`my-24 md:my-[30rem]`}>
        <HomeAboutText />
      </div>

      <div className={`my-32 md:my-[40rem]`}>
        <HomeVideoStats />
      </div>

      <div className={`my-32 mb-32 md:my-[40rem] md:mb-[128rem]`}>
        <HackUTDCountdown />
      </div>

      <div className={`my-32 -mt-16 md:my-72 md:-mt-[32rem]`}>
        <KeynoteSpeaker />
      </div>
    </div>
  );
}
