# API Documentation — Clinic Appointment

ဒီ file မှာ API endpoint အားလုံးကို ရှင်းရှင်းလင်းလင်း ဖော်ပြထားပါတယ်။

- **Base URL:** `http://localhost:5000/api`
- **Health check:** `GET http://localhost:5000/health` (API အလုပ်လုပ်လား စစ်ဖို့)
- **Data format:** JSON

---

## 1. Response ပုံစံ (အားလုံး ဒီအတိုင်းပါ)

### Success — တစ်ခုတည်း

```json
{
  "success": true,
  "message": "Doctor profile retrieved",
  "data": { "doctor": { } }
}
```

### Success — စာရင်း (list)

```json
{
  "success": true,
  "data": {
    "items": [],
    "page": 1,
    "pages": 2,
    "total": 12
  }
}
```

### Error

```json
{
  "success": false,
  "message": "This appointment slot is already booked"
}
```

Validation error ဆိုရင် `errors` ဆိုတဲ့ field ပါတယ်:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "Please provide a valid email" }]
}
```

---

## 2. Authentication (Token)

Login လုပ်ပြီးရင် `token` ရပါတယ်။ နောက်တစ်ခါ API ခေါ်တိုင်း header ထဲ ထည့်ပါ:

```text
Authorization: Bearer <token>
```

| အမျိုးအစား | ရှင်းလင်းချက် |
| --- | --- |
| Public | token မလိုပါ |
| Auth | token ရှိရမယ် |
| Patient | token ရှိရမယ် + role = `patient` |
| Admin | token ရှိရမယ် + role = `admin` |

Token မပါရင် `401`, role မမှန်ရင် `403` ပြန်ပါတယ်။

---

## 3. Status code များ

| Code | ဘာဆိုလိုလဲ |
| --- | --- |
| `200` | အောင်မြင်ပြီး data ပြန်ပေးတယ် |
| `201` | အသစ်ဖန်တီးပြီး (register, doctor, appointment) |
| `400` | ထည့်ထားတာ မမှန်ဘူး (validation) |
| `401` | Login မလုပ်ရသေးဘူး / token မမှန်ဘူး |
| `403` | Role မမှန်ဘူး (patient က admin API ခေါ်တာမျိုး) |
| `404` | ရှာတဲ့အရာ မတွေ့ဘူး |
| `409` | ထပ်နေတယ် (email ထပ်နေတာ / slot ယူထားပြီးသား) |
| `500` | Server မှာ မမျှော်လင့်ထားတဲ့ error |

---

## 4. Endpoint အကျဉ်း (၁၈ ခု)

| # | Method | Path | လိုအပ်ချက် | ရည်ရွယ်ချက် |
| --- | --- | --- | --- | --- |
| 1 | POST | `/auth/register` | Public | Patient အကောင့်ဖွင့် |
| 2 | POST | `/auth/login` | Public | Login |
| 3 | GET | `/auth/me` | Auth | လက်ရှိ user အချက်အလက် |
| 4 | PUT | `/auth/profile` | Auth | Profile ပြင် |
| 5 | GET | `/doctors` | Public | Doctor စာရင်း + search |
| 6 | GET | `/doctors/:id` | Public | Doctor profile |
| 7 | GET | `/doctors/:id/slots` | Public | လွတ်တဲ့အချိန်တွေ |
| 8 | POST | `/doctors` | Admin | Doctor အသစ်ထည့် |
| 9 | PUT | `/doctors/:id` | Admin | Doctor ပြင် |
| 10 | DELETE | `/doctors/:id` | Admin | Doctor ဖျက်/retire |
| 11 | POST | `/appointments` | Patient | ချိန်းဆို |
| 12 | GET | `/appointments/my` | Patient | ကိုယ့်ချိန်းတွေ |
| 13 | GET | `/appointments/:id` | Auth | ချိန်းတစ်ခု အသေးစိတ် |
| 14 | PATCH | `/appointments/:id/cancel` | Patient/Admin | ချိန်းဖျက် |
| 15 | PATCH | `/appointments/:id/reschedule` | Patient | ရက်ရွှေ့ |
| 16 | GET | `/admin/appointments` | Admin | ချိန်းအားလုံး + filter |
| 17 | PATCH | `/admin/appointments/:id/status` | Admin | Status ပြောင်း |
| 18 | GET | `/admin/dashboard` | Admin | ဂဏန်းအကျဉ်း |

---

# 5. Endpoint အသေးစိတ်

## 1) POST `/auth/register` — Patient အကောင့်ဖွင့်

**Public**

Request:

```json
{
  "name": "Demo Patient",
  "email": "newpatient@clinic.test",
  "password": "Patient@123",
  "phone": "09-123456789"
}
```

- `name`, `email`, `password` မဖြစ်မနေ လိုပါတယ်
- password ၆ လုံးအနည်းဆုံး
- email ထပ်နေရင် `409`

Success `201`:

```json
{
  "success": true,
  "message": "Registered successfully",
  "data": {
    "token": "eyJhbGciOi...",
    "user": { "_id": "...", "name": "Demo Patient", "role": "patient" }
  }
}
```

Error: `400` validation, `409` email ထပ်နေတာ

---

## 2) POST `/auth/login` — Login

**Public**

Request:

```json
{ "email": "patient@clinic.test", "password": "Patient@123" }
```

Success `200`:

```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "token": "eyJhbGciOi...",
    "user": { "_id": "...", "name": "Demo Patient", "role": "patient" }
  }
}
```

Error: `400` email/password မပါတာ, `401` email/password မမှန်တာ

---

## 3) GET `/auth/me` — လက်ရှိ user

**Auth**: `Authorization: Bearer <token>`

Success `200`:

```json
{
  "success": true,
  "data": { "user": { "_id": "...", "name": "Demo Patient", "role": "patient" } }
}
```

Error: `401` token မမှန်တာ

---

## 4) PUT `/auth/profile` — Profile ပြင်

**Auth**

Request (ပြင်ချင်တာပဲ ပို့လို့ရပါတယ်):

```json
{ "name": "New Name", "phone": "09-999999999", "email": "new@clinic.test" }
```

Success `200`: ပြင်ပြီးသား `user` ပြန်ပါတယ်။

Error: `400` validation, `409` email တခြားသူသုံးထားတာ

---

## 5) GET `/doctors` — Doctor စာရင်း

**Public**

Query params:

| Param | ဥပမာ | ရှင်းလင်းချက် |
| --- | --- | --- |
| `search` | `Cardiologist` | နာမည် သို့ specialty ထဲ ရှာတယ် |
| `specialty` | `Dermatologist` | Specialty အတိအကျ |
| `isActive` | `true` / `false` / `all` | မပါရင် active ပဲ |
| `page` | `1` | စာမျက်နှာ |
| `limit` | `9` | တစ်မျက်နှာ အရေအတွက် (အများဆုံး 50) |

```
GET /api/doctors?search=neha&specialty=Cardiologist&page=1&limit=9
```

Success `200`:

```json
{
  "success": true,
  "data": {
    "items": [{ "_id": "...", "name": "Dr. Neha Kapoor", "specialty": "Cardiologist" }],
    "page": 1,
    "pages": 1,
    "total": 1
  }
}
```

---

## 6) GET `/doctors/:id` — Doctor profile

**Public**

Success `200`:

```json
{
  "success": true,
  "message": "Doctor profile retrieved",
  "data": {
    "doctor": {
      "_id": "...",
      "name": "Dr. Rohan Sharma",
      "specialty": "Orthopedist",
      "qualification": "MBBS, MS (Orthopedics)",
      "experienceYears": 14,
      "workingHours": { "days": ["Mon", "Tue"], "start": "09:00", "end": "17:00" },
      "slotDurationMinutes": 30,
      "availableSlots": ["09:00", "09:30"],
      "isActive": true
    },
    "availableSlotCount": 8
  }
}
```

Error: `404` doctor မတွေ့တာ

---

## 7) GET `/doctors/:id/slots` — လွတ်တဲ့အချိန်တွေ

**Public**

```
GET /api/doctors/abc123/slots?date=2026-11-25
```

Success `200`:

```json
{
  "success": true,
  "data": {
    "date": "2026-11-25",
    "booked": ["09:00", "10:30"],
    "available": ["09:30", "10:00", "11:00", "14:00"]
  }
}
```

**ဘယ်လို တွက်လဲ:** doctor ရဲ့ `availableSlots` ထဲကနေ အဲဒီရက်မှာ ယူထားပြီးသား (`pending`, `confirmed`, `completed`) အချိန်တွေကို ဖယ်လိုက်တာပါ။ `cancelled` ကျတော့ slot ပြန်လွတ်သွားပါတယ်။

Error: `400` date မမှန်တာ, `404` doctor မတွေ့တာ

---

## 8) POST `/doctors` — Doctor အသစ်ထည့်

**Admin**

Request:

```json
{
  "name": "Dr. Test Doctor",
  "specialty": "General Physician",
  "qualification": "MBBS",
  "experienceYears": 5,
  "workingHours": { "days": ["Mon", "Tue", "Wed"], "start": "09:00", "end": "17:00" },
  "slotDurationMinutes": 30,
  "availableSlots": ["09:00", "09:30", "10:00"],
  "isActive": true
}
```

> `workingHours.days` က **`Mon`, `Tue`...** လို အတိုကောက်ပဲ လက်ခံပါတယ် (`Monday` ဆိုရင် 400 ပြပါတယ်)။

Success `201`: `{ "success": true, "data": { "doctor": { } } }`

Error: `400` validation, `401` token မရှိ, `403` patient ဖြစ်နေတာ

---

## 9) PUT `/doctors/:id` — Doctor ပြင်

**Admin**

ပြင်ချင်တဲ့ field ပဲ ပို့လို့ရပါတယ်:

```json
{ "experienceYears": 6, "workingHours": { "end": "18:00" } }
```

Success `200`: ပြင်ပြီးသား `doctor` ပြန်ပါတယ်။

Error: `400`, `401`, `403`, `404`

---

## 10) DELETE `/doctors/:id` — Doctor ဖျက်

**Admin**

- ချိန်းမရှိသေးရင် → DB ကနေ အပြီးဖျက်ပါတယ်
- ချိန်းရှိပြီးဆိုရင် → `isActive = false` လုပ်ပြီး retire လုပ်ပါတယ် (data မပျောက်အောင်)

Success `200`:

```json
{ "success": true, "data": { "id": "...", "deleted": true, "softDeleted": false } }
```

Error: `401`, `403`, `404`

---

## 11) POST `/appointments` — ချိန်းဆို

**Patient**

Request:

```json
{
  "doctor": "abc123",
  "date": "2026-11-25",
  "time": "09:00",
  "reason": "Routine checkup"
}
```

Success `201`:

```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": { "appointment": { "_id": "...", "status": "pending" } }
}
```

Error:

| Code | အကြောင်းရင်း |
| --- | --- |
| `400` | date/time/reason မမှန်တာ |
| `404` | doctor မတွေ့တာ |
| `409` | **အချိန်ယူထားပြီးသား** — `"This appointment slot is already booked"` |

### Double-booking မဖြစ်အောင် ဘယ်လိုလုပ်ထားလဲ

1. Controller က အရင် ရှာတယ် — အဲဒီ doctor + date + time မှာ ချိန်းရှိပြီလား
2. ရှိပြီးဆိုရင် `409` ပြန်ပို့တယ်
3. မရှိရင် သိမ်းတယ်
4. Database မှာလည်း **partial unique index** ရှိတယ် — တပြိုင်တည်း request ၂ ခုရောက်ရင် နောက်တစ်ခုကို ငြင်းပေးတယ်

```js
// server/src/models/Appointment.js
{ doctor: 1, date: 1, time: 1 }
partialFilterExpression: { status: { $in: ['pending', 'confirmed', 'completed'] } }
```

---

## 12) GET `/appointments/my` — ကိုယ့်ချိန်းတွေ

**Patient**

Query: `?scope=upcoming|past|cancelled|all`

| Scope | ပြတာ |
| --- | --- |
| `upcoming` | မရောက်သေးတဲ့ ချိန်းတွေ |
| `past` | ပြီးခဲ့တဲ့ ချိန်းတွေ |
| `cancelled` | ဖျက်ထားတာတွေ |
| `all` | အားလုံး (default) |

Success `200`: `{ "success": true, "data": { "items": [], "page": 1, "pages": 1, "total": 3 } }`

---

## 13) GET `/appointments/:id` — ချိန်းတစ်ခု အသေးစိတ်

**Auth** (ချိန်းရဲ့ ပိုင်ရှင် သို့ admin ပဲ ကြည့်နိုင်)

Success `200`: `{ "success": true, "data": { "appointment": { } } }`

Error: `403` တခြားသူ့ချိန်း ကြည့်လို့ရင်း, `404` မတွေ့တာ

---

## 14) PATCH `/appointments/:id/cancel` — ချိန်းဖျက်

**Patient (ပိုင်ရှင်) သို့ Admin**

Request:

```json
{ "cancellationReason": "Cannot make it" }
```

Success `200`: status `cancelled` ဖြစ်သွားပြီး slot ပြန်လွတ်ပါတယ်။

Error: `400`, `403`, `404`, `409` (ဖျက်ပြီးသားကို ထပ်ဖျက်လို့ရင်း)

---

## 15) PATCH `/appointments/:id/reschedule` — ရက်ရွှေ့

**Patient (ပိုင်ရှင်)**

Request:

```json
{ "date": "2026-11-26", "time": "10:00" }
```

Success `200`: အသစ်ပြောင်းထားတဲ့ `appointment` ပြန်ပါတယ်။

Error:

| Code | အကြောင်းရင်း |
| --- | --- |
| `400` | date/time မမှန်တာ |
| `404` | ချိန်းမတွေ့တာ |
| `409` | အသစ်ရွေးထားတဲ့ slot ယူထားပြီးသား / ဖျက်ပြီးသား ချိန်းကို ရွှေ့လို့ရင်း |

---

## 16) GET `/admin/appointments` — ချိန်းအားလုံး + Filter

**Admin**

Query params:

| Param | ဥပမာ |
| --- | --- |
| `doctor` | doctor id |
| `patient` | patient id |
| `date` | `2026-11-25` |
| `status` | `pending` / `confirmed` / `cancelled` / `completed` |
| `page`, `limit` | pagination |

```
GET /api/admin/appointments?status=pending&date=2026-11-25&page=1&limit=20
```

Success `200`: `{ "success": true, "data": { "items": [], "page": 1, "pages": 1, "total": 2 } }`

Error: `401`, `403`

---

## 17) PATCH `/admin/appointments/:id/status` — Status ပြောင်း

**Admin**

Request:

```json
{ "status": "confirmed", "cancellationReason": "" }
```

လက်ခံတဲ့ status: `pending`, `confirmed`, `cancelled`, `completed`

Success `200`: status ပြောင်းပြီးသား `appointment` ပြန်ပါတယ်။

Error: `400` status မမှန်တာ, `401`, `403`, `404`

### Status flow

```text
pending ──confirm──► confirmed ──complete──► completed
   │                     │
   └──── cancel ─────────┴────► cancelled (slot ပြန်လွတ်)
```

---

## 18) GET `/admin/dashboard` — ဂဏန်းအကျဉ်း

**Admin**

Success `200`:

```json
{
  "success": true,
  "message": "Dashboard data retrieved",
  "data": {
    "users": 2,
    "patients": 1,
    "admins": 1,
    "doctors": { "total": 6, "active": 6, "inactive": 0 },
    "appointments": {
      "total": 8,
      "pending": 2,
      "confirmed": 2,
      "cancelled": 2,
      "completed": 2,
      "upcoming": 4,
      "activeStatuses": ["pending", "confirmed", "completed"]
    }
  }
}
```

Error: `401` token မရှိ, `403` patient ဖြစ်နေတာ

---

# 6. curl နမူနာတွေ

Terminal မှာ တိုက်ရိုက် စမ်းချင်ရင် ဒီတွေကို သုံးပါ။

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"patient@clinic.test\",\"password\":\"Patient@123\"}"
```

### Doctor စာရင်း

```bash
curl http://localhost:5000/api/doctors?specialty=Cardiologist
```

### Slot တွေ

```bash
curl "http://localhost:5000/api/doctors/DOCTOR_ID/slots?date=2026-11-25"
```

### ချိန်းဆို (token လို)

```bash
curl -X POST http://localhost:5000/api/appointments ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_TOKEN" ^
  -d "{\"doctor\":\"DOCTOR_ID\",\"date\":\"2026-11-25\",\"time\":\"09:00\",\"reason\":\"Routine checkup\"}"
```

### ချိန်းဖျက်

```bash
curl -X PATCH http://localhost:5000/api/appointments/APPOINTMENT_ID/cancel ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_TOKEN" ^
  -d "{\"cancellationReason\":\"Cannot make it\"}"
```

### ရက်ရွှေ့

```bash
curl -X PATCH http://localhost:5000/api/appointments/APPOINTMENT_ID/reschedule ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_TOKEN" ^
  -d "{\"date\":\"2026-11-26\",\"time\":\"10:00\"}"
```

### Admin ချိန်းစာရင်း (status filter)

```bash
curl "http://localhost:5000/api/admin/appointments?status=pending&page=1&limit=20" ^
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Admin status ပြောင်း

```bash
curl -X PATCH http://localhost:5000/api/admin/appointments/APPOINTMENT_ID/status ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer ADMIN_TOKEN" ^
  -d "{\"status\":\"confirmed\"}"
```

### Admin dashboard

```bash
curl http://localhost:5000/api/admin/dashboard -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 7. မှတ်ထားရမယ့် အချက်များ

1. **Password တွေကို bcrypt နဲ့ hash လုပ်ပြီး သိမ်းပါတယ်** — DB ထဲမှာ မူရင်း password မရှိပါဘူး
2. **JWT token က ၇ ရက်အထိ သုံးလို့ရပါတယ်** (`JWT_EXPIRES_IN=7d`)
3. **Doctor ဖျက်တဲ့အခါ** ချိန်းရှိနေရင် အပြီးမဖျက်ဘဲ `isActive=false` လုပ်ပါတယ်
4. **Slot တွေက doctor ရဲ့ `availableSlots` ထဲကပဲ လာပါတယ်** — admin က ပြင်နိုင်ပါတယ်
5. **Demo data ပဲ သုံးပါ** — တကယ့် လူနာအချက်အလက် မထည့်ပါနဲ့
