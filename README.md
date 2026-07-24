# PSTU IT Carnival 2026 - Programming Contest Registration

A full-stack MERN registration system for the **PSTU IT Carnival 2026 Programming Contest**.

Teams can register online by submitting team, coach, and member information. Each team must have exactly **3 members**.

---

## Tech Stack

**Frontend**
- React (Vite)
- JavaScript
- Tailwind CSS
- React Hook Form
- Axios

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- dotenv, cors, express-validator, nodemon

---

## Folder Structure

```
IT_CARNIVAL/
|-- client/                # React + Vite frontend
|   |-- public/
|   |-- src/
|   |   |-- components/    # Reusable UI components
|   |   |-- services/      # Axios API service
|   |   |-- App.jsx
|   |   |-- main.jsx
|   |   `-- index.css
|   |-- index.html
|   |-- package.json
|   |-- tailwind.config.js
|   |-- postcss.config.js
|   `-- vite.config.js
`-- server/                # Express + MongoDB backend
    |-- src/
    |   |-- config/        # DB connection
    |   |-- controllers/   # Route logic
    |   |-- middlewares/   # Error handling
    |   |-- models/        # Mongoose schemas
    |   |-- routes/        # Express routes
    |   |-- validators/    # express-validator rules
    |   |-- utils/         # Helpers (response, registrationId)
    |   |-- app.js
    |   `-- server.js
    |-- .env.example
    `-- package.json
```

---

## Setup

### 1. Open the project

```bash
cd IT_CARNIVAL
```

### 2. Install backend dependencies

```bash
cd server
cp .env.example .env       # then edit .env with your MongoDB URI and PORT
npm install
```

### 3. Install frontend dependencies

```bash
cd ../client
npm install
```

---

## Run the app

Open **two terminals**.

**Terminal 1 - backend**
```bash
cd server
npm run dev
```
Backend runs on `http://localhost:5000` (or the PORT in `.env`).

**Terminal 2 - frontend**
```bash
cd client
npm run dev
```
Frontend runs on `http://localhost:5173`.

---

## API Endpoints

| Method | Endpoint                     | Description                  |
| ------ | ---------------------------- | ---------------------------- |
| GET    | `/api/v1/health`             | Health check                 |
| POST   | `/api/v1/registrations`      | Create a new registration    |

### Example success response
```json
{
  "success": true,
  "message": "Registration completed successfully",
  "data": {
    "registrationId": "PSTU-PC-2026-0001"
  }
}
```

---

## Notes

- No authentication / admin dashboard is included in this initial version.
- No payment functionality is included.
- The registration form requires exactly **3 team members** with unique emails and Codeforces handles.
- Team names must be unique.
