# Architecture

## Overview

The ERP system is a full-stack MERN application with an MVC-style backend and a React SPA frontend.

## Tech Stack

| Layer   | Technology        | Purpose                    |
|---------|-------------------|----------------------------|
| Database| MongoDB           | Persistent data store      |
| Backend | Node.js + Express | REST API, business logic   |
| Frontend| React (Vite)      | UI and client-side logic   |

## High-Level Flow

```
┌─────────────┐     HTTP/REST      ┌─────────────┐     Mongoose      ┌─────────────┐
│   React     │ ◄────────────────► │   Express   │ ◄───────────────► │  MongoDB    │
│  (Vite)     │      /api/*        │   (MVC)     │                   │             │
│  :3000      │                    │   :5000     │                   │             │
└─────────────┘                    └─────────────┘                   └─────────────┘
```

- **Frontend** runs on port 3000; in dev, Vite proxies `/api` to the backend.
- **Backend** runs on port 5000; all API routes are under `/api`.
- **Database** connection is configured via `backend/.env` (`MONGODB_URI`).

## Backend (MVC)

Request flow: **Route → Controller → Model → Database**.

| Layer       | Location              | Responsibility                          |
|-------------|-----------------------|-----------------------------------------|
| **Routes**  | `backend/src/routes/` | Map URLs to controllers                 |
| **Controllers** | `backend/src/controllers/` | Handle request/response, call models |
| **Models**  | `backend/src/models/` | Mongoose schemas and data access        |
| **Middlewares** | `backend/src/middlewares/` | Auth, validation, logging          |
| **Config**  | `backend/src/config/` | DB connection and app config            |

## Frontend Structure

| Folder / File   | Purpose                                  |
|-----------------|------------------------------------------|
| `src/pages/`    | Page-level components (views)            |
| `src/components/` | Reusable UI components                |
| `src/services/` | API calls and external integration       |
| `src/utils/`    | Helpers, constants, formatters           |

## Security (Planned)

- Authentication: JWT or session-based (to be defined in `docs/API.md`).
- Authorization: role-based access for ERP modules.
- CORS: configured in Express; restrict origins in production.
- Environment: secrets only in `.env`; never committed.

## Deployment (Reference)

- **Backend**: Node process (e.g. PM2, Docker, or platform like Render/Railway).
- **Frontend**: Static build (`npm run build`); serve from CDN or same host.
- **Database**: MongoDB Atlas or self-hosted; use env-based `MONGODB_URI`.
