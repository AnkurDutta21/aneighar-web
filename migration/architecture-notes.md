# Architecture Notes — Anei Ghar Web App

## 1. Frontend Architecture

**Framework**: React 19 + Vite 8 + TypeScript 6  
**Styling**: TailwindCSS v4 (no PostCSS plugin — uses `@tailwindcss/vite`)  
**Component library**: Radix UI primitives + custom wrappers  
**Routing**: React Router v7 (data router)

### Directory Structure

```
client/src/
├── api/            # Pure API call functions (no state)
│   ├── auth.ts     # register, login, phoneLogin, logout, refresh, getMe, forgotPW, resetPW
│   ├── pg.ts       # CRUD + images + owner listings
│   └── inquiry.ts  # inquiries + savesApi + dashboardApi (all in one file)
├── components/
│   ├── auth/
│   │   ├── OnboardingModal.tsx  # Multi-step post-registration wizard
│   │   └── ProtectedRoute.tsx  # Route guard (auth + role)
│   ├── layout/
│   │   ├── AppLayout.tsx        # Sidebar + Topbar wrapper for dashboard
│   │   ├── PublicLayout.tsx     # Navbar + Outlet for public pages
│   │   ├── Sidebar.tsx          # Navigation sidebar + Topbar hamburger
│   │   └── Footer.tsx           # Public footer
│   └── ui/
│       ├── Button.tsx           # CVA-based button variants
│       ├── Card.tsx             # Card + CardHeader + CardContent
│       ├── Input.tsx            # Labeled input + error
│       ├── Toast.tsx            # Toast notification system
│       └── index.tsx            # Avatar component (re-exports)
├── hooks/
│   ├── useAuth.ts   # useLogin, useRegister, usePhoneLogin, useUpdateProfile, useLogout, useForgotPassword, useResetPassword
│   ├── usePG.ts     # usePGListings, usePGListing, useMyListings, useCreatePG, useUpdatePG, useDeletePG, useUploadImages, useDeleteImage
│   └── useInquiry.ts # useCreateInquiry, useOwnerInquiries, useStudentInquiries, useUpdateInquiryStatus, useToggleSave, useSavedListings, useDashboard
├── lib/
│   ├── apiClient.ts  # Axios instance (baseURL=/api, withCredentials, JWT interceptor, refresh interceptor)
│   ├── firebase.ts   # Firebase Auth SDK (phone OTP)
│   └── utils.ts      # cn() helper (clsx + tailwind-merge)
├── pages/
│   ├── HomePage.tsx              # Public landing page
│   ├── auth/
│   │   ├── LoginPage.tsx          # Email/password login
│   │   ├── RegisterPage.tsx       # Name + email + password + role selection
│   │   ├── PhoneLoginPage.tsx     # Firebase OTP (step 1: phone, step 2: OTP)
│   │   └── ResetPasswordPage.tsx  # Password reset via token in URL
│   ├── pg/
│   │   ├── PGListPage.tsx         # Filterable list with pagination
│   │   └── PGDetailsPage.tsx      # Single PG: gallery, amenities, inquiry form, save button
│   └── dashboard/
│       ├── DashboardPage.tsx       # Owner stats + recent listings/inquiries
│       ├── MyListingsPage.tsx      # Owner: manage listings (edit/delete/toggle status)
│       ├── NewPGPage.tsx           # Create OR edit PG (multi-section form + image upload)
│       ├── InquiriesPage.tsx       # Role-aware: owner sees all, student sees own
│       └── SavedListingsPage.tsx   # Student: saved PG listings
├── stores/
│   ├── authStore.ts  # Zustand + persist: { user, accessToken, isAuthenticated, setAuth, setToken, logout }
│   └── uiStore.ts    # Zustand: { sidebarOpen, toasts, setSidebarOpen, toggleSidebar, addToast, removeToast }
└── types/index.ts    # All TypeScript interfaces
```

---

## 2. Authentication Flow

### Email/Password
1. User submits login form → `authApi.login(payload)` → `POST /api/auth/login`
2. Server responds: `{ data: { user, accessToken } }` + sets HTTP-only refresh token cookie
3. `useAuthStore.setAuth(user, accessToken)` persists to localStorage via Zustand persist
4. Axios request interceptor attaches `Authorization: Bearer <token>` on every request
5. On 401: response interceptor fires `POST /api/auth/refresh` → server reads cookie, returns new accessToken
6. If refresh fails: `logout()` + redirect to `/login`

### Phone OTP (Firebase)
1. User enters phone number
2. `signInWithPhoneNumber(auth, phone, recaptchaVerifier)` (Firebase client SDK)
3. User enters OTP → `confirmationResult.confirm(otp)`
4. `currentUser.getIdToken()` → send to `POST /api/auth/phone`
5. Server validates ID token via `firebase-admin`, upserts User, returns same auth response
6. If user is new (phone login): `isOnboarded=false` → `OnboardingModal` shows

### Onboarding Gate
- After any login: check `user.isOnboarded === false` (strict false, not undefined)
- If true: show `OnboardingModal` over current page
- Modal collects: `name` (phone users), `role` (phone users), `phone` (email users)
- Submits `PATCH /api/auth/me` → updates user → closes modal

### Token Refresh (⚠️ Mobile Concern)
- Web: Relies on HTTP-only cookie auto-sent with `withCredentials: true`
- **Mobile**: Cookies from native HTTP clients behave differently per platform
- **Need to verify**: Does `auth.controller.js:refreshToken` accept a body `refreshToken` field, or only read from cookie?
- If cookie-only: must add body-based refresh token support for mobile clients

---

## 3. State Management

### authStore (Zustand + persist)
```ts
{
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  setAuth(user, token): void
  setToken(token): void
  logout(): void
}
```
**Web persist**: localStorage key `anei-ghar-auth`  
**Mobile persist**: MMKV key `anei-ghar-auth` via `zustand-mmkv` or custom MMKV storage adapter

### uiStore (Zustand, no persist)
```ts
{
  sidebarOpen: boolean
  toasts: Toast[]
  setSidebarOpen(open): void
  toggleSidebar(): void
  addToast(toast): void      // auto-removes after 4000ms
  removeToast(id): void
}
```
**Mobile equivalent**: `sidebarOpen` → tab bar or drawer open state. `toasts` → react-native-toast-message or custom

---

## 4. API Layer

### Base configuration
- baseURL: `/api` (web — proxied by Vite dev server and Vercel in prod)
- **Mobile**: Must use full URL `https://api-ghar.aniecorp.in/api`
- `withCredentials: true` (for cookies)
- Auth header: `Authorization: Bearer <accessToken>`

### Endpoints Summary

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| POST | /auth/register | ❌ | - |
| POST | /auth/login | ❌ | - |
| POST | /auth/phone | ❌ | - |
| POST | /auth/refresh | ❌ | - |
| POST | /auth/logout | ✅ | any |
| GET | /auth/me | ✅ | any |
| PATCH | /auth/me | ✅ | any |
| POST | /auth/forgot-password | ❌ | - |
| POST | /auth/reset-password/:token | ❌ | - |
| GET | /pg | ❌ | - |
| GET | /pg/:id | ❌ | - |
| GET | /pg/owner/my-listings | ✅ | owner |
| POST | /pg | ✅ | owner |
| PUT/PATCH | /pg/:id | ✅ | owner |
| DELETE | /pg/:id | ✅ | owner |
| POST | /pg/:id/images | ✅ | owner |
| DELETE | /pg/:id/images/:publicId | ✅ | owner |
| POST | /inquiries | ✅ | student |
| GET | /inquiries/student | ✅ | student |
| GET | /inquiries/owner | ✅ | owner |
| PATCH | /inquiries/:id/status | ✅ | owner |
| GET | /saves | ✅ | student |
| POST | /saves/:pgId | ✅ | student |
| GET | /dashboard | ✅ | owner |

---

## 5. Data Models (TypeScript interfaces)

### User
```ts
{ _id, name, email?, role: 'student'|'owner', phone?, phoneVerified?, firebaseUid?, isOnboarded?, avatar?, createdAt }
```

### PGListing
```ts
{ _id, title, description, location: {address, city, state, pincode, coordinates?}, rent, deposit, genderPreference, roomType, totalRooms, availableRooms, amenities[], images: [{url, publicId}], rentIncludes?, additionalCharges?, owner, active, analytics: {views, inquiries, saves}, createdAt, updatedAt }
```

### Inquiry
```ts
{ _id, pg, student, message, phone, status: 'pending'|'responded'|'closed', createdAt }
```

### PGFilters (query params)
```ts
{ city?, minRent?, maxRent?, genderPreference?, roomType?, amenities?, page?, limit?, sort?, availableOnly? }
```

---

## 6. Form Validation (Zod schemas)

Web uses React Hook Form + Zod. Mobile will use the same.

Key schemas to port:
- **Login**: `{ email: string (email), password: string (min 6) }`
- **Register**: `{ name: string, email: string (email), password: string (min 6), role: enum }`
- **CreatePG**: Large multi-section form (title, description, location, rent, deposit, genderPreference, roomType, rooms, amenities, etc.)
- **Inquiry**: `{ message: string, phone: string (10 digits) }`
- **ResetPassword**: `{ password: string (min 8), confirmPassword: string (must match) }`

---

## 7. Third-Party Services

| Service | Web Usage | Mobile Approach |
|---|---|---|
| Firebase Auth | Phone OTP via Web SDK | `@react-native-firebase/auth` |
| Cloudinary | Server-side image storage | Same (handled by backend) |
| Vercel | Frontend hosting | Not applicable for native |

---

## 8. Environment Variables

### Web (Vite)
```
VITE_FIREBASE_API_KEY=AIzaSyBc0Gajbsnjsws9r1zkKG-7Gs4DI03StFc
VITE_FIREBASE_AUTH_DOMAIN=aneighar-8455d.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=aneighar-8455d
VITE_FIREBASE_APP_ID=1:910174855747:web:da19a21a999541af16aaf6
VITE_BACKEND=https://api-ghar.aniecorp.in/
```

### Mobile (expo-constants / app.config.ts)
```
EXPO_PUBLIC_API_URL=https://api-ghar.aniecorp.in
EXPO_PUBLIC_FIREBASE_PROJECT_ID=aneighar-8455d
EXPO_PUBLIC_FIREBASE_APP_ID=1:910174855747:android:...  (need new Firebase app for Android/iOS)
```
**Note**: New Firebase apps must be created for Android and iOS in Firebase Console.  
The `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) files must be added.

---

## 9. Navigation Structure (Target)

### RN Navigation Plan

```
RootNavigator (Stack)
├── PublicStack (Stack)
│   ├── HomeScreen
│   ├── LoginScreen
│   ├── RegisterScreen
│   ├── PhoneLoginScreen
│   ├── ResetPasswordScreen
│   ├── PGListScreen
│   └── PGDetailScreen
└── AppTabs (BottomTabNavigator) — authenticated
    ├── HomeTab → HomeScreen
    ├── BrowseTab → PGListScreen
    ├── DashboardTab → DashboardScreen (owner) / HomeScreen (student)
    └── ProfileTab → ProfileScreen
        + Stack within Dashboard tab:
            ├── MyListingsScreen (owner)
            ├── NewPGScreen (owner)
            ├── InquiriesScreen
            └── SavedListingsScreen (student)
```

### Role-based Tab Visibility
- Student tabs: Home, Browse, Saved, Inquiries, Profile
- Owner tabs: Home, Browse, My Listings, Inquiries, Profile

---

## 10. Key Differences — Web vs Mobile

| Concern | Web | Mobile |
|---|---|---|
| Route guards | `<ProtectedRoute>` component | Navigation `beforeRemove` / custom hook |
| Cookie refresh | HTTP-only cookie auto-sent | Need body-based or header-based refresh token |
| File input | `<input type="file">` | `expo-image-picker` |
| Scroll events | `window.scroll` | `ScrollView` / `FlatList` |
| URL navigation | `useNavigate()` | `navigation.navigate()` |
| Deep links | React Router paths | Expo Linking + deep link config |
| reCAPTCHA | Rendered in DOM | Invisible reCAPTCHA via `@react-native-firebase/auth` |
| Toast | Custom DOM-based | `react-native-toast-message` or custom |
| Avatar fallback | CSS initials with `::before` | RN `Text` inside `View` |
