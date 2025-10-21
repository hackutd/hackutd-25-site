import * as React from 'react';
import { useState, useEffect, useContext } from 'react';
import Head from 'next/head';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { SectionReferenceContext } from '@/lib/context/section';

/* Calendar */
export default function Calendar() {
  const [dateCard, setDateCard] = useState([]);
  const [scheduleCard, setScheduleCard] = useState([]);
  const [filter, setFilter] = useState('All');

  /* Fetch Data */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const scheduleData = await fetch(
          `${window.location.protocol}//${window.location.host}/api/schedule`,
        ).then((res) => res.json());
        setScheduleCard(scheduleData);

        const dateData = await fetch(
          `${window.location.protocol}//${window.location.host}/api/dates`,
        ).then((res) => res.json());
        setDateCard(dateData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  if (dateCard.length === 0 || scheduleCard.length === 0) {
    return <div>Fetching Data</div>;
  }

  /* Event Colors */
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

  /* Dates Values */
  const dateValues = {
    year: dateCard[0].year,
    day1: dateCard[0].day1,
    day1Month: dateCard[0].day1Month,
    day2: dateCard[0].day2,
    day2Month: dateCard[0].day2Month,
    endTime: dateCard[0].endTime,
    startTime: dateCard[0].startTime,
  };

  /* Set event dates and times */
  const day1StartDateAndTime = new Date(
    dateValues['year'],
    dateValues['day1Month'],
    dateValues['day1'],
    dateValues['startTime'],
    0,
  );
  const day2StartDateAndTime = new Date(
    dateValues['year'],
    dateValues['day2Month'],
    dateValues['day2'],
    dateValues['startTime'],
    0,
  );
  const eventEndDateAndTime = new Date(
    dateValues['year'],
    dateValues['day1Month'],
    dateValues['day2'] + 1,
    dateValues['endTime'],
    0,
  );

  /* Filter Functionality */

  const changeFilter = (newFilter: string) => {
    if (newFilter === filter) {
      setFilter('All');
    } else {
      setFilter(newFilter);
    }
  };

  /* Event Component */
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
                ? `${!isLastEvent && filter === 'All' ? 'p-4 border-b' : 'rounded-b-xl p-4'}`
                : 'p-4 border-b'
            }
                          `}
            style={{ backgroundColor: '#100101BF', borderBottomColor: '#FF99BD' }}
          >
            <div className="flex justify-between pb-1">
              <div className="text-md font-bold font-dmSans text-white">{formattedTime}</div>
              <div className="text-md font-bold font-dmSans text-white">{data.title}</div>
            </div>
            <div className="flex justify-between">
              <div
                className={`text-xs rounded-xl py-1 px-2 border-2 font-dmSans ${
                  eventColors[data.type]
                }`}
                style={{
                  backgroundColor: '#100101BF',
                }}
              >
                {data.type}
              </div>
              <div className="text-white flex items-center font-dmSans">
                <LocationOnIcon style={{ fontSize: 'large', marginRight: '2px' }} />
                {data.location}
              </div>
            </div>
          </div>
        </>
      )
    );
  };

  /* Filter Daily Events */
  const getDailyEvents = (startTime, endTime) => {
    return scheduleCard
      .sort((a, b) => {
        return +new Date(a.startDate) - +new Date(b.startDate);
      })
      .filter((event) => {
        const eventDate = new Date(event.startDate);
        return eventDate >= startTime && eventDate <= endTime;
      })
      .map((event, index, array) => (
        <Event data={event} key={event.title + index} index={index} arrayLength={array.length} />
      ));
  };

  const day1Events = getDailyEvents(day1StartDateAndTime, day2StartDateAndTime);
  const day2Events = getDailyEvents(day2StartDateAndTime, eventEndDateAndTime);

  return (
    <>
      <Head>
        <title>HackUTD 2025: Lost in the Pages - Event Schedule | Nov 8-9, 2025</title>
        <meta
          name="description"
          content="View the complete schedule for HackUTD 2025: Lost in the Pages hackathon. See workshops, meals, social events, and required activities for Nov 8-9, 2025."
        />
        <meta
          name="keywords"
          content="HackUTD 2025 schedule, Lost in the Pages, hackathon schedule, workshops, events, Nov 8-9 2025, UT Dallas"
        />
        <link rel="canonical" href="https://legend.hackutd.co/schedule" />
      </Head>

      <div
      // style = {{
      //   backgroundColor: '#0B0B1B',
      //   backgroundImage: 'url("/assets/sponsorsBG/leaves.PNG")',
      // }}
      >
        <div
          className="text-center text-5xl font-bold p-4 font-youngSerif"
          style={{
            background: 'linear-gradient(354.75deg, #FFD29B 4.2%, #FFD29B 37.67%, #FF5757 95.8%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter:
              'drop-shadow(1px 1px 0 #000) drop-shadow(-1px -1px 0 #000) drop-shadow(1px -1px 0 #000) drop-shadow(-1px 1px 0 #000)',
          }}
        >
          What to Expect Day Of?
        </div>

        {/* Filter */}
        <div className="md:flex justify-center items-center mx-8">
          <div
            className="border-2 border-blue-900 rounded-3xl px-8 my-4 border-opacity-40"
            style={{ backgroundColor: '#430D12E5' }}
          >
            <div
              className="text-center py-1 text-xl font-bold font-youngSerif"
              style={{
                background:
                  'linear-gradient(354.75deg, #FFD29B 4.2%, #FFD29B 37.67%, #FF5757 95.8%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
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

        {/* Calendar */}
        <div className="md:flex p-1 overflow-y-auto overflow-x-hidden mx-auto lg:w-[80%] w-full h-full">
          <div className="w-full lg:w-1/2 px-4 md:px-0">
            <div
              className="text-3xl font-black py-6 text-[#FFF] font-youngSerif text-center"
              style={{
                textShadow:
                  '1px 1px 0 #FF99BD, -1px -1px 0 #FF99BD, 1px -1px 0 #FF99BD, -1px 1px 0 #FF99BD',
              }}
            >
              Day 1: Saturday
            </div>
            <div
              className="mb-8 mx-2 p-2 border-2 rounded-2xl border-opacity-20"
              style={{
                backgroundColor: '#100101BF',
                borderColor: '#FF99BD',
                boxShadow: '0px 0px 20px 0px #CD4D4D80',
              }}
            >
              {day1Events}
            </div>
          </div>

          <div className="w-full lg:w-1/2 md:ml-6 px-4 md:px-0">
            <div
              className="text-3xl font-black py-6 text-[#FFF] font-youngSerif text-center"
              style={{
                textShadow:
                  '1px 1px 0 #FF99BD, -1px -1px 0 #FF99BD, 1px -1px 0 #FF99BD, -1px 1px 0 #FF99BD',
              }}
            >
              Day 2: Sunday
            </div>
            <div
              className="mb-8 mx-2 p-2 border-2 rounded-2xl border-opacity-20"
              style={{
                backgroundColor: '#100101BF',
                borderColor: '#FF99BD',
                boxShadow: '0px 0px 20px 0px #CD4D4D80',
              }}
            >
              {day2Events}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
