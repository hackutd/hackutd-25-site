import * as React from 'react';
import { useState } from 'react';
import Head from 'next/head';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { SectionReferenceContext } from '@/lib/context/section';
import { PRE_EVENTS_DATA } from '@/lib/pre-events-data';

export default function PreEventsPage() {
  const [filter, setFilter] = useState('All');
  const scheduleCard = PRE_EVENTS_DATA;

  const eventColors = {
    All: 'border-gray-500 text-gray-500',
    Required: 'border-[#FC012E] text-[#FC012E]',
    Food: 'border-[#56E100] text-[#56E100]',
    Social: 'border-[#FFB900] text-[#FFB900]',
    Sponsor: 'border-[#008CF1] text-[#008CF1]',
    Workshop: 'border-[#5200FF] text-[#5200FF]',
    'All-Filter': 'border-gray-500 bg-gray-500 text-white',
    'Required-Filter': 'border-[#FC012E] bg-[#FC012E] text-white',
    'Food-Filter': 'border-[#56E100] bg-[#56E100] text-white',
    'Social-Filter': 'border-[#FFB900] bg-[#FFB900] text-white',
    'Sponsor-Filter': 'border-[#008CF1] bg-[#008CF1] text-white',
    'Workshop-Filter': 'border-[#5200FF] bg-[#5200FF] text-white',
  };

  const changeFilter = (newFilter: string) => {
    if (newFilter === filter) {
      setFilter('All');
    } else {
      setFilter(newFilter);
    }
  };

  const Event = ({ data, index, arrayLength }) => {
    const startDate = new Date(data.startDate);
    const formattedTime = startDate
      .toLocaleString([], { hour: 'numeric', minute: 'numeric' })
      .replace(' ', '')
      .replace('AM', 'am')
      .replace('PM', 'pm');

    const showEvent = filter === 'All' || filter === data.type;
    const showFilteredEvents = filter !== 'All';

    const isLastEvent = index === arrayLength - 1;
    const hasEvenIndex = index % 2 === 0;

    return (
      showEvent && (
        <>
          <div
            className={`${
              !showFilteredEvents
                ? `${!hasEvenIndex && filter === 'All' ? 'bg-[#F2F3FF]' : 'bg-white'} 
                             ${
                               !isLastEvent && filter === 'All'
                                 ? 'p-4 border-b border-[#05149C]'
                                 : 'rounded-b-xl p-4'
                             }`
                : 'p-4 border-b border-[#05149C]'
            }
                          `}
          >
            <div className="flex justify-between pb-1">
              <div className="text-md font-bold font-dmSans">{formattedTime}</div>
              <div className="text-md font-bold font-dmSans">{data.title}</div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div
                  className={`bg-white text-xs rounded-xl py-1 px-2 border-2 font-dmSans ${
                    eventColors[data.type]
                  }`}
                >
                  {data.type}
                </div>
                <div className="text-gray-600 flex items-center font-dmSans">
                  <LocationOnIcon style={{ fontSize: 'large', marginRight: '2px' }} />
                  {data.location}
                </div>
              </div>
              {data.rsvpLink && (
                <a
                  href={data.rsvpLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-[#FFD29B] to-[#FF5757] text-white px-3 py-1 rounded-lg text-xs font-bold font-dmSans hover:opacity-80 transition-opacity"
                  style={{
                    textShadow: '1px 1px 0 rgba(0,0,0,0.3)',
                  }}
                >
                  RSVP
                </a>
              )}
            </div>
          </div>
        </>
      )
    );
  };

  const sortedEvents = scheduleCard
    .sort((a, b) => {
      return +new Date(a.startDate) - +new Date(b.startDate);
    })
    .map((event, index, array) => (
      <Event data={event} key={event.title + index} index={index} arrayLength={array.length} />
    ));

  return (
    <>
      <Head>
        <title>HackUTD 2025: Pre-Events Schedule | Leading up to Nov 8-9, 2025</title>
        <meta
          name="description"
          content="Join HackUTD 2025 pre-events! Workshops, info sessions, networking events, and preparation activities leading up to our main hackathon on Nov 8-9, 2025."
        />
        <meta
          name="keywords"
          content="HackUTD 2025 pre-events, workshops, info sessions, networking, preparation, UT Dallas, hackathon"
        />
        <link rel="canonical" href="https://legend.hackutd.co/pre-events" />
      </Head>
      <div className="bg-[#F2F3FF]">
        <div className="text-center text-5xl font-bold text-[#05149C] p-4 font-fredoka">
          What to Expect?
        </div>

        <div className="md:flex justify-center items-center mx-8">
          <div className="bg-white border-2 border-blue-900 rounded-3xl px-8 my-4 border-opacity-40">
            <div className="text-center py-1 text-xl font-bold text-[#05149C] font-poppins">
              Filters
            </div>
            <div className="flex flex-wrap justify-center mb-2 font-poppins">
              <div
                onClick={() => changeFilter('All')}
                className={`text-sm cursor-pointer mx-1 px-2 h-8 py-1 border-2 rounded-xl border-gray-500 mb-1
              ${filter === 'All' ? eventColors['All-Filter'] : eventColors['All']}`}
              >
                All
              </div>

              <div
                onClick={() => changeFilter('Required')}
                className={`text-sm cursor-pointer mx-1 px-2 h-8 py-1 border-2 rounded-xl
              ${filter === 'Required' ? eventColors['Required-Filter'] : eventColors['Required']}`}
              >
                Required
              </div>

              <div
                onClick={() => changeFilter('Sponsor')}
                className={`text-sm cursor-pointer mx-1 px-2 h-8 py-1 border-2 rounded-xl
              ${filter === 'Sponsor' ? eventColors['Sponsor-Filter'] : eventColors['Sponsor']}`}
              >
                Sponsor
              </div>

              <div
                onClick={() => changeFilter('Food')}
                className={`text-sm cursor-pointer	mx-1 px-2 h-8 py-1 border-2 rounded-xl
              ${filter === 'Food' ? eventColors['Food-Filter'] : eventColors['Food']}`}
              >
                Food
              </div>

              <div
                onClick={() => changeFilter('Workshop')}
                className={`text-sm cursor-pointer mx-1 px-2 h-8 py-1 border-2 rounded-xl
              ${filter === 'Workshop' ? eventColors['Workshop-Filter'] : eventColors['Workshop']}`}
              >
                Workshop
              </div>

              <div
                onClick={() => changeFilter('Social')}
                className={`text-sm cursor-pointer mx-1 px-2 h-8 py-1 border-2 rounded-xl
              ${filter === 'Social' ? eventColors['Social-Filter'] : eventColors['Social']}`}
              >
                Social
              </div>
            </div>
          </div>
        </div>

        <div className="md:flex p-1 overflow-y-auto overflow-x-hidden mx-auto lg:w-[80%] w-full h-full">
          <div className="w-full px-4 md:px-0">
            <div className="text-3xl font-black py-6 text-[#05149C] font-fredoka">
              All Pre-Events
            </div>
            <div className="bg-white mb-8 mx-2 p-2 border-2 rounded-2xl border-[#05149C] border-opacity-20">
              {sortedEvents}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
