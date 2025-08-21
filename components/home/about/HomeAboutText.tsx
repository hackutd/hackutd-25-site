import React, { useContext, useEffect, useRef } from 'react';

import { SectionReferenceContext } from '@/lib/context/section';

const HomeAboutText = () => {
  const { aboutRef } = useContext(SectionReferenceContext);
  const titleRef = useRef(null); // Reference for title animation
  const explanationRef = useRef(null); // Reference for explanation animation
  const containerRef = useRef(null); // Reference for entire container to observe

  useEffect(() => {
    // TODO: update this to use the media query
    // const isDesktopView = window.matchMedia('(min-width: 1024px)').matches;
    const isDesktopView = true;

    if (isDesktopView) {
      const handleIntersection = (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const titleText = titleRef.current;
            const explanationText = explanationRef.current;

            // Add animation classes
            titleText.classList.add('title-animate-in');
            explanationText.classList.add('explanation-animate-in');

            observer.unobserve(entry.target);
          }
        });
      };

      const observer = new IntersectionObserver(handleIntersection, {
        threshold: 0.3,
        rootMargin: '0px 0px -100px 0px',
      });

      if (containerRef.current) {
        observer.observe(containerRef.current);
      }

      return () => {
        if (containerRef.current) {
          observer.unobserve(containerRef.current);
        }
      };
    } else {
      // Mobile: show immediately
      const titleText = titleRef.current;
      const explanationText = explanationRef.current;
      if (titleText) titleText.classList.add('title-animate-in');
      if (explanationText) explanationText.classList.add('explanation-animate-in');
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative py-12 flex flex-col items-center justify-center font-jua"
      style={{
        // background: '#F2F3FF',
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      id="what-is-hackutd"
    >
      <style>
        {`
          .title-animate {
            opacity: 0;
            transform: translateY(50px);
            transition: opacity 1s ease-out, transform 1s ease-out;
            will-change: opacity, transform;
          }

          .title-animate-in {
            opacity: 1;
            transform: translateY(0);
          }

          .explanation-animate {
            opacity: 0;
            transform: translateY(100px);
            transition: opacity 1.5s ease-out 1.5s, transform 1.5s ease-out 1.5s;
            will-change: opacity, transform;
          }

          .explanation-animate-in {
            opacity: 1;
            transform: translateY(0);
          }
        `}
      </style>

      <h1
        ref={titleRef}
        className="text-5xl font-bold mb-3 text-center relative font-jua z-10 text-[#FFF] title-animate"
      >
        About HackPortal?
      </h1>

      <div className="relative w-full flex justify-center items-center z-10">
        <p
          ref={explanationRef}
          className="text-xl text-center text-[#616161] max-w-2xl mb-16 font-fredoka relative z-10 px-6 md:px-0 explanation-animate"
        >
          Hackathons are 24-hour gatherings where students collaborate to create innovative
          projects, forge new connections, and compete for prizes.
        </p>
      </div>
    </div>
  );
};

export default HomeAboutText;
