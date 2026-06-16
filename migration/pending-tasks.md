# Pending Tasks

**Last Updated**: 2026-06-16  
**Current Phase**: Phase 2 — RN Project Setup (NOT STARTED)

---

## Immediate Next Tasks (Phase 2)

### P2.1 — Initialize Expo Project
- [ ] Run `npx create-expo-app@latest ./app --template blank-typescript`
- [ ] Verify Expo SDK version (target SDK 52+)
- [ ] Set `name: "AneiGhar"`, `slug: "aneighar"` in `app.json`
- [ ] Remove boilerplate files (App.tsx default content)

### P2.2 — Configure TypeScript
- [ ] Update `tsconfig.json` with strict mode
- [ ] Configure path aliases (`@/*` → `src/*`) via `babel-plugin-module-resolver`

### P2.3 — Install Core Dependencies
```bash
# Navigation
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context

# State & Data
npm install zustand @tanstack/react-query axios

# Storage
npx expo install react-native-mmkv

# Styling
npm install nativewind tailwindcss

# Forms & Validation
npm install react-hook-form zod @hookform/resolvers

# Firebase
npx expo install @react-native-firebase/app @react-native-firebase/auth

# Images
npx expo install expo-image-picker expo-image expo-constants

# Dev tools
npm install --save-dev @types/react @types/react-native
```

### P2.4 — Configure NativeWind
- [ ] Create `tailwind.config.js` with content paths
- [ ] Update `babel.config.js` with nativewind plugin
- [ ] Add NativeWind types declaration

### P2.5 — Set Up React Navigation
- [ ] Create `src/navigation/` directory
- [ ] Create `RootNavigator.tsx` (Stack: Public + App)
- [ ] Create `PublicStackNavigator.tsx`
- [ ] Create `AppTabNavigator.tsx` (role-based tabs)

### P2.6 — Configure Zustand + MMKV
- [ ] Create MMKV storage adapter for Zustand persist
- [ ] Port `authStore.ts`
- [ ] Port `uiStore.ts`

### P2.7 — Configure TanStack Query
- [ ] Create `src/lib/queryClient.ts`
- [ ] Wrap app with `QueryClientProvider`

### P2.8 — Set Up Axios Client
- [ ] Create `src/lib/apiClient.ts` (full URL, not relative)
- [ ] JWT interceptor (read from MMKV via authStore)
- [ ] 401 → refresh → retry (without `window.location`)
- [ ] Refresh failure → logout + navigate to login

### P2.9 — Environment Variables
- [ ] Create `app.config.ts` (dynamic Expo config)
- [ ] Add `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] Create `.env` in `/app`

### P2.10 — Folder Structure
```
app/
├── app.config.ts
├── package.json
├── babel.config.js
├── tailwind.config.js
├── tsconfig.json
└── src/
    ├── api/
    │   ├── auth.ts
    │   ├── pg.ts
    │   └── inquiry.ts
    ├── components/
    │   ├── ui/
    │   └── layout/
    ├── hooks/
    │   ├── useAuth.ts
    │   ├── usePG.ts
    │   └── useInquiry.ts
    ├── lib/
    │   ├── apiClient.ts
    │   ├── firebase.ts
    │   └── mmkv.ts
    ├── navigation/
    │   ├── RootNavigator.tsx
    │   ├── PublicStackNavigator.tsx
    │   └── AppTabNavigator.tsx
    ├── screens/
    │   ├── HomeScreen.tsx
    │   ├── auth/
    │   │   ├── LoginScreen.tsx
    │   │   ├── RegisterScreen.tsx
    │   │   ├── PhoneLoginScreen.tsx
    │   │   ├── ResetPasswordScreen.tsx
    │   │   └── OnboardingScreen.tsx
    │   ├── pg/
    │   │   ├── PGListScreen.tsx
    │   │   └── PGDetailScreen.tsx
    │   └── dashboard/
    │       ├── DashboardScreen.tsx
    │       ├── MyListingsScreen.tsx
    │       ├── NewPGScreen.tsx
    │       ├── InquiriesScreen.tsx
    │       └── SavedListingsScreen.tsx
    ├── stores/
    │   ├── authStore.ts
    │   └── uiStore.ts
    └── types/
        └── index.ts
```

---

## Phase 3 — Shared API Layer

- [ ] Port `src/api/auth.ts`
- [ ] Port `src/api/pg.ts`
- [ ] Port `src/api/inquiry.ts` (includes saves + dashboard)
- [ ] Port `src/types/index.ts` (identical — zero changes needed)

---

## Phase 4 — Authentication

- [ ] Port `hooks/useAuth.ts` (identical logic, different navigation on logout)
- [ ] Build `LoginScreen.tsx`
- [ ] Build `RegisterScreen.tsx`
- [ ] Build `PhoneLoginScreen.tsx` (Firebase native SDK)
- [ ] Build `ResetPasswordScreen.tsx` + deep link setup
- [ ] Build `OnboardingScreen.tsx` (modal or full screen)
- [ ] Implement auth guard in navigation

---

## Phase 5 — Core Screens

- [ ] `HomeScreen.tsx`
- [ ] `PGListScreen.tsx`
- [ ] `PGDetailScreen.tsx`
- [ ] `DashboardScreen.tsx`

---

## Phase 6 — Remaining Screens

- [ ] `MyListingsScreen.tsx`
- [ ] `NewPGScreen.tsx` (create + edit PG)
- [ ] `InquiriesScreen.tsx`
- [ ] `SavedListingsScreen.tsx`

---

## Blockers (must resolve before Phase 4 auth)

1. **Inspect `server/controllers/auth.controller.js`** — verify if refreshToken can be passed in body for mobile clients
2. **Firebase Console** — create Android + iOS apps, download config files
3. **Deep link scheme** — decide URL scheme for password reset (e.g., `aneighar://reset-password/:token`)
