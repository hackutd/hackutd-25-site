import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { PRE_EVENTS_DATA, getEventById, PreEventData } from '@/lib/pre-events-data';
import PreEventDetail from '@/components/pre-events/PreEventDetail';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface Props {
  event: PreEventData;
}

export default function PreEventPage({ event }: Props) {
  if (!event) {
    return (
      <div className="min-h-screen bg-[#F2F3FF] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <Link href="/pre-events" className="text-blue-600 hover:text-blue-800">
            ← Back to Pre-Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{event.title} | HackUTD 2025 Pre-Events</title>
        <meta name="description" content={event.description} />
        <meta
          name="keywords"
          content={`HackUTD 2025, ${event.type}, ${event.tags?.join(', ') || ''}, pre-events`}
        />
        <link rel="canonical" href={`https://legend.hackutd.co/pre-events/${event.id}`} />
      </Head>

      <div className="min-h-screen bg-[#F2F3FF] py-8">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              href="/pre-events"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              <ArrowBackIcon className="mr-2" />
              Back to Pre-Events
            </Link>
          </div>

          {/* Event Detail */}
          <PreEventDetail event={event} />
        </div>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = PRE_EVENTS_DATA.map((event) => ({
    params: { id: event.id },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const eventId = params?.id as string;
  const event = getEventById(eventId);

  if (!event) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      event,
    },
  };
};
