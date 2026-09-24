# TRUPTI 🪷✨ — Love Meter

A tiny, beautiful place for today's feeling.

## Features

- **Live Daily Percentage**: Minimal interactive circular progress indicator with gentle petal physics.
- **Dynamic Messages**: Contextual heartfelt reactions corresponding to percentage feelings.
- **History & Memory Lane**: View daily entries, streaks, and trends.
- **Under Maintenance Window**:
  - Aesthetic frosted glass overlay with live progress indicator.
  - Interactive "Check Live Status" check.
  - Owner / Secret Passcode access to bypass maintenance window.
  - Fully controllable from the Admin Dashboard with 1-click toggle and customizable announcement copy.
- **Role-Based PIN Authentication**:
  - Trupti PIN (`1603`): Update daily percentage & note.
  - Admin PIN (`0609`): Admin dashboard, manage history, clear records, and toggle/configure Maintenance Mode.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Environment Variables

See `.env.example` for reference:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_TRUPTI_PIN` (default: 1603)
- `NEXT_PUBLIC_ADMIN_PIN` (default: 0609)
- `NEXT_PUBLIC_MAINTENANCE_MODE` (default: true)
