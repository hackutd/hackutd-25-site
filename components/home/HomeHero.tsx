import Image from 'next/image';
import MLH_Sticker from '../../public/assets/mlh-sticker.png';
//import HackTitle from './HackTitle';
import { useState } from 'react';
import { RequestHelper } from '../../lib/request-helper';

export default function HomeHero() {
  const [userEmail, setUserEmail] = useState<string>('');
  const handleSubmitEmail = async (userEmail: string) => {
    const res = await RequestHelper.post<{ userEmail: string }, unknown>(
      '/api/email',
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
      {
        userEmail,
      },
    );
    if (res.status === 200) {
      alert('Email submitted successful');
    } else {
      alert('Something is wrong... please try again later');
    }
  };
  return (
    <section className="min-h-screen bg-cover bg-hero-pattern bg-no-repeat bg-center flex flex-col-reverse md:flex-col">
      <div className="flex h-screen w-full relative">
        <div className="relative z-10 shrink-0 w-full flex">
          {/* MLH sticker */}
          <div className="absolute top-0 right-4 z-20">
            <Image
              src={MLH_Sticker.src}
              height={MLH_Sticker.height}
              width={MLH_Sticker.width}
              alt="MLH sticker"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Big welcome */}
          <div className="w-full flex flex-col gap-2 justify-center items-center">
            {/* <HackTitle /> */}
            <p className="font-poppins text-white font-medium">
              Get notified when application drops
            </p>
            <div className="rounded-xl border-none w-2/5 p-[5px] flex items-center bg-white gap-x-3">
              <input
                type="text"
                className="w-4/5 rounded-lg border-none focus:ring-0"
                placeholder="Email Address"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
              <button
                className="rounded-lg bg-[#F7CE79] px-4 py-3 w-1/5 text-white"
                onClick={async () => {
                  await handleSubmitEmail(userEmail);
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

//Bring this back later

// import BackgroundCircles from '../BackgroundCircles';
// import AppHeader from '../AppHeader';

// export default function HomeHero() {
//   return (
//     <section className="min-h-screen bg-contain bg-white flex flex-col-reverse md:flex-col">
//       {/* App header */}
//       <AppHeader />

//       <div className="flex h-screen w-full relative">
//         <div className="w-full h-full absolute top-0 left-0 z-0">
//           <BackgroundCircles />
//         </div>

//         <div className="relative z-10 shrink-0 w-full flex">
//           {/* MLH sticker */}
//           {/* <div className="absolute top-0 right-4 z-20">
//             <Image
//               src={MLH_Sticker.src}
//               height={MLH_Sticker.height}
//               width={MLH_Sticker.width}
//               alt="MLH sticker"
//               className="w-full h-full object-cover"
//             />
//           </div> */}

//           {/* Big welcome */}
//           <div className="w-full flex flex-col gap-2 justify-center items-center bg-[rgba(255,255,255,0.75)] backdrop-blur-[60px]">
//             <p className="font-nunito text-[#262626] text-xl md:text-3xl">Welcome To</p>
//             <h1 className="font-fredokaOne text-4xl md:text-6xl lg:text-8xl font-bold text-[#05149C]">
//               HACKPORTAL
//             </h1>
//           </div>
//         </div>
//       </div>

//       {/* Bottom banner */}
//       <div className="font-dmSans w-full flex justify-center bg-[#7B81FF] text-white h-[1.75rem] text-nowrap overflow-hidden">
//         <p className="text-lg">
//           SAMPLE TEXT • SAMPLE TEXT • SAMPLE TEXT • SAMPLE TEXT • SAMPLE TEXT • SAMPLE TEXT • SAMPLE
//           TEXT • SAMPLE TEXT • SAMPLE TEXT
//         </p>
//       </div>
//     </section>
//   );
// }
