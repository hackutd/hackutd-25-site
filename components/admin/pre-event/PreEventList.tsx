import React, { useEffect, useState } from 'react';

interface Props {
  events: PreEvent[];
  onEventEditClick: (eventIndex: number) => void;
  onEventDeleteClick: (eventIndex: number) => void;
}

export default function PreEventList({ events, onEventEditClick, onEventDeleteClick }: Props) {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [filteredEvents, setFilteredEvents] = useState<PreEvent[]>([]);

  useEffect(() => {
    const now = new Date();
    let filtered = events;

    switch (filter) {
      case 'upcoming':
        filtered = events.filter((event) => new Date(event.startDate) > now);
        break;
      case 'past':
        filtered = events.filter((event) => new Date(event.endDate) < now);
        break;
      case 'all':
      default:
        filtered = events;
        break;
    }

    // Sort by start date
    filtered.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    setFilteredEvents(filtered);
  }, [events, filter]);

  const getEventStatus = (event: PreEvent) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (now < startDate) {
      return { status: 'upcoming', color: 'text-blue-600 bg-blue-100' };
    } else if (now >= startDate && now <= endDate) {
      return { status: 'live', color: 'text-green-600 bg-green-100' };
    } else {
      return { status: 'past', color: 'text-gray-600 bg-gray-100' };
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-5">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-4">Pre-Events Management</h1>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'upcoming'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Upcoming ({events.filter((e) => new Date(e.startDate) > new Date()).length})
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'past'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Past ({events.filter((e) => new Date(e.endDate) < new Date()).length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All ({events.length})
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No pre-events found for the selected filter.
          </div>
        ) : (
          filteredEvents.map((event, idx) => {
            const eventStatus = getEventStatus(event);
            const originalIndex = events.findIndex((e) => e.Event === event.Event);

            return (
              <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${eventStatus.color}`}
                      >
                        {eventStatus.status.toUpperCase()}
                      </span>
                      {event.isVirtual && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          VIRTUAL
                        </span>
                      )}
                      {event.registrationRequired && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                          REGISTRATION REQUIRED
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-gray-600 mb-2">
                      <p>
                        <strong>Type:</strong> {event.type} | <strong>Track:</strong> {event.track}
                      </p>
                      <p>
                        <strong>Location:</strong> {event.location}
                      </p>
                      <p>
                        <strong>Start:</strong> {formatDate(event.startDate)}
                      </p>
                      <p>
                        <strong>End:</strong> {formatDate(event.endDate)}
                      </p>
                      {event.registrationRequired && event.maxCapacity > 0 && (
                        <p>
                          <strong>Capacity:</strong> {event.currentRegistrations || 0}/
                          {event.maxCapacity}
                        </p>
                      )}
                    </div>

                    {event.description && (
                      <p className="text-sm text-gray-700 mb-2">{event.description}</p>
                    )}

                    {event.speakers && event.speakers.length > 0 && (
                      <p className="text-sm text-gray-600">
                        <strong>Speakers:</strong>{' '}
                        {event.speakers.filter((s) => s.trim()).join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => onEventEditClick(originalIndex)}
                      className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-800 rounded text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onEventDeleteClick(originalIndex)}
                      className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
