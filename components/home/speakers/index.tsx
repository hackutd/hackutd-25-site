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
    <section className="overflow-x-auto min-h-[24rem] pb-20  bg-cover bg-center">
      <div className="relative w-screen flex justify-center items-start overflow-x-hidden">
        {/* Top overlay banner */}
        <div className="absolute top-0 bg-[url('/assets/SpeakerRoll.png')] bg-cover bg-center w-[500px] h-[170px] flex items-center justify-center z-20">
          <h1 className="text-4xl mb-4 font-bold text-center font-Young-Serif text-transparent bg-gradient-to-b from-[#FF834E] to-[#7D1F00] bg-clip-text">
            Keynote Speaker
          </h1>
        </div>

        {/* Main Vector border */}
        <Image
          src={Vector}
          alt="Vector Border"
          width={1920}
          height={1008}
          className="w-[65vw] h-auto max-h-[65vh] mt-20 max-w-full" // add margin-top to make space for banner
        />

        {/* Inner content (speaker image + info card) */}
        <div className="absolute inset-0 flex flex-col md:flex-row justify-center items-center gap-8 max-w-full">
          {/* Speaker image */}
          <div className="flex justify-center">
            <Image
              className="md:w-[300px] md:h-[300px] w-[200px] h-[200px]"
              src={SpeakerImage}
              width={300}
              height={300}
              alt="Speaker"
            />
          </div>

          {/* Square info card */}
          <div className="relative w-72 h-72 md:w-80 md:h-80 px-4">
            <div className="absolute inset-0 rounded-3xl bg-black/80 border border-orange-400 shadow-[0_0_30px_10px_rgba(255,165,0,0.5)]"></div>
            <div className="relative flex flex-col justify-center items-center gap-y-2 px-4 py-4 text-center">
              <h1 className="font-fredoka font-medium text-[#F7CE79] text-2xl break-words">
                {data.name}
              </h1>
              <h3 className="font-fredoka text-lg text-white break-words">{data.title}</h3>
              <p className="text-sm leading-5 font-fredoka text-white font-normal break-words">
                {data.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
