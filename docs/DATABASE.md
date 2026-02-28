# Database

## Overview

The application uses **MongoDB** as the primary database. The backend connects via **Mongoose** (ODM).

## Connection

- **Config file**: `backend/src/config/database.js`
- **Environment**: `MONGODB_URI` in `backend/.env`
- **Default (local)**: `mongodb://localhost:27017/erp`

Example for MongoDB Atlas:

```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/erp?retryWrites=true&w=majority
```

## Naming Conventions

| Item        | Convention        | Example           |
|-------------|-------------------|-------------------|
| Database    | lowercase, short  | `erp`             |
| Collections | plural, lowercase | `users`, `orders` |
| Fields      | camelCase         | `createdAt`, `firstName` |
| Model names | PascalCase, singular | `User`, `Product` |

## Schema Conventions

- **Timestamps**: Enable `timestamps: true` in schema for `createdAt` and `updatedAt`.
- **Ids**: Use default `_id` (ObjectId); expose as `id` in API if needed via virtual or transform.
- **References**: Use `ObjectId` refs for relations (e.g. `user`, `orderId`).
- **Required fields**: Mark explicitly in schema; validate in controller or middleware where needed.

## Planned Collections (ERP)

Use this as a checklist; add/remove as the product evolves.

| Collection   | Description (draft)                |
|-------------|-------------------------------------|
| `users`     | Staff/login, roles, profile        |
| `customers` | Customer master data               |
| `products`  | Product/SKU, pricing, stock ref     |
| `inventory` | Stock levels, warehouse/location   |
| `orders`    | Sales/purchase orders, line items  |
| `invoices`  | Invoicing and payment status       |
| `suppliers` | Supplier master data               |

## Indexes

- Add indexes in Mongoose schemas for fields used in queries and filters (e.g. `email`, `orderId`, `status`, `createdAt`).
- Document index decisions in this file or in code comments as they are added.

## Backups & Migrations

- **Backups**: Use MongoDB backup tools (e.g. `mongodump`, Atlas backups).
- **Migrations**: For schema changes, use versioned migration scripts or document manual steps here.
