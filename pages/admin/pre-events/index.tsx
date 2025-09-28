import { GetServerSideProps } from 'next';
import { RequestHelper } from '../../../lib/request-helper';
import { useState } from 'react';
import PreEventForm from '../../../components/admin/pre-event/PreEventForm';
import PreEventList from '../../../components/admin/pre-event/PreEventList';

interface Props {
  events: PreEvent[];
}

export default function PreEventPage(props: Props) {
  const [events, setEvents] = useState<PreEvent[]>(props.events);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingEventIndex, setEditingEventIndex] = useState<number>(-1);

  const handleEventEditClick = (eventIndex: number) => {
    setEditingEventIndex(eventIndex);
    setShowForm(true);
  };

  const handleEventDeleteClick = async (eventIndex: number) => {
    const eventToDelete = events[eventIndex];
    if (confirm(`Are you sure you want to delete "${eventToDelete.title}"?`)) {
      try {
        await RequestHelper.delete(
          '/api/pre-events',
          {},
          {
            Event: eventToDelete.Event,
          },
        );
        setEvents(events.filter((_, index) => index !== eventIndex));
      } catch (error) {
        console.error('Error deleting pre-event:', error);
        alert('Failed to delete pre-event. Please try again.');
      }
    }
  };

  const handleFormSubmit = async (eventData: PreEvent) => {
    try {
      if (editingEventIndex === -1) {
        // Adding new event
        await RequestHelper.post('/api/pre-events', {}, eventData);
        setEvents([...events, eventData]);
      } else {
        // Updating existing event
        await RequestHelper.post('/api/pre-events', {}, eventData);
        const updatedEvents = [...events];
        updatedEvents[editingEventIndex] = eventData;
        setEvents(updatedEvents);
      }
      setShowForm(false);
      setEditingEventIndex(-1);
    } catch (error) {
      console.error('Error saving pre-event:', error);
      alert('Failed to save pre-event. Please try again.');
    }
  };

  const handleAddEventClick = () => {
    setEditingEventIndex(-1);
    setShowForm(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingEventIndex(-1);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Pre-Events Management</h1>
          <button
            onClick={handleAddEventClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Add Pre-Event
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingEventIndex === -1 ? 'Add New Pre-Event' : 'Edit Pre-Event'}
              </h2>
              <button onClick={handleFormCancel} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <PreEventForm
              event={editingEventIndex === -1 ? undefined : events[editingEventIndex]}
              onSubmitClick={handleFormSubmit}
              formAction={editingEventIndex === -1 ? 'Add' : 'Edit'}
            />
          </div>
        )}

        <PreEventList
          events={events}
          onEventEditClick={handleEventEditClick}
          onEventDeleteClick={handleEventDeleteClick}
        />
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // Import Firebase Admin only on the server side
    const { firestore } = await import('firebase-admin');
    const initializeApi = (await import('../../../lib/admin/init')).default;

    initializeApi();
    const db = firestore();

    const snapshot = await db.collection('/pre-events').get();
    const events: PreEvent[] = [];

    snapshot.forEach((doc) => {
      const currentEvent = doc.data();
      events.push({
        ...currentEvent,
        startDate: currentEvent.startDate.toDate(),
        endDate: currentEvent.endDate.toDate(),
      } as PreEvent);
    });

    return {
      props: {
        events,
      },
    };
  } catch (error) {
    console.error('Error fetching pre-events:', error);
    return {
      props: {
        events: [],
      },
    };
  }
};
