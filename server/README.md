# Clinic Appointment Booking API

Express + MongoDB (Mongoose) backend. CommonJS, role-based JWT auth, express-validator, bcryptjs.

## Requirements

- Node.js 18+
- MongoDB running at `mongodb://127.0.0.1:27017` (or set `MONGODB_URI`)

## Setup

```bash
cd server
npm install
copy .env.example .env   # optional: override defaults; do not commit .env
npm run dev              # nodemon
# or
npm start
npm run seed             # idempotent demo data
```

The server binds to `0.0.0.0` so it is reachable from other devices on the LAN.
If `.env` is absent, safe development defaults are used (including a dev-only JWT secret).

> No real patient data is included. Demo reasons are generic ("Routine checkup", "Follow-up visit").

## Seed accounts

| Role | Email | Password |
| --- | --- | --- |
| admin | `admin@clinic.test` | `Admin@123` |
| patient | `patient@clinic.test` | `Patient@123` |

The seeder upserts 6 doctors (General Physician x2, Cardiologist, Dermatologist, Pediatrician, Orthopedist) and 8 appointments with upcoming, past and cancelled examples. Re-running it does not create duplicates for the same doctor/date/time.

## JSON contract

```json
// Single
{ "success": true, "message": "OK", "data": { } }

// List
{ "success": true, "data": { "items": [], "page": 1, "pages": 2, "total": 12 } }

// Error
{ "success": false, "message": "Validation failed", "errors": [{ "field": "email", "message": "..." }] }
```

`errors` is omitted when there are none. Status codes used: 200, 201, 400, 401, 403, 404, 409, 500.

## Endpoints

Base URL: `http://localhost:5000/api`

### Auth
| Method | Path | Access | Notes |
| --- | --- | --- | --- |
| POST | `/auth/register` | public | `{ name, email, password, phone? }`, creates a patient |
| POST | `/auth/login` | public | `{ email, password }`, returns `{ user, token }` |
| GET | `/auth/me` | auth | current user |
| PUT | `/auth/profile` | auth | `{ name, phone?, email? }` |

### Doctors
| Method | Path | Access | Notes |
| --- | --- | --- | --- |
| GET | `/doctors` | public | `search`, `specialty`, `isActive=true\|false\|all`, `page`, `limit` (default: active only) |
| GET | `/doctors/:id` | public | profile + `availableSlotCount` for today |
| GET | `/doctors/:id/slots?date=YYYY-MM-DD` | public | `{ date, booked: [], available: [] }` |
| POST | `/doctors` | admin | create doctor |
| PUT | `/doctors/:id` | admin | partial update |
| DELETE | `/doctors/:id` | admin | soft-delete if appointments exist, otherwise hard delete |

### Appointments
| Method | Path | Access | Notes |
| --- | --- | --- | --- |
| POST | `/appointments` | patient | `{ doctor, date, time, reason? }` |
| GET | `/appointments/my?scope=all\|upcoming\|past\|cancelled` | patient | paginated list |
| GET | `/appointments/:id` | auth | owner patient or admin |
| PATCH | `/appointments/:id/cancel` | patient owner/admin | `{ cancellationReason? }` |
| PATCH | `/appointments/:id/reschedule` | patient owner | `{ date, time }` |

### Admin
| Method | Path | Access | Notes |
| --- | --- | --- | --- |
| GET | `/admin/appointments` | admin | `doctor`, `patient`, `date`, `status`, `page`, `limit` |
| PATCH | `/admin/appointments/:id/status` | admin | `{ status: confirmed\|cancelled\|completed, cancellationReason? }` |
| GET | `/admin/dashboard` | admin | user, doctor and appointment counts |

Send protected requests with `Authorization: Bearer <token>`.

## Double-booking prevention

`Appointment` has a **partial unique index** on `{ doctor, date, time }` filtered with
`{ status: { $in: ['pending', 'confirmed', 'completed'] } }`. MongoDB partial indexes do not
support `$ne`, so `$in` is used. Cancelled appointments are excluded and may reuse a slot.
Controllers also check for conflicts first and return **409**; duplicate-key errors (11000)
are translated to **409** by the central error handler.

## Project layout

```text
server/
├── .env.example
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── server.js
    ├── config/       env.js, db.js
    ├── controllers/  auth, doctor, appointment, admin
    ├── middleware/   auth, role, validate, errorHandler, notFound
    ├── models/       User, Doctor, Appointment
    ├── routes/       auth, doctor, appointment, admin, index
    ├── seed/         seedData.js
    └── utils/        generateToken, apiResponse, slots
```
