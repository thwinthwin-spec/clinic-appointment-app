# Clinic Care — React + Vite client

Frontend for the sample Clinic Appointment Booking app. Built with React 18,
react-router-dom v6, axios, Vite, and plain CSS. No real patient information is
used anywhere — every doctor, patient, and appointment is demo data.

## Quick start

```bash
cd client
npm install
cp .env.example .env        # Windows: copy .env.example .env
npm run dev                 # http://localhost:5173
```

The API must be running at `http://localhost:5000/api` (or wherever
`VITE_API_URL` points). The `.env` file is deliberately not included in this
project; only `.env.example` is provided.

### Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Create an optimized production bundle in `dist/` |
| `npm run preview` | Preview the production build locally |

## Sample logins

| Role | Email | Password |
| --- | --- | --- |
| Patient | `patient@clinic.test` | `Patient@123` |
| Admin | `admin@clinic.test` | `Admin@123` |

The login screen has **Use** buttons that fill these sample credentials for you.
New accounts can also be created through `/register`; use fictional details only.

## Routes

Public: `/login`, `/register`

Patient (requires sign in): `/doctors`, `/doctors/:id`, `/book/:doctorId`,
`/appointments`, `/profile`

Admin (requires the `admin` role): `/admin`, `/admin/doctors`,
`/admin/appointments`

`/` redirects by role; anything else renders the 404 page.

## Features

- Doctor search (name/specialty), specialty filter, pagination, and
  loading/error/empty states.
- Doctor detail with qualification, experience, working hours and date-based
  slot availability.
- Booking form with slot selection, reason validation, and a clear conflict
  message when a slot is taken (HTTP 409).
- Appointment tabs (upcoming/past/cancelled), inline rescheduling, and a
  cancellation confirmation dialog with an optional reason.
- Profile edits (name, email, phone).
- Admin dashboard counts, doctor CRUD (including working days, start/end time,
  slot duration, comma-separated slots, and active state), and appointment
  status actions (confirm / complete / cancel).
- Fully client-side validation, disabled buttons while submitting, and
  responsive layouts for phones and tablets.

## API contract

Base URL: `VITE_API_URL` (default `http://localhost:5000/api`). The axios client
attaches `Authorization: Bearer <token>` from `localStorage.token`. A `401`
response clears `token` and `user` and sends the user to `/login`.

| Method | Endpoint | Used for |
| --- | --- | --- |
| POST | `/auth/register` | Register `{name,email,password,phone?}` |
| POST | `/auth/login` | Login `{email,password}` → `{token,user}` |
| GET | `/auth/me` | Restore the current session |
| PUT | `/auth/profile` | Update name/email/phone |
| GET | `/doctors` | Search + filter + pagination |
| GET | `/doctors/:id` | Doctor detail |
| GET | `/doctors/:id/slots?date=YYYY-MM-DD` | `{date,booked,available}` |
| POST/PUT/DELETE | `/doctors`, `/doctors/:id` | Admin doctor management |
| POST | `/appointments` | Book `{doctor,date,time,reason}` |
| GET | `/appointments/my?scope=…` | Upcoming/past/cancelled/all |
| GET | `/appointments/:id` | Single appointment |
| PATCH | `/appointments/:id/cancel` | Cancel with optional reason |
| PATCH | `/appointments/:id/reschedule` | Reschedule `{date,time}` |
| GET | `/admin/appointments` | Filtered admin list |
| PATCH | `/admin/appointments/:id/status` | Confirm/complete/cancel |
| GET | `/admin/dashboard` | Counts and optional recent appointments |

The admin doctor form submits
`workingHours: { days: string[], start: 'HH:MM', end: 'HH:MM' }`,
`availableSlots: string[]`, `slotDurationMinutes: number`, and `isActive: boolean`.

## Folder structure

```
client/
├── index.html
├── vite.config.js
├── .env.example
├── README.md
└── src/
    ├── main.jsx / App.jsx / index.css
    ├── api/          axios instance + auth, doctor, appointment calls
    ├── components/   header, guards, cards, slot picker, badges, feedback
    ├── context/      AuthContext (session persistence + profile)
    ├── pages/        auth, patient pages, 404
    │   └── admin/    dashboard, doctors, appointments
    └── utils/        formatters + shared constants
```
