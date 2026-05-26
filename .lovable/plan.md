
# MediConnect Improvement Plan

Grouped into 5 waves so each ships independently. You can stop after any wave.

---

## Wave 1 — Trust, Legal & SEO foundations (quick wins)

**1. Cookie consent banner**
- Bottom-right floating banner with Accept All / Reject Non-Essential / Customize
- Stores choice in `localStorage` (`mc_cookie_consent`)
- Gates analytics scripts behind acceptance
- Reusable `CookieConsent.tsx` mounted in `App.tsx`

**2. SEO meta tags (per-route)**
- Install `react-helmet-async`, wrap app in `HelmetProvider`
- Create `<SEO>` helper component (title, description, canonical, og:*)
- Add to: Index, Hospitals, Treatments, HowItWorks, About, PublicHospitalProfile, Privacy/Terms/Cookies/Refund/MedicalDisclaimer, Auth
- Per-hospital pages: dynamic title `{hospital.name} — Treatments & Reviews | MediConnect`
- JSON-LD: `MedicalOrganization` sitewide in `index.html`, `Hospital` schema on hospital pages, `FAQPage` on Support

**3. sitemap.xml + robots.txt polish**
- Generate static `public/sitemap.xml` listing public routes
- Update `robots.txt` with `Sitemap:` directive

**4. Trigger SEO scan**
- After wave ships, run `seo--trigger_scan` to verify

---

## Wave 2 — Landing & Conversion polish

**1. Live trust strip in Hero**
- Counters pulled from DB: verified hospitals count, completed bookings, countries served, average rating
- New hook `useTrustStats()` querying `hospitals`, `bookings`, `reviews` aggregates
- Animated count-up on scroll into view

**2. Sticky mobile CTA**
- Bottom-fixed "Get Free Quote" bar on `/` for mobile (<sm)
- Hides on scroll-up of hero, reappears after

**3. Treatment cost estimator widget**
- Small interactive card on landing: pick treatment → see avg India price vs origin-country price
- Static comparison data seeded in a new `treatment_cost_estimates` table

**4. Currency selector**
- Header dropdown (USD/EUR/GBP/AED/INR), stored in localStorage + context
- Hospital cards & package prices read from context and convert via static rate map (admin-editable later)

---

## Wave 3 — Patient & Hospital experience

**1. Patient document UX upgrade**
- Thumbnail previews for uploaded reports (PDF first-page render + image preview)
- Upload progress + per-file status (uploading / scanning / verified)
- AI summary chip when `analyze-report` edge function returns results

**2. Per-hospital consent log**
- New table `medical_data_consents` (patient_id, hospital_id, granted_at, revoked_at, scope)
- Explicit consent modal before first document share to a hospital
- Patient can revoke from Profile → Privacy tab

**3. Notification center upgrade**
- In-app bell already exists — add email triggers (booking confirmed, visa stage change, new message) via existing edge functions pattern
- User notification preferences page

**4. Hospital response-time SLA**
- Track `first_response_at` on inquiries
- Show "Avg response: 4h" badge on hospital cards
- Admin dashboard widget for slow responders

**5. Saved replies for hospital inquiries**
- New `hospital_quick_replies` table
- Insert into reply textarea via dropdown

---

## Wave 4 — Security, compliance & admin

**1. Run security scans**
- `supabase--linter` + `security--run_security_scan`
- Fix all surfaced findings (RLS gaps, exposed columns)
- Update `security-memory`

**2. Audit log for medical document access**
- New `document_access_log` table (document_id, accessed_by, accessed_at, action)
- DB trigger or edge-function gateway records every read
- Admin viewer at `/admin/audit-log`

**3. 2FA for hospital & admin accounts**
- Enable Supabase TOTP MFA
- Enrollment UI in Hospital and Admin profile pages
- Required at next login for those roles

**4. Rate limiting on AI endpoints**
- Add per-user request counter (last 60s) in `analyze-report`, `medical-chat`, `ai-hospital-search`
- Store counts in a small `ai_usage_log` table, reject when threshold exceeded

**5. Hospital quality scorecard**
- Composite score: avg rating, response time, completion rate, dispute count
- Visible to admin; shown as star + tier badge on public profile

---

## Wave 5 — Performance, PWA, i18n

**1. Image optimization**
- Lazy-load all hospital/treatment card images (`loading="lazy"`)
- Use `<img srcSet>` for hero & hospital banners
- Compress assets in `src/assets/`

**2. Real PWA offline**
- Update `sw.js` to cache: app shell, saved hospital pages, last inquiries
- Show offline banner when navigator.onLine === false

**3. Web push notifications**
- Wire service worker to Supabase Realtime → `Notification.requestPermission`
- New `push_subscriptions` table

**4. i18n coverage audit**
- Script: scan source for hard-coded English strings missing from `en.json`
- Fill gaps in ar/es/fr
- Add RTL CSS for Arabic (`dir="rtl"` on body when lang=ar, mirror flex layouts where needed)

---

## Technical notes

- New DB tables (Wave 2–4): `treatment_cost_estimates`, `medical_data_consents`, `hospital_quick_replies`, `document_access_log`, `ai_usage_log`, `push_subscriptions` — all RLS-protected; one migration per wave.
- New edge functions: `send-notification-email`, `rate-limit-check` (or inline in existing functions).
- No third-party paid services added — uses existing Supabase + Lovable AI Gateway.
- Each wave is independently shippable; no wave depends on a later one.

---

## Suggested order

Ship Wave 1 first (lowest risk, highest legal/SEO value), then ask which of 2–5 to prioritize next based on whether your bottleneck is **conversions** (Wave 2), **operations** (Wave 3), **compliance** (Wave 4), or **scale/reach** (Wave 5).
