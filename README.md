# Clinic Appointment Website

A **Clinic Appointment Booking Website** for the browser. It has pages for patients and for admins. This is a website, not a mobile app.

```text
React website (client/)  →  Express API (server/)  →  MongoDB
```

> ⚠️ This project uses **demo/sample data** only. Do not enter real patient health information.

## At a glance — what is this project?

| | |
| --- | --- |
| **Project** | Clinic Appointment Website |
| **Type** | Full-stack **browser website** — clinic appointment booking system (not a mobile app) |
| **What it does** | Patient — find doctors, view slots, book/cancel/reschedule · Admin — manage doctors, manage appointments, view dashboard |
| **Tech** | React + Vite · Node.js + Express · MongoDB + Mongoose · JWT + bcryptjs |
| **Ports** | API `5000` · Website `5173` |
| **Demo login** | `patient@clinic.test / Patient@123`, `admin@clinic.test / Admin@123` |
| **Status** | Completed demo project with **fictional data** only — do not enter real patient information. |

In short: A browser-based clinic appointment booking system with separate patient and admin areas. Patients search doctors, view available slots and manage bookings; admins manage doctors, appointments and dashboard stats. Built with React, Express and MongoDB as a demo project using fictional data only.

---

## 1. Main features

### Patient

- Register / login
- Search for a doctor by name or specialty
- View doctor profiles, working hours and available slots
- Choose a date and time and book an appointment
- View upcoming / past / cancelled appointments
- Cancel or reschedule an appointment
- Edit their own profile

### Admin

- Protected admin login
- Add / edit / delete doctors (specialty, working hours, slots)
- View / confirm / cancel / complete appointments
- Search and filter by doctor, patient, date and status
- Counts on the dashboard

---

## 2. Tech stack

| Part | Used |
| --- | --- |
| Website | React 18, React Router v6, Axios, Vite, plain CSS |
| API | Node.js, Express, express-validator |
| Database | MongoDB + Mongoose |
| Auth | bcryptjs (password hashing), JWT + role guard |
| Config | dotenv (`.env`) |

---

## 3. Folder overview

```text
clinic-appointment-app/
├── client/     ← React website
├── server/     ← Express API + MongoDB code
├── README.md              this file
├── API_DOCUMENTATION.md   details of every endpoint
├── PROJECT_STRUCTURE.md   what each file does
└── BEGINNER_GUIDE.md      guide to understanding the code
```

See `PROJECT_STRUCTURE.md` for the full tree.

---

## 4. Prerequisites

- Node.js 18+ (with npm)
- MongoDB running yourself (or a MongoDB Atlas connection string)
  - Locally: `mongodb://127.0.0.1:27017/clinic_appointment`

Check your tools in a terminal with `node -v` and `npm -v`.

---

## 5. Installation

From the project root:

```bash
npm run install:all
```

This runs `npm install` for both `server` and `client`.

---

## 6. Environment variables (`.env`)

### Server

```bash
copy server\.env.example server\.env
```

Then open `server/.env` and change values if needed.

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/clinic_appointment
JWT_SECRET=replace_with_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
SEED_ADMIN_EMAIL=admin@clinic.test
SEED_ADMIN_PASSWORD=Admin@123
SEED_PATIENT_EMAIL=patient@clinic.test
SEED_PATIENT_PASSWORD=Patient@123
```

> Change `JWT_SECRET` to a long random string in a real project.
> Do not commit `.env` to GitHub — `.gitignore` already excludes it.

### Client

```bash
copy client\.env.example client\.env
```

```env
VITE_API_URL=http://localhost:5000/api
```

Change this if the API is running on a different port.

---

## 7. Load demo data

```bash
npm run seed
```

This adds:

- 1 admin + 1 patient
- 6 doctors
- 8 appointments (upcoming / past / cancelled)

It is **idempotent** — running it a second time does not add duplicates.

---

## 8. Running

**Terminal 1 — API**

```bash
npm run dev:server
```

Then open `http://localhost:5000/health` in a browser. A `{ "success": true, ... }` response means it is working.

**Terminal 2 — Website**

```bash
npm run dev:client
```

Then open:

```text
http://localhost:5173
```

---

## 9. Demo login

```text
Patient : patient@clinic.test / Patient@123
Admin   : admin@clinic.test  / Admin@123
```

You can also click the **Use** button on the login page to fill these in automatically.

---

## 10. Common problems

| Problem | Fix |
| --- | --- |
| `Cannot reach the server` | Check that the API is running (`npm run dev:server`), then open `/health` |
| Website will not open | Check `http://localhost:5173` and look for errors in the terminal |
| Login returns 401 | Have you run `npm run seed`? Are the email/password correct? |
| `EADDRINUSE` | Another program is using port 5000 or 5173 — stop it or change the port in `.env` |
| Slot returns 409 | Someone else already took that doctor's time — choose another slot |
| Doctor list is empty | Check that the seed ran and MongoDB is running |

---

## 11. Zip file

```text
clinic-appointment-app.zip
```

It contains all source code. `node_modules`, `.env` and logs are **not included**. To rebuild it:

```powershell
.\make-zip.ps1
```

---

## 12. Next steps

- `BEGINNER_GUIDE.md` — explains how one request flows through the app, with an example
- `API_DOCUMENTATION.md` — request/response examples for all 18 endpoints
- `PROJECT_STRUCTURE.md` — what every file does
