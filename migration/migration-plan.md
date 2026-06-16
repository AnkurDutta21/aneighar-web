# Anei Ghar — React Native Migration Plan

## Project Overview

**App**: Anei Ghar — India's student PG rental platform  
**Source**: React + Vite + TypeScript web app (`/client`)  
**Target**: React Native + Expo app (`/app`)  
**Backend**: Node.js + Express + MongoDB (`/server`)  
**Backend URL**: `https://api-ghar.aniecorp.in`

---

## Tech Stack Decision

| Concern | Web (current) | Mobile (target) |
|---|---|---|
| Framework | React + Vite | React Native + Expo (SDK 52+) |
| Language | TypeScript | TypeScript |
| Routing | React Router v7 | React Navigation v7 |
| State | Zustand v5 | Zustand v5 (same) |
| Data fetching | TanStack Query v5 | TanStack Query v5 (same) |
| HTTP | Axios | Axios |
| Auth storage | localStorage (Zustand persist) | MMKV via zustand-mmkv |
| Styling | TailwindCSS v4 + Radix UI | NativeWind v4 + custom RN components |
| Forms | React Hook Form + Zod | React Hook Form + Zod (same) |
| Phone auth | Firebase Web SDK | `@react-native-firebase/auth` |
| Image upload | FormData + Cloudinary | `expo-image-picker` + FormData |
| Icons | Lucide React | `@expo/vector-icons` (MaterialIcons / Feather) |
| Storage | Zustand persist (localStorage) | MMKV + Zustand persist (MMKV adapter) |

---

## Phases

### Phase 1 — Analysis & Documentation ✅ IN PROGRESS
- [x] Scan web app architecture
- [x] Scan backend API routes
- [x] Identify all pages, components, hooks, stores
- [x] Document auth flow
- [x] Generate migration-plan.md
- [x] Generate architecture-notes.md
- [x] Generate parity-checklist.md

### Phase 2 — RN Project Setup
- [ ] Initialize Expo project in `/app` directory
- [ ] Configure TypeScript strict mode
- [ ] Set up folder structure (mirrors web structure)
- [ ] Configure NativeWind
- [ ] Set up React Navigation (Stack + Tab navigators)
- [ ] Configure Zustand + MMKV
- [ ] Configure TanStack Query
- [ ] Set up Axios client with interceptors
- [ ] Configure environment variables (expo-constants / app.config.ts)
- [ ] Set up absolute imports / path aliases

### Phase 3 — Shared API Layer
- [ ] Port `apiClient.ts` → Axios instance with JWT + refresh token
- [ ] Port `api/auth.ts` → identical functions
- [ ] Port `api/pg.ts` → identical functions
- [ ] Port `api/inquiry.ts` → identical functions (savesApi, dashboardApi included)

### Phase 4 — Authentication
- [ ] Port `authStore.ts` → Zustand + MMKV persist
- [ ] Port `useAuth.ts` hooks
- [ ] Login screen (email + password)
- [ ] Register screen (name, email, password, role)
- [ ] Phone login screen (Firebase OTP)
- [ ] Reset password screen (email → token → new password)
- [ ] Onboarding screen (name / role / phone — post-registration)
- [ ] Auth guard (protected route equivalent in RN Navigation)
- [ ] Auto-refresh token on 401

### Phase 5 — Core Screens
- [ ] Home screen (hero, city search, features, CTA)
- [ ] PG List screen (filters, paginated list)
- [ ] PG Detail screen (gallery, amenities, inquiry form)
- [ ] Dashboard screen (stats cards, recent listings, recent inquiries)

### Phase 6 — Remaining Features
- [ ] My Listings screen (owner)
- [ ] Create / Edit PG form (multi-step, image upload)
- [ ] Inquiries screen (owner + student views)
- [ ] Saved Listings screen (student)
- [ ] Sidebar / Tab navigation (role-based nav items)

### Phase 7 — Performance & Polish
- [ ] Image lazy loading + caching
- [ ] List virtualization (FlashList)
- [ ] Offline state handling
- [ ] Error boundaries
- [ ] Skeleton loaders
- [ ] Pull-to-refresh

### Phase 8 — QA & Parity Verification
- [ ] Verify all parity-checklist items
- [ ] Manual QA on Android
- [ ] Manual QA on iOS (if available)
- [ ] Fix regressions
- [ ] Final commit + tagging

---

## Key Constraints & Decisions

1. **Firebase Phone Auth**: Web SDK uses `RecaptchaVerifier`. RN uses `@react-native-firebase/auth` with automatic reCAPTCHA. Must use native Firebase module.
2. **Cookie-based refresh token**: Server sets HTTP-only cookie for refresh token. In RN we cannot access `document.cookie`. The `POST /api/auth/refresh` relies on the cookie. On mobile we'll need to either:
   - Store the refresh token in MMKV securely and pass it manually in the request body, OR
   - Verify if the server accepts `refreshToken` in the request body (check `auth.controller.js`)
   - **Action required**: Inspect `auth.controller.js` before implementing auth.
3. **Image upload**: Web uses `File` objects. RN uses `expo-image-picker` returning URIs. Need to construct FormData differently.
4. **Window / DOM APIs**: `window.location.href`, `window.scrollY` etc. must be replaced with RN equivalents.
5. **MMKV over AsyncStorage**: MMKV is synchronous, 10× faster — preferred for auth token persistence.
6. **NativeWind**: Web uses Tailwind class names. NativeWind v4 is compatible but requires `className` prop support. Some utility classes differ — verify each screen.

---

## API Base URL

```
Production: https://api-ghar.aniecorp.in/api
```

All endpoints are prefixed `/api` — matches `apiClient.ts` `baseURL: '/api'` (web proxies via Vite).
In RN, point directly to the full URL.

---

## Role-Based Access Matrix

| Feature | Student | Owner | Public |
|---|---|---|---|
| Browse PG List | ✅ | ✅ | ✅ |
| PG Details | ✅ | ✅ | ✅ |
| Send Inquiry | ✅ | ❌ | ❌ |
| Saved Listings | ✅ | ❌ | ❌ |
| Dashboard Stats | ❌ | ✅ | ❌ |
| My Listings | ❌ | ✅ | ❌ |
| Create/Edit PG | ❌ | ✅ | ❌ |
| View Inquiries | ✅ (own) | ✅ (all) | ❌ |
