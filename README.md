# 🍽️ Restoran Kasir Backend API

Sistem manajemen restoran & kantin digital yang modern untuk **SMK Telkom Malang**. Backend API ini memudahkan pengelolaan menu, pesanan pelanggan, pembayaran digital, dan sistem kasir terintegrasi dengan teknologi terkini.

> Dibangun sebagai project ujian kenaikan level dengan stack **NestJS 11** + **TypeScript 5** + **Prisma 6** + **PostgreSQL**.

---

## 🚀 Tech Stack

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-20.x+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.x+-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x+-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)

[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![JWT](https://img.shields.io/badge/JWT-Auth-FF6B6B?style=for-the-badge&logo=json-web-tokens&logoColor=white)](https://jwt.io/)
[![Xendit](https://img.shields.io/badge/Xendit-Payment-FF6B35?style=for-the-badge&logo=stripe&logoColor=white)](https://xendit.co/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Storage-4A90E2?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)

</div>

### 📦 Dependencies Detail

| Layer        | Teknologi                                          |
| ------------ | -------------------------------------------------- |
| **Framework** | NestJS 11.x + TypeScript 5.x                      |
| **ORM**      | Prisma 6.x                                         |
| **Database** | PostgreSQL (Local / Railway)                       |
| **Auth**     | JWT + Passport + Bcrypt                            |
| **Validation** | Class-Validator + Class-Transformer            |
| **Upload**   | Cloudinary + Multer                                |
| **Payment**  | Xendit QRIS                                        |
| **API Docs** | Swagger / OpenAPI                                  |
| **Dev Tools** | ESLint + Prettier + Jest + Supertest             |

---

## ✨ Fitur Utama

- ✅ **Authentication** — Register & Login dengan JWT + Bcrypt password hashing
- ✅ **Menu Management** — CRUD menu dengan kategori (FOOD, DRINK, SNACK) dan upload gambar ke Cloudinary
- ✅ **Order Management** — Sistem pemesanan lengkap dengan tracking status real-time
- ✅ **Payment QRIS** — Integrasi Xendit untuk pembayaran QRIS Dynamic online
- ✅ **Order Status Flow** — PENDING → PAID → PREPARING → READY → COMPLETED atau CANCELLED
- ✅ **Admin Dashboard** — Endpoint khusus admin untuk mengelola menu dan order
- ✅ **Webhook Handling** — Callback otomatis dari Xendit untuk notifikasi pembayaran
- ✅ **Stock Management** — Manajemen stok menu real-time
- ✅ **API Documentation** — Swagger UI interaktif di `/api/docs`
- ✅ **Global Validation** — DTO validation dengan class-validator di semua endpoint

---

## 📦 Instalasi & Setup

### Prerequisites

Pastikan Anda memiliki:
- **Node.js** versi 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 12+ (atau pakai [Railway](https://railway.app/))
- **Git** untuk clone repository
- Akun **[Cloudinary](https://cloudinary.com/)** untuk upload gambar (gratis 10GB/bulan)
- Akun **[Xendit](https://xendit.co/)** untuk pembayaran QRIS (opsional, bisa pakai Cash dulu)

### Quick Start

```bash
# 1. Clone repository
git clone https://github.com/username/restoran-kasir-backend.git
cd restoran-kasir-backend

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env dan isi konfigurasi database, JWT secret, API keys

# 4. Generate Prisma Client
npx prisma generate

# 5. Jalankan migration database
npx prisma migrate dev --name init

# 6. Jalankan development server
npm run start:dev
```

Aplikasi akan berjalan di: **`http://localhost:3001`**  
Swagger Docs: **`http://localhost:3001/api/docs`**

---

## ⚙️ Konfigurasi Environment Variables

Salin `.env.example` dan sesuaikan nilai berikut di file `.env`:

```env
# 🔧 Server Configuration
PORT=3001
NODE_ENV=development

# 🗄️ Database PostgreSQL
DATABASE_URL=postgresql://postgres:password@localhost:5432/db_menu_ukl

# 🔐 JWT Authentication (minimal 32 karakter)
JWT_SECRET=your_super_secret_jwt_key_min_32_chars_here
JWT_EXPIRES_IN=1d

# 🖼️ Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# 💳 Xendit Payment Gateway
XENDIT_SECRET_KEY=xnd_development_xxxxxxxxxxxx
XENDIT_CALLBACK_TOKEN=your_webhook_token_for_security
```

> ⚠️ **Jangan commit `.env` ke Git!** Gunakan `.env.example` sebagai template.

---

## 📡 API Endpoints

Base URL: `/api`  
Full API documentation tersedia di: **[`/api/docs`](http://localhost:3001/api/docs)**

<details open>
<summary><strong>🔐 Authentication</strong></summary>

| Method | Endpoint            | Akses   | Deskripsi                  |
| ------ | ------------------- | ------- | -------------------------- |
| POST   | `/auth/register`    | Public  | Daftar akun admin baru     |
| POST   | `/auth/login`       | Public  | Login & dapatkan JWT token |

</details>

<details open>
<summary><strong>🍽️ Menu Management</strong></summary>

| Method | Endpoint                | Akses | Deskripsi                                   |
| ------ | ----------------------- | ----- | ------------------------------------------- |
| GET    | `/menu`                 | Publik | List semua menu (filter by `availableOnly`) |
| POST   | `/menu`                 | Admin | Buat menu baru + upload gambar              |
| PATCH  | `/menu/:id`             | Admin | Update menu & gambar                        |
| GET    | `/menu/:id`             | Publik | Detail menu single                          |

</details>

<details open>
<summary><strong>🛒 Order Management</strong></summary>

| Method | Endpoint               | Akses | Deskripsi                                |
| ------ | ---------------------- | ----- | ---------------------------------------- |
| POST   | `/orders`              | Publik | Buat order baru                         |
| GET    | `/orders`              | Admin | List semua order (filter by `status`)   |
| GET    | `/orders/:id`          | Admin | Detail order lengkap dengan items       |
| PATCH  | `/orders/:id`          | Admin | Edit order (tambah/kurang item)         |
| PATCH  | `/orders/:id/status`   | Admin | Ubah status order (PAID, CANCELLED, dll) |

</details>

<details open>
<summary><strong>💳 Payment & Webhooks</strong></summary>

| Method | Endpoint                | Akses    | Deskripsi                                  |
| ------ | ----------------------- | -------- | ------------------------------------------ |
| POST   | `/api/payment/checkout` | Publik   | Buat link pembayaran Xendit QRIS           |
| POST   | `/api/payment/webhook`  | Internal | Webhook callback dari Xendit (auto-update) |

</details>

---

## 🔄 Order Status Flow

```
┌─────────────────────────────────────────────────────────┐
│              ORDER LIFECYCLE DIAGRAM                    │
└─────────────────────────────────────────────────────────┘

              [CREATE ORDER]
                    │
                    ▼
              ┌──────────┐
              │ PENDING  │ (menunggu pembayaran)
              └────┬─────┘
                   │
           ┌───────┴───────┐
           │               │
           ▼               ▼
      [CASH]          [ONLINE QRIS]
           │               │
           │           [Xendit Process]
           │               │
           │               ▼
           │         ┌──────────────┐
           │         │ Webhook PAID │
           │         └───────┬──────┘
           │                 │
           └────────┬────────┘
                    │
                    ▼
              ┌──────────┐
              │ PAID     │ (siap diproses)
              └────┬─────┘
                   │
                   ▼
           ┌─────────────────┐
           │ PREPARING       │ (sedang dibuat)
           └────┬────────────┘
                │
                ▼
           ┌──────────┐
           │ READY    │ (siap diambil)
           └────┬─────┘
                │
                ▼
        ┌──────────────┐
        │ COMPLETED    │ (selesai)
        └──────────────┘

CANCELLED PATH:
    PENDING ──→ CANCELLED (customer batal / timeout)
    PENDING ──→ CANCELLED (Xendit EXPIRED)
```

---

## 🗃️ Database Schema

```
┌─────────────────────────────────────────────────────────┐
│            DATABASE RELATIONSHIP DIAGRAM                │
└─────────────────────────────────────────────────────────┘

                    ┌──────────┐
                    │  User    │
                    │ (ADMIN)  │
                    └────┬─────┘
                         │
                         │ creates
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   ┌─────────┐      ┌──────────┐    ┌─────────┐
   │ MenuItem │ ◄───┤  Order   ├───►│OrderItem│
   │          │     │          │    │         │
   │ - name   │     │ - id     │    │- qty    │
   │ - price  │     │ - status │    │- price  │
   │ - stock  │     │ - total  │    │- notes  │
   │ - image  │     │ - payment│    └─────────┘
   └──────────┘     └──────────┘


ENUM VALUES:
  Role:          ADMIN
  MenuCategory:  FOOD, DRINK, SNACK
  OrderStatus:   PENDING, PAID, PREPARING, READY, COMPLETED, CANCELLED
  PaymentMethod: CASH, ONLINE
```

---

## 📁 Struktur Project

```
backend/
│
├── src/
│   ├── auth/                    # Authentication & JWT
│   │   ├── auth.controller.ts   # Register, Login endpoints
│   │   ├── auth.service.ts      # Auth logic & password hashing
│   │   ├── jwt.strategy.ts      # Passport JWT strategy
│   │   └── dto/
│   │       ├── register.dto.ts
│   │       └── login.dto.ts
│   │
│   ├── menu/                    # Menu Management
│   │   ├── menu.controller.ts   # CRUD menu endpoints
│   │   ├── menu.service.ts      # Menu business logic
│   │   ├── menu.module.ts
│   │   └── dto/
│   │       ├── create-menu.dto.ts
│   │       └── update-menu.dto.ts
│   │
│   ├── orders/                  # Order Management
│   │   ├── orders.controller.ts # Order endpoints & status flow
│   │   ├── orders.service.ts    # Order business logic
│   │   ├── orders.module.ts
│   │   └── dto/
│   │       ├── create-order.dto.ts
│   │       └── update-order.dto.ts
│   │
│   ├── xendit/                  # Payment Integration
│   │   ├── xendit.controller.ts # Payment & webhook endpoints
│   │   ├── xendit.service.ts    # Xendit API calls
│   │   ├── xendit.module.ts
│   │   └── dto/
│   │       ├── create-xendit.dto.ts
│   │       └── xendit-webhook.dto.ts
│   │
│   ├── cloudinary/              # Image Upload
│   │   ├── cloudinary.controller.ts
│   │   ├── cloudinary.service.ts
│   │   ├── cloudinary.provider.ts
│   │   └── cloudinary.module.ts
│   │
│   ├── prisma/                  # Database ORM
│   │   ├── prisma.service.ts    # PrismaClient wrapper
│   │   ├── prisma.module.ts
│   │   └── schema.prisma        # Database schema
│   │
│   ├── app.controller.ts        # Root controller
│   ├── app.service.ts           # Root service
│   ├── app.module.ts            # Main app module
│   └── main.ts                  # Bootstrap & Swagger setup
│
├── prisma/
│   ├── schema.prisma            # Database models & migrations
│   └── migrations/              # Migration history
│
├── test/                        # Integration & E2E tests
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── package.json
├── tsconfig.json
├── nest-cli.json
├── .env.example                 # Environment variables template
└── README.md                    # Documentation (file ini)
```

---

## 🔐 Keamanan & Autentikasi

### JWT Strategy

- **Algorithm:** HS256
- **Payload:** `{ id, username, role }`
- **Header:** `Authorization: Bearer <token>`
- **Ekspirasi:** Default 1 hari (bisa disesuaikan di `.env`)

### Password Hashing

- Menggunakan **Bcrypt** dengan salt rounds = 10
- Tidak pernah menyimpan plain password di database

### CORS Configuration

```javascript
app.enableCors({
  origin: '*',  // Dapat disesuaikan untuk production
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type, Accept, Authorization',
  credentials: true,
});
```

---

## 📊 Contoh Request & Response

### Register Admin

```bash
POST /auth/register
Content-Type: application/json

{
  "namaRestoran": "Restoran Kami",
  "username": "admin",
  "phone": "081234567890",
  "password": "AdminPassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Akun berhasil dibuat!",
  "data": {
    "id": 1,
    "namaRestoran": "Restoran Kami",
    "username": "admin",
    "phone": "081234567890",
    "role": "ADMIN",
    "createdAt": "2025-06-03T10:30:00Z",
    "updatedAt": "2025-06-03T10:30:00Z"
  }
}
```

### Create Order

```bash
POST /orders
Content-Type: application/json

{
  "customerName": "Budi",
  "tableNumber": "5",
  "paymentMethod": "ONLINE",
  "items": [
    { "menuItemId": 1, "quantity": 2, "notes": "Pedas" },
    { "menuItemId": 3, "quantity": 1, "notes": "" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Pesanan berhasil dibuat!",
  "data": {
    "id": 42,
    "customerName": "Budi",
    "tableNumber": "5",
    "status": "PENDING",
    "paymentMethod": "ONLINE",
    "subtotal": 75000,
    "tax": 7500,
    "total": 82500,
    "createdAt": "2025-06-03T11:00:00Z",
    "items": [...]
  }
}
```

---

## 📚 npm Scripts

```bash
# 🚀 Development & Running
npm run start               # Start server (production mode)
npm run start:dev          # Start dengan auto-reload (hot reload)
npm run start:debug        # Debug mode dengan inspector

# 🏗️ Build & Compilation
npm run build              # Compile TypeScript ke JavaScript

# 📝 Code Quality
npm run lint               # ESLint check & auto-fix
npm run format             # Prettier format code

# 🧪 Testing
npm run test               # Run unit tests (Jest)
npm run test:watch        # Watch mode untuk development
npm run test:cov          # Test coverage report
npm run test:e2e          # Run end-to-end tests

# 💾 Database
npx prisma generate       # Generate Prisma Client
npx prisma migrate dev    # Create & apply migration (dev)
npx prisma migrate deploy # Apply migration (production)
npx prisma studio        # GUI untuk view/edit database
```

---

## 🚀 Deployment

### Production Build

```bash
# 1. Build aplikasi
npm run build

# 2. Jalankan di production
npm run start:prod

# Server akan listen pada PORT yang ditentukan di .env
```

### Railway Deployment

Jika menggunakan [Railway](https://railway.app/):

1. Push code ke GitHub
2. Connect repository ke Railway
3. Set environment variables di Railway dashboard
4. Railway otomatis akan:
   - Install dependencies
   - Run build
   - Run migrations
   - Start server

**Build Command (Railway):**
```bash
npm install && npx prisma generate && npx prisma migrate deploy && npm run build
```

**Start Command (Railway):**
```bash
npm run start:prod
```

---

## ⚠️ Known Issues & Risks

| Masalah                | Dampak               | Solusi / Mitigasi                  |
| ---------------------- | -------------------- | ---------------------------------- |
| **No Unit Tests**      | Quality assurance    | Perlu ditambah sebelum production  |
| **No E2E Tests**       | Integration bugs     | Jalankan manual testing atau Jest  |
| **Single DB Instance** | No data redundancy   | Setup read-replica / backup rutin  |
| **Xendit Sandbox**     | Testing only         | Upgrade ke production key saat live|
| **CORS Permissive**    | Security risk        | Set `origin` ke domain spesifik    |

---

## 🔮 Roadmap

- [ ] Unit tests untuk semua service & controller
- [ ] E2E tests dengan Supertest
- [ ] Pagination endpoints (GET `/orders?page=1&limit=10`)
- [ ] Rate limiting dengan `@nestjs/throttler`
- [ ] Email notifications dengan Resend atau Nodemailer
- [ ] Dashboard analytics (total sales, top menu, dll)
- [ ] Staging environment (Railway preview deployments)
- [ ] Customer profile & loyalty points
- [ ] WhatsApp notifications (Fonnte/WA Gateway)
- [x] ~~Basic CRUD menu & order~~
- [x] ~~JWT authentication~~
- [x] ~~Xendit QRIS integration~~
- [x] ~~Cloudinary image upload~~
- [x] ~~Swagger documentation~~

---

## 📄 License

**UNLICENSED** — Private project untuk SMK Telkom Malang. Unauthorized copying or distribution is prohibited.

---

## 👨‍💼 Kontribusi & Support

Untuk bug reports, feature requests, atau pertanyaan:
- 📧 Email: admin@restoran-kasir.local
- 📱 WhatsApp: +62-812-3456-7890
- 💬 Discord: [Invite Link]

---

<div align="center">

**Made with ❤️ for SMK Telkom Malang**

[![NestJS](https://img.shields.io/badge/Powered%20by-NestJS-E0234E?style=flat-square)](https://nestjs.com)
[![TypeScript](https://img.shields.io/badge/Built%20with-TypeScript-3178C6?style=flat-square)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Database-Prisma-2D3748?style=flat-square)](https://www.prisma.io/)

</div>
