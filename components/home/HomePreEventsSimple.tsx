import * as React from 'react';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { PRE_EVENTS_DATA } from '@/lib/pre-events-data';

export default function HomePreEventsSimple() {
  const Event = ({ data, index, arrayLength }) => {
    const startDate = new Date(data.startDate);
    const formattedTime =
      startDate
        .toLocaleString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          timeZone: 'America/Chicago',
          hour12: true,
        })
        .replace(' ', '')
        .replace('AM', 'am')
        .replace('PM', 'pm') + ' CST';

    const formattedDate = startDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: 'America/Chicago',
    });

    const isLastEvent = index === arrayLength - 1;

    return (
      <div
        className={`${!isLastEvent ? 'p-4 border-b' : 'rounded-b-xl p-4'}`}
        style={{ backgroundColor: '#100101BF', borderBottomColor: '#FF99BD' }}
      >
        <div className="flex justify-between pb-1">
          <div
            className="text-md font-bold font-dmSans text-white"
            style={{
              textShadow:
                '1px 1px 0 #FF99BD, -1px -1px 0 #FF99BD, 1px -1px 0 #FF99BD, -1px 1px 0 #FF99BD',
            }}
          >
            {formattedDate} • {formattedTime}
          </div>
          <div
            className="text-md font-bold font-dmSans text-white"
            style={{
              textShadow:
                '1px 1px 0 #FF99BD, -1px -1px 0 #FF99BD, 1px -1px 0 #FF99BD, -1px 1px 0 #FF99BD',
            }}
          >
            {data.title}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div
              className="text-xs rounded-xl py-1 px-2 border-2 font-dmSans border-[#5200FF] text-[#5200FF]"
              style={{
                backgroundColor: '#100101BF',
                textShadow:
                  '1px 1px 0 #FF99BD, -1px -1px 0 #FF99BD, 1px -1px 0 #FF99BD, -1px 1px 0 #FF99BD',
              }}
            >
              {data.type}
            </div>
            <div
              className="text-white flex items-center font-dmSans"
              style={{
                textShadow:
                  '1px 1px 0 #FF99BD, -1px -1px 0 #FF99BD, 1px -1px 0 #FF99BD, -1px 1px 0 #FF99BD',
              }}
            >
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
    );
  };

  const upcomingEvents = PRE_EVENTS_DATA.filter(
    (event) => new Date(event.startDate) > new Date(),
  ).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  return (
    <div id="pre-events-section">
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
        Pre-Events!
      </div>
      <div className="md:flex p-1 overflow-y-auto overflow-x-hidden mx-auto lg:w-[80%] w-full h-full">
        <div className="w-full lg:w-1/2 px-4 md:px-0">
          <div
            className="text-3xl font-black py-6 text-[#FFF] font-youngSerif text-center"
            style={{
              textShadow:
                '1px 1px 0 #FF99BD, -1px -1px 0 #FF99BD, 1px -1px 0 #FF99BD, -1px 1px 0 #FF99BD',
            }}
          >
            HackUTD Workshops
          </div>
          <div
            className="mb-8 mx-2 p-2 border-2 rounded-2xl border-opacity-20"
            style={{
              backgroundColor: '#100101BF',
              borderColor: '#FF99BD',
              boxShadow: '0px 0px 20px 0px #CD4D4D80',
            }}
          >
            {upcomingEvents.map((event, index) => (
              <Event
                key={event.id}
                data={event}
                index={index}
                arrayLength={upcomingEvents.length}
              />
            ))}
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
            Coming Soon!
          </div>
          <div
            className="mb-8 mx-2 p-2 border-2 rounded-2xl border-opacity-20"
            style={{
              backgroundColor: '#100101BF',
              borderColor: '#FF99BD',
              boxShadow: '0px 0px 20px 0px #CD4D4D80',
            }}
          >
            <div className="p-4 text-center" style={{ backgroundColor: '#100101BF' }}>
              <div
                className="text-lg font-bold font-dmSans text-white"
                style={{
                  textShadow:
                    '1px 1px 0 #FF99BD, -1px -1px 0 #FF99BD, 1px -1px 0 #FF99BD, -1px 1px 0 #FF99BD',
                }}
              >
                Stay tuned for more upcoming events!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
