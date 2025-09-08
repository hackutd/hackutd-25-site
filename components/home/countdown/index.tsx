import React, { useState, useEffect, CSSProperties } from 'react';
// TODO: convert styles to tailwind
import styles from './HackCountdown.module.css';
import Image from 'next/image';
import { config } from '../../../hackportal.config';

interface Props {
  targetDate: string;
}

const HackCountdown: React.FC<Props> = ({ targetDate }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  return (
    <section className="relative w-screen flex justify-center items-start overflow-x-hidden">
      <div className="relative w-screen flex flex-col justify-center items-center overflow-x-hidden">
        <div className="relative w-[95vw] md:w-[600px] h-auto aspect-[2.4/1] z-20 translate-y-12 md:translate-y-0">
          <Image
            src="/assets/KeynoteSpeakerRoll.svg"
            alt="Countdown banner"
            fill
            style={{ objectFit: 'contain' }}
            className="relative md:static top-4 md:top-0" // push down only on mobile
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-2xl md:text-5xl font-bold text-center font-Young-Serif text-transparent bg-gradient-to-b from-[#EDFF4E] to-[#FF1717] bg-clip-text -mt-8 md:-mt-8 translate-y-2 md:translate-y-0">
              CountDown
            </h1>
          </div>
        </div>

        {/* -------------------- DESKTOP LAYOUT (VISIBLE ON MD AND UP) -------------------- */}
        <div className="hidden md:block w-full flex flex-col items-center -mt-56">
          <div className="relative flex justify-center">
            <Image
              src="/assets/Vector.svg"
              alt="Decorative background shape"
              style={{
                objectFit: 'contain',
                objectPosition: 'center',
                zIndex: -1,
              }}
              width={600}
              height={400}
              className="w-[70vw] h-auto max-h-[70vh] mt-20 max-w-full"
            />

            {/* Content positioned absolutely within the border */}
            <div className="absolute inset-0 flex flex-col items-center justify-center mt-20">
              <div className="w-[18rem] md:w-[20rem] px-4">
                <div className={styles.timeSection}>
                  {Object.entries(timeLeft).map(([unit, value]) => {
                    const digits = value.toString().padStart(2, '0').split('');
                    return (
                      <div key={unit} style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex' }}>
                          {digits.map((digit, index) => (
                            <div key={`${unit}-${index}`} className={styles.digitBox}>
                              <span className={styles.digit}>{digit}</span>
                            </div>
                          ))}
                        </div>
                        <div className={styles.label}>{unit.toUpperCase()}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-center w-full text-white text-2xl font-DM-Sans mt-8">
                <h1>{"We'll let you know when we are hatching"}</h1>
              </div>
            </div>
          </div>
        </div>

        {/* -------------------- MOBILE LAYOUT (VISIBLE ON SMALL SCREENS) -------------------- */}
        <div className="block md:hidden flex flex-col items-center mt-8 px-4">
          <div className="flex flex-row flex-wrap justify-center gap-4 mt-8">
            {Object.entries(timeLeft).map(([unit, value]) => {
              const digits = value.toString().padStart(2, '0').split('');
              return (
                <div key={unit} className="flex flex-col items-center mb-4">
                  <div className="flex">
                    {digits.map((digit, index) => (
                      <div key={`${unit}-${index}`} className={styles.digitBox}>
                        <span className="text-3xl font-bold text-white font-Young-Serif">
                          {digit}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-gray-300 font-Young-Serif mt-1">
                    {unit.toUpperCase()}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center w-full text-white text-lg font-DM-Sans mt-8">
            <h1>{"We'll let you know when we are hatching"}</h1>
          </div>
        </div>
      </div>
    </section>
  );
};

const HackUTDCountdown: React.FC = () => {
  return <HackCountdown targetDate={config.targetDate} />;
};

export default HackUTDCountdown;
