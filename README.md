# InternView

Website ulasan pengalaman magang untuk mahasiswa — platform tempat mahasiswa
dan alumni membagikan ulasan perusahaan, pengalaman magang, dan pengalaman
seleksi magang secara terstruktur dan terverifikasi.

> Skripsi — Universitas Bina Nusantara. Backend: Spring Boot · Frontend: React ·
> Database: PostgreSQL · Object storage: MinIO.

## Struktur

Monorepo berisi dua aplikasi:

```
internview/
├── api/    # Backend  — Spring Boot 3 (Java 21), PostgreSQL, MinIO, JWT auth
└── app/    # Frontend — React 19 + Vite 7 + Tailwind 4 + react-router 7
```

Masing-masing berdiri sendiri (punya `Dockerfile` / `package.json` sendiri).

## Fitur utama

- Ulasan perusahaan, pengalaman magang, dan pengalaman seleksi magang
- Pencarian & perbandingan perusahaan
- Formulir ulasan bertahap (rating, pengalaman, proses rekrutmen)
- Verifikasi sertifikat magang & pengajuan perusahaan baru oleh admin
- Autentikasi JWT (access + refresh) dan **reset kata sandi via email**
- Dashboard admin: verifikasi, master data, manajemen pengguna

## Menjalankan secara lokal

### 1. Backend (`api/`)

```bash
cd api
cp .env.example .env        # isi nilai sebenarnya
docker compose up -d        # Postgres + MinIO + API di :8888
```

Skema database dikelola manual — jalankan `api/prod-migration.sql` terhadap
database sebelum menjalankan API untuk pertama kali (aplikasi berjalan dengan
`ddl-auto=validate`, jadi tabel harus sudah ada).

Untuk menguji email reset kata sandi secara lokal, jalankan penampung SMTP
seperti [Mailpit](https://github.com/axllent/mailpit) di `:1025` dan biarkan
`MAIL_HOST`/`MAIL_PORT` pada nilai default.

### 2. Frontend (`app/`)

```bash
cd app
cp .env.example .env        # VITE_API_BASE_URL harus menunjuk ke API
pnpm install
pnpm dev                    # SPA di :5173
```

Port frontend harus tetap `5173` (atau tambahkan origin baru ke
`CORS_ALLOWED_ORIGINS` di API), karena cookie refresh dikirim dengan
`withCredentials` dan browser menegakkan kecocokan origin.

## Konfigurasi (env)

Lihat `api/.env.example` dan `app/.env.example` untuk daftar lengkap variabel.
File `.env` yang berisi rahasia **tidak** ikut ter-commit (di-`.gitignore`).

## Deploy

Setiap aplikasi punya alur build sendiri. Untuk backend, jalankan
`api/prod-migration.sql` pada database produksi **sebelum** men-deploy kode baru,
dan set variabel `MAIL_*` + `FRONTEND_URL` di lingkungan API.
