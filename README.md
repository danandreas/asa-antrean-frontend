# ASA Antrean Online — Frontend

Frontend aplikasi antrean klinik berbasis Next.js (App Router), didesain mobile-first
seperti aplikasi native dengan bottom tab navigation.

## Fitur

- Login & Register (Sanctum token dari backend Laravel)
- Dashboard beda tampilan untuk role `admin` dan `user`
- Booking antrean (user) & panggil antrean berikutnya (admin)
- CRUD data poli (admin)
- Profil: ubah nama/email, ubah password, logout
- Toast notifikasi untuk setiap aksi create/update
- Loading shimmer di semua state loading data

## Menjalankan secara lokal

```bash
npm install
cp .env.example .env.local
# sesuaikan NEXT_PUBLIC_API_URL ke alamat backend Laravel kamu
npm run dev
```

Buka `http://localhost:3000`.

## Environment Variables

Lihat `.env.example`. Minimal yang wajib diisi:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Endpoint backend yang dibutuhkan

Frontend ini mengasumsikan backend Laravel sudah menyediakan:

- `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- `PUT /auth/profile` — update nama & email _(baru, lihat catatan di bawah)_
- `PUT /auth/password` — update password _(baru, lihat catatan di bawah)_
- `GET/POST/PUT/DELETE /clinics`
- `GET/POST /queue-tickets`, `GET /queue-tickets/my`, `POST /queue-tickets/call-next`,
  `PATCH /queue-tickets/{id}/status`
- `POST /device-tokens`, `DELETE /device-tokens`

> **Catatan**: endpoint `PUT /auth/profile` dan `PUT /auth/password` dipakai oleh
> halaman Profil tapi belum ada di backend Laravel yang sudah dibuat sebelumnya.
> Tambahkan dua method ini di `AuthController` — lihat kode yang diberikan di chat.

## Struktur folder penting

```
src/
  app/
    login/page.tsx
    register/page.tsx
    (app)/layout.tsx        <- shell dashboard + bottom nav (route protected)
    (app)/dashboard/page.tsx
    (app)/queue/page.tsx
    (app)/clinics/page.tsx
    (app)/profile/page.tsx
  components/
    BottomNav.tsx
    PageHeader.tsx
    StatusBadge.tsx
    TicketCard.tsx
    Shimmer.tsx
  lib/
    api.ts               <- axios instance + interceptor token
    auth-context.tsx      <- context login/register/logout
    types.ts
```

## Setup notifikasi real-time (Firebase Cloud Messaging)

1. Buka Firebase Console → project yang sama dengan backend Laravel kamu.
2. **Project Settings → General → Your apps** → tambah app **Web** (`</>`) kalau belum ada.
   Salin config yang muncul (`apiKey`, `authDomain`, `projectId`, dst) ke `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   ```
3. **Project Settings → Cloud Messaging → Web configuration → Web Push certificates**
   → klik **Generate key pair**. Salin ke:
   ```env
   NEXT_PUBLIC_FIREBASE_VAPID_KEY=...
   ```
4. Jalankan `npm run dev`, buka aplikasi di browser (harus HTTPS atau `localhost`),
   login, lalu browser akan menanyakan izin notifikasi. Setelah diizinkan, token
   perangkat otomatis terkirim ke backend lewat `POST /device-tokens`.
5. Saat admin memanggil antrean dan sisa `waiting` tinggal 1 untuk user tertentu,
   backend akan memicu push — muncul sebagai **toast yang tidak hilang otomatis**
   (harus ditutup manual) kalau tab sedang aktif, atau notifikasi sistem browser
   kalau tab di-background/tertutup.

> Kalau env Firebase belum diisi, aplikasi tetap berjalan normal — fitur FCM
> otomatis nonaktif tanpa error (lihat `isFirebaseConfigured()` di `src/lib/firebase.ts`).

## Deploy ke Vercel

1. Push repo ini ke GitHub.
2. Import project di Vercel.
3. Set environment variable `NEXT_PUBLIC_API_URL` dan semua `NEXT_PUBLIC_FIREBASE_*`
   ke value production kamu.
4. Deploy. Pastikan domain Vercel sudah HTTPS (otomatis) karena Web Push mewajibkan HTTPS.
