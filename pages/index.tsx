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
        <title>HackUTD 2025</title>
        <meta name="description" content="A default HackPortal instance" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
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
        className="overflow-x-hidden w-full"
        style={{
          backgroundColor: '#0B0B1B',
          backgroundImage: 'url("/assets/sponsorsBG/leaves.PNG")',
          backgroundRepeat: 'repeat',
          backgroundSize: 'auto',
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
      </div>

      <div>
        <HomeSponsors />
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
