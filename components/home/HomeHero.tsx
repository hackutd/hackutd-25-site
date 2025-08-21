import BackgroundCircles from '../BackgroundCircles';
import AppHeader from '../AppHeader';
import Image from 'next/image';

export default function HomeHero() {
  return (
    <section className="min-h-screen bg-contain bg-white flex flex-col-reverse md:flex-col">
      {/* App header */}
      <AppHeader />

      <div className="flex h-screen w-full relative">
        {/* <div className="w-full h-full absolute top-0 left-0 z-0">
          <BackgroundCircles />
        </div> */}

        <div className="relative z-10 shrink-0 w-full flex">
          {/* MLH sticker */}
          {/* <div className="absolute top-0 right-4 z-20">
            <Image
              src={MLH_Sticker.src}
              height={MLH_Sticker.height}
              width={MLH_Sticker.width}
              alt="MLH sticker"
              className="w-full h-full object-cover"
            />
          </div> */}

          {/* Big welcome */}
          <div
            className="w-full flex flex-col gap-2 justify-center items-center relative"
            style={{
              backgroundImage: `url('/assets/topDrawing/frontSideTrees.webp'),
                                url('/assets/topDrawing/bird.PNG'),
                                url('/assets/topDrawing/cat.PNG'),
                                url('/assets/topDrawing/deer.PNG'),
                                url('/assets/topDrawing/fox.PNG'),
                                url('/assets/topDrawing/bgGrass.webp'), 
                                url('/assets/topDrawing/bgTrees.webp'),
                                url('/assets/topDrawing/foreground.webp'), 
                                url('/assets/topDrawing/bg.webp'), 
                                url('/assets/topDrawing/bgClouds.webp'),
                                url('/assets/topDrawing/moon.webp'), 
                                url('/assets/topDrawing/sky.webp')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {/* <p className="font-nunito text-[#FFF] text-xl md:text-3xl">Welcome To</p> */}
            <div
              className="w-full max-w-[600px] md:max-w-[800px] z-10 absolute"
              style={{ top: '33%', transform: 'translateY(-50%)' }}
            >
              <Image
                src="/assets/Vectorized-Title.svg"
                alt="HACKPORTAL"
                width={800}
                height={200}
                className="w-full h-auto drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom banner */}
      {/* <div className="font-dmSans w-full flex justify-center bg-[#7B81FF] text-white h-[1.75rem] text-nowrap overflow-hidden">
        <p className="text-lg">
          SAMPLE TEXT • SAMPLE TEXT • SAMPLE TEXT • SAMPLE TEXT • SAMPLE TEXT • SAMPLE TEXT • SAMPLE
          TEXT • SAMPLE TEXT • SAMPLE TEXT
        </p>
      </div> */}
    </section>
  );
}
