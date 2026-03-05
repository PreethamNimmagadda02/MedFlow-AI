# MedFlow AI — Hospital Management System

> **⚠️ Prototype / Demo Only** — Synthetic data, no real PHI/PII. Not intended for clinical use.

MedFlow AI is a modern, AI-enabled hospital management demo built with React, TypeScript, and Tailwind CSS. It demonstrates patient registration, appointment scheduling, and AI-assisted triage/diagnostics using deterministic mock APIs.

---

## ✨ Features

### 1. Patient Registration
- Form with validation (name, DOB, sex, phone, email, address, allergies/conditions/medications)
- Duplicate detection by phone/email with user-friendly resolution ("View Existing Patient" / "Register Anyway")
- Chip-based input for multi-value medical fields
- Zod schema validation with accessible error messages

### 2. Appointment Scheduling
- Search/filter providers by specialty and name
- Timezone-aware time slot selection (IST / Asia/Kolkata)
- Booking modal with patient selection and reason
- Reschedule and cancel with confirmation modals (`PATCH /api/appointments/:id` mock)
- Tabbed view: Scheduled / Completed / Cancelled

### 3. AI Triage & Diagnostics (Mock)
- Symptom input via free text **and** tag chips
- Vitals entry (temperature, HR, BP, SpO₂)
- Pain scale slider (0–10), onset tracking
- Optional file upload with type/size validation (JPEG, PNG, WebP, PDF ≤ 5MB)
- **Deterministic** triage engine mapping symptoms → urgency, differentials, guidance
- Mock chest X-ray AI diagnostics with file validation (images ≤ 10MB)
- Prominent disclaimer banners

### 4. Clinician Dashboard
- Today's appointment overview with stat cards
- Date and provider filters
- Expandable AI triage results per appointment

---

## 🛠 Technology Stack

| Layer | Technology |
|---|---|
| Framework | [React 19](https://react.dev) + [TypeScript](https://typescriptlang.org) |
| Build | [Vite 7](https://vite.dev) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Forms | [React Hook Form](https://react-hook-form.com) + [Zod v4](https://zod.dev) |
| Data | [TanStack Query v5](https://tanstack.com/query) |
| Routing | [React Router v7](https://reactrouter.com) |
| Icons | [Lucide React](https://lucide.dev) |
| Testing | [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com) |
| Font | [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Install & Run
```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will be available at **http://localhost:5173**.

### Production Build
```bash
npm run build
npm run preview
```

### Run Tests
```bash
# Run all tests
npx vitest run

# Run with watch mode
npx vitest
```

---

## 🧪 Tests

25 unit tests across 4 test suites covering all mock API layers:

| Suite | Tests | What's Covered |
|---|---|---|
| `patients.test.ts` | 7 | CRUD, duplicate phone/email detection (case-insensitive), skipDuplicateCheck |
| `providers.test.ts` | 6 | List, filter by specialty/name, find by ID, unique specialties |
| `appointments.test.ts` | 5 | CRUD, filter by status, cancel, reschedule |
| `triage.test.ts` | 7 | Urgency levels (Low/Medium/High/Critical), determinism, output contract, diagnostics |

```
npx vitest run
 ✓ src/test/triage.test.ts (7 tests) 3ms
 ✓ src/test/providers.test.ts (6 tests) 2ms
 ✓ src/test/patients.test.ts (7 tests) 3ms
 ✓ src/test/appointments.test.ts (5 tests) 3ms

 Test Files  4 passed (4)
      Tests  25 passed (25)
   Duration  686ms
```

---

## 📁 Project Structure

```
src/
├── api/                    # Mock API layer
│   ├── types.ts            # TypeScript interfaces
│   ├── mockData.ts         # Seed data (patients, providers, appointments)
│   ├── patients.ts         # Patient CRUD + duplicate detection
│   ├── providers.ts        # Provider search & filtering
│   ├── appointments.ts     # Appointment CRUD, reschedule, cancel
│   ├── triage.ts           # Deterministic AI triage engine
│   └── hooks.ts            # TanStack Query hooks with simulated delays
├── components/
│   ├── Layout.tsx           # App shell (sidebar, responsive nav)
│   └── ui/                  # Reusable UI components
│       ├── Button.tsx       # Variants, sizes, loading state
│       ├── Card.tsx         # Glassmorphism, hover effects
│       ├── Badge.tsx        # Status & urgency variants
│       ├── Modal.tsx        # Accessible modal with focus trap
│       ├── Toast.tsx        # Notification system
│       ├── Input.tsx        # Input, Select, Textarea with ARIA
│       ├── ChipInput.tsx    # Tag-based multi-value input
│       └── Disclaimer.tsx   # AI disclaimer banner
├── i18n/
│   └── en.ts               # Externalized i18n strings (all UI text)
├── pages/
│   ├── Dashboard.tsx        # Clinician overview
│   ├── Patients.tsx         # Patient list with search
│   ├── PatientRegister.tsx  # Registration form
│   ├── PatientDetail.tsx    # Patient profile & history
│   ├── Scheduling.tsx       # Provider search & slot booking
│   ├── Appointments.tsx     # Tabbed appointment management
│   └── Triage.tsx           # AI triage form & results
├── test/                    # Unit tests (Vitest)
│   ├── setup.ts
│   ├── patients.test.ts
│   ├── providers.test.ts
│   ├── appointments.test.ts
│   └── triage.test.ts
├── App.tsx                  # Route definitions (React.lazy code-splitting)
├── main.tsx                 # Entry point with providers
└── index.css                # Tailwind config & design tokens
```

---

## 🔧 Mock API Contracts

All APIs are **deterministic** — no external calls, no randomness.

### `patients.ts`
| Function | Contract |
|---|---|
| `getPatients()` | Returns all patients (in-memory array) |
| `getPatient(id)` | Returns patient by ID |
| `createPatient(input)` | Creates patient; returns `{ success: false, error: DuplicateError }` if phone/email exists, unless `skipDuplicateCheck: true` |

### `providers.ts`
| Function | Contract |
|---|---|
| `getProviders(filters?)` | Filter by `specialty` and/or `name` (case-insensitive substring match) |
| `getProvider(id)` | Returns provider by ID |
| `getSpecialties()` | Returns unique sorted specialty list |

### `appointments.ts`
| Function | Contract |
|---|---|
| `getAppointments(filters?)` | Filter by `patientId`, `providerId`, `status`, `date` |
| `createAppointment(input)` | Creates with status `Scheduled` |
| `rescheduleAppointment(id, newStart)` | Updates start time, keeps `Scheduled` status |
| `cancelAppointment(id)` | Sets status to `Cancelled` |

### `triage.ts` (Deterministic Mock AI)
| Function | Contract |
|---|---|
| `postTriage(input)` | Maps symptom keywords → urgency level, differentials, guidance, explanation. No LLM/external API. |
| `postDiagnostics(input)` | Returns mock chest X-ray analysis with confidence and next steps |

Triage urgency mapping:
- **Critical**: temp ≥ 40°C OR SpO₂ < 90% OR HR > 130
- **High**: chest pain (age > 45 or HR > 100), respiratory with SpO₂ < 95%
- **Medium**: fever + sore throat, abdominal pain, respiratory with normal SpO₂
- **Low**: headache, mild/general symptoms

---

## ♿ Accessibility

### Landmarks
- `<main>` — page content region
- `<nav>` — sidebar navigation with `aria-label="Main navigation"`
- `<aside>` — sidebar container
- `<header>` — mobile top bar
- `<fieldset>` / `<legend>` — form sections

### Keyboard Navigation
- All interactive elements reachable via Tab
- Modal focus trapping (Tab/Shift-Tab cycle within)
- Escape key dismisses modals
- NavLinks respond to Enter/Space

### ARIA & Forms
- `aria-label` on icon buttons and filters
- `aria-required` on form fields
- `role="alert"` on error/duplicate messages
- Error messages linked to inputs via `aria-describedby`

### Contrast
- Custom Tailwind tokens (surface-900 on surface-50) meeting WCAG AA
- Urgency badges: distinct colors per level (green/amber/red/purple)

---

## ⚡ Performance

### Code Splitting
All page routes use `React.lazy()` + `Suspense` for automatic code splitting:

```
dist/assets/index.js          292.00 kB  (core + shared components)
dist/assets/Dashboard.js        7.41 kB  (loaded on demand)
dist/assets/Scheduling.js       8.70 kB  (loaded on demand)
dist/assets/Triage.js          10.62 kB  (loaded on demand)
dist/assets/Appointments.js     6.01 kB  (loaded on demand)
...
```

Initial bundle is **292 KB** (93 KB gzipped), down from 437 KB without splitting.

### Optimizations
- CSS processed by Tailwind v4 (tree-shaken, 7 KB gzipped)
- Vite production build with minification and tree-shaking
- Simulated API delays (200–2000ms) with loading skeletons
- No external API calls — all data is in-memory

---

## 🔒 Security & Privacy

- **No API keys or secrets** in the frontend bundle
- **No PII logging** — zero `console.log` statements in source code
- **File validation** — client-side type and size checks:
  - Triage uploads: JPEG, PNG, WebP, PDF ≤ 5MB
  - X-ray uploads: JPEG, PNG, WebP ≤ 10MB
- **Synthetic data only** — prominent disclaimer banners on AI pages and sidebar
- **No external network calls** — all APIs are in-memory mocks

---

## 🌐 i18n

All user-facing strings are externalized to `src/i18n/en.ts` (150+ strings):
- App chrome (title, subtitle, disclaimer)
- Navigation labels
- Form labels, placeholders, error messages
- Status labels, filter options
- AI output headings and descriptions

To add a new language, create a new file (e.g., `hi.ts`) with the same structure and swap the import.

---

## 📱 Responsive Design

- **360px–1920px** tested
- Collapsible sidebar with hamburger menu on mobile
- Grid layouts collapse to single column on small screens
- Touch-friendly button targets (min 44×44px)

---

## 📄 License

MIT — This is a demo/prototype project.
