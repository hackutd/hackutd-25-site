import Image from 'next/image';

export default function HomeVideoStats() {
  return (
    <section className="z-10 relative md:h-[600px]">
      <img
        src="/assets/pathDrawing/bushRight.webp"
        alt=""
        className="absolute right-0 top-0 -mt-[30vw] z-0 w-[80vw] hidden md:block xl:-mt-[50vw] 2xl:-mt-[60rem]"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
      <img
        src="/assets/pathDrawing/bird.webp"
        alt="Bird"
        className="absolute right-0 top-0 -mt-[30vw] z-10 md:w-[12vw] hidden md:block xl:-mt-[50vw] 2xl:-mt-[60rem]"
        style={{ right: '12vw', top: '12vw' }}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
      <img
        src="/assets/pathDrawing/gust.GIF"
        alt="Gust"
        className="absolute right-0 top-0 -mt-[30vw] z-5 md:w-[28vw] hidden md:block xl:-mt-[50vw] 2xl:-mt-[60rem]"
        style={{ right: '8vw', top: '8vw' }}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />

      <div className="flex flex-col justify-center items-center mx-auto py-[1rem] md:py-[2rem] lg:py-[3rem] xl:py-[3rem] 2xl:py-[4rem] ml-2 md:ml-4 lg:ml-[40vw] px-4 md:px-0">
        <div className="flex justify-center relative w-full z-20 -mt-[10vw] sm:-mt-[12vw] md:mt-0 xl:-mt-[20vw] 2xl:-mt-64">
          <img
            src="/assets/statsScroll.png"
            alt=""
            className="z-10 lg:w-[60vw]"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div
            className=" mt-[26vw] sm:mt-[30vw] md:mt-[240px] lg:mt-[180px] xl:mt-[240px] 2xl:mt-[450px] absolute inset-0 flex-row lg:flex-col items-center justify-center 
                     z-50 stats-position-533-640"
          >
            <div className="flex justify-center items-center text-center font-medium text-[10px] sm:text-base w-[50%] md:w-full ml-[22vw] md:ml-0 md:text-lg lg:text-base 2xl:text-3xl text-[#351918] md:space-x-20 space-y-6 md:space-y-0 stats-text-533-640 lg:mt-4">
              At our last hackathon, we had the pleasure of hosting...
            </div>
            <div className="flex md:flex-col justify-center flex-wrap w-[60%] lg:w-full gap-x-4 ml-[18vw] mt-2 lg:ml-0 lg:mt-4 2xl:mt-8">
              <div className="flex flex-row justify-center items-center text-center text-[10px] sm:text-lg md:text-2xl lg:text-2xl 2xl:text-5xl lg:space-x-20 space-y-6 lg:space-y-0 stats-numbers-533-640">
                <span className="font-medium text-[#351918]">1200+&nbsp;</span>Hackers
              </div>
              <div className="lg:mt-1 2xl:mt-2 flex flex-row justify-center items-center text-center text-[10px] sm:text-lg md:text-2xl lg:text-2xl 2xl:text-5xl md:space-x-20 space-y-6 md:space-y-0 stats-numbers-533-640">
                <span className="font-medium text-[#351918]">30+&nbsp;</span>Universities
              </div>
              <div className="lg:mt-1 2xl:mt-2 flex flex-row justify-center items-center text-center text-[10px] sm:text-lg md:text-2xl lg:text-2xl 2xl:text-5xl md:space-x-20 space-y-6 md:space-y-0 stats-numbers-533-640">
                <span className="font-medium text-[#351918]">200+&nbsp;</span>Projects
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center relative w-full z-30 mt-4 md:mt-2 lg:mt-0 xl:mt-0 2xl:mt-16">
          <img
            src="/assets/teaserBanner.png"
            alt=""
            className="z-20 w-[90%] sm:w-[80%] md:w-[70%] lg:w-[37vw] max-w-[600px] lg:-mt-4"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <h1
            className="-mt-[50px] sm:-mt-[57px] md:-mt-[60px] lg:-mt-[70px] 2xl:-mt-[90px] absolute inset-0 flex items-center justify-center 
                    text-xl sm:text-2xl md:text-4xl lg:text-4xl font-light 
                    bg-gradient-to-t from-[#FFC273] to-[#8C180D] font-medium bg-clip-text z-50 text-[#531285] md:text-transparent font-serif px-4"
          >
            See our Teaser
          </h1>
        </div>
        <div className="w-[70vw] sm:w-[60vw] md:w-[40vw] -mt-[15vw] sm:-mt-[17vw] md:-mt-[4vw] lg:-mt-[120px] z-20 aspect-video flex justify-center items-center rounded-lg overflow-hidden ">
          <iframe
            className="w-full aspect-video"
            src="https://www.youtube.com/embed/SaDiaoaHxEc?controls=1&modestbranding=1&rel=0"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </section>
  );
}
