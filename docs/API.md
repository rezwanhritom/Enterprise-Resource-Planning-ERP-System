# API

## Base URL

- **Development**: `http://localhost:5000/api` (frontend proxies `/api` to this in Vite dev).
- **Environment**: Backend does not prefix with `/api` in code; the Express app mounts routes at `/api`, so all endpoints below are relative to `/api`.

## General Conventions

- **Format**: JSON request and response bodies.
- **Headers**: `Content-Type: application/json` for requests with a body.
- **Errors**: Use appropriate HTTP status codes; response body can include `message` or `error` and optional `details`.

## Endpoints (Current)

| Method | Endpoint     | Description        |
|--------|--------------|--------------------|
| GET    | `/api/health`| Service health check (outside route mount; same app) |
| GET    | `/api`       | Simple API info message |

Health check response example:

```json
{ "status": "ok", "message": "ERP Backend is running" }
```

## Adding New Endpoints

1. **Model**: Define schema in `backend/src/models/`.
2. **Controller**: Add handlers in `backend/src/controllers/` (e.g. `create`, `read`, `update`, `delete`).
3. **Routes**: Create a route file in `backend/src/routes/` and mount it in `backend/src/routes/index.js`.

Example mount in `routes/index.js`:

```js
import userRoutes from './userRoutes.js';
router.use('/users', userRoutes);
```

## Authentication (Planned)

- To be implemented (e.g. JWT in `Authorization` header or cookies).
- Document auth middleware and protected routes here once added.

## Versioning (Optional)

- If needed later: prefix routes with version (e.g. `/api/v1/users`) or use header.
- Current: no version prefix.
