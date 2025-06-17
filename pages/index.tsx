import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import { RequestHelper } from '../lib/request-helper';
import HomeHero from '../components/home/HomeHero';

/**
 * The home page.
 *
 * Landing: /
 *
 */
export default function Home(props: {
  keynoteSpeakers: KeynoteSpeaker[];
  challenges: Challenge[];
  answeredQuestion: AnsweredQuestion[];
  fetchedMembers: TeamMember[];
  sponsorCard: Sponsor[];
  scheduleCard: ScheduleEvent[];
  dateCard: Dates;
  prizeData: Array<{ rank: number; prizeName: string }>;
}) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Wait for all components to render before showing page
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
        <title>HackUTD 2025</title> {/* !change */}
        <meta name="description" content="HackUTD 2025 Event Site" /> {/* !change */}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <HomeHero />
      {/* <HomeNotif />
      <HomeHero />
      <HomeVideoStats />
      <HackCountdown />
      <HomeAbout />
      <HomeSchedule scheduleCard={props.scheduleCard} dateCard={props.dateCard} />
      <HomeSpeakers keynoteSpeakers={props.keynoteSpeakers} />
      <HomeChallenges challenges={props.challenges} />
      <HomePrizes prizes={props.prizeData} />
      <HomeTeam members={props.fetchedMembers} />
      <HomeFaq answeredQuestion={props.answeredQuestion} />
      <HomeSponsors sponsorCard={props.sponsorCard} />
      <HomeFooter /> */}
    </>
  );
}

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   const protocol = context.req.headers.referer?.split('://')[0] || 'http';
//   const { data: keynoteData } = await RequestHelper.get<KeynoteSpeaker[]>(
//     `${protocol}://${context.req.headers.host}/api/keynotespeakers`,
//     {},
//   );
//   const { data: challengeData } = await RequestHelper.get<Challenge[]>(
//     `${protocol}://${context.req.headers.host}/api/challenges/`,
//     {},
//   );
//   const { data: prizeData } = await RequestHelper.get<Array<{ rank: number; prizeName: string }>>(
//     `${protocol}://${context.req.headers.host}/api/prizes`,
//     {},
//   );
//   const { data: answeredQuestion } = await RequestHelper.get<AnsweredQuestion[]>(
//     `${protocol}://${context.req.headers.host}/api/questions/faq`,
//     {},
//   );
//   const { data: memberData } = await RequestHelper.get<TeamMember[]>(
//     `${protocol}://${context.req.headers.host}/api/members`,
//     {},
//   );
//   const { data: sponsorData } = await RequestHelper.get<Sponsor[]>(
//     `${protocol}://${context.req.headers.host}/api/sponsor`,
//     {},
//   );
//   const { data: scheduleData } = await RequestHelper.get<ScheduleEvent[]>(
//     `${protocol}://${context.req.headers.host}/api/schedule`,
//     {},
//   );
//   const { data: dateData } = await RequestHelper.get<ScheduleEvent[]>(
//     `${protocol}://${context.req.headers.host}/api/dates`,
//     {},
//   );
//   return {
//     props: {
//       keynoteSpeakers: keynoteData,
//       challenges: challengeData,
//       answeredQuestion: answeredQuestion,
//       fetchedMembers: memberData,
//       sponsorCard: sponsorData,
//       scheduleCard: scheduleData,
//       dateCard: dateData,
//       prizeData: prizeData,
//     },
//   };
// };

// Add this back later
// import { GetServerSideProps } from 'next';
// import { useEffect, useState } from 'react';
// import Head from 'next/head';

// import HomeChallengesComponent from '@/components/home/challenge';
// import HomeHero from '@/components/home/HomeHero';
// import HackUTDCountdown from '@/components/home/countdown';
// import HomeAboutText from '@/components/home/about/HomeAboutText';
// import HomeAboutPhotos from '@/components/home/about/HomeAboutPhotos';
// import HomeSchedule from '@/components/home/HomeSchedule';
// import HomeFaq from '@/components/home/faq';
// import HomeSponsors from '@/components/home/sponsors';
// import HomeFooter from '@/components/home/HomeFooter';

// import { RequestHelper } from '@/lib/request-helper';

// interface Props {
//   answeredQuestion: AnsweredQuestion[];
//   sponsorCard: Sponsor[];
//   scheduleCard: ScheduleEvent[];
//   dateCard: Dates;
//   challenges: Challenge[];
// }

// export default function Home({
//   answeredQuestion,
//   challenges,
//   dateCard,
//   scheduleCard,
//   sponsorCard,
// }: Props) {
//   const [loading, setLoading] = useState(true);
//   useEffect(() => {
//     setLoading(false);
//   }, []);

//   if (loading) {
//     return (
//       <div>
//         <h1>Loading...</h1>
//       </div>
//     );
//   }

//   return (
//     <>
//       <Head>
//         <title>HackUTD 2025</title>
//         <meta name="description" content="HackUTD 2025 Event Site" />
//         <link rel="icon" href="/favicon.ico" />
//       </Head>
//       <div className="overflow-x-hidden w-full">
//         <HomeHero />
//         <HackUTDCountdown />
//         <HomeAboutText />
//         <HomeAboutPhotos />
//         <HomeSchedule scheduleCard={scheduleCard} dateCard={dateCard} />
//         <HomeChallengesComponent challenges={challenges} />
//         <HomeFaq answeredQuestions={answeredQuestion} />
//         <HomeSponsors />
//         <HomeFooter />
//       </div>
//     </>
//   );
// }

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   const protocol = context.req.headers.referer?.split('://')[0] || 'http';
//   const { data: keynoteData } = await RequestHelper.get<KeynoteSpeaker[]>(
//     `${protocol}://${context.req.headers.host}/api/keynotespeakers`,
//     {},
//   );
//   const { data: challengeData } = await RequestHelper.get<Challenge[]>(
//     `${protocol}://${context.req.headers.host}/api/challenges/`,
//     {},
//   );
//   const { data: answeredQuestion } = await RequestHelper.get<AnsweredQuestion[]>(
//     `${protocol}://${context.req.headers.host}/api/questions/faq`,
//     {},
//   );
//   const { data: scheduleData } = await RequestHelper.get<ScheduleEvent[]>(
//     `${protocol}://${context.req.headers.host}/api/schedule`,
//     {},
//   );
//   const { data: dateData } = await RequestHelper.get<ScheduleEvent[]>(
//     `${protocol}://${context.req.headers.host}/api/dates`,
//     {},
//   );
//   return {
//     props: {
//       keynoteSpeakers: keynoteData,
//       challenges: challengeData,
//       answeredQuestion: answeredQuestion,
//       scheduleCard: scheduleData,
//       dateCard: dateData,
//     },
//   };
// };
