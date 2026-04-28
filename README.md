# Asset Maintenance System

A production-ready REST API for managing factory machinery maintenance workflows with role-based access control using Node.js, Express.js, TypeScript, Sequelize, and MYSQL.

---

# Solution Overview

This system automates asset maintenance operations inside a factory.

It supports three user roles:

## 1. User

Can:

* Report machinery issues
* View only tasks created by them
* Track task status

## 2. Manager

Can:

* View all tasks
* Assign technicians
* Approve material requests
* Verify completion
* Close tasks

## 3. Technician

Can:

* View assigned tasks only
* Start maintenance work
* Request materials
* Mark tasks completed

---

# How the Solution Works

When a machine issue occurs:

1. User creates maintenance task
2. Unique task code generated automatically

Example:

```text
TSK-1234-XYZ
```

3. Manager reviews and assigns technician
4. Technician works on task
5. If materials required, manager approval is needed
6. Technician completes task
7. Manager closes task

---

# Efficiency & Scalability

## Efficient Design

* Pagination on task listing APIs
* Search & filters supported
* Indexed database columns:

  * task code
  * status
  * assigned_to
  * reported_by

## Scalable Design

* Modular folder structure
* Separate controllers/services/models
* JWT stateless authentication
* Easy migration to microservices later
* Supports thousands of tasks/users

---

# Architecture Flow

```text
Client / Frontend
      |
      v
REST API (Express + TypeScript)
      |
      |---- Auth Module
      |---- Task Module
      |---- User Module
      |---- Middleware
      |
      v
MYSQL Database
```

---

# Data Flow

## Login Flow

```text
User -> /login -> JWT Token -> Protected APIs
```

## Create Task Flow

```text
User -> POST /task/create -> DB -> Task Created
```

## Task Assignment Flow

```text
Manager -> Assign Technician -> Task Updated
```

## Completion Flow

```text
Technician -> Complete Task
Manager -> Verify -> Close Task
```

---

# Tech Stack

* Node.js
* Express.js
* TypeScript
* MYSQL
* Sequelize
* JWT
* bcrypt
* Jest

---

# Build & Run Instructions

## 1. Clone Project

```bash
git clone git@github.com:someshshinde/interview_assignment.git
cd asset-maintenance
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Create Environment File

Create `.env`

```env
PORT=8000

DATABASE_NAME=assignment_schema
DATABASE_USER=root
DATABASE_PASSWORD=mysql
DATABASE_HOST=localhost
DATABASE_DIALECT=mysql

JWT_SECRET=yourSecretKey
NODE_ENV=development
```

## 4. Build Project

```bash
npm run build
```

## 5. Run Development Server

```bash
npm run dev
```

## 6. Run Production

```bash
npm start
```

---

# API Base URL

```text
http://localhost:8000/api/v1
```

---

# Main APIs

## Auth

```text
POST /login
POST /register
```

## Tasks

```text
POST /task/create
GET /task?page=1&limit=10
GET /task?id=1page=1&limit=10
GET /health
```

---

# Health Check

```text
GET /api/v1/health
```

Returns:

* API status
* Database status
* Uptime
* Memory usage

---

# Unit Tests

Basic unit tests included using Jest.

## Covered Areas

### Authentication

* Login success
* Invalid password
* Missing credentials

### Tasks

* Create task
* Fetch task list
* Role-based visibility

### Health API

* Returns 200 status
* DB connectivity check

---

# Run Tests

```bash
npm test
```

For coverage:

```bash
npm run test:coverage
```

---

# Folder Structure

```text
src/
 ├── app.ts
 ├── server.ts
 ├── routes/
 ├── controllers/
 ├── middleware/
 ├── models/
 ├── utils/
```

---

# Security Features

* JWT Authentication
* Password hashing with bcrypt
* Role Based Authorization
* Input Validation
* Protected Routes

---

# Why This Design

This architecture follows enterprise backend best practices:

* Clean code structure
* Reusable modules
* Easy maintenance
* Scalable APIs
* Secure authentication

---

# Author

Somesh Shinde
