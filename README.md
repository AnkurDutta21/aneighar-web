# Anei Ghar — PG Rental Platform

A production-grade full-stack PG rental platform built with React, Node.js, and MongoDB.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite) + TypeScript + Tailwind CSS |
| State | Zustand + React Query |
| Forms | React Hook Form + Zod |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT (access + refresh tokens, httpOnly cookies) |
| Images | Cloudinary |
| Tests BE | Jest + Supertest + mongodb-memory-server |
| Tests FE | Vitest + React Testing Library + MSW |
| CI/CD | GitHub Actions |

## 📁 Project Structure

```
anei-ghar-web/
├── server/                 # Express API
│   ├── controllers/        # Route handlers (thin layer)
│   ├── services/           # Business logic
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routers
│   ├── middleware/         # Auth, upload, error handler
│   ├── utils/              # AppError, catchAsync, tokens
│   └── tests/              # Integration tests
│
├── client/                 # React (Vite) SPA
│   └── src/
│       ├── features/       # Feature-based modules
│       │   ├── auth/       # Auth types, hooks, components
│       │   ├── pg/         # PG types, hooks, components
│       │   └── inquiry/    # Inquiry components
│       ├── pages/          # Route-level pages
│       ├── stores/         # Zustand stores
│       ├── lib/api/        # Axios API modules
│       ├── layouts/        # Shared layout wrappers
│       ├── components/     # Shared UI components
│       └── test/           # Vitest + MSW setup
│
└── .github/workflows/      # GitHub Actions CI
```

## 🛠 Local Setup

### Prerequisites
- Node.js 20+
- MongoDB (Atlas URI or local)
- Cloudinary account

### Backend

```bash
cd server
cp .env.example .env   # Fill in your MONGO_URI, JWT secrets, Cloudinary keys
npm install
npm run dev            # Starts on http://localhost:5000
```

### Frontend

```bash
cd client
npm install
npm run dev            # Starts on http://localhost:5173
```

### Running Tests

```bash
# Backend
cd server && npm test

# Frontend
cd client && npx vitest run
```

## 🔑 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register user |
| POST | `/api/auth/login` | — | Login |
| POST | `/api/auth/refresh` | Cookie | Refresh token |
| POST | `/api/auth/logout` | ✅ | Logout |
| GET | `/api/auth/me` | ✅ | Get current user |
| GET | `/api/pg` | — | List PGs (filtered) |
| GET | `/api/pg/:id` | — | PG detail + view++ |
| POST | `/api/pg` | Owner | Create listing |
| PUT | `/api/pg/:id` | Owner | Update listing |
| DELETE | `/api/pg/:id` | Owner | Soft delete |
| POST | `/api/pg/:id/images` | Owner | Upload images |
| GET | `/api/pg/owner/my-listings` | Owner | Owner's listings |
| POST | `/api/inquiries` | Student | Send inquiry |
| GET | `/api/inquiries/owner` | Owner | Inbox |
| PATCH | `/api/inquiries/:id/status` | Owner | Update status |
| POST | `/api/saves/:pgId` | Student | Toggle save |
| GET | `/api/saves` | Student | Saved listings |
| GET | `/api/dashboard` | Owner | Analytics |

## 🎨 Design System

- **Primary Gradient**: `#1E90FF → #0B3D91`
- **Background**: `#0a0a0a`
- **Cards**: Glassmorphism with `rgba(17,24,39,0.7)` + blur
- **Font**: Inter
- **Spacing**: 4/8/12/16/24/32/48px
- **Radii**: Cards `rounded-2xl`, Buttons `rounded-xl`, Inputs `rounded-full`

## 📈 Roadmap (Phase 2)
- Real-time chat (Socket.io)
- Reviews & ratings
- Recommendation engine
- Admin panel
