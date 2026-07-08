# AttendAssist

> **Track Less. Attend Smarter.**

AI-powered attendance management platform for university students.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 20, Tailwind CSS, Chart.js, Lucide Icons |
| Backend | Node.js, Express.js, MongoDB Atlas, Mongoose |
| AI | Google Gemini API |
| Auth | JWT (httpOnly cookies), Google OAuth 2.0 |
| Hosting | Vercel (frontend), Render (backend) |

---

## Project Structure

```
attendassist/
├── backend/       Express.js REST API
├── frontend/      Angular 20 SPA
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB Atlas account (or local MongoDB)
- Google Cloud project with OAuth credentials
- Gemini API key

### Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in your environment variables in .env
npm install
npm run dev
```

Server starts on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
ng serve
```

App starts on `http://localhost:4200`

---

## Environment Variables

See `backend/.env.example` for required configuration.

---

## License

Private — All rights reserved.
# attendassist
