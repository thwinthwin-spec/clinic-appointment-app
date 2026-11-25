import { SPECIALTIES, WEEK_DAYS } from '../../utils/constants';

export default function DoctorFormFields({ form, errors, setField, toggleDay, saving }) {
  let specialtyOptions = SPECIALTIES.map((item) => (
    <option key={item} value={item}>{item}</option>
  ));

  // Keep an existing specialty even if it is not in the standard list.
  if (SPECIALTIES.indexOf(form.specialty) === -1) {
    specialtyOptions.push(<option key={form.specialty} value={form.specialty}>{form.specialty}</option>);
  }

  return (
    <div className="form-grid">
      <div className="form-grid form-grid--two">
        <div className="field">
          <label htmlFor="doctor-name">Full name</label>
          <input
            id="doctor-name"
            type="text"
            value={form.name}
            onChange={(event) => setField('name', event.target.value)}
            aria-invalid={Boolean(errors.name)}
            disabled={saving}
            required
          />
          {errors.name && <span className="inline-error">{errors.name}</span>}
        </div>

        <div className="field">
          <label htmlFor="doctor-specialty">Specialty</label>
          <select
            id="doctor-specialty"
            value={form.specialty}
            onChange={(event) => setField('specialty', event.target.value)}
            aria-invalid={Boolean(errors.specialty)}
            disabled={saving}
          >
            {specialtyOptions}
          </select>
          {errors.specialty && <span className="inline-error">{errors.specialty}</span>}
        </div>
      </div>

      <div className="field">
        <label htmlFor="doctor-qualification">Qualification</label>
        <input
          id="doctor-qualification"
          type="text"
          placeholder="e.g. MD, FACC"
          value={form.qualification}
          onChange={(event) => setField('qualification', event.target.value)}
          disabled={saving}
        />
      </div>

      <div className="form-grid form-grid--two">
        <div className="field">
          <label htmlFor="doctor-experience">Experience (years)</label>
          <input
            id="doctor-experience"
            type="number"
            min="0"
            max="80"
            value={form.experienceYears}
            onChange={(event) => setField('experienceYears', event.target.value)}
            aria-invalid={Boolean(errors.experienceYears)}
            disabled={saving}
          />
          {errors.experienceYears && <span className="inline-error">{errors.experienceYears}</span>}
        </div>

        <div className="field">
          <label htmlFor="doctor-duration">Slot duration (minutes)</label>
          <input
            id="doctor-duration"
            type="number"
            min="5"
            max="240"
            step="5"
            value={form.slotDurationMinutes}
            onChange={(event) => setField('slotDurationMinutes', event.target.value)}
            aria-invalid={Boolean(errors.slotDurationMinutes)}
            disabled={saving}
          />
          {errors.slotDurationMinutes && <span className="inline-error">{errors.slotDurationMinutes}</span>}
        </div>
      </div>

      <div className="field">
        <span className="fieldset-label">Working days</span>
        <div className="checkbox-group">
          {WEEK_DAYS.map((day) => (
            <label className="checkbox-row" key={day}>
              <input
                type="checkbox"
                checked={form.workingDays.indexOf(day) !== -1}
                onChange={() => toggleDay(day)}
                disabled={saving}
              />
              {day}
            </label>
          ))}
        </div>
        {errors.workingDays && <span className="inline-error">{errors.workingDays}</span>}
      </div>

      <div className="form-grid form-grid--two">
        <div className="field">
          <label htmlFor="doctor-start">Day starts at</label>
          <input
            id="doctor-start"
            type="time"
            value={form.start}
            onChange={(event) => setField('start', event.target.value)}
            aria-invalid={Boolean(errors.start)}
            disabled={saving}
          />
          {errors.start && <span className="inline-error">{errors.start}</span>}
        </div>

        <div className="field">
          <label htmlFor="doctor-end">Day ends at</label>
          <input
            id="doctor-end"
            type="time"
            value={form.end}
            onChange={(event) => setField('end', event.target.value)}
            aria-invalid={Boolean(errors.end)}
            disabled={saving}
          />
          {errors.end && <span className="inline-error">{errors.end}</span>}
        </div>
      </div>

      <div className="field">
        <label htmlFor="doctor-slots">Available slots</label>
        <textarea
          id="doctor-slots"
          placeholder="09:00, 09:30, 10:00"
          value={form.availableSlotsText}
          onChange={(event) => setField('availableSlotsText', event.target.value)}
          aria-invalid={Boolean(errors.availableSlotsText)}
          disabled={saving}
        />
        <span className="text-muted text-small">
          Enter times separated by commas or one per line (24-hour format).
        </span>
        {errors.availableSlotsText && <span className="inline-error">{errors.availableSlotsText}</span>}
      </div>

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(event) => setField('isActive', event.target.checked)}
          disabled={saving}
        />
        Active (visible to patients)
      </label>
    </div>
  );
}
