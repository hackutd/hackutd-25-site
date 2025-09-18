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
      <section className="min-h-[100vh] flex flex-col-reverse md:flex-col">
        {/* <AppHeader /> */}
        {/* <AppHeader /> */}

        <div className="relative w-full min-h-[100vh] max-h-[100vh] overflow-hidden">
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
                <Image
                  src="https://s3.amazonaws.com/logged-assets/trust-badge/2026/mlh-trust-badge-2026-gray.svg"
                  alt="Major League Hacking 2026 Hackathon Season"
                  width={100}
                  height={100}
                  style={{ width: '100%' }}
                  className="w-full"
                />
              </a>
            </div>
          </div>

          <div
            className="absolute left-1/2 z-10 w-full max-w-[600px] md:max-w-[800px] px-4"
            style={{ top: '33%', transform: 'translate(-50%, -50%)' }}
          >
            <Image
              src="/assets/Vectorized-Title.svg"
              alt="HACKPORTAL"
              width={800}
              height={200}
              fetchPriority="high"
              priority
              className={`w-full h-auto ${isMobile ? '' : 'drop-shadow-2xl'}`}
            />

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
                  color: '#1a1a2e',
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

      <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
        <div className="md:hidden" style={{ marginTop: '-20rem' }}>
          <Image
            src="/assets/topDrawing/poyo.webp"
            alt="Poyo"
            width={120}
            height={120}
            className="w-24 h-24"
          />
        </div>
        <div className="hidden md:block" style={{ marginTop: '15rem' }}>
          <Image
            src="/assets/topDrawing/poyo.webp"
            alt="Poyo"
            width={240}
            height={240}
            className="w-48 h-48 md:w-64 md:h-64"
          />
        </div>
      </div>

      <div className={`my-24 md:my-[30rem] xl:my-[60rem] 2xl:my-[70rem]`}>
        <div className="relative w-full h-32 md:h-48 xl:h-64 2xl:h-80 pointer-events-none">
          <div className="absolute -left-32 md:-left-48 xl:-left-64 2xl:-left-80 -top-[400px] md:-top-[600px] xl:-top-[800px] 2xl:-top-[1000px] z-10">
            <Image
              src="/assets/pathDrawing/backLeftCloud.webp"
              alt="Back Left Cloud"
              width={800}
              height={400}
              className="w-[500px] md:w-[700px] xl:w-[800px] 2xl:w-[1000px] h-auto opacity-80"
            />
          </div>

          <div className="absolute -right-16 md:-right-24 xl:-right-32 2xl:-right-40 -top-[400px] md:-top-[600px] xl:-top-[800px] 2xl:-top-[1000px] z-10">
            <Image
              src="/assets/pathDrawing/backRightCloud.webp"
              alt="Back Right Cloud"
              width={800}
              height={400}
              className="w-[500px] md:w-[700px] xl:w-[800px] 2xl:w-[1000px] h-auto opacity-80"
            />
          </div>
        </div>

        <HomeAboutText />
      </div>

      <div className={`my-8 md:my-12 xl:my-24`}>
        <HomeVideoStats />
      </div>

      <div className={`my-32 mb-32 md:my-[60rem] md:mb-[128rem]`}>
        <div className="absolute z-0" style={{ left: '-8rem', marginTop: '20rem' }}>
          <div className="md:hidden">
            <Image
              src="/assets/pathDrawing/cliff.webp"
              alt="Cliff"
              width={300}
              height={400}
              className="w-80 h-96"
            />
          </div>
          <div className="hidden md:block">
            <Image
              src="/assets/pathDrawing/cliff.webp"
              alt="Cliff"
              width={400}
              height={600}
              className="w-[50rem] h-[40rem] md:w-[60rem] md:h-[50rem]"
            />
          </div>
        </div>

        <HackUTDCountdown />
      </div>

      <div className={`my-32 -mt-16 md:my-72 xl:my-80 md:-mt-[32rem] xl:-mt-[20rem] relative`}>
        <Image
          src="/assets/pathDrawing/sideRiver.webp"
          alt="Side River"
          width={400}
          height={600}
          className="absolute right-0 z-20 lg:w-[60vw] hidden lg:block select-none pointer-events-none side-river-medium"
          style={{
            top: '-1400px',
            right: '-100px',
          }}
          draggable={false}
          onError={(e) => {
            console.log('Side river image failed to load');
            e.currentTarget.style.display = 'none';
          }}
          onLoad={() => {
            console.log('Side river image loaded successfully');
          }}
        />
        <Image
          src="/assets/pathDrawing/deer.webp"
          alt="Deer"
          width={200}
          height={300}
          className="absolute right-0 z-30 lg:w-[30vw] hidden lg:block select-none pointer-events-none side-river-medium deer-positioning"
          style={{
            top: '-1000px',
            right: '20px',
          }}
          draggable={false}
          onError={(e) => {
            console.log('Deer image failed to load');
            e.currentTarget.style.display = 'none';
          }}
          onLoad={() => {
            console.log('Deer image loaded successfully');
          }}
        />
        <KeynoteSpeaker />
      </div>
    </div>
  );
}
