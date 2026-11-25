# Clinic Appointment Website

Browser မှာ သုံးရတဲ့ **Clinic Appointment Booking Website** တစ်ခုပါ။
Patient နဲ့ Admin အတွက် page တွေ ပါတယ်။ ဖုန်း app မဟုတ်ပါဘူး။

```text
React website (client/)  →  Express API (server/)  →  MongoDB
```

> ⚠️ ဒီ project က **demo/sample data** ပဲ သုံးပါတယ်။ တကယ့် လူနာရဲ့ ကျန်းမာရေး အချက်အလက် မထည့်ပါနဲ့။

---

## 1. ပါဝင်တဲ့ အဓိက အရာတွေ

### Patient

- Register / Login
- Doctor ကို နာမည် သို့မဟုတ် specialty နဲ့ ရှာပါ
- Doctor profile, working hours, လွတ်တဲ့ slot တွေ ကြည့်ပါ
- ရက်နဲ့ အချိန်ရွေးပြီး ချိန်းဆိုပါ
- Upcoming / Past / Cancelled ချိန်းတွေ ကြည့်ပါ
- ချိန်း ဖျက်ရန် / ရက်ရွှေ့ရန်
- ကိုယ့် profile အချက်အလက် ပြင်ရန်

### Admin

- Protected admin login
- Doctor ထည့် / ပြင် / ဖျက် (specialty, working hours, slots)
- ချိန်းဆိုမှုတွေ ကြည့် / confirm / cancel / complete
- Doctor, patient, date, status အလိုက် ရှာနဲ့ filter
- Dashboard မှာ အရေအတွက် ဂဏန်းတွေ

---

## 2. Tech stack

| ပိုင်း | သုံးထားတာ |
| --- | --- |
| Website | React 18, React Router v6, Axios, Vite, plain CSS |
| API | Node.js, Express, express-validator |
| Database | MongoDB + Mongoose |
| Auth | bcryptjs (password hash), JWT + role guard |
| Config | dotenv (`.env`) |

---

## 3. Folder အကျဉ်း

```text
clinic-appointment-app/
├── client/     ← React website
├── server/     ← Express API + MongoDB code
├── README.md              ဒီ file
├── API_DOCUMENTATION.md   endpoint အကုန်ရဲ့ အသေးစိတ်
├── PROJECT_STRUCTURE.md   ဘယ် file က ဘာလုပ်လဲ
└── BEGINNER_GUIDE.md      code နားလည်လွယ်အောင် လမ်းညွှန်း
```

အသေးစိတ် tree ကို `PROJECT_STRUCTURE.md` မှာ ကြည့်ပါ။

---

## 4. လိုအပ်တာတွေ (Prerequisites)

- Node.js 18+ (npm ပါရမယ်)
- MongoDB ကိုယ်တိုင် run ထားရမယ် (သို့မဟုတ် MongoDB Atlas connection string)
  - Local ဆိုရင် `mongodb://127.0.0.1:27017/clinic_appointment`

`node -v` နဲ့ `npm -v` ကို terminal မှာ စစ်လို့ရပါတယ်။

---

## 5. Install လုပ်နည်း

Project root မှာ:

```bash
npm run install:all
```

ဒါက `server` နဲ့ `client` နှစ်ခုလုံးကို `npm install` လုပ်ပေးပါတယ်။

---

## 6. Environment variables (`.env`)

### Server

```bash
copy server\.env.example server\.env
```

ပြီးရင် `server/.env` ကို ဖွင့်ပြီး လိုအပ်ရင် ပြင်ပါ။

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

> `JWT_SECRET` ကို တကယ့် project မှာ ရှည်လျားပြီး ရနိုင်တဲ့ စာသားနဲ့ ပြောင်းပါ။
> `.env` ကို GitHub မှာ မတင်ပါနဲ့ — `.gitignore` က ဖယ်ထားပြီးသားပါ။

### Client

```bash
copy client\.env.example client\.env
```

```env
VITE_API_URL=http://localhost:5000/api
```

API က အခြား port မှာ ဖွင့်ထားရင် ဒီမှာ ပြောင်းပါ။

---

## 7. Demo data ထည့်ရန်

```bash
npm run seed
```

ဒါက ထည့်ပေးတာ —

- Admin ၁ ယောက် + Patient ၁ ယောက်
- Doctor ၆ ယောက်
- ချိန်းဆိုမှု ၈ ခု (upcoming / past / cancelled ပါ)

**၂ ခါ လုပ်ရင်လည်း ထပ်မထည့်ပါဘူး** (idempotent)။

---

## 8. Run လုပ်နည်း

**Terminal ၁ — API**

```bash
npm run dev:server
```

ပြီးရင် `http://localhost:5000/health` ကို browser မှာ ဖွင့်ကြည့်ပါ။
`{ "success": true, ... }` ပြရင် အဆင်ပြေပါတယ်။

**Terminal ၂ — Website**

```bash
npm run dev:client
```

ပြီးရင် ဒီမှာ ဖွင့်ပါ —

```text
http://localhost:5173
```

---

## 9. Demo login

```text
Patient : patient@clinic.test / Patient@123
Admin   : admin@clinic.test  / Admin@123
```

Login page မှာ **Use** ခလုတ်နှိပ်ပြီး အလိုအလျောက် ဖြည့်လို့လည်း ရပါတယ်။

---

## 10. အဖြစ်များတဲ့ ပြဿနာတွေ

| ပြဿနာ | ဖြေရှင်းနည်း |
| --- | --- |
| `Cannot reach the server` | API run နေလား စစ်ပါ (`npm run dev:server`), ပြီးရင် `/health` ဖွင့်ကြည့်ပါ |
| Website မပွင့်ဘူး | `http://localhost:5173` မှန်လား; terminal မှာ error ရှိလား |
| Login 401 ပြတယ် | `npm run seed` လုပ်ထားလား; email/password မှန်လား |
| `EADDRINUSE` | port 5000 သို့ 5173 ကို တခြား program သုံးနေတာပါ — အဲဒါကို ပိတ်ပါ သို့မဟုတ် `.env` ထဲက port ပြောင်းပါ |
| Slot 409 ပြတယ် | အဲဒီ doctor ရဲ့ အချိန်ကို တခြားသူ ယူထားပြီးသားလို့ ဆိုလိုတာပါ — အခြား slot ရွေးပါ |
| Doctor list မပြဘူး | seed ထည့်ထားလား; MongoDB run နေလား |

---

## 11. Zip file

```text
clinic-appointment-app.zip
```

ထဲမှာ source code အားလုံး ပါပါတယ်။ `node_modules`, `.env`, log တွေ **မပါပါဘူး**။
Zip ပြန်ထုတ်ချင်ရင်:

```powershell
.\make-zip.ps1
```

---

## 12. နောက်တစ်ဆင့်

- `BEGINNER_GUIDE.md` — request တစ်ခု ဘယ်လို စီးဆင်းလဲ ဆိုတာ ဥပမာနဲ့ ရှင်းပြထားတယ်
- `API_DOCUMENTATION.md` — endpoint ၁၈ ခုရဲ့ request/response နမူနာတွေ
- `PROJECT_STRUCTURE.md` — ဘယ် file က ဘာလုပ်လဲ
