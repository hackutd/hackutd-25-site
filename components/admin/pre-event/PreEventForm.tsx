import { useState } from 'react';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import TextField from '@mui/material/TextField';
import { DEFAULT_PRE_EVENT_FORM_DATA } from '../../../lib/data';

interface Props {
  event?: PreEvent;
  onSubmitClick: (eventData: PreEvent) => Promise<void>;
  formAction: 'Edit' | 'Add';
}

export default function PreEventForm({ event, onSubmitClick, formAction }: Props) {
  const [disableSubmit, setDisableSubmit] = useState<boolean>(false);
  const [eventForm, setEventForm] = useState<typeof event>(
    formAction === 'Edit' ? event : DEFAULT_PRE_EVENT_FORM_DATA,
  );

  return (
    <div className="my-3 flex flex-col gap-y-4">
      <input
        value={eventForm.title}
        onChange={(e) => setEventForm((prev) => ({ ...prev, title: e.target.value }))}
        type="text"
        placeholder="Enter pre-event title"
        className="border-2 p-3 rounded-lg"
      />
      <input
        value={eventForm.page}
        onChange={(e) => setEventForm((prev) => ({ ...prev, page: e.target.value }))}
        type="text"
        placeholder="Enter page"
        className="border-2 p-3 rounded-lg"
      />
      <select
        className="border-2 p-3 rounded-lg"
        value={eventForm.type}
        onChange={(e) => setEventForm((prev) => ({ ...prev, type: e.target.value }))}
      >
        <option value="" disabled>
          Choose a pre-event type
        </option>
        <option value="Workshop">Workshop</option>
        <option value="Info Session">Info Session</option>
        <option value="Networking">Networking</option>
        <option value="Social">Social</option>
        <option value="Training">Training</option>
        <option value="Preparation">Preparation</option>
        <option value="Sponsor">Sponsor Event</option>
      </select>
      <input
        type="text"
        className="border-2 p-3 rounded-lg"
        placeholder={`Enter track ("General", "Technical", etc.)`}
        value={eventForm.track}
        onChange={(e) => setEventForm((prev) => ({ ...prev, track: e.target.value }))}
      />
      <input
        value={eventForm.location}
        onChange={(e) => setEventForm((prev) => ({ ...prev, location: e.target.value }))}
        type="text"
        placeholder="Enter event location (or 'Virtual' for online events)"
        className="border-2 p-3 rounded-lg"
      />
      <textarea
        cols={50}
        className="border-2 p-3 rounded-lg"
        value={eventForm.description}
        placeholder="Enter event description"
        onChange={(e) => {
          setEventForm((prev) => ({
            ...prev,
            description: e.target.value,
          }));
        }}
      />
      <DateTimePicker
        label="Enter start date"
        value={eventForm.startDate}
        onChange={(newValue) => setEventForm((prev) => ({ ...prev, startDate: newValue }))}
        renderInput={(params) => <TextField {...params} />}
      />
      <DateTimePicker
        label="Enter end date"
        value={eventForm.endDate}
        onChange={(newValue) => setEventForm((prev) => ({ ...prev, endDate: newValue }))}
        renderInput={(params) => <TextField {...params} />}
      />

      {/* Pre-event specific fields */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isVirtual"
          checked={eventForm.isVirtual}
          onChange={(e) => setEventForm((prev) => ({ ...prev, isVirtual: e.target.checked }))}
          className="w-4 h-4"
        />
        <label htmlFor="isVirtual" className="text-sm font-medium">
          Virtual Event
        </label>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="registrationRequired"
          checked={eventForm.registrationRequired}
          onChange={(e) =>
            setEventForm((prev) => ({ ...prev, registrationRequired: e.target.checked }))
          }
          className="w-4 h-4"
        />
        <label htmlFor="registrationRequired" className="text-sm font-medium">
          Registration Required
        </label>
      </div>

      {eventForm.registrationRequired && (
        <input
          type="number"
          className="border-2 p-3 rounded-lg"
          placeholder="Maximum capacity (0 for unlimited)"
          value={eventForm.maxCapacity}
          onChange={(e) =>
            setEventForm((prev) => ({ ...prev, maxCapacity: parseInt(e.target.value) || 0 }))
          }
        />
      )}

      {eventForm.speakers.map((speaker, idx) => (
        <input
          className="border-2 p-3 rounded-lg"
          value={speaker}
          key={idx}
          type="text"
          placeholder="Enter speaker name"
          onChange={(e) =>
            setEventForm((prev) => ({
              ...prev,
              speakers: prev.speakers.map((sp, i) => {
                if (i === idx) return e.target.value as string;
                return sp;
              }),
            }))
          }
        ></input>
      ))}
      <button
        onClick={() =>
          setEventForm((prev) => ({
            ...prev,
            speakers: [...prev.speakers, ''],
          }))
        }
        className="font-bold bg-blue-200 hover:bg-blue-300 border border-blue-800 text-blue-900 rounded-lg p-3"
      >
        Add Speaker
      </button>
      <button
        disabled={disableSubmit}
        onClick={async () => {
          setDisableSubmit(true);
          try {
            await onSubmitClick(eventForm);
          } catch (error) {
          } finally {
            setDisableSubmit(false);
          }
        }}
        className="font-bold bg-green-200 hover:bg-green-300 border border-green-800 text-green-900 rounded-lg p-3"
      >
        {formAction} Pre-Event
      </button>
    </div>
  );
}
