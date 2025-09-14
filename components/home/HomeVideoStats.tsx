export default function HomeVideoStats() {
  return (
    <section className="z-10 relative md:h-[370px]">
      <div className="flex flex-col justify-center items-center mx-auto py-[3rem] ml-7 lg:ml-[40vw]">
        {/* Stats */}
        <div className="flex justify-center relative w-full z-10">
          <img src="/assets/statsScroll.png" alt="HackUTD" className="z-10 lg:w-[60vw]" />
          <div
            className=" mt-[26vw] md:mt-[250px] lg:mt-[17.3vw] absolute inset-0 flex-row lg:flex-col items-center justify-center 
                     z-50"
          >
            <div className="flex justify-center items-center text-center font-medium text-sm w-[50%] md:w-full ml-[22vw] md:ml-0 md:text-lg text-[#351918] md:space-x-20 space-y-6 md:space-y-0">
              At our last hackathon, we had the pleasure of hosting...
            </div>
            <div className="flex md:flex-col justify-center flex-wrap w-[60%] lg:w-full gap-x-4 ml-[18vw] mt-2 lg:ml-0 lg:mt-[3vw]">
              <div className="flex flex-row justify-center items-center text-center text-md md:text-2xl lg:text-3xl lg:space-x-20 space-y-6 lg:space-y-0">
                <span className="font-medium text-[#351918]">1200+&nbsp;</span>Hackers
              </div>
              <div className="lg:mt-1 flex flex-row justify-center items-center text-center text-md md:text-2xl lg:text-3xl md:space-x-20 space-y-6 md:space-y-0">
                <span className="font-medium text-[#351918]">30+&nbsp;</span>Universities
              </div>
              <div className="lg:mt-1 flex flex-row justify-center items-center text-center text-md md:text-2xl lg:text-3xl md:space-x-20 space-y-6 md:space-y-0">
                <span className="font-medium text-[#351918]">200+&nbsp;</span>Projects
              </div>
            </div>
          </div>
        </div>

        {/* Video */}
        <div className="flex justify-center relative w-full z-10">
          <img
            src="/assets/teaserBanner.png"
            alt="HackUTD"
            className="z-10 w-[80%] md:w-[70%] lg:w-[37vw]"
          />
          <h1
            className="-mt-[47px] md:-mt-[50px] lg:-mt-[70px] absolute inset-0 flex items-center justify-center 
                    text-2xl md:text-4xl lg:text-4xl font-light 
                    bg-gradient-to-t from-[#FFC273] to-[#8C180D] font-medium bg-clip-text z-50 text-transparent font-serif"
          >
            See our Teaser
          </h1>
        </div>
        <div className="w-[50vw] md:w-[40vw] -mt-[17vw] lg:-mt-[120px] aspect-video flex justify-center bg-black bg-opacity-50">
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
