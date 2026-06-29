# StoreRate — Store Rating Application

StoreRate is a full stack web application that allows users to discover, browse, and rate registered stores. The platform supports three distinct user roles with dedicated interfaces, role based access control, and a complete store rating system backed by a RESTful API.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Features by Role](#features-by-role)
4. [Database Schema](#database-schema)
5. [API Reference](#api-reference)
6. [Project Structure](#project-structure)
7. [Getting Started](#getting-started)
8. [Environment Variables](#environment-variables)
9. [Running the Application](#running-the-application)

---

## Overview

StoreRate connects store owners with their customers through a transparent rating system. Customers can browse registered stores and submit star ratings (1 to 5). Store owners can monitor their average rating and see exactly who rated them and what score they gave. A system administrator manages the entire platform by creating users and stores.

The application enforces strict role based routing — each user type sees only the interface built for them, and every API route is protected by JWT authentication with role verification middleware.

---

## Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| Node.js + Express.js v5 | REST API server |
| PostgreSQL | Relational database |
| JSON Web Tokens (JWT) | Authentication |
| bcrypt | Password hashing |
| pg (node-postgres) | Database driver |
| dotenv | Environment configuration |
| nodemon | Development auto-reload |

### Frontend

| Technology | Purpose |
|---|---|
| React 19 + Vite | UI framework and build tool |
| React Router v7 | Client side routing |
| Tailwind CSS v3 | Utility first styling |
| Axios | HTTP client |
| jwt-decode | Token decoding on client |
| Inter (Google Fonts) | Typography |

---

## Features by Role

### System Administrator

* Access a live dashboard showing total users, total stores, and total ratings submitted across the platform
* View a complete, sortable, and searchable table of all registered users with their name, email, address, role, and join date
* Filter users by name, email, address, or role
* Create new user accounts with any role (Normal User, Store Owner, or System Admin)
* View a complete, sortable, and searchable table of all registered stores with their average rating and owner information
* Filter stores by name, email, or address
* Create new stores and assign them to any existing Store Owner account

### Store Owner

* View a dedicated dashboard for their own store
* See their store's average rating displayed prominently
* View a complete list of all customer ratings including the rater's name, email, score, and the date the rating was submitted
* Update their account password

### Normal User

* Self-register via the public signup page
* Browse the full list of registered stores with average ratings displayed as stars
* Search stores by name or address in real time
* Submit a star rating (1 to 5) for any store they have not yet rated
* Update a previously submitted rating at any time
* View their own submitted rating on every store card
* Update their account password

---

## Database Schema

The application uses a PostgreSQL database with the following three tables.

### users

| Column | Type | Constraints |
|---|---|---|
| id | UUID | Primary Key, auto generated |
| name | VARCHAR(60) | Not null, minimum 20 characters |
| email | VARCHAR(255) | Not null, unique |
| password_hash | VARCHAR(255) | Not null |
| address | VARCHAR(400) | Optional |
| role | ENUM | Not null — SYSTEM_ADMIN, STORE_OWNER, or NORMAL_USER |
| created_at | TIMESTAMP | Defaults to current timestamp |

### stores

| Column | Type | Constraints |
|---|---|---|
| id | UUID | Primary Key, auto generated |
| owner_id | UUID | Foreign key → users.id (on delete cascade) |
| name | VARCHAR(255) | Not null |
| email | VARCHAR(255) | Not null |
| address | VARCHAR(400) | Not null |
| created_at | TIMESTAMP | Defaults to current timestamp |

### ratings

| Column | Type | Constraints |
|---|---|---|
| id | UUID | Primary Key, auto generated |
| user_id | UUID | Foreign key → users.id (on delete cascade) |
| store_id | UUID | Foreign key → stores.id (on delete cascade) |
| score | INTEGER | Not null, must be between 1 and 5 |
| created_at | TIMESTAMP | Defaults to current timestamp |
| | | Unique constraint on (user_id, store_id) — one rating per user per store |

---

## API Reference

All protected routes require the `Authorization: Bearer <token>` header.

### Authentication — `/api/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Register a new Normal User account |
| POST | `/api/auth/login` | Public | Login and receive a JWT token |

### Admin — `/api/admin` (System Admin only)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/dashboard` | Get platform stats: total users, stores, and ratings |
| GET | `/api/admin/users` | List all users with optional filter and sort query params |
| POST | `/api/admin/users` | Create a new user with any role |
| GET | `/api/admin/stores` | List all stores with average rating, owner name, and filter/sort support |
| POST | `/api/admin/stores` | Create a new store assigned to a Store Owner |

### Stores — `/api/stores` (Authenticated)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/stores` | Any | List all stores with average rating. Normal Users also receive their own rating per store. |
| GET | `/api/stores/my-store` | Store Owner | Get own store details with full ratings list |
| GET | `/api/stores/:id` | Any | Get a single store's details |
| POST | `/api/stores/:id/ratings` | Normal User | Submit a new rating (score 1 to 5) |
| PUT | `/api/stores/:id/ratings` | Normal User | Update an existing rating |

### Users — `/api/users` (Authenticated)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/me` | Get the logged-in user's profile |
| PUT | `/api/users/me/password` | Update own password |

### Validation Rules

* Name: minimum 20 characters, maximum 60 characters
* Email: must be a valid email format and unique across the system
* Password: minimum 8 characters, at least one uppercase letter, at least one special character
* Address: maximum 400 characters
* Rating score: integer between 1 and 5 inclusive

---

## Project Structure

```
store_rating_app/
│
├── backend/
│   ├── .env                          # Environment variables (not committed)
│   ├── package.json
│   └── src/
│       ├── server.js                 # Express app entry point
│       ├── db.js                     # PostgreSQL connection pool
│       ├── middleware/
│       │   ├── authMiddleware.js     # JWT verification + requireRole factory
│       │   └── validateMiddleware.js # Shared field validation helpers
│       ├── controllers/
│       │   ├── authController.js     # Signup and login logic
│       │   ├── adminController.js    # Dashboard stats, user and store management
│       │   ├── storeController.js    # Store listing, detail, and rating submission
│       │   └── userController.js     # Profile fetch and password update
│       └── routes/
│           ├── authRoutes.js
│           ├── adminRoutes.js
│           ├── storeRoutes.js
│           └── userRoutes.js
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── src/
        ├── App.jsx                   # Root component with all routes
        ├── index.css                 # Global styles and Tailwind utilities
        ├── context/
        │   └── AuthContext.jsx       # Global auth state with localStorage persistence
        ├── services/
        │   └── api.js                # Axios instance with auto token injection
        ├── components/
        │   ├── Navbar.jsx            # Sticky top nav with role badge and logout
        │   ├── ProtectedRoute.jsx    # Role based route guard
        │   ├── StarRating.jsx        # Display and interactive star component
        │   ├── StoreCard.jsx         # Store card for the browsing grid
        │   ├── StatCard.jsx          # Dashboard stat card
        │   ├── Modal.jsx             # Reusable modal with overlay
        │   └── LoadingSpinner.jsx    # Amber spinner component
        └── pages/
            ├── Auth/
            │   ├── Login.jsx         # Split panel login page
            │   └── Signup.jsx        # Registration with live validation
            ├── Admin/
            │   ├── AdminDashboard.jsx   # Stats, user table, store table
            │   ├── CreateUserModal.jsx  # Create user form modal
            │   └── CreateStoreModal.jsx # Create store form modal
            ├── Owner/
            │   └── OwnerDashboard.jsx  # Store info, ratings list
            └── User/
                ├── UserDashboard.jsx   # Store browsing grid with rating flow
                └── UserProfile.jsx     # Change password page
```

---

## Getting Started

### Prerequisites

* Node.js version 18 or above
* PostgreSQL version 14 or above
* npm version 9 or above

### Database Setup

Create a new PostgreSQL database and run the following SQL to set up the schema:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER');

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(60) NOT NULL CHECK (char_length(name) >= 20),
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  address       VARCHAR(400),
  role          user_role NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stores (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  address    VARCHAR(400) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ratings (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  store_id   UUID REFERENCES stores(id) ON DELETE CASCADE,
  score      INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_store_rating UNIQUE (user_id, store_id)
);
```

### Installation

Clone the repository:

```bash
git clone https://github.com/ajinkya252005/store_rating_app.git
cd store_rating_app
```

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

---

## Environment Variables

Create a `.env` file inside the `backend/` directory with the following variables:

```env
PORT=5000

DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=store_rating_db

JWT_SECRET=your_strong_jwt_secret_key
```

> The `.env` file is listed in `.gitignore` and is never committed to version control.

---

## Running the Application

### Start the Backend

```bash
cd backend
npm run dev
```

The API server starts at `http://localhost:5000`

### Start the Frontend

```bash
cd frontend
npm run dev
```

The React app starts at `http://localhost:5173`

### Creating the First Admin Account

Since there is no public route to create an admin, insert the first System Admin directly into the database. Generate a bcrypt hash for your chosen password using Node.js and then insert the record:

```bash
node -e "const b = require('bcrypt'); b.hash('YourPassword@1', 10).then(h => console.log(h));"
```

Then insert into the database:

```sql
INSERT INTO users (name, email, password_hash, address, role)
VALUES (
  'Your Full Admin Name Here',
  'admin@yourdomain.com',
  '<paste_bcrypt_hash_here>',
  'Your Address Here',
  'SYSTEM_ADMIN'
);
```

Once logged in as the System Admin, all subsequent users and stores can be created through the admin dashboard.

---

## Role Based Access Summary

| Route | SYSTEM_ADMIN | STORE_OWNER | NORMAL_USER |
|---|---|---|---|
| `/login` | ✓ | ✓ | ✓ |
| `/signup` | ✓ | ✓ | ✓ |
| `/admin` | ✓ | ✗ | ✗ |
| `/owner` | ✗ | ✓ | ✗ |
| `/dashboard` | ✗ | ✗ | ✓ |
| `/profile` | ✗ | ✓ | ✓ |

Accessing a route without the correct role automatically redirects the user to their own assigned dashboard.

---

## Author

Developed by Ajinkya Moharir
