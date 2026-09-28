# GovInfra360 - National Infrastructure Ledger

GovInfra360 is a comprehensive, full-stack infrastructure tracking platform designed for government administrators to monitor, manage, and update public infrastructure projects across the nation.

## Live Deployment Links

- **Frontend (Live Application):** [https://pravi-assignment.vercel.app](https://pravi-assignment.vercel.app)
- **Backend (API):** [https://pravi-assignment.onrender.com/api/public/projects](https://pravi-assignment.onrender.com/api/public/projects)

*Note: The backend is hosted on Render's free tier. If the API has not been accessed in the last 15 minutes, it may take 45-60 seconds for the server to wake up on the first load.*

---

## Tech Stack

- **Frontend:** React.js (Vite), React Router DOM, TailwindCSS, Lucide React, India SVG Maps
- **Backend:** Node.js, Express.js
- **Database:** SQLite (managed via Sequelize ORM)
- **Authentication:** JWT (JSON Web Tokens) & bcryptjs

---

## Architecture Diagram

The system architecture diagram is available in the root folder as `GovInfra360_System_Architecture.jpg`.

---

## Admin Credentials

The platform features a secure Role-Based Access Control (RBAC) system. Use the following credentials to test the administrative features:

- **Email:** `central@govinfra.in`
- **Password:** `password`

*(Other state-specific and department-specific accounts are detailed in `credentials.md`).*

---

## Running Locally

To run the full-stack application on your local machine, you will need two terminal windows.

### 1. Start the Backend API
```bash
cd backend
npm install
node seed.js    # Generates the local SQLite database & dummy data
node server.js  # Starts the API on port 8000
```

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev     # Starts the React development server
```

The frontend will start locally, usually on `http://localhost:5173`.
