# Site-wide UX Clarity Pass

## Goal
Make every page easier to understand without removing, replacing, or rebranding anything. This pass only reorders, groups, spaces, and labels existing elements.

## Guardrails
- Keep every existing section, card, button, form field, filter, image, color, and feature.
- No new visual style, no new colors or fonts, and no changes to data or login.
- Add as little as possible: short page intros, breadcrumbs, and group headings only.

## Changes by page

### 1. Homepage
- Reorder the sections so visitors first understand the service, then find, explore, and act:
  Hero (search) → How It Works → Treatment Categories → Featured Hospitals → Cost Estimator → Testimonials → Newsletter
  becomes
  Hero → How It Works → Treatment Categories → Featured Hospitals → Testimonials (trust) → Cost Estimator (take action) → Newsletter.
- Space sections consistently and give each section one short heading and one line of explanation.

### 2. Patient Dashboard (keep all current parts)
- Group the current parts under two clear headings:
  - **Your current journey**: journey progress, next step, requests, upcoming appointment, treatment status.
  - **Manage**: messages, documents, payments, support, quick actions.
- Put the next step at the top as the main button. All other buttons use the secondary style.
- Add a Payments link inside the Manage group. The Payments page already exists.

### 3. Hospital Directory and Treatments
- Put each page in this order: heading, one-line purpose, search and filters, results count and sorting, results.
- Make the main action on each card look the same everywhere. For example, "View Hospital" is the main button and "Compare" and "Get Quote" are secondary.

### 4. Hospital Profile
- Put the basics first: name, location, rating, and verification badges.
- Then show the main actions (Request Consultation / Get Quote) in one fixed spot: the sidebar on desktop and a sticky bar on mobile.
- Keep the tab order: About → Doctors → Packages → Reviews → Gallery.
- Add a breadcrumb: Home › Hospitals › [Hospital name].

### 5. Navigation
- Keep all current menu items. Highlight the page the user is on, and use the same names in the menu and page headings.
- Add breadcrumbs to Hospital Profile, Treatments, Compare, Cost Estimator, and the patient pages (Dashboard › Requests, and so on).

### 6. Forms (inquiry, quote, profile)
- Group fields into short labeled parts: About you, Medical need, and Preferences/travel.
- Add helpful placeholder and hint text. Required fields stay required.

## Technical details
- Use one small shared breadcrumb built on the existing breadcrumb UI component and a shared page-intro pattern that reuses the existing SectionHeader.
- Files touched: Index.tsx, patient/Dashboard.tsx, Hospitals.tsx, Treatments.tsx, PublicHospitalProfile.tsx, Compare.tsx, CostEstimator.tsx, patient Inquiries/Bookings/Payments/Profile page headers, and Navbar active state (styling only).
- No database, route, or login changes.

## Validation
- Check the desktop (1280px) and mobile (390px) layouts for every changed page: no horizontal scrolling, a clear main action, and no missing elements compared with before.
- Confirm the build is clean and every button still reaches the same place.
