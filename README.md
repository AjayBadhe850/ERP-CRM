# Mini ERP + CRM Operations Portal

A full-stack business management application for wholesale/distribution companies. Built with Node.js, Express, Prisma, and React.

## 🚀 Features

- **Authentication & RBAC**: Secure JWT-based login with roles: Admin, Sales, Warehouse, and Accounts.
- **Customer CRM**: Complete lifecycle management from Leads to Active customers, including follow-up tracking and status history.
- **Product & Inventory**: SKU-based product management with real-time stock tracking and low-stock alerts.
- **Sales Challans**: Transactional workflow for sales:
  - Create Draft challans with product snapshots.
  - Confirm challans with atomic stock reduction.
  - Automatic inventory movement logging (IN/OUT).
- **Dashboard**: Real-time business statistics and quick actions.
- **Responsive UI**: Professional admin-style interface built for desktop and mobile.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Axios, React Router, CSS Variables.
- **Backend**: Node.js, Express, TypeScript.
- **Database**: PostgreSQL (via Prisma ORM).
- **Security**: Bcrypt password hashing, JWT authentication, Role-based middleware.

## 📁 Project Structure

```
FT/
├── backend/            # Express API source code
│   ├── prisma/         # Database schema and migrations
│   ├── src/            # API routes and business logic
│   └── scripts/        # Seed data scripts
├── frontend/           # React application source code
│   ├── src/            # Components, pages, and auth context
│   └── public/         # Static assets
└── mini-erp-postman.json # Postman collection for API testing
```

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- PostgreSQL database

### Backend Setup
1. `cd backend`
2. `npm install`
3. Create `.env` from `.env.example` and set `DATABASE_URL` and `JWT_SECRET`.
4. `npx prisma migrate dev`
5. `npm run seed` to populate test users and data.
6. `npm run dev` to start the server (default: port 4000).

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. Create `.env` from `.env.example` and set `VITE_API_URL`.
4. `npm run dev` to start the development server.

## 🔑 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@example.com | Password123! |
| **Sales** | sales@example.com | Password123! |
| **Warehouse** | warehouse@example.com | Password123! |
| **Accounts** | accounts@example.com | Password123! |

## 🧪 API Documentation

Use the provided `mini-erp-postman.json` to import the collection into Postman. Set the `baseUrl` environment variable to your running backend.

## ⚖️ License
MIT
