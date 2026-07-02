# தேசிய உரிமைகள் களம் - நுகர்வோர் அமைப்பு (National Rights Forum)

A comprehensive, full-stack web application designed to manage the operations, memberships, and media of the **National Rights Forum & Consumer Forum**. This application serves as both a public portal for the organization and a powerful management dashboard for its administrators.

## 🚀 Features

### Public Portal
- **Landing Page:** Showcases the organization's vision, objectives, leadership (தலைவர்கள்), wings (அணிகள்), and media gallery.
- **Bilingual Support:** Full support for Tamil (தமிழ்) and English, ensuring accessibility for all users.
- **Member Registration:** A robust public registration form with:
  - Automated translation of member details to Tamil (powered by Google Gemini).
  - Built-in photo capture using webcam/device camera.
  - Automatic digital ID card generation upon successful registration.
- **Digital Card Renewal:** Members can search for their details and renew their membership cards digitally.

### Admin Dashboard
- **Member Management:** View, edit, update, and manage all registered members.
- **Real-time Synchronization:** Live data updates across all clients using Supabase Realtime.
- **Officers & History:** Manage current officers across different wings and districts, and maintain a historical record of past officers.
- **Media & Wings Management:** Upload and manage photos/videos in the media gallery, and update wing descriptions.
- **ID Resequencing & Appointment Letters:** Admins can regenerate sequential member IDs and download official appointment letters for officers.

## 🛠 Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, Lucide React (Icons).
- **Backend:** Node.js, Express.js (integrated into a single full-stack setup via `tsx` and `esbuild`).
- **Database:** Supabase (PostgreSQL) handling CRUD operations, Row Level Security, and Realtime subscriptions.
- **AI & Translation:** Google GenAI SDK (Gemini) for high-quality, contextual English-to-Tamil translations.
- **Utilities:** `html2canvas` and `html-to-image` for generating and downloading pixel-perfect ID cards and appointment letters.

## 📁 Project Structure

```text
├── src/
│   ├── components/      # React components (AdminPanel, RegistrationModal, Cards, etc.)
│   ├── db/              # Database schema and utilities
│   ├── lib/             # API clients and services (Supabase Client, DB Service)
│   ├── pages/           # Main application pages (LandingPage)
│   ├── App.tsx          # Main React Application router/entry
│   ├── data.ts          # Constants, predefined wings, districts, leaders
│   ├── types.ts         # TypeScript interfaces and types
│   └── index.css        # Global Tailwind CSS entry
├── server.ts            # Express backend (API routes, Vite middleware, Image proxy)
├── supabase-schema.sql  # Supabase database schema definition and RLS policies
├── .env.example         # Required environment variables
└── package.json         # Project dependencies and scripts
```

## ⚙️ Environment Variables

To run the project, create a `.env` file based on `.env.example`:

```env
# Server Configuration
PORT=3000

# Google Gemini API for translations
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 🚀 Running Locally

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start Development Server:**
   This will start both the Express backend and the Vite frontend on port `3000`.
   ```bash
   npm run dev
   ```

3. **Production Build:**
   This bundles the frontend via Vite and the Express server via ESBuild into a single executable `server.cjs`.
   ```bash
   npm run build
   ```

4. **Start Production Server:**
   ```bash
   npm run start
   ```

## 🗄️ Database Setup (Supabase)

The application uses Supabase as its primary database. To initialize your Supabase instance, execute the SQL script provided in `supabase-schema.sql` in your Supabase SQL Editor. This will create the required tables (`memberships`, `officers`, `officer_history`, `media`, `wings`, `leaders`) and enable Realtime functionality.
