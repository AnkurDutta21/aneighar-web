# Parity Checklist — Anei Ghar Web → React Native

Legend:
- [ ] Not Started
- [/] In Progress
- [x] Completed
- [v] Verified (tested on device)

---

## PUBLIC SCREENS

### 1. Home Screen
- **Web route**: `/`
- **Web file**: `client/src/pages/HomePage.tsx`
- **RN file**: `app/src/screens/HomeScreen.tsx` (planned)
- **Status**: [ ] Not Started

**Components**:
- [ ] Sticky header with logo + nav links
- [ ] Hero section with city search bar
- [ ] Popular cities quick-select buttons
- [ ] "Browse All PGs" CTA button
- [ ] "List Your PG" CTA (unauthenticated only)
- [ ] Features grid (4 cards: Smart Search, Precise Locations, Safe & Secure, Detailed Listings)
- [ ] "Growing fast" traction banner
- [ ] Final CTA section
- [ ] Footer

**API endpoints**: None (static)

**State dependencies**:
- `useAuthStore.isAuthenticated` (conditional nav links / CTAs)

**Notes**:
- Web: scroll-aware sticky header (`window.scrollY > 40`)
- Mobile: Replace with fixed header or collapsible header via `Animated.scrollY`
- Mobile: City search → navigate to PGList with query param

---

### 2. PG List Screen
- **Web route**: `/pg`
- **Web file**: `client/src/pages/pg/PGListPage.tsx`
- **RN file**: `app/src/screens/PGListScreen.tsx` (planned)
- **Status**: [ ] Not Started

**Components**:
- [ ] Filter bar (city, minRent, maxRent, genderPreference, roomType, availableOnly)
- [ ] Sort selector
- [ ] PG card grid / list
- [ ] Pagination controls
- [ ] Empty state
- [ ] Loading skeleton

**API endpoints**:
- `GET /pg?city=&minRent=&maxRent=&genderPreference=&roomType=&page=&limit=&sort=&availableOnly=`

**State dependencies**:
- `PGFilters` state (local)
- `usePGListings(filters)` React Query hook

**Validation**: None

**Permissions**: Public

**Edge cases**:
- [ ] Empty results state
- [ ] Network error state
- [ ] Filter reset

---

### 3. PG Detail Screen
- **Web route**: `/pg/:id`
- **Web file**: `client/src/pages/pg/PGDetailsPage.tsx`
- **RN file**: `app/src/screens/PGDetailScreen.tsx` (planned)
- **Status**: [ ] Not Started

**Components**:
- [ ] Image gallery / carousel
- [ ] Title, location, rent badge
- [ ] Room type + gender preference badges
- [ ] Available rooms indicator
- [ ] Amenities grid
- [ ] Rent includes section
- [ ] Additional charges
- [ ] Inquiry form (student only — message + phone)
- [ ] Save/unsave button (student only)
- [ ] Owner info card

**API endpoints**:
- `GET /pg/:id`
- `POST /inquiries` (student)
- `POST /saves/:pgId` (student toggle)

**State dependencies**:
- `usePGListing(id)` React Query
- `useAuthStore` (role check for inquiry form / save button)

**Validation**:
- Inquiry: message (required), phone (10-digit Indian)

**Permissions**:
- Public: view
- Student only: inquiry form, save button

**Edge cases**:
- [ ] Image gallery empty state (placeholder)
- [ ] Inquiry already submitted (if applicable)
- [ ] Not authenticated → prompt to login for inquiry

---

## AUTHENTICATION SCREENS

### 4. Login Screen
- **Web route**: `/login`
- **Web file**: `client/src/pages/auth/LoginPage.tsx`
- **RN file**: `app/src/screens/auth/LoginScreen.tsx` (planned)
- **Status**: [ ] Not Started

**Components**:
- [ ] Email input
- [ ] Password input (toggle visibility)
- [ ] Submit button with loading state
- [ ] "Forgot password?" link
- [ ] "Sign in with Phone" link → PhoneLogin
- [ ] "Register" link
- [ ] Error toast on failure

**API endpoints**:
- `POST /auth/login`

**Validation**:
- email: required, valid email format
- password: required, min 6 chars

**Permissions**: Public (redirect to dashboard if already authenticated)

**Edge cases**:
- [ ] Invalid credentials error
- [ ] Network error
- [ ] Loading state during submission

---

### 5. Register Screen
- **Web route**: `/register`
- **Web file**: `client/src/pages/auth/RegisterPage.tsx`
- **RN file**: `app/src/screens/auth/RegisterScreen.tsx` (planned)
- **Status**: [ ] Not Started

**Components**:
- [ ] Name input
- [ ] Email input
- [ ] Password input
- [ ] Role selector (Student / Owner cards)
- [ ] Submit button
- [ ] "Sign in" link

**API endpoints**:
- `POST /auth/register`

**Validation**:
- name: required
- email: required, valid
- password: required, min 6 chars
- role: required, enum `student|owner`

**Post-registration**:
- If `isOnboarded === false` → show OnboardingScreen/Modal

---

### 6. Phone Login Screen
- **Web route**: `/phone-login`
- **Web file**: `client/src/pages/auth/PhoneLoginPage.tsx`
- **RN file**: `app/src/screens/auth/PhoneLoginScreen.tsx` (planned)
- **Status**: [ ] Not Started

**Components**:
- [ ] Step 1: Phone number input (+91 prefix) + Send OTP button
- [ ] RecaptchaVerifier (web) → handled automatically by native Firebase SDK
- [ ] Step 2: OTP input (6 digits) + Verify button
- [ ] Resend OTP (after cooldown)
- [ ] Error messages per step

**API endpoints**:
- Firebase: `signInWithPhoneNumber` → OTP
- Firebase: `confirmationResult.confirm(otp)` → ID token
- Backend: `POST /auth/phone` with `{ idToken }`

**Permissions**: Public

**⚠️ Mobile difference**: 
- Web uses `RecaptchaVerifier` rendered in DOM
- Mobile: `@react-native-firebase/auth` handles reCAPTCHA invisibly

---

### 7. Reset Password Screen
- **Web route**: `/reset-password/:token`
- **Web file**: `client/src/pages/auth/ResetPasswordPage.tsx`
- **RN file**: `app/src/screens/auth/ResetPasswordScreen.tsx` (planned)
- **Status**: [ ] Not Started

**Components**:
- [ ] New password input
- [ ] Confirm password input
- [ ] Submit button
- [ ] Success message / redirect

**Steps**:
1. User clicks "Forgot password" on login → enters email → `POST /auth/forgot-password` → email sent
2. Email contains link with token → web opens `/reset-password/:token`
3. Mobile: Deep link to app → parse token from URL → show reset form
4. Submit → `POST /auth/reset-password/:token` with `{ password }`

**Validation**:
- password: min 8 chars
- confirmPassword: must match password

**⚠️ Mobile difference**: Requires deep link configuration in Expo to handle reset password URLs

---

### 8. Onboarding Screen
- **Web**: Modal overlay on any page (from `OnboardingModal.tsx`)
- **RN file**: `app/src/screens/auth/OnboardingScreen.tsx` (planned)
- **Status**: [ ] Not Started

**Steps (dynamic)**:
- `name` step: shown only for phone users without a name
- `role` step: shown only for phone users (email users select role at register)
- `phone` step: shown for email users without a phone number

**API endpoints**:
- `PATCH /auth/me` with `{ name?, role?, phone? }`

**Validation**:
- name: required if shown
- phone: 10-digit Indian number (optional — can skip)

---

## DASHBOARD SCREENS (Authenticated)

### 9. Dashboard Screen
- **Web route**: `/dashboard`
- **Web file**: `client/src/pages/dashboard/DashboardPage.tsx`
- **RN file**: `app/src/screens/dashboard/DashboardScreen.tsx` (planned)
- **Status**: [ ] Not Started

**Components**:
- [ ] Stats cards (Total Listings, Available, Total Views, Total Inquiries)
- [ ] Recent Listings list
- [ ] Recent Inquiries list
- [ ] User profile header

**API endpoints**:
- `GET /dashboard` (owner only)

**State dependencies**:
- `useDashboard()` React Query

**Permissions**: Authenticated + Owner role

**Edge cases**:
- [ ] Student accessing dashboard → show limited view or redirect

---

### 10. My Listings Screen
- **Web route**: `/dashboard/listings`
- **Web file**: `client/src/pages/dashboard/MyListingsPage.tsx`
- **RN file**: `app/src/screens/dashboard/MyListingsScreen.tsx` (planned)
- **Status**: [ ] Not Started

**Components**:
- [ ] List of owner's PG listings
- [ ] Per-listing: title, status badge, actions (edit, delete, toggle active)
- [ ] "Add new listing" button → NewPGScreen
- [ ] Delete confirmation dialog
- [ ] Empty state

**API endpoints**:
- `GET /pg/owner/my-listings`
- `DELETE /pg/:id`
- `PATCH /pg/:id` (toggle active field)

**Permissions**: Authenticated + Owner role

---

### 11. Create/Edit PG Screen
- **Web route**: `/dashboard/listings/new` + `/dashboard/listings/:id/edit`
- **Web file**: `client/src/pages/dashboard/NewPGPage.tsx` (31KB — complex)
- **RN file**: `app/src/screens/dashboard/NewPGScreen.tsx` (planned)
- **Status**: [ ] Not Started

**This is the most complex screen.**

**Sections**:
- [ ] Basic Info (title, description, genderPreference, roomType)
- [ ] Location (address, city, state, pincode)
- [ ] Pricing (rent, deposit, availableRooms, totalRooms)
- [ ] Amenities (multi-select checkboxes)
- [ ] Rent Includes (multi-select)
- [ ] Additional Charges (text)
- [ ] Image Upload section (after PG is created)

**API endpoints**:
- `POST /pg` (create)
- `PATCH /pg/:id` (update)
- `POST /pg/:id/images` (upload images — multipart/form-data)
- `DELETE /pg/:id/images/:publicId` (delete image)
- `GET /pg/:id` (load existing for edit)

**Validation** (full Zod schema):
- title: required, min 5 chars
- description: required, min 20 chars
- location.address, city, state, pincode: all required
- rent: required, number, > 0
- deposit: required, number, >= 0
- totalRooms: required, >= 1
- availableRooms: required, 0 <= availableRooms <= totalRooms
- genderPreference: enum (male|female|any)
- roomType: enum (single|double|triple|dormitory)
- amenities: array, min 1

**⚠️ Mobile difference**:
- Image upload: `expo-image-picker` instead of `<input type="file">`
- FormData construction differs (URI-based blob)

**Permissions**: Authenticated + Owner role

---

### 12. Inquiries Screen
- **Web route**: `/dashboard/inquiries`
- **Web file**: `client/src/pages/dashboard/InquiriesPage.tsx`
- **RN file**: `app/src/screens/dashboard/InquiriesScreen.tsx` (planned)
- **Status**: [ ] Not Started

**Components**:
- [ ] Role-aware: owner sees all inquiries, student sees own
- [ ] Inquiry card (PG title, message, phone, status badge, date)
- [ ] Owner: status update (pending → responded → closed)
- [ ] Filters: status filter (owner only)
- [ ] Pagination (owner)
- [ ] Empty state

**API endpoints**:
- Owner: `GET /inquiries/owner?page=&limit=&status=`
- Student: `GET /inquiries/student`
- Owner: `PATCH /inquiries/:id/status`

**Permissions**: Authenticated (any role, different views)

---

### 13. Saved Listings Screen
- **Web route**: `/dashboard/saved`
- **Web file**: `client/src/pages/dashboard/SavedListingsPage.tsx`
- **RN file**: `app/src/screens/dashboard/SavedListingsScreen.tsx` (planned)
- **Status**: [ ] Not Started

**Components**:
- [ ] Grid/list of saved PG listings
- [ ] Unsave button per card
- [ ] Navigate to PG detail on tap
- [ ] Empty state

**API endpoints**:
- `GET /saves`
- `POST /saves/:pgId` (toggle — removes if saved)

**Permissions**: Authenticated + Student role

---

## SHARED / INFRASTRUCTURE

### 14. API Client
- **Web file**: `client/src/lib/apiClient.ts`
- **RN file**: `app/src/lib/apiClient.ts` (planned)
- **Status**: [ ] Not Started

- [ ] Axios instance with base URL
- [ ] JWT Bearer token interceptor
- [ ] 401 → refresh token → retry
- [ ] Refresh failure → logout + navigate to login

---

### 15. Auth Store
- **Web file**: `client/src/stores/authStore.ts`
- **RN file**: `app/src/stores/authStore.ts` (planned)
- **Status**: [ ] Not Started

- [ ] Same Zustand interface
- [ ] MMKV storage adapter instead of localStorage

---

### 16. Navigation (Auth Guard)
- **Web**: `ProtectedRoute` component wrapping routes
- **RN**: Custom `useProtectedNavigation` hook or navigation middleware
- **Status**: [ ] Not Started

- [ ] Redirect unauthenticated users to login
- [ ] Role-mismatch redirect to dashboard
- [ ] Show toast on access denied

---

### 17. Onboarding Gate
- **Web**: `OnboardingGate` function rendered globally in `App.tsx`
- **RN**: Conditional screen in auth flow or modal layer
- **Status**: [ ] Not Started

- [ ] Check `user.isOnboarded === false` after login
- [ ] Show onboarding screen/modal
- [ ] Complete → re-check and dismiss

---

## SUMMARY COUNTERS

| Category | Total | Not Started | In Progress | Completed | Verified |
|---|---|---|---|---|---|
| Public Screens | 3 | 3 | 0 | 0 | 0 |
| Auth Screens | 5 | 5 | 0 | 0 | 0 |
| Dashboard Screens | 5 | 5 | 0 | 0 | 0 |
| Infrastructure | 4 | 4 | 0 | 0 | 0 |
| **Total** | **17** | **17** | **0** | **0** | **0** |
