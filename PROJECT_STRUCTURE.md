# Project Structure — Clinic Appointment Website

ဒီ project မှာ **အဓိက ၂ ပိုင်း** ရှိပါတယ်။

```text
client/  = Browser မှာ ပြတဲ့ React website
server/  = API ပေးတဲ့ Express + MongoDB server
```

Root ကျန်တဲ့ file တွေက docs နဲ့ zip လုပ်တဲ့ script ပါ။

---

## 1. Full folder tree (တကယ့် file အတိုင်း)

```text
clinic-appointment-app/
├── .gitignore
├── package.json                 _ root scripts (install:all, dev:server, dev:client...)
├── make-zip.ps1                 _ zip ထုတ်တဲ့ script
├── README.md                    _ စတင်ရန် လမ်းညွှန်း
├── API_DOCUMENTATION.md         _ endpoint အကုန်ရဲ့ အသေးစိတ်
├── PROJECT_STRUCTURE.md         _ ဒီ file
├── BEGINNER_GUIDE.md            _ code နားလည်လွယ်အောင် ရှင်းပြချက်
│
├── server/
│   ├── .env.example             _ လျှို့ဝှက်တန်ဖိုးတွေရဲ့ ပုံစံ (copy လုပ်ပြီးသုံး)
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md
│   └── src/
│       ├── server.js            _ server ကို ဖွင့်တဲ့နေရာ (port 5000)
│       ├── app.js               _ middleware တွေ တပ်ဆင်တဲ့နေရာ
│       ├── config/
│       │   ├── env.js           _ .env ထဲက တန်ဖိုးတွေ ဖတ်တယ်
│       │   └── db.js            _ MongoDB နဲ့ ချိတ်တယ်
│       ├── models/
│       │   ├── User.js          _ patient/admin အကောင့်
│       │   ├── Doctor.js        _ doctor profile
│       │   └── Appointment.js   _ ချိန်းဆိုမှု + double-booking index
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── doctor.controller.js
│       │   ├── doctor.write.controller.js     _ doctor ထည့်/ပြင်/ဖျက် အပိုင်း
│       │   ├── appointment.controller.js
│       │   ├── appointment.actions.controller.js _ cancel/reschedule အပိုင်း
│       │   └── admin.controller.js
│       ├── routes/
│       │   ├── index.js         _ /api အောက်ကို စုပေးတယ်
│       │   ├── auth.routes.js
│       │   ├── doctor.routes.js
│       │   ├── doctor.rules.js  _ doctor write validation စည်းမျဉ်း
│       │   ├── appointment.routes.js
│       │   └── admin.routes.js
│       ├── middleware/
│       │   ├── auth.js          _ token စစ်တယ်
│       │   ├── role.js          _ patient/admin ခွဲတယ်
│       │   ├── validate.js      _ express-validator error တွေ စစ်တယ်
│       │   ├── notFound.js      _ route မတွေ့ရင် 404
│       │   └── errorHandler.js  _ error အားလုံးကို JSON အဖြစ် ပြန်ပေးတယ်
│       ├── utils/
│       │   ├── generateToken.js _ JWT ထုတ်တယ်
│       │   ├── apiResponse.js   _ success/error response ပုံစံ
│       │   └── slots.js         _ အချိန် slot တွက်တဲ့ helper
│       └── seed/
│           ├── seedData.js      _ demo data ထည့်တဲ့ script
│           └── seedConstants.js _ demo doctor/appointment စာရင်း
│
└── client/
    ├── .env.example             _ VITE_API_URL ပုံစံ
    ├── package.json
    ├── package-lock.json
    ├── index.html
    ├── vite.config.js
    ├── README.md
    └── src/
        ├── main.jsx             _ React ကို browser မှာ တပ်ဆင်တယ်
        ├── App.jsx              _ route အားလုံး သတ်မှတ်တယ်
        ├── index.css            _ အားလုံးသုံးတဲ့ style
        ├── api/
        │   ├── axios.js         _ token ထည့်တယ်, error message ပြန်ယူတယ်
        │   ├── authApi.js       _ /auth/* ခေါ်တယ်
        │   ├── doctorApi.js     _ /doctors/* ခေါ်တယ်
        │   └── appointmentApi.js_ /appointments/*, /admin/* ခေါ်တယ်
        ├── context/
        │   └── AuthContext.jsx  _ login/logout အခြေအနေ သိမ်းတယ်
        ├── components/
        │   ├── Header.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── Loading.jsx
        │   ├── ErrorMessage.jsx
        │   ├── DoctorCard.jsx
        │   ├── AppointmentCard.jsx
        │   ├── SlotPicker.jsx
        │   ├── StatusBadge.jsx
        │   └── admin/
        │       ├── StatCard.jsx
        │       ├── AppointmentFilters.jsx
        │       ├── AppointmentTable.jsx
        │       ├── DoctorTable.jsx
        │       ├── DoctorFormFields.jsx
        │       └── DoctorFormModal.jsx
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── DoctorListPage.jsx
        │   ├── DoctorDetailPage.jsx
        │   ├── BookAppointmentPage.jsx
        │   ├── MyAppointmentsPage.jsx
        │   ├── ProfilePage.jsx
        │   ├── NotFoundPage.jsx
        │   └── admin/
        │       ├── AdminDashboardPage.jsx
        │       ├── AdminDoctorsPage.jsx
        │       └── AdminAppointmentsPage.jsx
        └── utils/
            ├── constants.js     _ specialties, demo account စာသားတွေ
            └── formatters.js    _ date/time/status ပြတဲ့ ပုံစံ
```

---

## 2. Root files

| File | ဘာလုပ်တာလဲ |
| --- | --- |
| `package.json` | `npm run install:all`, `npm run seed`, `npm run dev:server`, `npm run dev:client` စတာတွေ စုထားတယ် |
| `.gitignore` | `node_modules`, `.env`, `dist`, log တွေကို git ထဲ မပါအောင် ဖယ်တယ် |
| `make-zip.ps1` | source file တွေကိုပဲ zip လုပ်တယ် (secret တွေ မပါ) |
| `README.md` | install လုပ်နည်း, run နည်း, demo login |
| `API_DOCUMENTATION.md` | endpoint ၁၈ ခုရဲ့ request/response နမူနာ |
| `PROJECT_STRUCTURE.md` | ဒီ file — folder နဲ့ file ရဲ့ ရည်ရွယ်ချက် |
| `BEGINNER_GUIDE.md` | request တစ်ခု ဘယ်လို စီးဆင်းလဲဆိုတာ မြန်မာလို ရှင်းပြတယ် |

---

## 3. Backend (`server/`) — ဘယ်ကနေ စဖတ်မလဲ

| File | ရည်ရွယ်ချက် |
| --- | --- |
| `src/server.js` | `.env` ဖတ်ပြီး DB ချိတ်ပြီး port 5000 မှာ နားထောင်တယ် |
| `src/app.js` | CORS, JSON parse, `/health`, `/api` routes, error handler တွေ တပ်တယ် |
| `src/config/env.js` | `PORT`, `MONGODB_URI`, `JWT_SECRET` စတာတွေ ဖတ်တယ် |
| `src/config/db.js` | `mongoose.connect()` လုပ်တယ် |
| `src/models/*.js` | MongoDB collection ရဲ့ field ပုံစံ သတ်မှတ်တယ် |
| `src/routes/*.js` | URL ကို controller function နဲ့ တွဲပေးတယ် |
| `src/controllers/*.js` | လုပ်ငန်းခွဲခြမ်းစိတ်ဖြာတယ် (ရှာတယ်, စစ်တယ်, သိမ်းတယ်, ပြန်ပို့တယ်) |
| `src/middleware/*.js` | token စစ်တာ, role စစ်တာ, validation error စစ်တာ |
| `src/utils/*.js` | JWT, response ပုံစံ, slot တွက်တာ |
| `src/seed/seedData.js` | demo data ထည့်တယ် (၂ ခါ လုပ်ရင် ထပ်မထည့်ဘူး) |

**စဖတ်ရန် အကြံပြုချက်:** `server.js` → `app.js` → `routes/auth.routes.js` → `controllers/auth.controller.js` → `models/User.js`

---

## 4. Frontend (`client/`) — ဘယ်ကနေ စဖတ်မလဲ

| File / folder | ရည်ရွယ်ချက် |
| --- | --- |
| `src/main.jsx` | `<App />` ကို browser ထဲ တပ်တယ် |
| `src/App.jsx` | URL တစ်ခုချင်းစီမှာ ဘယ် page ပြမလဲ ဆိုတာ သတ်မှတ်တယ် |
| `src/api/*.js` | API ကို ခေါ်တဲ့ function တွေ (page တွေက ဒီကိုပဲ သုံးတယ်) |
| `src/context/AuthContext.jsx` | token/user ကို localStorage ထဲ သိမ်းပြီး login အခြေအနေ ပြတယ် |
| `src/components/*.jsx` | header, card, slot picker စတာတွေ ပြန်သုံးလို့ရတဲ့ အစိတ်အပိုင်းတွေ |
| `src/components/admin/*.jsx` | admin page ကြီးတွေကို အသေးခွဲထားတာ (form, table, filter) |
| `src/pages/*.jsx` | patient နဲ့ login/register page တွေ |
| `src/pages/admin/*.jsx` | admin dashboard / doctors / appointments page တွေ |
| `src/utils/*.js` | date format, constant စာသားတွေ |
| `src/index.css` | responsive style အားလုံး |

**စဖတ်ရန် အကြံပြုချက်:** `App.jsx` → `pages/LoginPage.jsx` → `api/authApi.js` → `api/axios.js` → `context/AuthContext.jsx`

---

## 5. Data စီးဆင်းပုံ (အကျဉ်း)

```text
User click
  → page (useState / handleSubmit)
  → api/*.js (axios request + token)
  → server/src/routes/*.js
  → server/src/controllers/*.js
  → server/src/models/*.js (Mongoose)
  → MongoDB
  → ပြန်လမ်းအတိုင်း JSON ပြန်လာ
  → page က loading/error/data ပြတယ်
```

အသေးစိတ် ဥပမာကို `BEGINNER_GUIDE.md` မှာ ကြည့်ပါ။
