import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import type { GetServerSideProps } from 'next';

import HomeChallengesComponent from '@/components/home/challenge';
import HackUTDCountdown from '@/components/home/countdown';
import HomeAboutText from '@/components/home/about/HomeAboutText';
import HomeSchedule from '@/components/home/HomeSchedule';
import HomeFaq from '@/components/home/faq';
import HomeSponsors from '@/components/home/sponsors';
import HomeFooter from '@/components/home/HomeFooter';
import KeynoteSpeaker from '@/components/home/speakers';
import { RequestHelper } from '@/lib/request-helper';
const HomeHero = dynamic(() => import('@/components/home/HomeHero'), { ssr: false });

interface Props {
  answeredQuestion: AnsweredQuestion[];
  scheduleCard: ScheduleEvent[];
  dateCard: Dates;
  challenges: Challenge[];
  keynoteSpeakers?: KeynoteSpeaker[];
  sponsorCard?: Sponsor[];
}

export default function Home({
  answeredQuestion,
  challenges,
  dateCard,
  scheduleCard,
  keynoteSpeakers,
  sponsorCard,
}: Props) {
  const [showHero, setShowHero] = useState(false);
  useEffect(() => {
    const win = window as any;
    const id = win.requestIdleCallback
      ? win.requestIdleCallback(() => setShowHero(true))
      : setTimeout(() => setShowHero(true), 0);
    return () => (win.cancelIdleCallback ? win.cancelIdleCallback(id) : clearTimeout(id));
  }, []);

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

        <link rel="preload" as="image" href="/assets/topDrawing/foreground.webp" />
        <link rel="preload" as="image" href="/assets/topDrawing/bg.webp" />

        <style jsx>{`
          @supports not (background-image: url('data:image/webp;base64,UklGRgAAAABXRUJQ')) {
            .bg-fallback {
              background-image: url('/assets/pathDrawing/bushLeft.PNG'),
                url('/assets/pathDrawing/pathOutline.PNG'), url('/assets/pathDrawing/bg.PNG') !important;
              background-repeat: no-repeat, no-repeat, no-repeat !important;
              background-size: auto 100%, auto 100%, cover !important;
              background-position: left bottom, center bottom, center top !important;
            }
          }
        `}</style>
      </Head>

      <div
        className="overflow-x-hidden w-full bg-fallback"
        style={{
          backgroundImage: `
            url("/assets/pathDrawing/bushLeft.webp"),
            url("/assets/pathDrawing/pathOutline.webp"),
            url("/assets/pathDrawing/bg.webp")
          `,
          backgroundRepeat: 'no-repeat, no-repeat, no-repeat',
          backgroundSize: 'auto 100%, auto 100%, cover',
          backgroundPosition: 'left bottom, center bottom, center top',
          backgroundAttachment: 'scroll',
          zIndex: 2,
        }}
      >
        {showHero && <HomeHero />}

        {/* Comment out later */}
        {/*
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
        */}
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const proto =
    (ctx.req.headers['x-forwarded-proto'] as string) ||
    (ctx.req.headers.referer?.split('://')[0] as string) ||
    'https';
  const host = (ctx.req.headers['x-forwarded-host'] as string) || (ctx.req.headers.host as string);
  const base = `${proto}://${host}`;

  const { data: keynoteData } = await RequestHelper.get<KeynoteSpeaker[]>(
    `${base}/api/keynotespeakers`,
    {},
  );
  const { data: challengeData } = await RequestHelper.get<Challenge[]>(
    `${base}/api/challenges/`,
    {},
  );
  const { data: answered } = await RequestHelper.get<AnsweredQuestion[]>(
    `${base}/api/questions/faq`,
    {},
  );
  const { data: scheduleData } = await RequestHelper.get<ScheduleEvent[]>(
    `${base}/api/schedule`,
    {},
  );
  const { data: dateData } = await RequestHelper.get<Dates>(`${base}/api/dates`, {});

  return {
    props: {
      keynoteSpeakers: keynoteData,
      challenges: challengeData,
      answeredQuestion: answered,
      scheduleCard: scheduleData,
      dateCard: dateData,
    },
  };
};
