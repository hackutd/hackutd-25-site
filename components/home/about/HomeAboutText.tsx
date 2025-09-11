import React, { useContext, useEffect, useRef } from 'react';

import { SectionReferenceContext } from '@/lib/context/section';
import gsap from 'gsap';

const HomeAboutText = () => {
  const { aboutRef } = useContext(SectionReferenceContext);
  const titleRef = useRef(null); // Reference for title animation
  const explanationRef = useRef(null); // Reference for explanation animation
  const containerRef = useRef(null); // Reference for entire container to observe

  useEffect(() => {
    // TODO: update this to use the media query
    const isDesktopView = window.matchMedia('(min-width: 1024px)').matches;

    if (isDesktopView) {
      const handleIntersection = (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const titleText = titleRef.current;

            gsap.set(titleText, { opacity: 1 });

            const titleLetters = titleText.innerText.split('');
            titleText.innerHTML = titleLetters
              .map((letter) => {
                if (letter === ' ') {
                  return `<span class="inline-block">&nbsp;</span>`;
                }
                return `<span class="bg-gradient-to-t from-[#531285] to-[#C694FF] bg-clip-text text-transparent inline-block">${letter}</span>`;
              })
              .join('');

            gsap.fromTo(
              titleText.children,
              { opacity: 0, y: 50 },
              {
                opacity: 1,
                y: 0,
                stagger: 0.1,
                ease: 'power3.out',
                duration: 1,
              },
            );

            gsap.fromTo(
              explanationRef.current,
              { opacity: 0, y: 100 },
              { opacity: 1, y: 0, duration: 1.5, ease: 'power3.out', delay: 1.5 },
            );

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
      // Mobile: show immediately without GSAP animation
      const titleText = titleRef.current;
      const explanationText = explanationRef.current;
      if (titleText) {
        titleText.style.opacity = '1';
        // Ensure text content is preserved without GSAP manipulation
        titleText.innerHTML = 'What Is HackUTD?';
        // Ensure gradient is applied
        titleText.style.background = 'linear-gradient(to top, #531285, #C694FF)';
        titleText.style.WebkitBackgroundClip = 'text';
        titleText.style.WebkitTextFillColor = 'transparent';
        titleText.style.backgroundClip = 'text';
      }
      if (explanationText) explanationText.classList.add('explanation-animate-in');
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative mt-32 md:-mt-20 flex flex-col items-center md:items-start justify-center font-jua md:pl-16"
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
      <div className="flex justify-center md:justify-start relative w-full z-10">
        <div className="flex flex-col items-center md:items-start w-full max-w-4xl">
          <div className="relative flex justify-center w-full -mb-20" style={{ zIndex: 100 }}>
            <img
              src="/assets/aboutbanner.png"
              alt="HackUTD"
              className="z-10 rotate-180"
              style={{ zIndex: 10 }}
            />
            <h1
              ref={titleRef}
              className="mt-[50px] sm:mt-[70px] absolute inset-0 flex items-center justify-center
                      text-2xl sm:text-3xl md:text-4xl font-light 
                      bg-gradient-to-t from-[#531285] to-[#C694FF] bg-clip-text text-transparent font-serif banner-gradient"
              style={{
                zIndex: 100,
                opacity: 1,
                background: 'linear-gradient(to top, #531285, #C694FF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              What Is HackUTD?
            </h1>
          </div>

          <div className="relative w-full z-0 flex justify-center">
            <p
              ref={explanationRef}
              className="text-xl text-center md:text-left text-white max-w-sm md:max-w-4xl mb-16 font-fredoka relative px-[20px] md:px-[40px] opacity-0 bg-black/50 pt-[100px] pb-[50px] rounded-2xl backdrop-blur-sm shadow-lg shadow-[#93004C66]"
            >
              HackUTD, the largest university hackathon in Texas, is a weekend-long event where
              students build apps, hardware, and more. HackUTD provides a venue for self-expression
              and creativity through technology. People with varying technical backgrounds from
              universities all over the US come together, form teams around a problem or idea, and
              collaboratively build a unique solution from scratch. Whether youre a frequent
              hackathon attendee or just getting started, we&apos;d love to see what you can make!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeAboutText;
