# PSTU IT Carnival 2026 - Programming Contest Registration

A full-stack MERN registration system for the **PSTU IT Carnival 2026 Programming Contest**.

Teams can register online by submitting team, coach, and member information. Each team must have exactly **3 members**.

---

## Run with Docker (recommended)

The entire stack — MongoDB, the Express API, and the React client — is
containerized. The client is built and served by **nginx**, which also
reverse-proxies `/api` to the API server, so the whole app runs behind a
single port with no CORS setup.

**Prerequisites:** Docker + Docker Compose (Docker Desktop covers both).

```bash
# from the project root
docker compose up -d --build
```

Then open **http://localhost:5173** 🎉

That's it — no local Node or MongoDB install required. Data is stored in a
named volume (`mongo-data`), so it survives restarts.

| Command | What it does |
| ------- | ------------ |
| `docker compose up -d --build` | Build images and start everything in the background |
| `docker compose logs -f`       | Follow logs from all services |
| `docker compose ps`            | Show container status |
| `docker compose down`          | Stop and remove the containers |
| `docker compose down -v`       | Also delete the database volume (fresh start) |

**Optional configuration** — copy `.env.example` to `.env` in the project
root to change the host port or database name:

```bash
cp .env.example .env    # then edit CLIENT_PORT, MONGO_DB, REGISTRATION_ID_PREFIX
```

Everything has a sensible default, so `docker compose up` also works with no
`.env` file at all.

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
