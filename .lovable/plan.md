# Patient Experience Unification Plan

Goal: turn the scattered patient pages into one coherent journey — **Discover → Estimate → Match → Inquire → Book → Track** — with consistent navigation, visual language, and data flowing between features.

---

## 1. Navigation & Routing Consistency

**Navbar (`src/components/layout/Navbar.tsx`)**
- Reorder primary links into the patient journey: `Home · Hospitals · Treatments · Cost Estimator · AI Analysis · Visa`.
- Remove the duplicated "Dashboard" link from primaryLinks (it already exists as a right-side button).
- Move AI search pill to act as a global shortcut, not a primary link duplicate.
- Add a single "More" dropdown for: How It Works, Success Stories, Pricing, Blog, Support, About, Contact.
- Mobile sheet: group links into sections (Explore / Tools / Account) instead of one flat list.

**Footer (`src/components/layout/Footer.tsx`)**
- Audit every link → confirm route exists in `App.tsx`. Add `/cost-estimator`, `/patient/ai-analysis` to "For Patients".
- Replace dead/duplicate hospital portal links with clearer labels ("Hospital Login", "List Your Hospital").

**Route map sanity pass (`src/App.tsx`)**
- Verify every link in Navbar/Footer/Dashboard resolves; redirect legacy paths if any.

---

## 2. Homepage Flow & Section Ordering

`src/pages/Index.tsx` reordered to follow the patient mental model:

```text
1. Hero (search + value prop)
2. How It Works (3-step trust primer)        ← moved up
3. Treatment Categories
4. Featured Hospitals (verified + active)
5. Cost Estimator (preview → CTA to /cost-estimator)
6. AI Analysis teaser (CTA to /patient/ai-analysis)  ← new compact band
7. Testimonials / Success stats
8. Newsletter
```

Each section gets a consistent header pattern (eyebrow + H2 + one-line subhead) and the same vertical rhythm (`py-16 md:py-24`).

---

## 3. Cross-Feature Integration (the key fix)

Make the four "smart" tools talk to each other instead of being islands.

- **AI Analysis → Cost Estimator**: already partially wired. Pass detected condition + severity via query params or a shared `sessionStorage` key (`mediconnect:patientContext`). Estimator pre-fills treatment + complexity.
- **Cost Estimator → Hospitals**: "See hospitals offering this" button on the final estimate filters `/hospitals?treatment=<id>&budget=<range>`.
- **Hospital profile → Inquiry**: "Get exact quote" passes the estimator context into the inquiry form so hospitals see the AI-derived condition + budget upfront.
- **Inquiry → Patient Dashboard**: confirmation toast + direct link to `/patient/inquiries`; dashboard "Recent Inquiries" card surfaces it immediately.
- **Patient Dashboard Quick Actions**: replace generic buttons with journey-stage CTAs (Run AI Analysis, Estimate Costs, Find Hospitals, View Inquiries, Track Visa).

Implementation: a tiny shared util `src/lib/patientContext.ts` (get/set/clear) used by all four surfaces. No backend changes.

---

## 4. Visual / Design Consistency

Enforce the premium light aesthetic already in memory:

- **Card system**: pick one — `glass-card` for elevated/interactive, plain `Card` for content. Stop mixing `.premium-card` with gradient utilities (the bug we hit on Cost Estimator).
- **Section headers**: shared `<SectionHeader eyebrow title subtitle />` component → use across Home, Cost Estimator, Hospitals list, Dashboard.
- **Spacing scale**: standardize on `container mx-auto px-4` + `py-16 md:py-24` for marketing sections; `py-8` for app sections.
- **CTA hierarchy**: one primary button per section, secondary outline for "Learn more". Audit Hero, Estimator, Hospital cards.
- **Trust badges row** (NABH/JCI/ISO) reused on Home hero, Hospital cards, Cost Estimator final stage — single component.

---

## Files to Touch

| Area | Files |
|---|---|
| Nav/Footer | `src/components/layout/Navbar.tsx`, `Footer.tsx` |
| Homepage | `src/pages/Index.tsx`, `src/components/home/*` (light tweaks for ordering + section header) |
| Integration | new `src/lib/patientContext.ts`; edits to `src/components/ai/AnalysisResults.tsx`, `src/pages/CostEstimator.tsx`, `src/components/home/CostEstimator.tsx`, `src/pages/Hospitals.tsx`, `src/pages/PublicHospitalProfile.tsx`, inquiry form |
| Dashboard | `src/components/patient/dashboard/QuickActions.tsx` |
| Shared UI | new `src/components/shared/SectionHeader.tsx`, `TrustBadges.tsx` |

No DB migrations, no new backend, no business-logic changes — pure frontend coherence pass.

---

## Out of Scope (this round)

- Hospital, Admin, Agent portal redesigns
- New features or AI model changes
- Auth/onboarding flow changes

Want me to proceed with this, or trim/expand any section first?