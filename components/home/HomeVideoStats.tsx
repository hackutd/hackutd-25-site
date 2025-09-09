export default function HomeVideoStats() {
  return (
    <section className="z-10 relative md:h-[370px]">
      <div className="flex flex-col justify-center items-center mx-auto py-[3rem]">
        <div className="flex justify-center relative w-full z-10">
          <img src="/assets/statsScroll.png" alt="HackUTD" className="z-10 w-[60vw]" />
          <div
            className="mt-[300px] absolute inset-0 flex-col items-center justify-center 
                     z-50"
          >
            <div className="flex flex-col md:flex-row justify-center items-center text-center md:space-x-20 space-y-6 md:space-y-0">
              At our last hackathon, we had the pleasure of hosting...
            </div>
            <div className="flex flex-col md:flex-row justify-center items-center text-center md:space-x-20 space-y-6 md:space-y-0">
              1200+ Hackers
            </div>
            <div className="flex flex-col md:flex-row justify-center items-center text-center md:space-x-20 space-y-6 md:space-y-0">
              30+ Universities
            </div>
            <div className="flex flex-col md:flex-row justify-center items-center text-center md:space-x-20 space-y-6 md:space-y-0">
              200+ Projects
            </div>
          </div>
        </div>

        {/* Video */}
        <div className="w-full aspect-video flex justify-center">
          <iframe
            className="w-7/8 md:w-[800px] md:h-[450px]"
            src="https://www.youtube.com/embed/dMVtL2OmB60?si=ZKpc1VRAM6i-XmQQ"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </section>
  );
}
