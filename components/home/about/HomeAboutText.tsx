import React, { useContext, useEffect, useRef } from 'react';
import gsap from 'gsap';

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
        threshold: 1,
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
      gsap.set([titleRef.current, explanationRef.current], { opacity: 1, y: 0 });
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative -mt-36 flex flex-col items-center justify-center font-jua"
      style={{
        // background: '#F2F3FF',
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      id="what-is-hackutd"
    >
      <div className="flex justify-center relative w-full z-10">
        <img src="/assets/aboutbanner.png" alt="HackUTD" className="z-10 rotate-180" />
        <h1
          ref={titleRef}
          className="mt-[50px] sm:mt-[70px] absolute inset-0 flex items-center justify-center 
                  text-2xl sm:text-3xl md:text-4xl font-light 
                  bg-gradient-to-t from-[#531285] to-[#C694FF] bg-clip-text z-50 text-transparent font-serif"
        >
          What Is HackUTD?
        </h1>
      </div>

      <div className="relative w-full flex justify-center items-center -mt-24 z-0">
        <p
          ref={explanationRef}
          className="text-xl text-center text-white max-w-4xl mb-16 font-fredoka relative px-[40px] opacity-0 bg-black/50 pt-[100px] pb-[50px] rounded-2xl backdrop-blur-sm shadow-lg shadow-[#93004C66]"
        >
          HackUTD, the largest university hackathon in Texas, is a weekend-long event where students
          build apps, hardware, and more. HackUTD provides a venue for self-expression and
          creativity through technology. People with varying technical backgrounds from universities
          all over the US come together, form teams around a problem or idea, and collaboratively
          build a unique solution from scratch. Whether youre a frequent hackathon attendee or just
          getting started, we&apos;d love to see what you can make!
        </p>
      </div>
    </div>
  );
};

export default HomeAboutText;
