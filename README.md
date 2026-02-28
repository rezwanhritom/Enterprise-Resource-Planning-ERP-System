# Enterprise-Resource-Planning-ERP-System

The Enterprise Resource Planning (ERP) System is a comprehensive web-based platform designed to manage and integrate the core operations of a business within a single centralized system.

## Tech Stack (MERN MVC)

- **M**ongoDB – database  
- **E**xpress – backend API (Node.js)  
- **R**eact – frontend (Vite)  
- **N**ode.js – runtime  
- **MVC** – Model–View–Controller on backend; React views on frontend  

## Project Structure

```
├── backend/                 # Express API (MVC)
│   ├── src/
│   │   ├── config/          # DB and app config
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── middlewares/     # Auth, validation, etc.
│   │   ├── views/           # Server-rendered views (optional)
│   │   └── app.js
│   ├── server.js
│   ├── .env
│   └── package.json
├── frontend/                # React (Vite)
│   ├── src/
│   │   ├── components/      # Reusable UI
│   │   ├── pages/          # Page components (views)
│   │   ├── services/       # API calls
│   │   ├── utils/          # Helpers
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── .env
│   └── package.json
├── docs/                    # Documentation and reference materials
├── package.json             # Root scripts (run both apps)
└── README.md
```

## Setup

1. **Install dependencies (all at once)**  
   From project root:
   ```bash
   npm run install:all
   ```

   Or separately:
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Environment**  
   - `backend/.env` has `PORT`, `MONGODB_URI`, `NODE_ENV`. Edit `MONGODB_URI` if needed.  
   - `frontend/.env` has `VITE_API_URL` for the API base URL (default `http://localhost:5000/api`).

3. **MongoDB**  
   Have MongoDB running locally (or use a cloud URI in `backend/.env`).

4. **Run**  
   - Both apps: `npm run dev` (backend on port 5000, frontend on 3000).  
   - Backend only: `npm run dev:backend`.  
   - Frontend only: `npm run dev:frontend`.

5. **Build frontend**  
   `npm run build` (output in `frontend/dist`).
