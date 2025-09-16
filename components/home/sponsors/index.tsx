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
      <section className="relative pt-[10rem] bg-[#F2F3FF] font-fredoka">
        <div className="text-center text-5xl text-[#5D5A88]">
          <h1 className="uppercase font-bold">Loading sponsors...</h1>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative pt-[10rem] bg-[#F2F3FF] font-fredoka">
        <div className="text-center text-5xl text-[#5D5A88]">
          <h1 className="uppercase font-bold">Error loading sponsors</h1>
          <p className="text-2xl mt-4">{error}</p>
        </div>
      </section>
    );
  }

  return (
    sponsors.length !== 0 && (
      <section className="relative pt-[10rem] font-fredoka">
        {/* TODO: will update styling better once get more assets and finalized content */}
        <div></div>
        <div className="flex flex-col flex-grow">
          <h4
            className="font-bold md:text-5xl text-2xl my-4 text-center uppercase font-youngSerif pt-32 pb-12"
            style={{
              background: 'linear-gradient(354.75deg, #FFD29B 4.2%, #FFD29B 37.67%, #FF5757 95.8%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Sponsorship
          </h4>
          <h2
            className="uppercase text-center text-3xl font-youngSerif"
            style={{
              background: 'linear-gradient(354.75deg, #FFD29B 4.2%, #FFD29B 37.67%, #FF5757 95.8%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
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
            }}
          >
            If you would like to sponsor HackPortal,
          </h2>
          <h2
            className="text-center font-youngSerif"
            style={{
              background: 'linear-gradient(354.75deg, #FFD29B 4.2%, #FFD29B 37.67%, #FF5757 95.8%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
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
            }}
          >
            and more to come!
          </p>
        </div>
      </section>
    )
  );
}
