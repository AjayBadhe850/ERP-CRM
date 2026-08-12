# Mini ERP + CRM Operations Portal

Mini ERP + CRM is a full-stack business management application built for wholesale and distribution businesses. It helps manage customers, products, inventory, sales challans, and user access from one place.

The project was built using React for the frontend, Node.js and Express for the backend, and PostgreSQL with Prisma for database management.

## Features

### Authentication and User Roles

The application includes JWT-based authentication and role-based access.

There are four user roles:

* Admin
* Sales
* Warehouse
* Accounts

Each role can access the features that are relevant to their responsibilities.

### Customer Management

The CRM section helps manage customer information and follow-ups.

It includes:

* Customer creation and management
* Lead and customer status tracking
* Follow-up management
* Customer status history
* Customer information management

### Product and Inventory

The inventory section is designed to make stock management easier.

It supports:

* Product management
* SKU-based products
* Current stock tracking
* Low-stock monitoring
* Inventory movement records
* Automatic stock updates

### Sales Challans

The sales module handles the challan workflow.

Users can:

* Create draft challans
* Add products to challans
* Confirm sales challans
* Automatically reduce stock after confirmation
* Track inventory movements

Stock changes are handled using database transactions to help keep inventory data consistent.

### Dashboard

The dashboard provides a quick overview of the business.

It includes information such as:

* Customer statistics
* Product and inventory information
* Sales information
* Quick actions

### Responsive Design

The frontend is designed to work on both desktop and mobile screens.

The interface uses a simple admin-style layout so that the main sections are easy to access.

---

## Technologies Used

### Frontend

* React
* Vite
* Axios
* React Router
* CSS

### Backend

* Node.js
* Express
* TypeScript

### Database

* PostgreSQL
* Prisma ORM

### Authentication

* JWT
* Bcrypt

### API Testing

* Postman

---

## Project Structure

```text
FT/
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   │
│   ├── scripts/
│   │   └── seed.ts
│   │
│   ├── src/
│   │   ├── routes/
│   │   └── ...
│   │
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│   │
│   └── package.json
│
└── mini-erp-postman.json
```

---

## Getting Started

### Requirements

Before running the project, make sure you have:

* Node.js 18 or later
* PostgreSQL
* npm
* Git

---

## Backend Setup

First, move into the backend folder:

```bash
cd backend
```

Install the dependencies:

```bash
npm install
```

Create a `.env` file and add your database connection and JWT secret:

```env
DATABASE_URL="your-postgresql-database-url"
JWT_SECRET="your-secret"
PORT=4000
```

Generate Prisma Client:

```bash
npx prisma generate
```

Run the database migrations:

```bash
npx prisma migrate dev
```

To add the sample users and data:

```bash
npm run seed
```

Start the backend:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:4000
```

---

## Frontend Setup

Open a new terminal and go to the frontend folder:

```bash
cd frontend
```

Install the dependencies:

```bash
npm install
```

Create a `.env` file:

```env
VITE_API_URL="http://localhost:4000"
```

Start the frontend:

```bash
npm run dev
```

The frontend will normally run on:

```text
http://localhost:5173
```

---

## Test Login Accounts

The seed script creates a few test accounts that can be used while developing the application.

| Role      | Email                   | Password       |
| --------- | ----------------------- | -------------- |
| Admin     | `admin@example.com`     | `Password123!` |
| Sales     | `sales@example.com`     | `Password123!` |
| Warehouse | `warehouse@example.com` | `Password123!` |
| Accounts  | `accounts@example.com`  | `Password123!` |

These accounts are only meant for testing and development. For a real deployment, use proper passwords and user accounts.

---

## API Testing

A Postman collection is included in the project:

```text
mini-erp-postman.json
```

Import this file into Postman and set the `baseUrl` to the backend URL.

For local development:

```text
http://localhost:4000
```

For production, use the deployed backend URL.

---

## Deployment

The project can be deployed with the frontend and backend hosted separately.

For example:

```text
Frontend
   ↓
Netlify

Backend
   ↓
Render

Database
   ↓
PostgreSQL
```

For the frontend, set:

```env
VITE_API_URL="https://your-backend-url"
```

For the backend, set:

```env
DATABASE_URL="your-postgresql-url"
JWT_SECRET="your-production-secret"
```

Environment variables should be kept private and should not be committed to the repository.

---

## Security

The project includes JWT authentication, password hashing with Bcrypt, and role-based access control.

For production use, it is recommended to:

* Use strong JWT secrets
* Use secure database credentials
* Use HTTPS
* Change the default test passwords
* Keep `.env` files out of Git
* Create separate accounts for actual users

-
