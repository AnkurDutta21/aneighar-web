# Anei Ghar — Onboarding, Engagement & Conversion Audit

## 1. Acquisition / Entry Points

The [HomePage](file:///d:/freelance/anei%20ghar%20web/client/src/pages/HomePage.tsx) serves as the top-of-funnel landing page. It has:

| Element | Status |
|---|---|
| Hero with "Browse PGs" CTA → `/pg` | ✅ Built |
| "List Your PG" CTA → `/register` (unauthenticated only) | ✅ Built |
| Stats bar (1,200+ PGs, 8,500+ students, 50+ cities, 4.8★) | ✅ Built (hardcoded) |
| Features section (Search, Verified Locations, Trusted Listings, Top Rated) | ✅ Built |
| Bottom CTA: "Create Free Account" / "Browse Listings" (auth-aware) | ✅ Built |
| Nav: Sign In / Get Started / Dashboard (auth-aware) | ✅ Built |
| Footer | ✅ Built |

> [!NOTE]
> Stats are hardcoded placeholders. No live data is pulled from the backend.

---

## 2. Registration / Authentication Flows

### 2a. Email Registration — [RegisterPage](file:///d:/freelance/anei%20ghar%20web/client/src/pages/auth/RegisterPage.tsx)

```
Name → Email → Password → Role (Student / Owner) → Create Account → /dashboard
```

| Detail | Status |
|---|---|
| Zod validation on all fields | ✅ |
| Role selection (student / owner) as a `<Select>` | ✅ |
| Phone OTP shortcut button at top | ✅ |
| Error banner on API failure | ✅ |
| Redirects to `/dashboard` on success | ✅ |
| No email verification step | ⚠️ Gap |
| No password strength indicator | ⚠️ Gap |
| No Google / social sign-in | ⚠️ Gap |

### 2b. Email Login — [LoginPage](file:///d:/freelance/anei%20ghar%20web/client/src/pages/auth/LoginPage.tsx)

```
Email + Password → Sign In → /dashboard
```

| Detail | Status |
|---|---|
| Zod validation | ✅ |
| Phone OTP shortcut button at top | ✅ |
| Error banner with API message | ✅ |
| No "Forgot password" link | ⚠️ Gap |

### 2c. Phone OTP Login — [PhoneLoginPage](file:///d:/freelance/anei%20ghar%20web/client/src/pages/auth/PhoneLoginPage.tsx)

```
Enter 10-digit phone → Send OTP (Firebase reCAPTCHA) → 6-box OTP entry → Auto-submit on last digit → /dashboard
```

| Detail | Status |
|---|---|
| Firebase invisible reCAPTCHA | ✅ |
| 6-digit OTP boxes with auto-advance & paste support | ✅ |
| 60-second resend countdown | ✅ |
| Error handling for `too-many-requests`, `invalid-code`, `code-expired` | ✅ |
| Back button: OTP → phone, phone → login | ✅ |
| Auto-submit on last OTP digit fill | ✅ |

---

## 3. Post-Login Onboarding — [OnboardingModal](file:///d:/freelance/anei%20ghar%20web/client/src/components/auth/OnboardingModal.tsx)

Triggered globally via `OnboardingGate` in [App.tsx](file:///d:/freelance/anei%20ghar%20web/client/src/App.tsx) whenever `user.isOnboarded === false`.

### Step Logic (dynamically built based on auth method)

| Condition | Steps Shown |
|---|---|
| Phone user with no name | Name → Role |
| Phone user with name | Role only |
| Email user with no phone | Phone only |
| Email user with phone | Modal skipped (nothing shown) |

### Steps Detail

| Step | Content |
|---|---|
| **Name** | Text input, Enter key support, blocks Continue if empty |
| **Role** | Card picker: Student (GraduationCap) or Owner (Home icon), visual selection state |
| **Phone** | `+91` prefix, 10-digit input, validation, skip allowed for email users |

| Mechanism | Status |
|---|---|
| Progress bar (multi-step only) | ✅ |
| Step counter "Step X of Y" | ✅ |
| Submits all data in one `updateProfile` PATCH call | ✅ |
| Dismissible | ❌ Not dismissible — blocks all interaction until completed |
| Skip phone for email users | ✅ |
| Owner nudge chip: "Owners with verified phone get 3× more inquiries" | ✅ |

> [!IMPORTANT]
> `isOnboarded === false` is strict — `undefined` (legacy users) is treated as already onboarded. This is intentional to avoid breaking existing accounts.

---

## 4. Route Guards & Role-Based Access

Handled by [ProtectedRoute](file:///d:/freelance/anei%20ghar%20web/client/src/components/auth/ProtectedRoute.tsx):

| Route | Guard |
|---|---|
| `/dashboard` | Any authenticated user |
| `/dashboard/inquiries` | Any authenticated user |
| `/dashboard/saved` | `role === 'student'` only |
| `/dashboard/listings` | `role === 'owner'` only |
| `/dashboard/listings/new` | `role === 'owner'` only |
| `/dashboard/listings/:id/edit` | `role === 'owner'` only |
| `/pg`, `/pg/:id` | Public (no auth required) |

> [!NOTE]
> Wrong-role access redirects to `/dashboard`, not to an error page. Silent redirect may confuse users.

---

## 5. Conversion — PG Details Page

[PGDetailsPage](file:///d:/freelance/anei%20ghar%20web/client/src/pages/pg/PGDetailsPage.tsx) is the primary conversion surface.

### Conversion Actions Available

| Action | Who Sees It | Status |
|---|---|---|
| "Send Inquiry" button → expands form | Authenticated students only | ✅ |
| "Save Listing" (Heart) button | Any authenticated user | ✅ |
| "Sign in to Inquire" → `/login` | Unauthenticated users | ✅ |
| Inquiry form: message + phone | Students | ✅ |
| Phone pre-filled from profile | Students with phone | ✅ |
| Toast on success / error | ✅ | ✅ |
| Analytics display (Views / Inquiries / Saves) | All users | ✅ |
| Owner card (name + avatar) | All users | ✅ |
| Owner phone number visible to students | ❌ Not shown | ⚠️ Gap |
| Image gallery with thumbnail strip | ✅ | ✅ |
| Map view placeholder (no real map) | Coordinates exist | ⚠️ Gap |

---

## 6. Engagement — Dashboard

[DashboardPage](file:///d:/freelance/anei%20ghar%20web/client/src/pages/dashboard/DashboardPage.tsx) is role-aware:

### Owner View
- Stat cards: Active Listings, Total Views, Inquiries, Saves
- Listings table (up to 5): title, city, rent, views, inquiry count, availability badge, edit link
- Quick actions: Browse PGs, Inquiries (inbox), Add PG

### Student View
- Stat cards: Browse PGs (1,200+), Saved PGs (live), My Inquiries (live)
- Quick actions: Browse PGs, Inquiries (my sent), Saved PGs

### Supporting Pages

| Page | Purpose | Status |
|---|---|---|
| [InquiriesPage](file:///d:/freelance/anei%20ghar%20web/client/src/pages/dashboard/InquiriesPage.tsx) | View all inquiries (sent or received) | ✅ Built |
| [MyListingsPage](file:///d:/freelance/anei%20ghar%20web/client/src/pages/dashboard/MyListingsPage.tsx) | Owner's full listing management | ✅ Built |
| [NewPGPage](file:///d:/freelance/anei%20ghar%20web/client/src/pages/dashboard/NewPGPage.tsx) | Create/edit PG listing (28 KB — large form) | ✅ Built |
| [SavedListingsPage](file:///d:/freelance/anei%20ghar%20web/client/src/pages/dashboard/SavedListingsPage.tsx) | Student's saved/wishlist PGs | ✅ Built |

---

## 7. Gap Analysis — What's Missing

### 🔴 High Priority
| Gap | Impact |
|---|---|
| No "Forgot Password" flow | Blocks email users who lose credentials |
| No email verification | Anyone can register with fake email |
| Owner phone not visible to students on listing page | Students cannot contact owner directly |
| Real map integration (Google Maps / Mapbox) | Map placeholder shown currently |

### 🟡 Medium Priority
| Gap | Impact |
|---|---|
| Live stats on homepage (not hardcoded) | Trust signal feels fake |
| No Google / social sign-in option | Higher friction for mobile users |
| Wrong-role redirect is silent (no error message) | Confusing UX |
| No notification system (email/SMS to owner on new inquiry) | Owners may miss inquiries |
| No inquiry status tracking (pending / accepted / declined) | Students can't track their requests |

### 🟢 Nice-to-Have
| Gap | Impact |
|---|---|
| Password strength indicator on register | Better UX |
| Welcome email after registration | Engagement |
| Profile edit page | Users can't update name/phone/role post-onboarding |
| PG review / rating system | The 4.8★ rating on homepage has no backing data |
