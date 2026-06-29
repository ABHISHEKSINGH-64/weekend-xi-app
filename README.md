# Weekend XI 🏏
> **One Tap. One Team. Every Weekend.**

Weekend XI is a premium, responsive full-stack web application custom-designed for PG (Hostel) residents to organize weekend cricket matches without cluttering WhatsApp groups or making endless phone calls. Built with React, Node.js, Express, MongoDB, and Socket.IO, it synchronizes registrations, match check-ins, stats, and admin announcements in real time.

---

## Features
- **Zero-signup Player Portals:** Residents check in using their Name and Room Number. The application auto-generates their unique `Access Code` on the fly.
- **Double-check in Protection:** Room numbers can only be claimed by one unique player name, preventing duplicates.
- **Interactive Match Progress:** View real-time player check-ins against a progress bar. If 10 or more players select **I'M IN**, the status updates to `🎉 Match Confirmed!`.
- **Dynamic Countdown Clocks:** Real-time clock displays days, hours, minutes, and seconds remaining.
- **Admin Control Panel:** Dedicated dashboard at `/admin` for administrators to schedule next matches, post/edit announcements, cancel matches, reset responses, and monitor live stats.
- **Local Network Support:** Resolves base APIs dynamically so users can connect directly using phone browsers on the local Wi-Fi.

---

## Tech Stack
- **Frontend:** React (Vite), React Router, Tailwind CSS, Framer Motion, React Icons, Axios, Socket.IO Client.
- **Backend:** Node.js, Express, Socket.IO.
- **Database:** MongoDB (Mongoose).
- **Authentication:** Custom Access Code & JSON Web Tokens (JWT) preserved in `localStorage`.

---

## Project Structure
```
CRICKET/
├── client/                     # Frontend React SPA
│   ├── src/
│   │   ├── components/        # Reusable UI elements (Navbar, GlassCard, etc.)
│   │   ├── context/           # Global Contexts (Auth, Socket, Toast)
│   │   ├── hooks/             # Custom Hooks (useCountdown)
│   │   ├── pages/             # Route pages (Home, Login, AdminLogin, Dashboard, AdminDashboard)
│   │   ├── services/          # API Services (Axios wrappers)
│   │   ├── utils/             # General helpers (Avatar, Access Code generator)
│   │   └── index.css          # Styling & Glassmorphism definitions
│   └── tailwind.config.js     # Tailwind Configuration
│
└── server/                     # Backend Node/Express Server
    ├── config/                # MongoDB configuration
    ├── controllers/           # Auth, Match, and Response logic
    ├── middleware/            # JWT validator & role guards
    ├── models/                # User, Match, and Response models
    ├── routes/                # Express Route handlers
    ├── .env                   # Configuration variables (DB URI, Secrets, Admin Details)
    └── server.js              # Server and Socket.IO entry point
```

---

## Setup & Run Instructions

### 1. Prerequisite
Ensure you have Node.js and MongoDB installed and running on your system.

### 2. Configure Environment Variables
Create or verify the `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/weekend-xi
JWT_SECRET=super_secret_weekend_xi_jwt_token_key_123!
ADMIN_NAME=Admin
ADMIN_ACCESS_CODE=ADMIN123
```

### 3. Run Backend Server
```bash
cd server
npm install
npm run dev
```
*Note: The server will automatically connect to MongoDB and seed the initial Admin account based on the `.env` variables if one does not already exist.*

### 4. Run Frontend Client
```bash
cd client
npm install
npm run dev
```

### 5. Accessing on Local Network
Residents can access the app from their mobile phones over PG Wi-Fi:
1. Find the host computer's local IP address (e.g. `192.168.1.15`).
2. Open phone browser and navigate to `http://<host-ip>:5173`.
3. The app will automatically connect to the backend running at `http://<host-ip>:5000` via dynamic base URL resolving!
