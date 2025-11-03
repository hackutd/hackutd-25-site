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
    <section
      className="overflow-x-hidden min-h-[24rem] pb-20 bg-cover bg-center lg:mt-[20rem] 2xl:mt-[30rem]"
      style={{ maxWidth: '100vw', overflowX: 'hidden', width: '100vw' }}
    >
      <div
        className="relative w-full min-h-screen flex flex-col justify-center items-center overflow-x-hidden px-4"
        style={{ maxWidth: '100vw', overflowX: 'hidden', width: '100%' }}
      >
        {/* Speaker Banner (this now serves as the main header for the section) */}
        <div className="relative w-full max-w-[500px] h-[170px] 2xl:max-w-[800px] 2xl:h-[300px] z-20 mb-10 mt-64">
          <Image
            src="/assets/SpeakerRoll.png"
            alt="Keynote Speaker Banner"
            fill
            style={{ objectFit: 'contain' }}
            className="w-full h-full"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1
              className="text-2xl md:text-4xl 2xl:text-6xl font-bold text-center font-Young-Serif px-4 -mt-4"
              style={{ color: '#531285' }}
            >
              Keynote Speaker
            </h1>
          </div>
        </div>

        {/* -------------------- DESKTOP LAYOUT (HIDDEN ON MOBILE) -------------------- */}
        {/* The negative margin pulls this section up slightly to overlap with the banner */}
        <div className="hidden xl:block w-full max-w-6xl 2xl:max-w-8xl -mt-16 md:-mt-24">
          {/* Content now sits in a normal flow, not absolutely positioned */}
          <div className="flex flex-col lg:flex-row justify-center items-center gap-6 lg:gap-10 p-4 lg:p-8">
            {/* Speaker Image */}
            <div className="flex justify-center flex-shrink-0">
              <div className="w-[200px] h-[200px] md:w-[250px] md:h-[250px] lg:w-[300px] lg:h-[300px] 2xl:w-[400px] 2xl:h-[400px] border border-purple-300 shadow-[0_0_30px_10px_rgba(216,180,254,0.5)] bg-black/80 rounded-lg flex items-center justify-center">
                <Image
                  src={data.img || SpeakerImage}
                  alt={data.name || 'Keynote Speaker'}
                  width={300}
                  height={300}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>
            {/* Speaker Details */}
            <div className="relative w-full max-w-[500px] lg:max-w-[400px] 2xl:max-w-[600px] min-h-[280px] lg:h-80 2xl:h-96">
              <div className="absolute inset-0 rounded-3xl bg-black/80 border border-purple-300 shadow-[0_0_30px_10px_rgba(216,180,254,0.5)]"></div>
              <div className="relative flex flex-col justify-center items-center gap-y-2 p-4 lg:p-6 h-full">
                <div className="flex flex-col items-start justify-center h-full text-left px-4">
                  {data?.title || data?.name ? (
                    <>
                      {data?.name && (
                        <div
                          className="text-white text-xl md:text-2xl 2xl:text-4xl font-bold font-youngSerif -mt-6 mb-4 pt-2"
                          style={{ color: '#E3DDC6' }}
                        >
                          {data.name}
                        </div>
                      )}
                      {data?.title && (
                        <div className="text-white text-lg md:text-xl 2xl:text-2xl mt-2 font-medium mb-2">
                          {data.title}
                        </div>
                      )}
                      {data?.description && (
                        <p className="text-base md:text-lg text-white/90 mt-4 max-w-xl">
                          {data.description}
                        </p>
                      )}
                    </>
                  ) : (
                    <span className="text-white text-xl md:text-2xl 2xl:text-4xl font-bold font-youngSerif">
                      Coming Soon
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* -------------------- MOBILE LAYOUT (HIDDEN ON DESKTOP) -------------------- */}
        <div className="block xl:hidden w-full max-w-sm flex flex-col items-center gap-6 p-4">
          {/* Speaker Image */}
          <div className="flex justify-center flex-shrink-0 w-[200px] h-[200px] -mt-16">
            <div className="w-full h-full border border border-purple-300 shadow-[0_0_30px_10px_rgba(216,180,254,0.5)] bg-black/80 rounded-lg flex items-center justify-center overflow-hidden ">
              {data?.img ? (
                <Image
                  src={data.img}
                  alt={data.name || 'Keynote Speaker'}
                  width={400}
                  height={400}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-white text-lg font-bold font-youngSerif">Coming Soon</span>
              )}
            </div>
          </div>
          {/* Speaker Details */}
          <div className="relative w-full rounded-3xl bg-black/80 border border border-purple-300 shadow-[0_0_30px_10px_rgba(216,180,254,0.5)] min-h-[280px]">
            <div className="relative flex flex-col justify-center items-center gap-y-2 p-4 h-full">
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                {data?.title || data?.name ? (
                  <>
                    {data?.name && (
                      <div
                        className="text-white text-lg font-bold font-youngSerif mb-2"
                        style={{ color: '#E3DDC6' }}
                      >
                        {data.name}
                      </div>
                    )}
                    {data?.title && <div className="text-white text-base mt-1">{data.title}</div>}
                    {data?.description && (
                      <p className="text-md text-white/90 mt-3">{data.description}</p>
                    )}
                  </>
                ) : (
                  <span className="text-white text-lg font-bold font-youngSerif">Coming Soon</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
