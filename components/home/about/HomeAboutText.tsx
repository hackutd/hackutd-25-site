import React, { useContext, useEffect, useRef } from 'react';

import { SectionReferenceContext } from '@/lib/context/section';
import gsap from 'gsap';

const HomeAboutText = () => {
  const { aboutRef } = useContext(SectionReferenceContext);
  const titleRef = useRef(null); // Reference for title animation
  const explanationRef = useRef(null); // Reference for explanation animation
  const containerRef = useRef(null); // Reference for entire container to observe

  useEffect(() => {
    // Show content immediately without animations
    const titleText = titleRef.current;
    const explanationText = explanationRef.current;

    if (titleText) {
      titleText.style.opacity = '1';
      titleText.innerHTML = 'What Is HackUTD?';
      titleText.style.color = '#531285';
    }

    if (explanationText) {
      explanationText.style.opacity = '1';
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative mt-4 md:mt-0 flex flex-col items-center md:items-start justify-center font-jua md:pl-16"
      style={{
        background: 'transparent',
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        zIndex: 50,
        position: 'relative',
        minHeight: '200px',
      }}
      id="what-is-hackutd"
    >
      {/* Pink Flower Tree - positioned left, higher than fox, behind about container */}
      <div
        className="absolute left-0 top-0 pointer-events-none"
        style={{
          zIndex: 10,
          transform: 'translateY(-20%)',
        }}
      >
        <img
          src="/assets/pathDrawing/pinkFlowerTree.webp"
          alt="Pink Flower Tree"
          className="w-64 md:w-96 lg:w-[500px] xl:w-[500px] 2xl:w-[800px] h-auto opacity-80"
        />
      </div>
      <div className="flex justify-center md:justify-start relative w-full z-10">
        <div className="flex flex-col items-center md:items-start w-full max-w-4xl xl:max-w-4xl 2xl:max-w-7xl">
          <div className="relative flex justify-center w-full -mb-20" style={{ zIndex: 100 }}>
            <img
              src="/assets/aboutbanner.png"
              alt="HackUTD"
              className="z-10 rotate-180 w-auto h-auto xl:scale-125"
              style={{ zIndex: 10 }}
            />
            <h1
              ref={titleRef}
              className="mt-[50px] sm:mt-[70px] 2xl:mt-[100px] absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl md:text-4xl xl:text-4xl 2xl:text-6xl font-light font-serif hackutd-title"
              style={{
                zIndex: 100,
                opacity: 1,
                color: '#531285',
              }}
            >
              What Is HackUTD?
            </h1>
          </div>

          <div className="relative w-full z-0 flex justify-center">
            <p
              ref={explanationRef}
              className="text-xl xl:text-xl 2xl:text-3xl text-center md:text-left text-white max-w-sm md:max-w-4xl xl:max-w-4xl 2xl:max-w-6xl mb-16 font-fredoka relative px-[20px] md:px-[40px] xl:px-[40px] 2xl:px-[60px] pt-[100px] pb-[50px] xl:pt-[100px] xl:pb-[50px] 2xl:pt-[120px] 2xl:pb-[70px] rounded-2xl backdrop-blur-sm shadow-lg"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            >
              HackUTD, the largest 24 hour university hackathon in North America, is a weekend-long
              event where students build apps, hardware, and more. HackUTD provides a venue for
              self-expression and creativity through technology. People with varying technical
              backgrounds from universities all over the US come together, form teams around a
              problem or idea, and collaboratively build a unique solution from scratch. Whether
              youre a frequent hackathon attendee or just getting started, we&apos;d love to see
              what you can make!
            </p>
          </div>

          {/* Fox image below the about text */}
          <div className="relative w-full flex justify-center -mt-4">
            <img
              src="/assets/pathDrawing/sfox.GIF"
              alt="Fox"
              className="
                w-80 md:w-96 lg:w-[500px] xl:w-[500px] 2xl:w-[600px]
                h-auto
                md:-mt-12 lg:-mt-16
                scale-[1.4]        /* enlarge by 40% */
                origin-center      /* scale from the middle */
              "
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeAboutText;
