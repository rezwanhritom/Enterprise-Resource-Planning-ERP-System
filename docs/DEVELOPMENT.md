# Development

## Prerequisites

- **Node.js** (LTS recommended, e.g. 18+)
- **npm** (or yarn/pnpm)
- **MongoDB** running locally or a remote URI (e.g. Atlas)

## Environment Variables

| File              | Variable       | Description                    |
|-------------------|----------------|--------------------------------|
| `backend/.env`    | `PORT`         | Backend server port (default 5000) |
| `backend/.env`    | `MONGODB_URI`  | MongoDB connection string      |
| `backend/.env`    | `NODE_ENV`     | `development` / `production`   |
| `frontend/.env`   | `VITE_API_URL` | Full API base URL for client   |

## Scripts

From **project root**:

| Script            | Description                    |
|-------------------|--------------------------------|
| `npm run install:all` | Install root, backend, and frontend deps |
| `npm run dev`     | Run backend + frontend (concurrently)    |
| `npm run dev:backend`  | Run backend only (watch mode)   |
| `npm run dev:frontend` | Run frontend only (Vite dev server) |
| `npm run build`   | Build frontend for production  |
| `npm start`       | Start backend only (no watch)  |

In **backend/**:

| Script    | Description        |
|-----------|--------------------|
| `npm start` | Start server     |
| `npm run dev` | Start with `--watch` |

In **frontend/**:

| Script     | Description          |
|------------|----------------------|
| `npm run dev`    | Vite dev server (port 3000) |
| `npm run build`  | Production build     |
| `npm run preview`| Preview production build |

## Local URLs

- **Frontend**: http://localhost:3000  
- **Backend**:  http://localhost:5000  
- **API (health)**: http://localhost:5000/api/health  

## Code Conventions

- **Backend**: ES modules (`import`/`export`); consistent error handling in controllers.
- **Frontend**: React functional components; API calls in `src/services/`.
- **Docs**: Keep `docs/` updated when adding features (API, DB, architecture).

## Where to Document

| Topic           | Document        |
|----------------|-----------------|
| System design  | `docs/ARCHITECTURE.md` |
| DB schema, collections | `docs/DATABASE.md` |
| Endpoints, auth | `docs/API.md`   |
| Setup, scripts, env | `docs/DEVELOPMENT.md` (this file) |
