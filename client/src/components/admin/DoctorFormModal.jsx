import { useState } from 'react';
import doctorApi from '../../api/doctorApi';
import { getErrorMessage } from '../../api/axios';
import ErrorMessage from '../ErrorMessage';
import DoctorFormFields from './DoctorFormFields';
import {
  DEFAULT_SLOT_DURATION,
  DEFAULT_WORKING_DAYS,
  SPECIALTIES,
  WEEK_DAYS,
} from '../../utils/constants';

function emptyForm() {
  return {
    name: '',
    specialty: SPECIALTIES[0],
    qualification: '',
    experienceYears: '0',
    workingDays: DEFAULT_WORKING_DAYS.slice(),
    start: '09:00',
    end: '17:00',
    slotDurationMinutes: String(DEFAULT_SLOT_DURATION),
    availableSlotsText: '09:00, 09:30, 10:00, 10:30, 11:00, 11:30',
    isActive: true,
  };
}

// Copy an existing doctor into the editable form shape.
function formFromDoctor(doctor) {
  return {
    name: doctor.name,
    specialty: doctor.specialty,
    qualification: doctor.qualification,
    experienceYears: String(doctor.experienceYears),
    workingDays: doctor.workingHours.days.slice(),
    start: doctor.workingHours.start,
    end: doctor.workingHours.end,
    slotDurationMinutes: String(doctor.slotDurationMinutes),
    availableSlotsText: doctor.availableSlots.join(', '),
    isActive: doctor.isActive,
  };
}

export default function DoctorFormModal({ doctor, onClose, onSaved }) {
  const [form, setForm] = useState(() => {
    if (doctor) return formFromDoctor(doctor);
    return emptyForm();
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Update a single field when its input changes.
  function setField(field, value) {
    const next = Object.assign({}, form);
    next[field] = value;
    setForm(next);
    const nextErrors = Object.assign({}, errors);
    nextErrors[field] = '';
    setErrors(nextErrors);
    setFormError('');
  }

  function toggleDay(day) {
    const next = Object.assign({}, form);
    const days = form.workingDays.slice();
    const index = days.indexOf(day);

    if (index !== -1) {
      days.splice(index, 1);
      next.workingDays = days;
    } else {
      // Keep the short day codes in normal week order: Mon, Tue, Wed, ...
      const ordered = [];
      WEEK_DAYS.forEach((item) => {
        if (item === day || days.indexOf(item) !== -1) ordered.push(item);
      });
      next.workingDays = ordered;
    }

    setForm(next);
    setErrors({});
  }

  function validate() {
    const next = {};
    const slots = form.availableSlotsText
      .split(/[,\n]/)
      .map((slot) => slot.trim())
      .filter(Boolean);

    if (!form.name.trim()) next.name = 'Doctor name is required.';
    if (!form.specialty) next.specialty = 'Choose a specialty.';

    const experience = Number(form.experienceYears);
    if (form.experienceYears === '' || Number.isNaN(experience) || experience < 0) {
      next.experienceYears = 'Enter a valid number of years.';
    }

    if (form.workingDays.length === 0) next.workingDays = 'Pick at least one working day.';
    if (!form.start) next.start = 'Start time is required.';
    if (!form.end) next.end = 'End time is required.';
    if (form.start && form.end && form.start >= form.end) {
      next.end = 'End time must be after start time.';
    }

    const duration = Number(form.slotDurationMinutes);
    if (Number.isNaN(duration) || duration < 5 || duration > 240) {
      next.slotDurationMinutes = 'Use a duration between 5 and 240 minutes.';
    }

    if (slots.length === 0) {
      next.availableSlotsText = 'Add at least one available slot.';
    } else {
      slots.forEach((slot) => {
        if (!/^\d{1,2}:\d{2}$/.test(slot)) {
          next.availableSlotsText = 'Use 24-hour times such as 09:00, separated by commas.';
        }
      });
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return null;
    return slots;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    const slots = validate();
    if (!slots) return;

    // The API expects workingHours.days to use short codes like "Mon".
    const payload = {
      name: form.name.trim(),
      specialty: form.specialty,
      qualification: form.qualification.trim(),
      experienceYears: Number(form.experienceYears),
      workingHours: {
        days: form.workingDays,
        start: form.start,
        end: form.end,
      },
      slotDurationMinutes: Number(form.slotDurationMinutes),
      availableSlots: slots,
      isActive: form.isActive,
    };

    setSaving(true);
    try {
      if (doctor) {
        await doctorApi.updateDoctor(doctor._id, payload);
        onSaved('Doctor details updated.');
      } else {
        await doctorApi.createDoctor(payload);
        onSaved('Doctor created.');
      }
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function closeModal() {
    if (saving) return;
    onClose();
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeModal();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="doctor-form-title">
        <div className="modal__header">
          <h2 id="doctor-form-title">{doctor ? 'Edit doctor' : 'Add a doctor'}</h2>
          <button type="button" className="modal__close" onClick={closeModal} aria-label="Close">×</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal__body">
            <ErrorMessage message={formError} title="Could not save doctor" />
            <DoctorFormFields
              form={form}
              errors={errors}
              setField={setField}
              toggleDay={toggleDay}
              saving={saving}
            />
          </div>

          <div className="modal__footer">
            <button type="button" className="btn btn-outline" onClick={closeModal} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : (doctor ? 'Save changes' : 'Create doctor')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
