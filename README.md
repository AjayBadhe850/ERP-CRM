# Mini ERP + CRM Operations Portal

A full-stack **Mini ERP and CRM Operations Portal** designed for wholesale and distribution businesses.

The application provides customer management, product management, inventory tracking, sales challan management, authentication, role-based access control, and stock validation.

##  Live Deployment

* **Frontend:** Netlify
* **Backend:** Render
* **Database:** Railway PostgreSQL

> Add your deployed URLs here before publishing:
>
> * Frontend: `YOUR_NETLIFY_URL`
> * Backend: `YOUR_RENDER_URL`

---

##  Project Overview

The Mini ERP + CRM Operations Portal is a full-stack web application developed to manage basic business operations such as customers, products, inventory, stock movements, and sales challans.

The project follows a three-layer architecture:

```text
User
  ↓
React Frontend
  ↓
REST APIs
  ↓
Node.js + Express Backend
  ↓
Prisma ORM
  ↓
PostgreSQL Database
```

The frontend does not directly communicate with the database.

All database operations and business logic are handled by the backend.

---

##  Features

###  Authentication & Authorization

* User login
* JWT-based authentication
* Password hashing using bcrypt
* Role-based access control
* Supported roles:

  * Admin
  * Sales
  * Warehouse
  * Accounts
* Protected API routes

###  Customer CRM

* Add customers
* Edit customer details
* Search customers
* View customer information
* Add follow-up notes
* Manage customer status

Customer information can include:

* Name
* Mobile number
* Email
* Business name
* GST number
* Customer type
* Address
* Status
* Follow-up date
* Notes

###  Product Management

* Add products
* Edit products
* View product details
* Search products
* Manage SKU
* Manage categories
* Manage unit price
* Manage minimum stock
* Manage warehouse/location

###  Inventory Management

* Track current stock
* Record stock IN movements
* Record stock OUT movements
* Store movement reason
* Track creator
* Track timestamps
* Maintain stock movement history
* Prevent negative inventory

###  Sales Challan

* Select customers
* Select multiple products
* Enter product quantities
* Create sales challans
* Save challans as Draft
* Confirm challans
* Validate stock before confirmation
* Automatically reduce stock after confirmation
* Generate challan PDF using jsPDF

###  Testing

* Jest for automated testing
* Supertest for API testing
* Authentication testing
* API validation testing
* Error handling testing
* Business logic testing

---

#  Technology Stack

## Frontend

| Technology       | Purpose                                    |
| ---------------- | ------------------------------------------ |
| React            | User interface                             |
| Vite             | Frontend build tool and development server |
| TypeScript       | Type safety                                |
| Axios            | API communication                          |
| React Router DOM | Client-side routing                        |
| CSS              | Styling                                    |
| jsPDF            | PDF generation                             |

## Backend

| Technology | Purpose                         |
| ---------- | ------------------------------- |
| Node.js    | Backend runtime                 |
| Express.js | REST API framework              |
| TypeScript | Type-safe backend development   |
| Prisma ORM | Database access and ORM         |
| PostgreSQL | Relational database             |
| JWT        | Authentication                  |
| bcrypt     | Password hashing                |
| CORS       | Cross-origin communication      |
| dotenv     | Environment variable management |
| pg         | PostgreSQL connectivity         |

## Testing & Development

| Technology  | Purpose                                   |
| ----------- | ----------------------------------------- |
| Jest        | Automated testing                         |
| Supertest   | API testing                               |
| ts-node     | Execute TypeScript                        |
| ts-node-dev | Development server with automatic restart |

## Deployment

| Component | Platform |
| --------- | -------- |
| Frontend  | Netlify  |
| Backend   | Render   |
| Database  | Railway  |

---

# Architecture

```text
                    ┌─────────────────────┐
                    │       User          │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React + Vite      │
                    │    TypeScript       │
                    │      Netlify        │
                    └──────────┬──────────┘
                               │
                         Axios / REST API
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Node.js + Express   │
                    │    TypeScript       │
                    │       Render        │
                    └──────────┬──────────┘
                               │
                         Prisma ORM
                               │
                               ▼
                    ┌─────────────────────┐
                    │     PostgreSQL      │
                    │      Railway        │
                    └─────────────────────┘
```

---

#  Project Structure

```text
ERP-CRM/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── routes/
│   │   └── ...
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── ...
│   ├── prisma/
│   │   └── schema.prisma
│   ├── tests/
│   ├── package.json
│   └── ...
│
└── README.md
```

> Update the structure above if your actual repository folders are different.

---

#  Installation

## 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

```bash
cd ERP-CRM
```

---

#  Backend Setup

Navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
DATABASE_URL="your_postgresql_database_url"
JWT_SECRET="your_jwt_secret"
PORT=5000
```

Run Prisma commands:

```bash
npx prisma generate
```

If database migrations are required:

```bash
npx prisma migrate dev
```

Start the backend in development:

```bash
npm run dev
```

The backend should run on:

```text
http://localhost:5000
```

---

#  Frontend Setup

Open another terminal and navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create the required environment variable for the backend API.

Example:

```env
VITE_API_URL="http://localhost:5000"
```

Start the frontend:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

#  Environment Variables

## Backend

```env
DATABASE_URL=
JWT_SECRET=
PORT=
```

## Frontend

```env
VITE_API_URL=
```

Never commit real secrets, passwords, database URLs, or JWT secrets to GitHub.

Use `.env` files and add them to `.gitignore`.

---

# Application Flow

## Login Flow

```text
User enters credentials
        ↓
React Frontend
        ↓
POST /auth/login
        ↓
Express Backend
        ↓
Validate credentials
        ↓
bcrypt password verification
        ↓
Generate JWT
        ↓
Return authentication response
        ↓
Frontend
        ↓
Access protected application
```

---

#  Inventory Business Logic

One of the main business rules of the application is preventing negative stock.

For example:

```text
Available Stock = 10
Requested Quantity = 15

Result:
 Sales challan rejected
 Stock is not reduced
 Negative inventory is not allowed
```

Successful scenario:

```text
Available Stock = 20
Requested Quantity = 5

Result:
 Challan confirmed
 Stock reduced
 Remaining Stock = 15
```

Stock validation is performed on the backend so that the business rule cannot be bypassed simply by modifying frontend requests.

---

# 🧾 Sales Challan Flow

```text
Select Customer
       ↓
Select Products
       ↓
Enter Quantities
       ↓
Create Challan
       ↓
       ├── Draft
       │     ↓
       │   Save without treating it as confirmed sale
       │
       └── Confirm
             ↓
       Check Stock
             ↓
       ├── Insufficient Stock
       │       ↓
       │     Reject
       │
       └── Sufficient Stock
               ↓
          Confirm Challan
               ↓
          Reduce Inventory
               ↓
          Generate PDF
```

---

# Testing

The backend can be tested using Jest and Supertest.

Example:

```bash
npm test
```

Tests can verify:

* Login
* Authentication
* Authorization
* Customer APIs
* Product APIs
* Inventory APIs
* Sales challan APIs
* Validation
* Error handling
* Stock availability
* Business rules

Example API:

```http
POST /auth/login
```

Customer API:

```http
GET /customers
```

The exact endpoints may vary depending on the final backend implementation.

---

#  Deployment

The application is deployed using three services.

### Frontend — Netlify

The React/Vite frontend is deployed on Netlify.

### Backend — Render

The Node.js/Express backend is deployed on Render.

### Database — Railway

The PostgreSQL database is hosted on Railway.

The production architecture is:

```text
Netlify
   ↓
Render
   ↓
Railway PostgreSQL
```

---

#  Security

The application follows basic security practices including:

* Password hashing using bcrypt
* JWT authentication
* Protected API routes
* Role-based authorization
* Environment variables for secrets
* CORS configuration
* Backend-side validation
* Database credentials kept outside the frontend

---

#  Key Learning Outcomes

Through this project, I gained practical experience in:

* Full-stack web development
* React development
* TypeScript
* REST API development
* Node.js and Express.js
* Prisma ORM
* PostgreSQL
* JWT authentication
* Role-based authorization
* Database design
* Inventory business logic
* API testing
* Automated testing
* PDF generation
* Cloud deployment
* Frontend-backend integration

---

#  Future Improvements

Possible future enhancements include:

* Advanced dashboard analytics
* Sales reports
* Inventory reports
* Low-stock notifications
* Customer activity history
* Invoice generation
* Export reports to Excel
* Advanced filtering and sorting
* Audit logs
* Email notifications
* More granular role permissions

---

#  Developer

**AJAY KUMAR BADE**

AIML Student
Interested in Full-Stack Development, AI, and practical software solutions.

---

#  License

This project was developed as a full-stack case study and learning project.
