import React from 'react';
import { PreEventData } from '@/lib/pre-events-data';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ComputerIcon from '@mui/icons-material/Computer';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import LinkIcon from '@mui/icons-material/Link';
import SchoolIcon from '@mui/icons-material/School';

interface Props {
  event: PreEventData;
}

export default function PreEventDetail({ event }: Props) {
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      Workshop: 'bg-purple-100 text-purple-800',
      'Info Session': 'bg-blue-100 text-blue-800',
      Networking: 'bg-yellow-100 text-yellow-800',
      Social: 'bg-green-100 text-green-800',
      Training: 'bg-red-100 text-red-800',
      Preparation: 'bg-orange-100 text-orange-800',
      Sponsor: 'bg-indigo-100 text-indigo-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getEventTypeColor(
              event.type,
            )}`}
          >
            {event.type}
          </span>
          <span className="text-sm text-gray-500">{event.track} Track</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>

        {event.organizer && <p className="text-lg text-gray-600">Organized by {event.organizer}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
          <CalendarTodayIcon className="text-blue-600" />
          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p className="font-semibold">{formatDate(startDate)}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
          <AccessTimeIcon className="text-green-600" />
          <div>
            <p className="text-sm text-gray-500">Time</p>
            <p className="font-semibold">
              {formatTime(startDate)} - {formatTime(endDate)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg mb-6">
        {event.isVirtual ? (
          <ComputerIcon className="text-purple-600" />
        ) : (
          <LocationOnIcon className="text-red-600" />
        )}
        <div>
          <p className="text-sm text-gray-500">Location</p>
          <p className="font-semibold">{event.location}</p>
          {event.roomNumber && event.roomNumber !== event.location && (
            <p className="text-sm text-gray-600">Room: {event.roomNumber}</p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3">Description</h3>
        <p className="text-gray-700 leading-relaxed">{event.description}</p>
      </div>

      {event.speakers && event.speakers.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 flex items-center">
            <PersonIcon className="mr-2" />
            Speakers
          </h3>
          <div className="space-y-2">
            {event.speakers.map((speaker, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">{speaker}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {event.rsvpLink && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            {event.registrationRequired ? 'Registration Required' : 'RSVP'}
          </h3>
          <a
            href={event.rsvpLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <LinkIcon className="mr-2" />
            RSVP Now
          </a>
          {event.maxCapacity && (
            <p className="mt-2 text-sm text-blue-700">
              Capacity: {event.currentRegistrations || 0}/{event.maxCapacity} spots filled
            </p>
          )}
        </div>
      )}

      {event.prerequisites && event.prerequisites.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 flex items-center">
            <SchoolIcon className="mr-2" />
            Prerequisites
          </h3>
          <ul className="list-disc list-inside space-y-1">
            {event.prerequisites.map((prereq, index) => (
              <li key={index} className="text-gray-700">
                {prereq}
              </li>
            ))}
          </ul>
        </div>
      )}

      {event.materials && event.materials.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">What to Bring</h3>
          <ul className="list-disc list-inside space-y-1">
            {event.materials.map((material, index) => (
              <li key={index} className="text-gray-700">
                {material}
              </li>
            ))}
          </ul>
        </div>
      )}

      {event.tags && event.tags.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {event.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {event.contactEmail && (
        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
          <EmailIcon className="text-gray-600" />
          <div>
            <p className="text-sm text-gray-500">Contact</p>
            <a
              href={`mailto:${event.contactEmail}`}
              className="font-semibold text-blue-600 hover:text-blue-800"
            >
              {event.contactEmail}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
