import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import Head from 'next/head';

import HomeChallengesComponent from '@/components/home/challenge';
import HomeHero from '@/components/home/HomeHero';
import HackUTDCountdown from '@/components/home/countdown';
import HomeAboutText from '@/components/home/about/HomeAboutText';
import HomeSchedule from '@/components/home/HomeSchedule';
import HomeFaq from '@/components/home/faq';
import HomeSponsors from '@/components/home/sponsors';
import HomeFooter from '@/components/home/HomeFooter';
import KeynoteSpeaker from '@/components/home/speakers';
import { RequestHelper } from '@/lib/request-helper';
import HomeVideoStats from '@/components/home/HomeVideoStats';

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
  useEffect(() => {
    setLoading(false);
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
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <style jsx>{`
          @supports not (background-image: url('data:image/webp')) {
            .bg-fallback {
              background-image: url('/assets/pathDrawing/bushLeft.PNG'),
                url('/assets/pathDrawing/pathOutline.PNG'), url('/assets/pathDrawing/bg.PNG') !important;
            }
          }
        `}</style>
        {/* Preload hero images */}
        <link rel="preload" as="image" href="/assets/topDrawing/sky.webp" />
        <link rel="preload" as="image" href="/assets/topDrawing/moon.webp" />
        <link rel="preload" as="image" href="/assets/topDrawing/bgClouds.webp" />
        <link rel="preload" as="image" href="/assets/topDrawing/bg.webp" />
        <link rel="preload" as="image" href="/assets/topDrawing/bgTrees.webp" />
        <link rel="preload" as="image" href="/assets/topDrawing/bgGrass.webp" />
        <link rel="preload" as="image" href="/assets/topDrawing/foreground.webp" />
        <link rel="preload" as="image" href="/assets/topDrawing/frontSideTrees.webp" />
      </Head>
      <div
        className="overflow-x-hidden w-full bg-fallback"
        style={{
          backgroundImage: `url("/assets/pathDrawing/bushLeft.webp"),
                            url("/assets/pathDrawing/pathOutline.webp"),
                            url("/assets/pathDrawing/bg.webp")`,
          backgroundSize: 'cover',
          backgroundRepeat: 'repeat',
          zIndex: 2,
          // Mobile optimization
          backgroundAttachment: 'scroll',
        }}
      >
        {/* <div
          className="fixed top-0 left-0 w-full h-full z-20 pointer-events-none"
          style={{
            backgroundImage: `url("/assets/pathDrawing/mist.PNG")`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
          }}
        /> */}
        <HomeHero />

        <div className="my-72">
          <HomeAboutText />
        </div>

        <div className="my-72">
          <HomeVideoStats />
        </div>

        <div className="my-72">
          <HackUTDCountdown />
        </div>

        <div className="my-72">
          <KeynoteSpeaker />
        </div>

        <div className="my-72">
          <HomeSchedule scheduleCard={scheduleCard} dateCard={dateCard} />
        </div>

        <div className="my-72">
          <HomeChallengesComponent challenges={challenges} />
        </div>

        <div className="my-72">
          <HomeFaq answeredQuestions={answeredQuestion} />
        </div>

        <div className="my-72">
          <HomeSponsors />
        </div>
        <HomeFooter />
      </div>
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
