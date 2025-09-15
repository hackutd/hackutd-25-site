import React, { useEffect, useState } from 'react';
const SpeakerImage = '/assets/Speaker.png';
const Vector = '/assets/Vector.svg';
import Image from 'next/image';
import { RequestHelper } from '@/lib/request-helper';

export default function HomeSpeakers() {
  const [data, setData] = useState({ title: '', name: '', img: '', description: '' });
  useEffect(() => {
    const fetchData = async () => {
      const { data: keynote }: any = await RequestHelper.get('/api/keynotespeakers', {});
      setData(keynote);
    };
    fetchData();
  }, []);
  return (
    <section className="overflow-x-auto min-h-[24rem] pb-20 bg-cover bg-center lg:mt-[80rem] 2xl:mt-[160rem]">
      <div className="relative w-full min-h-screen flex flex-col justify-center items-center overflow-x-hidden px-4">
        {/* Keynote Speaker Banner (Remains unchanged as it is responsive) */}
        <div className="relative w-full max-w-[500px] h-[170px] 2xl:max-w-[800px] 2xl:h-[300px] z-20">
          <Image
            src="/assets/SpeakerRoll.png"
            alt="Keynote Speaker Banner"
            fill
            style={{ objectFit: 'contain' }}
            className="w-full h-full"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-2xl md:text-4xl 2xl:text-6xl font-bold text-center font-Young-Serif text-transparent bg-gradient-to-b from-[#FF834E] to-[#7D1F00] bg-clip-text px-4 -mt-4">
              Keynote Speaker
            </h1>
          </div>
        </div>

        {/* -------------------- DESKTOP LAYOUT (HIDDEN ON MOBILE) -------------------- */}
        <div className="hidden xl:block w-full max-w-6xl 2xl:max-w-8xl -mt-24">
          {/* Background vector border */}
          <div className="w-full flex justify-center">
            <Image
              src={Vector}
              alt="Vector Border"
              width={600}
              height={400}
              className="w-[70vw] h-auto max-h-[70vh] 2xl:w-[80vw] 2xl:max-h-[80vh] max-w-full object-contain"
            />
          </div>
          {/* Content overlay with absolute positioning */}
          <div className="absolute inset-0 flex flex-col lg:flex-row justify-center items-center gap-6 lg:gap-10 p-4 lg:p-8 2xl:mt-32">
            {/* Speaker Image */}
            <div className="flex justify-center flex-shrink-0">
              <div className="w-[200px] h-[200px] md:w-[250px] md:h-[250px] lg:w-[300px] lg:h-[300px] 2xl:w-[400px] 2xl:h-[400px] border border-orange-400 shadow-[0_0_30px_10px_rgba(255,165,0,0.5)] bg-black/80 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl md:text-2xl 2xl:text-4xl font-bold font-fredoka">
                  Coming Soon
                </span>
              </div>
            </div>
            {/* Speaker Details */}
            <div className="relative w-full max-w-[500px] lg:max-w-[400px] 2xl:max-w-[600px] min-h-[280px] lg:h-80 2xl:h-96">
              <div className="absolute inset-0 rounded-3xl bg-black/80 border border-orange-400 shadow-[0_0_30px_10px_rgba(255,165,0,0.5)]"></div>
              <div className="relative flex flex-col justify-center items-center gap-y-2 p-4 lg:p-6 h-full">
                <div className="flex items-center justify-center h-full">
                  <span className="text-white text-xl md:text-2xl 2xl:text-4xl font-bold font-fredoka">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* -------------------- MOBILE LAYOUT (HIDDEN ON DESKTOP) -------------------- */}
        <div className="block xl:hidden w-full max-w-sm flex flex-col items-center gap-6 p-4">
          {/* Speaker Image */}
          <div className="flex justify-center flex-shrink-0 w-[200px] h-[200px]">
            <div className="w-full h-full border border-orange-400 shadow-[0_0_30px_10px_rgba(255,165,0,0.5)] bg-black/80 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold font-youngSerif">Coming Soon</span>
            </div>
          </div>
          {/* Speaker Details */}
          <div className="relative w-full rounded-3xl bg-black/80 border border-orange-400 shadow-[0_0_30px_10px_rgba(255,165,0,0.5)] min-h-[280px]">
            <div className="relative flex flex-col justify-center items-center gap-y-2 p-4 h-full">
              <div className="flex items-center justify-center h-full">
                <span className="text-white text-lg font-bold font-youngSerif">Coming Soon</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
