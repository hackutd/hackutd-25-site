export default function HomeVideoStats() {
  return (
    <section className="z-10 relative md:h-[370px]">
      <div className="flex flex-col justify-center items-center mx-auto py-[3rem]">
        {/* Stats */}
        <div className="flex justify-center relative w-full z-10 ml-[40vw]">
          <img src="/assets/statsScroll.png" alt="HackUTD" className="z-10 w-[60vw]" />
          <div
            className="mt-[17.3vw] absolute inset-0 flex-col items-center justify-center 
                     z-50"
          >
            <div className="flex flex-col md:flex-row justify-center items-center text-center font-medium text-lg text-[#351918] md:space-x-20 space-y-6 md:space-y-0">
              At our last hackathon, we had the pleasure of hosting...
            </div>
            <div className=" mt-[3vw] flex flex-col md:flex-row justify-center items-center text-center text-3xl md:space-x-20 space-y-6 md:space-y-0">
              <span className="font-medium text-[#351918]">1200+&nbsp;</span>Hackers
            </div>
            <div className="mt-1 flex flex-col md:flex-row justify-center items-center text-center text-3xl md:space-x-20 space-y-6 md:space-y-0">
              <span className="font-medium text-[#351918]">30+&nbsp;</span>Universities
            </div>
            <div className="mt-1 flex flex-col md:flex-row justify-center items-center text-center text-3xl md:space-x-20 space-y-6 md:space-y-0">
              <span className="font-medium text-[#351918]">200+&nbsp;</span>Projects
            </div>
          </div>
        </div>

        {/* Video */}
        <div className="flex justify-center relative w-full z-10 ml-[40vw]">
          <img src="/assets/teaserBanner.png" alt="HackUTD" className="z-10 w-[37vw]" />
          <h1
            className="mt-[50px] sm:-mt-[70px] absolute inset-0 flex items-center justify-center 
                    text-2xl sm:text-3xl md:text-4xl font-light 
                    bg-gradient-to-t from-[#FFC273] to-[#8C180D] font-medium bg-clip-text z-50 text-transparent font-serif"
          >
            See our Teaser
          </h1>
        </div>
        <div className="w-[40vw] -mt-[120px] ml-[40vw] aspect-video flex justify-center bg-black bg-opacity-50">
          {/* <iframe
            className="w-7/8 md:w-[800px] md:h-[450px]"
            src="https://www.youtube.com/embed/dMVtL2OmB60?si=ZKpc1VRAM6i-XmQQ"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe> */}
        </div>
      </div>
    </section>
  );
}
