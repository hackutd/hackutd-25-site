import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import Head from 'next/head';

import HomeChallengesComponent from '@/components/home/challenge';
import HomeHero from '@/components/home/HomeHero';
import HomeSchedule from '@/components/home/HomeSchedule';
import HomeFaq from '@/components/home/faq';
import HomeSponsors from '@/components/home/sponsors';
import HomeFooter from '@/components/home/HomeFooter';
import { RequestHelper } from '@/lib/request-helper';

interface Props {
  answeredQuestion: AnsweredQuestion[];
  sponsorCard: Sponsor[];
  scheduleCard: ScheduleEvent[];
  dateCard: Dates;
  challenges: Challenge[];
}

export default function Home({
  answeredQuestion,
  challenges,
  dateCard,
  scheduleCard,
  sponsorCard,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setLoading(false);

    // Detect mobile device
    const checkMobile = () => {
      if (typeof window === 'undefined') return false;
      return window.innerWidth <= 768;
    };

    setIsMobile(checkMobile());

    const handleResize = () => {
      setIsMobile(checkMobile());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>HackUTD 2025 - Largest University Hackathon in North America | Nov 8-9, 2025</title>
        <meta
          name="description"
          content="Join HackUTD 2025, the largest 24-hour university hackathon in North America. Build innovative apps, hardware, and solutions with 1200+ hackers from 30+ universities. Nov 8-9, 2025 at UT Dallas."
        />
        <meta
          name="keywords"
          content="hackathon, HackUTD, UT Dallas, university hackathon, programming competition, tech event, North America, largest hackathon, student hackathon, coding event, Nov 8-9 2025"
        />
        <link rel="canonical" href="https://hackutd2025.com/" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Event',
              name: 'HackUTD 2025',
              description:
                'The largest 24-hour university hackathon in North America. Join 1200+ hackers from 30+ universities to build innovative apps, hardware, and solutions.',
              startDate: '2025-11-08T00:00:00-06:00',
              endDate: '2025-11-09T23:59:59-06:00',
              location: {
                '@type': 'Place',
                name: 'University of Texas at Dallas',
                address: {
                  '@type': 'PostalAddress',
                  streetAddress: '800 W Campbell Rd',
                  addressLocality: 'Richardson',
                  addressRegion: 'TX',
                  postalCode: '75080',
                  addressCountry: 'US',
                },
              },
              organizer: {
                '@type': 'Organization',
                name: 'HackUTD',
                url: 'https://hackutd2025.com',
              },
              url: 'https://hackutd2025.com',
              image: 'https://hackutd2025.com/assets/og-image.jpg',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
              },
              audience: {
                '@type': 'Audience',
                audienceType: 'Students',
              },
              eventStatus: 'https://schema.org/EventScheduled',
              eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
            }),
          }}
        />
        <style jsx>{`
          @supports not (background-image: url('data:image/webp')) {
            .bg-fallback {
              background-image: url('/assets/pathDrawing/bushLeft.webp'),
                url('/assets/pathDrawing/pathOutline.webp'), url('/assets/pathDrawing/bg.webp') !important;
            }
          }
        `}</style>
      </Head>
      <div>
        {/* <div
          className="fixed top-0 left-0 w-full h-full z-20 pointer-events-none"
          style={{
            backgroundImage: `url("/assets/pathDrawing/mist.webp")`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
          }}
        /> */}

        <HomeHero />
      </div>

      <div
        className="w-full relative"
        style={{
          backgroundColor: '#0B0B1B',
          backgroundImage: 'url("/assets/sponsorsBG/leaves.PNG")',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      >
        {/* <div className="my-72">
          <HomeSchedule scheduleCard={scheduleCard} dateCard={dateCard} />
        </div>

        <div className="my-72">
          <HomeChallengesComponent challenges={challenges} />
        </div> */}

        <div className="my-72">
          <HomeFaq answeredQuestions={answeredQuestion} />
        </div>

        <div
          className="absolute left-0 w-full pointer-events-none"
          style={{
            top: '30%',
            height: '70%',
            background:
              'linear-gradient(to bottom, transparent 0%, rgba(11,11,27,0.1) 20%, rgba(11,11,27,0.4) 60%, rgba(11,11,27,0.8) 100%)',
            zIndex: 1,
          }}
        />
        <div className="relative z-10" style={{ marginTop: '-200px', paddingTop: '200px' }}>
          <HomeSponsors />
        </div>
      </div>
      <HomeFooter />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const protocol = context.req.headers.referer?.split('://')[0] || 'http';
  const { data: keynoteData } = await RequestHelper.get<KeynoteSpeaker[]>(
    `${protocol}://${context.req.headers.host}/api/keynotespeakers`,
    {},
  );
  const { data: challengeData } = await RequestHelper.get<Challenge[]>(
    `${protocol}://${context.req.headers.host}/api/challenges/`,
    {},
  );
  const { data: answeredQuestion } = await RequestHelper.get<AnsweredQuestion[]>(
    `${protocol}://${context.req.headers.host}/api/questions/faq`,
    {},
  );
  const { data: scheduleData } = await RequestHelper.get<ScheduleEvent[]>(
    `${protocol}://${context.req.headers.host}/api/schedule`,
    {},
  );
  const { data: dateData } = await RequestHelper.get<ScheduleEvent[]>(
    `${protocol}://${context.req.headers.host}/api/dates`,
    {},
  );
  return {
    props: {
      keynoteSpeakers: keynoteData,
      challenges: challengeData,
      answeredQuestion: answeredQuestion,
      scheduleCard: scheduleData,
      dateCard: dateData,
    },
  };
};
