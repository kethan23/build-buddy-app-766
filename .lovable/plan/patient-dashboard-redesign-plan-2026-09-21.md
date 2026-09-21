# Patient Dashboard Redesign Plan

## Goal
Replace the current discovery-style dashboard with a concise **My Medical Journey** view that answers: current progress, one next action, upcoming appointment, submitted requests/documents, and support.

## What will change

### 1. Patient-specific header
- Show a time-aware greeting using the patient's saved name.
- Use the short supporting line: “Let's keep your medical journey moving.”
- Remove the promotional banner, decorative orbs, statistics, and dashboard tabs.

### 2. My Medical Journey
- Build one responsive five-stage tracker: **Medical Need → Consultation → Treatment Plan → Travel → Treatment**.
- Derive completed/current/upcoming states from the patient's real journey record, inquiries, bookings, and appointments.
- Keep each stage concise and make the current stage visually prominent.
- Show one contextual status sentence and one relevant action.
- Use a vertical, no-horizontal-scroll presentation on small screens and a horizontal presentation on wider screens.

### 3. One clear next step
- Derive a single priority action from real data:
  1. no activity → Start Medical Assistance
  2. no medical documents → Upload Reports
  3. inquiry awaiting consultation → View Consultation / Requests
  4. no hospital request → View Hospitals
  5. confirmed next appointment → View Appointment
  6. active treatment/travel → View Journey
  7. completed state → View Treatment Details
- Never show competing primary actions.

### 4. Upcoming appointment
- Show only the nearest future booking/appointment with its actual hospital, date, time, format, and status.
- Provide View Details and Join Consultation only when the saved data supports those actions.
- When absent, use one compact empty row with a Find a Doctor action rather than a large card.

### 5. My Requests and My Documents
- Replace large inquiry/booking cards with compact lists using actual records only.
- Requests will identify the real request type, hospital/treatment, status, and link to the appropriate details page or inbox.
- Documents will group actual uploads into Medical Reports, Prescriptions, Scans/Lab Results, Treatment Documents, and Other.
- Link document actions to the existing Profile → Documents area; no duplicate upload system or database structure.

### 6. Small utility areas
- Add four compact actions only: Find a Hospital, Find a Doctor, Upload Reports, Get Help.
- Add a subtle support row linked to the existing unified patient inbox/support flow.
- For a patient with no activity, show a useful welcome state with one primary action and two restrained discovery links.

## Technical details
- Replace the contents of the existing patient dashboard and split focused display sections into small dashboard components where useful.
- Reuse the existing authentication context, Supabase client, `profiles`, `patient_journey_tracking`, `inquiries`, `bookings`/appointments, `documents`, hospitals, and existing routes.
- Fetch dashboard data together, show a calm loading state, and handle partial query failures without blanking the page.
- Preserve the global navigation, routing, authentication, database, Home, Hospitals, Messages, and Profile pages.
- Do not add migrations, mock patient data, promotional content, generic hospital/doctor listings, platform statistics, or new backend systems.

## Validation
- Verify signed-in patient behavior with real session data.
- Test new-patient and active-patient empty/populated states.
- Check desktop at 1280px and mobile at 390px for readable hierarchy, no overlap, and no horizontal scrolling.
- Confirm all dashboard actions reach existing working destinations and the preview reports no build/runtime errors.
