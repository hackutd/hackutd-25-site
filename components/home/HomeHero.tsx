import { useEffect, useState } from 'react';
import AppHeader from '../AppHeader';
import Image from 'next/image';

const imageSequence = [
  'sky.PNG',
  'bgClouds.PNG',
  'bg.PNG',
  'foreground.PNG',
  'bgTrees.PNG',
  'bgGrass.PNG',
  'frontSideTrees.PNG',
  'moon.PNG',
  'fox.PNG',
  'deer.PNG',
  'cat.PNG',
  'bird.PNG',
];

export default function HomeHero() {
  const [loadedCount, setLoadedCount] = useState(0);
  const [allLoaded, setAllLoaded] = useState(false);

  useEffect(() => {
    if (loadedCount === imageSequence.length) {
      setTimeout(() => {
        setAllLoaded(true);
      }, 300); // small buffer after load
    }
  }, [loadedCount]);

  return (
    <section className="relative min-h-screen bg-contain bg-white flex flex-col-reverse md:flex-col">
      {/* App header */}
      <AppHeader />

      {/* Wrapper for all absolutely positioned stuff */}
      <div className="relative w-full h-screen">
        {/* Preloader */}
        {!allLoaded && (
          <div className="absolute inset-0 z-50 flex justify-center items-center bg-black text-white">
            <p className="text-xl animate-pulse">Loading...</p>
          </div>
        )}

        {/* Image Layers */}
        {imageSequence.map((name, index) => {
          const delay = index * 0.1;
          return (
            <div
              key={name}
              className={`absolute top-0 left-0 w-full h-full transition-all duration-50 ease-in-out ${
                allLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}
              style={{
                zIndex: index,
                transitionDelay: `${delay}s`,
              }}
            >
              <Image
                src={`/assets/topDrawing/compressed-images/${name}`}
                alt={name}
                fill
                onLoad={() => setLoadedCount((prev) => prev + 1)}
                className="object-cover"
                loading="eager"
                priority={index < 3}
              />
            </div>
          );
        })}

        {/* Title Content */}
        <div className="relative z-[9999] w-full h-full flex justify-center items-center">
          <div
            className={`w-full max-w-[600px] md:max-w-[800px] absolute transition-all duration-50 ease-in-out ${
              allLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
            style={{
              top: '30%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              transitionDelay: `${imageSequence.length * 0.2 + 0.2}s`,
            }}
          >
            <Image
              src="/assets/Vectorized-Title.svg"
              alt="HACKPORTAL"
              width={800}
              height={200}
              className="w-full h-auto drop-shadow-2xl"
              loading="eager"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
