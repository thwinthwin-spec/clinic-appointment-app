# Beginner Guide — Clinic Appointment Website

ဒီ file က code ကို နားလည်လွယ်အောင် ရေးပေးထားတဲ့ လမ်းညွှန်းပါ။
English API docs အပြင် ဒီမှာ မြန်မာလို ရှင်းပြထားပါတယ်။

---

## 1. အကြီးစား ပုံရိပ် (Big picture)

```text
Browser (React website)          Server (Express API)           Database
-----------------------          --------------------           --------
Login page                →      /api/auth/login          →     users
Doctor list page          →      /api/doctors             →     doctors
Book appointment page     →      /api/appointments        →     appointments
Admin page                →      /api/admin/...           →     appointments
```

**အဓိက စည်းချက်:** Website က data ကို ကိုယ်တိုင် မသိမ်းပါဘူး။
API ကို တောင်းတယ်။ API က MongoDB ကို ဖတ်/ရေးပြီး ပြန်ပို့တယ်။

---

## 2. စဖတ်သင့်တဲ့ file ၅ ခု

အစဉ်လိုက် ဖတ်ကြည့်ပါ — ဒီ ၅ ခု နားလည်ရင် ကျန်တာ လိုက်နားလည်လွယ်ပါတယ်။

| အစဉ် | File | ဘာလုပ်တာလဲ |
| --- | --- | --- |
| 1 | `client/src/App.jsx` | ဘယ် page တွေ ရှိလဲ၊ ဘယ် URL မှာ ပြမလဲ ဆိုတာ သတ်မှတ်တယ် |
| 2 | `client/src/pages/LoginPage.jsx` | Form တစ်ခု ဘယ်လို ရေးလဲ၊ error ဘယ်လို ပြလဲ |
| 3 | `client/src/api/authApi.js` | Website က API ကို ဘယ်လို ခေါ်လဲ |
| 4 | `server/src/routes/auth.routes.js` | API က URL ကို ဘယ်လို လက်ခံလဲ |
| 5 | `server/src/controllers/auth.controller.js` | လက်ခံပြီးရင် ဘာလုပ်လဲ (check, save, reply) |

---

## 3. "Login" တစ်ခုတည်းကို ခြေရာခံကြည့်ပါ

### အဆင့် 1 — User က button နှိပ်တယ်

`LoginPage.jsx` ထဲမှာ `handleSubmit` ဆိုတဲ့ function ရှိပါတယ်။
Form submit ဖြစ်တိုင်း ဒီ function အလုပ်လုပ်တယ်။

```jsx
const result = await login(email, password);
```

`await` ဆိုတာ "API ပြန်မလာသေးရင် ဒီနေရာမှာ စောင့်နေပါ" လို့ ဆိုလိုတာပါ။

### အဆင့် 2 — Website က API ကို ခေါ်တယ်

`client/src/api/authApi.js`:

```js
const response = await api.post('/auth/login', { email, password });
return response.data;
```

`api` က `client/src/api/axios.js` ထဲမှာ ဖန်တီးထားတာပါ။
`baseURL` က `http://localhost:5000/api` ဖြစ်တော့
နောက်ဆုံး URL က **`http://localhost:5000/api/auth/login`** ဖြစ်သွားတယ်။

### အဆင့် 3 — Server က လက်ခံတယ်

`server/src/routes/auth.routes.js`:

```js
router.post('/login', login);
```

ဆိုလိုတာက — `/api/auth/login` ကို POST နဲ့ လာရင် `login` ဆိုတဲ့ function ကို ခေါ်ပါ။

### အဆင့် 4 — Controller က စစ်ဆေးတယ်

`server/src/controllers/auth.controller.js` ထဲမှာ:

1. email နဲ့ user ကို MongoDB ထဲ ရှာတယ်
2. မရှိရင် `401` error ပြန်ပို့တယ်
3. ရှိရင် password ကို bcrypt နဲ့ တိုက်စစ်တယ်
4. မှန်ရင် JWT token ထုတ်ပေးတယ်
5. `{ success: true, data: { token, user } }` ပြန်ပို့တယ်

### အဆင့် 5 — Website က token ကို သိမ်းတယ်

`AuthContext.jsx` က token ကို `localStorage` ထဲ ထည့်တယ်။
နောက်တစ်ခါ API ခေါ်တိုင်း အဲဒီ token ကို `Authorization: Bearer ...` header အနေနဲ့ ပါအောင် `axios.js` က လုပ်ပေးတယ်။

---

## 4. နားလည်ထားသင့်တဲ့ React အခြေခံ ၃ ခု

### `useState` — မှတ်ဉာဏ်

```jsx
const [email, setEmail] = useState('');
```

- `email` = လက်ရှိ တန်ဖိုး
- `setEmail` = တန်ဖိုး ပြောင်းချင်ရင် ခေါ်တဲ့ function
- `''` = ပထမဆုံး တန်ဖိုး (empty string)

### `useEffect` — တစ်ခုခု ဖြစ်ပြီးရင် လုပ်ရမယ့်အရာ

```jsx
useEffect(() => {
  loadDoctors();
}, [search]);
```

`search` ပြောင်းတိုင်း `loadDoctors()` ကို ပြန်ခေါ်ပါ လို့ ဆိုလိုတာပါ။

### `.map()` — စာရင်းကို JSX အဖြစ် ပြောင်းတာ

```jsx
doctors.map(doctor => <DoctorCard key={doctor._id} doctor={doctor} />)
```

doctor တစ်ယောက်ချင်းစီအတွက် `DoctorCard` တစ်ခု ဖန်တီးပေးတယ်။
`key` က React ကို ဘယ်အရာက အသစ်/အဟောင်း ဆိုတာ သိစေဖို့ပါ။

---

## 5. နားလည်ထားသင့်တဲ့ Node/Express အခြေခံ ၃ ခု

### Route — လမ်းကြောင်း

```js
router.get('/:id', getDoctorById);
```

`/api/doctors/abc123` လာရင် `getDoctorById` ကို ခေါ်တယ်။
`:id` ဆိုတာ ပြောင်းလဲနိုင်တဲ့ နေရာ (အဲဒီမှာ `abc123` ဖြစ်သွားတာ)။

### Controller — လုပ်ဆောင်ချက်

```js
async function getDoctorById(req, res, next) {
  try {
    const doctor = await Doctor.findById(req.params.id);
    res.json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
}
```

- `req` = ဝင်လာတဲ့ request (ဘာတောင်းလဲ)
- `res` = ပြန်ပို့မယ့် response
- `next` = error ရှိရင် error handler ဆီ ပို့ပေးတာ

### Model — MongoDB ရဲ့ ပုံစံ

```js
const appointmentSchema = new Schema({
  patient: ObjectId,
  doctor: ObjectId,
  date: String,
  time: String,
  status: String,
});
```

ဒီလို သတ်မှတ်ထားတော့ MongoDB ထဲမှာ appointments အတွက်
ဒီ field တွေပဲ ရှိအောင် စီမံပေးတယ်။

---

## 6. Double-booking ကို ဘယ်လို တားလဲ

ချိန်းဆိုမှု တစ်ခု ဖန်တီးတိုင်း:

1. Controller က အဲဒီ doctor + date + time မှာ ချိန်းရှိပြီလား ရှာတယ်
2. ရှိပြီးဆိုရင် `409` error ပြန်ပို့တယ် (`This appointment slot is already booked`)
3. မရှိရင် သိမ်းတယ်

ဒီနှစ်ခုအပြင် database မှာလည်း **partial unique index** တစ်ခု ထားထားတယ်။
တပြိုင်တည်း request ၂ ခု ရောက်လာရင်တောင် database က နောက်တစ်ခုကို ငြင်းပေးပါတယ်။
`cancelled` ဖြစ်သွားတဲ့ ချိန်းကတော့ slot ကို ပြန်လွှတ်ပေးပါတယ်။

---

## 7. ကိုယ်တိုင် စမ်းကြည့်နည်း

```bash
# 1. install
npm run install:all

# 2. demo data ထည့်
npm run seed

# 3. API ကို ဖွင့် (တစ် terminal)
npm run dev:server

# 4. website ကို ဖွင့် (နောက်တစ် terminal)
npm run dev:client
```

ပြီးရင် browser မှာ `http://localhost:5173` ဖွင့်ပါ။

```text
Patient : patient@clinic.test / Patient@123
Admin   : admin@clinic.test  / Admin@123
```

---

## 8. အမှားပြင်ရင် ဘယ်က စကြည့်မလဲ

| လက္ခဏာ | စစ်ရမယ့်နေရာ |
| --- | --- |
| Website မပွင့်ဘူး | terminal မှာ Vite error ရှိလား; `localhost:5173` မှန်လား |
| `Cannot reach the server` | API run နေလား; `http://localhost:5000/health` ဖွင့်ကြည့်ပါ |
| Login 401 ပြတယ် | email/password မှန်လား; seed လုပ်ထားလား |
| Slot မပြဘူး | doctor ရဲ့ `availableSlots` ရှိလား; date မှန်လား |
| 409 ပြတယ် | အဲဒီအချိန်က တခြားသူ ယူထားပြီးသားလို့ ဆိုလိုတာပါ |

---

အကျဉ်းပြောရရင် — **page → api file → route → controller → model → database** ဆိုတဲ့ လမ်းကြောင်းတစ်ခုတည်းကို မှတ်ထားရင် လုံလောက်ပါတယ် 🙏
