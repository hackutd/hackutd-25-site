import { useState, useEffect } from 'react';
import LogoContext from '@/lib/context/logo';
import Image from 'next/image';
import PlaceholderMascot from '../../public/assets/Reveal.gif';
import styles from './HomeSponsors.module.css';
import SponsorCard from './SponsorCard';
import TierTitle from './TierTitle';
import { Sponsor } from '@/pages/admin/sponsors';
import { RequestHelper } from '@/lib/request-helper';

export default function HomeSponsors() {
  const [currentHoveredLogo, setCurrentHoveredLogo] = useState<string>('');
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        setLoading(true);
        const { data, status } = await RequestHelper.get<Sponsor[]>('/api/sponsors', {});

        if (status >= 200 && status < 300) {
          setSponsors(data);
        } else {
          setError(`Failed to fetch sponsors: ${status}`);
        }
      } catch (err) {
        setError('An error occurred while fetching sponsors');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSponsors();
  }, []);

  const sponsorTiers: { [key: string]: Sponsor[] } = sponsors.reduce((acc, curr) => {
    const tier = curr.tier;
    if (!acc[tier]) {
      acc[tier] = [];
    }
    acc[tier].push(curr);
    return acc;
  }, {} as { [key: string]: Sponsor[] });

  if (loading) {
    return (
      <section className="relative pt-[10rem] font-fredoka">
        <div className="text-center text-5xl text-white">
          <h1 className="uppercase font-bold">Loading sponsors...</h1>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative pt-[10rem] font-fredoka">
        <div className="text-center text-5xl text-white">
          <h1 className="uppercase font-bold">Error loading sponsors</h1>
          <p className="text-2xl mt-4">{error}</p>
        </div>
      </section>
    );
  }

  return (
    sponsors.length !== 0 && (
      <section
        className="relative font-fredoka"
        style={{
          overflow: 'visible',
          position: 'relative',
          backgroundColor: '#0B0B1B',
          backgroundImage: 'url("/assets/sponsorsBG/starryBG.PNG")',
          backgroundRepeat: 'repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundAttachment: 'local',
          minHeight: '100vh',
          height: 'auto',
          width: '100%',
        }}
      >
        <div
          className="absolute left-0 w-full pointer-events-none"
          style={{
            top: '0',
            height: '200px',
            background:
              'linear-gradient(to bottom, rgba(11,11,27,0.8) 0%, rgba(11,11,27,0.4) 50%, transparent 100%)',
            zIndex: 1,
          }}
        />
        <style jsx>{`
          @keyframes fireflyFloat1 {
            0%,
            100% {
              transform: translate(0, 0) scale(1);
            }
            25% {
              transform: translate(20px, -30px) scale(1.2);
            }
            50% {
              transform: translate(-15px, -20px) scale(0.8);
            }
            75% {
              transform: translate(30px, 10px) scale(1.1);
            }
          }
          @keyframes fireflyFloat2 {
            0%,
            100% {
              transform: translate(0, 0) scale(1);
            }
            20% {
              transform: translate(-25px, 15px) scale(0.9);
            }
            40% {
              transform: translate(35px, -25px) scale(1.3);
            }
            60% {
              transform: translate(-10px, 30px) scale(0.7);
            }
            80% {
              transform: translate(20px, -10px) scale(1.1);
            }
          }
          @keyframes fireflyFloat3 {
            0%,
            100% {
              transform: translate(0, 0) scale(1);
            }
            30% {
              transform: translate(40px, 20px) scale(1.4);
            }
            60% {
              transform: translate(-30px, -15px) scale(0.6);
            }
            90% {
              transform: translate(15px, 25px) scale(1.2);
            }
          }
          @keyframes fireflyFloat4 {
            0%,
            100% {
              transform: translate(0, 0) scale(1);
            }
            15% {
              transform: translate(-20px, -35px) scale(0.8);
            }
            35% {
              transform: translate(25px, 10px) scale(1.5);
            }
            55% {
              transform: translate(-35px, 20px) scale(0.9);
            }
            75% {
              transform: translate(10px, -20px) scale(1.3);
            }
            95% {
              transform: translate(-15px, 15px) scale(0.7);
            }
          }
          @keyframes fireflyGlow {
            0%,
            100% {
              opacity: 0.3;
            }
            50% {
              opacity: 1;
            }
          }
        `}</style>
        <div
          className="absolute pointer-events-none"
          style={{
            top: '-200px',
            left: 0,
            right: 0,
            height: 'calc(100% + 200px)',
            zIndex: 20,
          }}
        >
          {[...Array(16)].map((_, i) => {
            const animationType = i % 4;
            const animationNames = [
              'fireflyFloat1',
              'fireflyFloat2',
              'fireflyFloat3',
              'fireflyFloat4',
            ];
            const selectedAnimation = animationNames[animationType];

            return (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`, // Normal positioning within the extended container
                  animationDelay: `${Math.random() * 6}s`,
                  animationDuration: `${6 + Math.random() * 6}s`,
                  boxShadow: '0 0 10px #fbbf24, 0 0 20px #fbbf24, 0 0 30px #fbbf24',
                  animation: `${selectedAnimation} ${
                    6 + Math.random() * 6
                  }s ease-in-out infinite, fireflyGlow ${
                    2 + Math.random() * 3
                  }s ease-in-out infinite`,
                }}
              >
                <div
                  className="absolute inset-0 bg-yellow-300 rounded-full"
                  style={{
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${1.5 + Math.random() * 2.5}s`,
                    animation: 'fireflyGlow 2s ease-in-out infinite',
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* TODO: will update styling better once get more assets and finalized content */}
        <div className="pt-[2rem] pb-[2rem]"></div>
        <div className="flex flex-col flex-grow px-4">
          <h2
            className="uppercase text-center text-3xl font-youngSerif"
            style={{
              background: 'linear-gradient(354.75deg, #FFD29B 4.2%, #FFD29B 37.67%, #FF5757 95.8%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter:
                'drop-shadow(1px 1px 0 #000) drop-shadow(-1px -1px 0 #000) drop-shadow(1px -1px 0 #000) drop-shadow(-1px 1px 0 #000)',
            }}
          >
            interested in sponsoring?
          </h2>
          <h2
            className="mt-1 text-center font-youngSerif"
            style={{
              background: 'linear-gradient(354.75deg, #FFD29B 4.2%, #FFD29B 37.67%, #FF5757 95.8%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter:
                'drop-shadow(1px 1px 0 #000) drop-shadow(-1px -1px 0 #000) drop-shadow(1px -1px 0 #000) drop-shadow(-1px 1px 0 #000)',
            }}
          >
            If you would like to sponsor HackUTD,
          </h2>
          <h2
            className="text-center font-youngSerif"
            style={{
              background: 'linear-gradient(354.75deg, #FFD29B 4.2%, #FFD29B 37.67%, #FF5757 95.8%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter:
                'drop-shadow(1px 1px 0 #000) drop-shadow(-1px -1px 0 #000) drop-shadow(1px -1px 0 #000) drop-shadow(-1px 1px 0 #000)',
            }}
          >
            please reach out to us at&nbsp;
            <a
              href="mailto:hello@hackutd.co"
              rel="noopener noreferrer"
              target="_blank"
              className="underline"
              style={{
                background:
                  'linear-gradient(354.75deg, #FFD29B 4.2%, #FFD29B 37.67%, #FF5757 95.8%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter:
                  'drop-shadow(1px 1px 0 #000) drop-shadow(-1px -1px 0 #000) drop-shadow(1px -1px 0 #000) drop-shadow(-1px 1px 0 #000)',
              }}
            >
              hello@hackutd.co
            </a>
          </h2>
          <section className="flex flex-wrap justify-center p-4">
            <div className="p-4 w-full place-items-center">
              {['title', 'platinum', 'gold', 'silver', 'bronze'].map((tier) => (
                <div
                  key={tier}
                  className="flex flex-col gap-8 my-[3rem] text-center text-3xl text-[#5D5A88] font-bold font-youngSerif"
                >
                  <TierTitle tierName={tier} />

                  <div className="flex flex-wrap gap-16 justify-center items-center">
                    <LogoContext.Provider value={{ currentHoveredLogo, setCurrentHoveredLogo }}>
                      {sponsorTiers[tier]?.map((sponsor, idx) => (
                        <SponsorCard key={idx} {...sponsor} />
                      ))}
                    </LogoContext.Provider>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="mt-4">
          <p
            className="text-4xl text-center pb-28 font-youngSerif"
            style={{
              background: 'linear-gradient(354.75deg, #FFD29B 4.2%, #FFD29B 37.67%, #FF5757 95.8%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter:
                'drop-shadow(1px 1px 0 #000) drop-shadow(-1px -1px 0 #000) drop-shadow(1px -1px 0 #000) drop-shadow(-1px 1px 0 #000)',
            }}
          >
            and more to come!
          </p>
        </div>
      </section>
    )
  );
}
