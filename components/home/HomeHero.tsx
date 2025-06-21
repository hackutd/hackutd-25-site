import Image from 'next/image';
import MLH_Sticker from '../../public/assets/mlh-2025.png';
import { useState } from 'react';
import { RequestHelper } from '../../lib/request-helper';
import Link from 'next/link';
import styles from './HomeHero.module.css';

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
    <section
      className={`h-screen bg-no-repeat bg-center flex flex-col-reverse md:flex-col relative ${styles.animatedGradientBg}`}
    >
      <div className="flex flex-col h-full w-full justify-center items-center">
        <div className="relative z-10 shrink-0 w-full flex flex-col items-center justify-center flex-grow">
          {/* MLH sticker */}
          <div className="absolute top-0 right-4 z-20">
            <a
              id="mlh-trust-badge"
              style={{
                display: 'block',
                maxWidth: '100px',
                minWidth: '60px',
                position: 'fixed',
                right: '50px',
                top: '0',
                width: '10%',
                zIndex: 10000,
              }}
              href="https://mlh.io/na?utm_source=na-hackathon&utm_medium=TrustBadge&utm_campaign=2026-season&utm_content=gray"
              target="_blank"
            >
              <img
                src="https://s3.amazonaws.com/logged-assets/trust-badge/2026/mlh-trust-badge-2026-gray.svg"
                alt="Major League Hacking 2026 Hackathon Season"
                style={{ width: '100%' }}
              />
            </a>
          </div>

          {/* Big welcome */}
          <div className="w-full flex flex-col gap-2 justify-center items-center flex-grow mt-8 md:mt-16">
            {/* ComingSoon SVG - above HackTitle */}
            <div className={`w-full flex justify-center mb-20 ${styles.fadeInUp}`}>
              <img
                src="/assets/ComingSoon.svg"
                alt="Coming Soon"
                className="comingsoon-svg max-w-[180px] md:max-w-[214px] w-2/5 md:w-[214px] h-auto"
                style={{ display: 'block' }}
              />
            </div>
            {/* HackTitle SVG - hero title as image */}
            <div className={`w-full flex justify-center mb-2 md:mb-4 ${styles.fadeInUpDelayed}`}>
              <Image
                src="/assets/HackTitle.svg"
                alt="HackUTD Title"
                width={480}
                height={182}
                className="hacktitle-svg max-w-[320px] md:max-w-[480px] w-4/5 md:w-2/5 h-auto"
                style={{ display: 'block' }}
              />
            </div>
            {/* Nov 8 - 9 dates */}
            <div className={`w-full flex justify-center mb-2 ${styles.fadeInUpMoreDelayed}`}>
              <span className="font-montserrat text-white text-xl md:text-2xl font-semibold text-center drop-shadow">
                Nov 8 - 9
              </span>
            </div>
            <p
              className={`font-poppins text-white font-medium text-center ${styles.fadeInUpMoreDelayed}`}
            >
              Get notified when applications drop!
            </p>
            <div
              className={`rounded-xl border-none w-11/12 sm:w-4/5 lg:w-2/5 p-[5px] flex justify-between items-center bg-white gap-x-3 ${styles.fadeInUpEvenMoreDelayed}`}
            >
              <input
                type="text"
                className="w-3/5 lg:w-4/5 rounded-lg border-none focus:ring-0"
                placeholder="Email Address"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
              <button
                className="rounded-lg bg-[#D49410] px-4 py-3 text-white"
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
      <div className="absolute right-0 bottom-0 p-3 z-30">
        <Link target="_blank" href="https://static.mlh.io/docs/mlh-code-of-conduct.pdf">
          <h1 className="font-montserrat text-white text-lg cursor-pointer">MLH Code of Conduct</h1>
        </Link>
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
