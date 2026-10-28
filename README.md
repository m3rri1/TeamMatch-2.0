# TeamMatch

A skill-based team matching platform. People build a profile (skills, interests,
goals), discover compatible teammates, send connection requests and chat.

**Stack:** React 19 + Vite (frontend) · Express + MongoDB/Mongoose (backend)

## Getting started

```bash
# 1. Frontend
cp .env.example .env
npm install
npm run dev            # http://localhost:5173

# 2. Backend (separate terminal)
cd server
cp .env.example .env   # fill in MONGO_URI, PORT and JWT_SECRET
npm install
npm run dev
```

| Script           | Purpose                          |
| ---------------- | -------------------------------- |
| `npm run dev`    | Start the Vite dev server        |
| `npm run build`  | Production build                 |
| `npm run lint`   | Run ESLint                       |
| `npm run format` | Format `src/` with Prettier      |

## Project structure

```
src/
├── App.jsx                  # App state + page routing only
├── main.jsx
├── components/common/       # Reusable UI: Screen, Field, Choice, ChoiceGrid, ProfileSection
├── pages/
│   ├── Auth/                # Login / sign-up
│   ├── Home/                # Landing page
│   ├── Onboarding/
│   │   ├── OnboardingPage.jsx   # Shell: sidebar, progress, navigation
│   │   └── steps/               # One component per onboarding step (01–14)
│   ├── Profile/             # Profile review/edit
│   ├── Discover/            # Find & connect with teammates
│   ├── Requests/            # Incoming / outgoing connection requests
│   ├── Chat/                # Messaging
│   └── Feedback/
├── services/api.js          # fetch wrapper + auth token + profile sync
├── utils/                   # age, image resize, profile localStorage helpers
├── data/                    # skills, interests, demo profiles, empty profile
├── constants/storageKeys.js # localStorage keys
├── config/env.js            # API base URL (VITE_API_BASE_URL)
└── styles/App.css

server/
├── server.js
└── models/                  # User, Profile, Connection, Message
```

## Environment variables

Secrets live in `.env` files, which are git-ignored. Copy the `.env.example`
files and fill in real values. **Never commit a real `.env`.**
