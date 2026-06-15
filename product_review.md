# Anei Ghar — Senior Product Review & Feature Enhancement Audit

> Roles applied: Senior Product Manager · UX Researcher · Marketplace Growth Expert · SaaS Conversion Consultant

---

## 1. Executive Summary

Anei Ghar has a working technical skeleton — auth, listings, inquiries, a dashboard — but it is **not yet a product**. It is an MVP-grade CRUD app that has not yet solved the real problem it claims to solve.

The platform's stated goal is to connect students with PG owners. The actual problem students face is **trust and clarity at the moment of decision**: *Is this PG real? Is the price honest? Will the owner respond? Is it safe?* None of these are answered by the current product. Owners face a parallel problem: *Will this platform actually bring me quality leads, or is it noise?*

**The risk is not that features are missing. The risk is that the core value proposition is not yet delivered.** Students can browse listings and send a message into a void. Owners receive a message but have no reason to respond in-platform. Neither side has a strong reason to prefer Anei Ghar over WhatsApp groups.

The platform has approximately **4–6 weeks of work** before it becomes a credible marketplace. With the right prioritization, it can get there. Without it, it risks becoming a ghost town of inactive listings that no one trusts.

---

## 2. Critical Product Risks

> [!CAUTION]
> These risks can kill the marketplace before it reaches critical mass.

### 🔴 Risk 1 — The Inquiry Dead End (Severity: Critical)
A student sends an inquiry. What happens next? There is no notification to the owner (no email, no SMS, no WhatsApp). The owner has to log in and check `/dashboard/inquiries` to discover it. The average small-time PG owner **will never do this**. Inquiries will go unanswered. Students will stop sending them. This is the single biggest conversion killer on the platform.

### 🔴 Risk 2 — No Trust Layer (Severity: Critical)
The homepage claims "Trusted Listings" and "All PGs are verified by our team" — **this is false**. There is zero verification infrastructure. No owner badge. No listing verification. Showing "Verified" as a feature when it doesn't exist is a trust bomb waiting to go off the moment a student gets scammed or visits a non-existent PG. This will destroy word-of-mouth growth.

### 🔴 Risk 3 — Stale Inventory (Severity: Critical)
There is no mechanism to force owners to update room availability. A PG listed as "3 rooms available" from 6 months ago will still show as available. Students will show up to full PGs. Owners won't even know this happened. **Stale inventory is the #1 killer of accommodation marketplaces.** NoBroker, MagicBricks all struggled with this. It needs a structural solution, not a manual one.

### 🟠 Risk 4 — Zero Owner Activation Loop (Severity: High)
After an owner lists their first PG, there is no subsequent hook to bring them back. No weekly email summary ("You got 5 views this week"), no vacancy update prompt, no lead notification. The owner dashboard has data but zero *push* mechanisms. Owners will list once and disappear.

### 🟠 Risk 5 — Fake Stats Erode Trust (Severity: High)
The homepage displays `1,200+ PGs`, `8,500+ Happy Students`, `4.8★` — all hardcoded. The moment a user browses and sees 20 listings, the credibility of the entire platform collapses. **Lying to users in the hero section is worse than showing honest small numbers.** Remove or make live immediately.

### 🟡 Risk 6 — No Competitive Moat (Severity: Medium)
A PG owner can get a WhatsApp inquiry in 5 seconds via a Facebook post. A student can join a city-specific WhatsApp group and find 10 PG leads in an hour. Anei Ghar currently offers no advantage over this. No structured data, no verification, no comparison — just a prettier inbox. The moat must be built fast.

---

## 3. Top 10 Missing Features

Ranked by business impact, not technical complexity.

### #1 — Owner Notifications (WhatsApp / Email / SMS)
**Problem solved:** Owners miss inquiries because they don't re-open the app.
**Why current state fails:** There is no push mechanism. The inquiry dies the moment it's submitted.
**Business impact:** Direct recovery of ~60–80% of inquiry→response conversions. Without this, the funnel is broken at its most critical step.
**Priority:** 🔴 Critical
**Complexity:** Medium (Twilio/MSG91 for SMS/WhatsApp; SendGrid for email)

---

### #2 — Owner Verification & Verified Badge
**Problem solved:** Students can't trust that the listing is real.
**Why current state fails:** Homepage claims "Trusted Listings" with zero verification infrastructure. A fraudulent listing will eventually cause reputational damage.
**Business impact:** Unlocks the primary trust signal. Verified listings will have measurably higher inquiry rates. Creates a premium tier monetization angle.
**Priority:** 🔴 Critical
**Complexity:** Medium (manual review workflow + badge on listing; later scale to document upload + automated check)

---

### #3 — Availability Auto-Expiry & Update Prompts
**Problem solved:** Stale listings claiming rooms that are no longer available.
**Why current state fails:** `availableRooms` is a static field set at listing creation. Nothing forces an update.
**Business impact:** Reduces bounce-and-abandon from students who contact full PGs. Makes inventory data trustworthy enough to show to students as a filter.
**Priority:** 🔴 Critical
**Complexity:** Low-Medium (cron job that emails owner every 30 days: "Is your listing still active? Update availability with 1 click")

---

### #4 — Rent Breakdown (Inclusive / Exclusive Charges)
**Problem solved:** Students discover hidden charges *after* moving in — or worse, after committing.
**Why current state fails:** The listing shows one rent figure. No indication of what's included (electricity, water, meals, WiFi separately billed?).
**Business impact:** Highest-friction question at decision point. Surfacing this in-app prevents students from asking the same question 100 times and eliminates the most common post-move-in complaint.
**Priority:** 🔴 Critical
**Complexity:** Low (add structured fields to listing: `rentIncludes[]`, `additionalCharges[]`)

---

### #5 — Distance to Colleges / Landmarks
**Problem solved:** A student's #1 filter criterion is "how far is this PG from my college?"
**Why current state fails:** The listing has coordinates but no college proximity data, no landmark data. City + address is insufficient. Students have to open Google Maps separately for every listing they consider.
**Business impact:** This is the single most impactful feature for student satisfaction and return visits. NoBroker built a significant part of their moat on this.
**Priority:** 🔴 Critical
**Complexity:** Medium (Google Places API for "nearby colleges"; add landmark input to listing form)

---

### #6 — In-App Messaging / Reply Thread
**Problem solved:** After an inquiry, the conversation moves off-platform to WhatsApp or phone. The marketplace loses all context, data, and trust.
**Why current state fails:** The inquiry is a one-shot message. The owner can mark it "Responded" but there is no way to reply in-app. The student has no feedback loop.
**Business impact:** Keeping communication in-app is the core moat of any marketplace. It creates data (response times, conversion rates), enables dispute resolution, and gives owners a reason to log back in daily.
**Priority:** 🟠 High
**Complexity:** High (real-time messaging with WebSocket or polling; alternatively, async thread model — lower complexity)

---

### #7 — Forgot Password Flow
**Problem solved:** Email-registered users who forget their password are permanently locked out.
**Why current state fails:** There is no password reset path at all. `/login` has no "Forgot password?" link.
**Business impact:** A blocked user is a churned user. This is a table-stakes feature for any auth system.
**Priority:** 🟠 High
**Complexity:** Low (Firebase email link / backend token email; 1–2 days of work)

---

### #8 — PG Comparison Feature
**Problem solved:** Students shortlist 3–4 PGs and need to decide. Without comparison, they go to WhatsApp groups to ask friends, or rely on gut feel.
**Why current state fails:** No mechanism to compare two listings side-by-side. The saved listings page is a wishlist, not a decision tool.
**Business impact:** Reduces the research-to-inquiry gap. Students who compare are closer to a decision. Increases inquiry quality (they've already screened out options).
**Priority:** 🟡 Medium
**Complexity:** Medium (select 2–3 listings, render side-by-side table of rent, deposit, amenities, distance)

---

### #9 — Profile Edit Page
**Problem solved:** Users cannot update their name, phone number, or any profile details after onboarding.
**Why current state fails:** The `OnboardingModal` sets name/phone once. There is no `/profile` or settings page.
**Business impact:** Users who change phone numbers or want to correct their name have no recourse. This erodes trust in platform quality.
**Priority:** 🟡 Medium
**Complexity:** Low (reuse `updateProfile` mutation; build a simple settings form)

---

### #10 — Google Maps Embed on Listing Detail
**Problem solved:** Location coordinates exist in the data model but only show a placeholder icon.
**Why current state fails:** `pg.location.coordinates` is stored but never rendered. Students cannot verify the PG's location.
**Business impact:** Location verification is a core trust signal. A visible map with street view dramatically reduces "is this real?" anxiety.
**Priority:** 🟡 Medium
**Complexity:** Low (Google Maps Embed API — free tier covers typical usage; 4–8 hours of work)

---

## 4. Existing Features Review

### 4a. Authentication System

| Feature | Rating | Notes |
|---|---|---|
| Email/Password Registration | ✅ Good | Zod validation, role selection at registration. Minor gap: no email verification. |
| Phone OTP Login | ✅ Excellent | Best-in-class UX. Auto-advance, paste support, resend timer, all error states handled. |
| OnboardingModal | ✅ Good | Smart dynamic steps (phone vs email user). Minor gap: not dismissible — could feel aggressive if user just wants to browse. |
| ProtectedRoute | ⚠️ Needs Improvement | Wrong-role access silently redirects to `/dashboard` with no explanation. Should show a message. |
| Forgot Password | ❌ Missing | Critical gap. No path for email users who forget their password. |
| Email Verification | ❌ Missing | Anyone can register with any email. No ownership confirmation. |

### 4b. Homepage

| Feature | Rating | Notes |
|---|---|---|
| Hero CTA design | ✅ Good | Clean, premium dark UI. Well-structured CTAs. |
| Stats bar | 🔴 Should be redesigned | Hardcoded numbers destroy credibility the moment a user browses. Either connect to live API or remove entirely until data is real. |
| Features section | ⚠️ Needs Improvement | "Trusted Listings" and "All PGs verified" are marketing claims without backing. Misleading until verification is built. |
| Bottom CTA | ✅ Good | Auth-aware (shows Browse for logged-in users). Correct behavior. |
| No search on homepage | ❌ Missing | Users landing on the homepage cannot search by city directly. They must navigate to `/pg` first. Adding a city search bar on the hero would dramatically increase click-through. |

### 4c. PG List Page

| Feature | Rating | Notes |
|---|---|---|
| Filters (city, gender, room type, sort) | ⚠️ Needs Improvement | City is a free-text search — no autocomplete, no pre-set city buttons. Rent range filter is completely absent. Amenity filter is absent. |
| PG Card design | ✅ Good | Hover zoom on image, availability badge, amenity chips. Clean. |
| Pagination | ✅ Good | Previous/Next with page count. |
| Save from list | ✅ Good | Heart button on card, authenticated guard. |
| No "Available only" toggle | ❌ Missing | "Full" PGs pollute the browsing experience. Users must scroll past unavailable listings. |
| No rent range slider | ❌ Missing | Most critical filter for price-sensitive students. |

### 4d. PG Details Page

| Feature | Rating | Notes |
|---|---|---|
| Image gallery with thumbnail strip | ✅ Excellent | Well-implemented. Active image state, thumbnail selection. |
| Pricing card | ⚠️ Needs Improvement | Shows rent and deposit but nothing about what's included. No rent breakdown. |
| Inquiry form | ✅ Good | Message + phone, phone pre-filled from profile, toast on success. |
| "Sign in to Inquire" for unauthenticated | ✅ Good | Correct gating behavior. |
| Analytics display (views/inquiries/saves) | ⚠️ Needs Improvement | Showing this to students is a mistake. Seeing "0 inquiries" may suggest the PG has problems. This is an owner-facing metric being shown publicly. |
| Owner contact (phone/WhatsApp) | ❌ Missing | Students cannot contact the owner directly. No phone reveal, no WhatsApp link. All communication must go through the inquiry form — which the owner likely won't check. |
| Map | 🔴 Should be redesigned | Shows "Map view available" text with a pin icon. This is worse than omitting it. Either show a real map or remove this section. |
| No video tour | ❌ Missing | Video dramatically increases conversion in accommodation marketplaces. |

### 4e. Dashboard — Owner

| Feature | Rating | Notes |
|---|---|---|
| Stat cards (views, inquiries, saves) | ✅ Good | Correct metrics. Well-designed. |
| Listings table with per-listing analytics | ✅ Good | Views and inquiry count per listing. |
| Edit / Delete listing | ✅ Good | Both actions present and functional. |
| Inquiry inbox with status management | ⚠️ Needs Improvement | Status can be "Pending / Responded / Closed" but there is no way to reply in-platform. "Mark Responded" is a manual flag — it doesn't send anything to the student. |
| No vacancy quick-update | ❌ Missing | To update `availableRooms`, an owner must go through the full listing edit form (28 KB page). A quick "Update Vacancy" button would dramatically improve update frequency. |
| No push notifications | ❌ Missing | The inbox is useless if owners don't know they have new inquiries. |

### 4f. Dashboard — Student

| Feature | Rating | Notes |
|---|---|---|
| Stat cards | ⚠️ Needs Improvement | "Browse PGs: 1,200+" is hardcoded and misleading. Should show real count. |
| Saved listings | ✅ Good | Works correctly. Unsave action present. |
| My inquiries | ⚠️ Needs Improvement | Students can see the status (Pending / Responded / Closed) but cannot see any reply from the owner. "Responded" means the owner clicked a button — not that they actually said anything. |
| No inquiry history with PG details link | ⚠️ Needs Improvement | The inquiry card shows PG title but the student dashboard doesn't show the inquiry date in a meaningful way. |

---

## 5. Conversion Funnel Analysis

```
Homepage → Register/Login → Onboarding → Browse → PG Details → Inquiry → Owner Response → Booking
```

### Step 1: Homepage
- **Drop-off risk:** Hardcoded stats that don't match reality. User sees "8,500+ Happy Students" then browses to find 12 listings. Immediate trust collapse.
- **Missing:** City search bar in hero. This is a one-field addition that removes an entire navigation step.
- **Opportunity:** Add a single search input on the hero: "Search PGs in [city]…" → routes to `/pg?city=value`.

### Step 2: Registration
- **Drop-off risk:** Email-only option requires 4 fields. Phone OTP is faster but phone users have no role choice during registration (deferred to onboarding — adds friction).
- **Missing:** No social/Google login. Students already have a Google account from college; this is the most natural auth path.
- **Opportunity:** Email users don't see role selection prominently. The Select dropdown is visually identical to other inputs — it needs more visual weight (card-style like the onboarding modal).

### Step 3: Onboarding
- **Drop-off risk:** The modal is non-dismissible. A returning user who wants to browse quickly is forced through the flow. This is aggressive.
- **Friction:** Phone step asks for phone but doesn't explain *when* it will be used (for the inquiry form pre-fill). Adding 1 sentence of context here would reduce skips.
- **Opportunity:** For email users, make the phone step more compelling: "Owners respond 3× faster when you add a phone number" (this is already partially present for owners but not for students).

### Step 4: Browse PGs
- **Drop-off risk:** No rent range filter. A student with a ₹6,000 budget sees ₹15,000 listings and leaves.
- **Drop-off risk:** "Full" listings appearing in the default view waste search time.
- **Friction:** City filter is free-text. Typos return empty results. No autocomplete.
- **Opportunity:** Add a persistent "Available only" toggle (default ON). Add a price range slider. Add city autocomplete. These three changes alone will meaningfully improve time-to-first-inquiry.

### Step 5: PG Details
- **Drop-off risk:** The map is a fake placeholder. This actively reduces trust.
- **Drop-off risk:** No indication of what rent includes. Students don't inquire when they suspect hidden charges.
- **Drop-off risk:** Analytics (views/saves/inquiries) visible to students. "0 inquiries" makes a new legitimate listing look suspicious.
- **Missing trust signals:** No owner response time estimate, no verification badge, no review count.
- **Opportunity:** Showing "Owner typically responds within 2 hours" (even as a platform-level estimate for now) increases inquiry rate by reducing fear of being ghosted.

### Step 6: Inquiry Submission
- **Current state:** Working. Message + phone. Pre-fill from profile is a good touch.
- **Critical gap:** No confirmation beyond a toast. Student gets no email confirmation. Student has no way to know if inquiry was read.
- **Opportunity:** Send a confirmation email/SMS to the student: "Your inquiry to [PG name] was sent. We'll notify you when the owner responds."

### Step 7: Owner Response
- **This step is currently broken.** There is no mechanism that alerts the owner a new inquiry arrived. The owner must proactively log in, navigate to `/dashboard/inquiries`, and manually check.
- **This is where the entire funnel collapses.** No response → student moves on → marketplace has no value.
- **Fix:** SMS/WhatsApp notification to owner with inquiry details and a direct link to respond.

### Step 8: Booking
- **Does not exist.** The platform has no booking, no move-in confirmation, no tenancy agreement, no payment.
- This is appropriate for MVP. But the gap between "inquiry" and "booking" is the real user problem. Both parties go off-platform at this point.
- **Future opportunity:** A "Visit Confirmed" or "Move-In Confirmed" button that both parties can tap. This creates social proof data (conversion rates, filled rooms) and locks the relationship in-app.

---

## 6. Marketplace Strategy Analysis

### Why students would use Anei Ghar instead of WhatsApp groups

**Current honest answer: No compelling reason.**

WhatsApp groups offer:
- Real photos from real people who live there
- Honest peer reviews
- Faster responses (owners are in the group)
- Local trust (college seniors recommend specific groups)

Anei Ghar currently offers:
- A slightly prettier interface
- Filter by gender/room type
- A save feature

**To win this battle, Anei Ghar must offer things WhatsApp groups structurally cannot:**
1. **Structured, filterable data** (rent range, amenities, room type, availability) — WhatsApp is unstructured.
2. **Verified listings** — WhatsApp has no accountability.
3. **Distance to college** — No WhatsApp group shows this.
4. **Comparison** — You cannot compare 3 PGs in WhatsApp.
5. **Inquiry accountability** — WhatsApp has no tracking; Anei Ghar can show "responded within X hours."

### Why owners would use Anei Ghar instead of Facebook Marketplace

**Current honest answer: No compelling reason above Facebook's scale.**

Facebook Marketplace offers:
- Massive reach (existing user base)
- Free listing
- Instant messaging (WhatsApp/Messenger)
- Reviews via profile

Anei Ghar must offer:
1. **Qualified leads** — Students who come to Anei Ghar are looking for PGs specifically. Facebook Marketplace users are not.
2. **Structured tenant profiles** — Anei Ghar knows if the student is male/female, has a phone number, has a budget filter applied. Facebook doesn't.
3. **Analytics** — Views, saves, inquiry conversion rate per listing. Facebook Marketplace has none of this.
4. **Vacancy management** — One-click update "3 rooms available" → "1 room available." No platform does this well.

### Recommended Positioning

> "Anei Ghar is the only platform where every PG listing is verified, every inquiry reaches the owner in real time, and students can compare verified PGs side by side based on distance to their college."

This positioning is currently aspirational, not earned. It requires: verification, notifications, distance feature, and comparison. Once these are built, it is genuinely defensible.

---

## 7. Revenue Opportunities

Ranked by feasibility for an early-stage marketplace.

| Rank | Opportunity | Model | When to Launch | Notes |
|---|---|---|---|---|
| 1 | **Featured Listing Placement** | ₹499–₹999/month per listing | After 50+ listings | Owners pay for top placement in search results. Zero ops overhead. Natural first paid product. |
| 2 | **Owner Verification Service** | ₹299 one-time | After verification workflow is built | Charges owner to get the "Verified" badge. Adds trust signal. Creates immediate revenue. |
| 3 | **Premium Owner Plan** | ₹799–₹1,499/month | After 6 months | Bundle: featured placement + WhatsApp notifications + analytics + vacancy alerts. |
| 4 | **Lead Generation / Inquiry Credits** | Pay-per-lead | After 200+ active owners | Owner pays per student inquiry received. Only valid if leads are actually high quality. |
| 5 | **Background Verification for Students** | ₹199 per student | Long-term | Owners increasingly want to know who is moving in. Partnership with CIBIL or police verification services. |

**Do not launch paid features before the core funnel works.** Charging owners before notifications are built means charging for a broken product.

---

## 8. 30-Day Roadmap

Focus: Fix the broken funnel. Do not add new features until core flow works end-to-end.

| Week | Priority | Work |
|---|---|---|
| **Week 1** | 🔴 Critical | **Owner notifications** — WhatsApp (MSG91/Interakt) or email (SendGrid) when new inquiry arrives. Include inquiry message, student name, student phone. Direct link to inbox. |
| **Week 1** | 🔴 Critical | **Remove fake homepage stats** — Either connect to live API (`/api/stats`) or replace with honest messaging ("Growing fast — join early"). |
| **Week 2** | 🔴 Critical | **Forgot Password flow** — Firebase email link reset. 1–2 days of work. |
| **Week 2** | 🔴 Critical | **Rent Breakdown fields** — Add `rentIncludes` and `additionalCharges` to listing form and display on details page. |
| **Week 3** | 🟠 High | **Real Google Maps embed** — Replace placeholder with actual embed on PG details. Use free embed API. |
| **Week 3** | 🟠 High | **Available Only filter toggle** — Default ON on the browse page. |
| **Week 3** | 🟠 High | **Price range filter** — Min/Max rent on PG list page. |
| **Week 4** | 🟠 High | **Student inquiry confirmation** — Email/SMS to student after inquiry submitted: "Sent to [PG name]. Owner notified." |
| **Week 4** | 🟡 Medium | **Profile edit page** — Reuse `updateProfile` mutation. Simple settings page. |
| **Week 4** | 🟡 Medium | **Hide analytics from public** — Remove views/inquiries/saves from the public PG details page. Move to owner-only view. |

---

## 9. 90-Day Roadmap

Focus: Build the trust layer and owner activation loop.

| Month | Priority | Work |
|---|---|---|
| **Month 2** | 🔴 Critical | **Owner Verification workflow** — Upload Aadhaar/utility bill. Manual review by admin. Verified badge on listing. |
| **Month 2** | 🔴 Critical | **Availability auto-expiry** — Cron job emails owner every 30 days: "Is your vacancy still open?" One-click update link. Listings not updated in 60 days get marked "Pending Verification." |
| **Month 2** | 🟠 High | **Distance to College** — Add college/landmark proximity to listing form. Display on PG card and details ("2.3 km from NMIMS"). Google Places API. |
| **Month 2** | 🟠 High | **Quick vacancy update** — On owner dashboard, a single-click "Update Rooms" button per listing. No need to open the full edit form. |
| **Month 3** | 🟠 High | **In-app messaging thread** — Async reply model. Owner can reply to inquiry in dashboard. Student gets notification. No real-time required initially. |
| **Month 3** | 🟠 High | **PG Comparison** — Select 2–3 from saved listings, render side-by-side table. |
| **Month 3** | 🟡 Medium | **City search autocomplete** — Replace free-text city filter with autocomplete from known city list. |
| **Month 3** | 🟡 Medium | **Featured Listings (paid)** — First monetization. Featured badge, top placement. Stripe/Razorpay integration. |
| **Month 3** | 🟡 Medium | **Student rating of PG after inquiry** — "Did you visit this PG? Leave a quick rating." Builds the 4.8★ authentically. |

---

## 10. Feature Priority Matrix

```
HIGH IMPACT
    |
    |  [Owner Notifications]    [Distance to College]
    |  [Rent Breakdown]         [Verified Badge]
    |  [Availability Expiry]    [In-app Messaging]
    |  [Forgot Password]        [Real Map]
    |  [Remove Fake Stats]
    |
    |  [Price Range Filter]     [PG Comparison]
    |  [Available Only Toggle]  [City Autocomplete]
    |  [Student Confirmation]   [Quick Vacancy Update]
    |
    |  [Profile Edit Page]      [Featured Listings]
    |  [Hide Public Analytics]  [Student Rating]
    |
LOW IMPACT
    |__________________________________|_____________
                 LOW EFFORT          HIGH EFFORT
```

### Tabular View

| Feature | Impact | Effort | Priority | Do When |
|---|---|---|---|---|
| Owner WhatsApp/email notifications | 🔴 Critical | Medium | P0 | Week 1 |
| Remove hardcoded homepage stats | 🔴 Critical | Low | P0 | Week 1 |
| Forgot Password | 🔴 Critical | Low | P0 | Week 2 |
| Rent breakdown fields | 🔴 Critical | Low | P0 | Week 2 |
| Real Google Maps embed | 🟠 High | Low | P1 | Week 3 |
| Available Only toggle | 🟠 High | Low | P1 | Week 3 |
| Price range filter | 🟠 High | Low | P1 | Week 3 |
| Student inquiry confirmation | 🟠 High | Low | P1 | Week 4 |
| Owner verification + badge | 🔴 Critical | Medium | P1 | Month 2 |
| Availability auto-expiry cron | 🔴 Critical | Medium | P1 | Month 2 |
| Distance to college | 🟠 High | Medium | P1 | Month 2 |
| Quick vacancy update widget | 🟠 High | Low | P1 | Month 2 |
| In-app messaging thread | 🟠 High | High | P2 | Month 3 |
| PG Comparison feature | 🟡 Medium | Medium | P2 | Month 3 |
| City autocomplete | 🟡 Medium | Low | P2 | Month 3 |
| Featured listings (paid) | 🟡 Medium | Medium | P2 | Month 3 |
| Profile edit page | 🟡 Medium | Low | P2 | Week 4 |
| Hide public analytics | 🟡 Medium | Low | P2 | Week 4 |
| Student PG ratings | 🟡 Medium | High | P3 | Month 3+ |
| Video tour support | 🟡 Medium | High | P3 | Month 3+ |
| Google Sign-In | 🟡 Medium | Medium | P3 | Month 3+ |
| Background verification (students) | 🟢 Low | High | P4 | Month 6+ |

---

## Closing Verdict

Anei Ghar's engineering quality is solid. The UI is premium. The auth flow — especially phone OTP — is genuinely well-built. These are hard to get right and they are right.

But the product's **conversion funnel breaks at step 7** (owner response), which means everything that comes before it — registration, onboarding, browsing, inquiring — produces no outcome. A student gets a toast notification and then silence. An owner gets no signal that a lead arrived.

**Fix the owner notification pipeline in Week 1.** Everything else is secondary to that. Once an inquiry reliably reaches the owner and the owner reliably responds, Anei Ghar becomes a real marketplace. Until then, it's a beautiful dead-end.
