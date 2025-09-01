import React, { useEffect, useState } from 'react';
const SpeakerImage = '/assets/Speaker.png';
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
      <div className="w-full flex flex-col gap-2 justify-center items-center relative min-h-[24rem] absolute inset-0 -z-10"
        style={{
          backgroundImage: `url('/assets/pathDrawing/forestyGround.PNG')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="relative bg-[url('/assets/KeyNoteBg.svg')] bg-cover bg-center w-[800px] h-[200px] flex items-center justify-center mx-auto"
          >
          <h1 className="relative -top-4 text-6xl font-bold text-center font-DM-Sans z-10 text-transparent bg-gradient-to-t from-[#FF9F03] to-[#FFECB2] bg-clip-text">
            Keynote Speaker
          </h1>
        </div>
        <div className="flex flex-col md:flex-row items-center md:items-stretch gap-3 mx-auto justify-center">
          <Image
            className="md:w-[400px] md:h-[400px]"
            src={SpeakerImage}
            width={200}
            height={200}
            alt="Speaker"
          />
          <div className="w-4/5 bg-white rounded-3xl md:w-1/2 px-8 py-10 flex flex-col gap-y-2">
            <h1 className="font-fredoka font-medium text-[#F7CE79] text-4xl">{data.name}</h1>
            <h3 className="font-fredoka text-xl">{data.title}</h3>
            <hr className="border-t-4 w-[60px] border-black my-2" />
            <p className="mt-3 leading-7 font-fredoka text-lg font-normal">{data.description}</p>
          </div>
        </div>
              
      </div>
    </section>
  );
}
