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
```
* Creates a new task. The initial status depends on the user's role.
* Access: All authenticated users
* Request Body:

| Field         | Type   | Required | Description                                      |
|---------------|--------|----------|--------------------------------------------------|
| `title`       | string | Yes      | Task title                                       |
| `description` | string | Yes      | Detailed description                             |
| `priority`    | string | No       | LOW, MEDIUM, HIGH (default: MEDIUM)              |
| `machine_id`  | string | Yes      | Associated machine ID                            |
| `assigned_to` | number | Yes      | Technician ID (if pre-assigned)                  |

#Flow Logic:
* USER role: Task status = REPORTED
* MANAGER/TECHNICIAN role: Task status = IN_PROGRESS
```text
GET /task
```
* Retrieves tasks with filtering and pagination. Tasks are filtered based on user role:

| Role         | Visible Tasks       |
|--------------|---------------------|
| `USER`       | Tasks they reported |
| `TECHNICIAN` | Tasks they reported |
| `MANAGER`    | All tasks           |

* Query Parameters:

| Parameter   | Type   |	Default |	Description        |
|-------------|--------|---------|--------------------|
| `id`	       | string |	""	     | Filter by task ID  |
| `page`	     | number | 1	      | Page number        |
| `limit`	    | number	| 10	     | Items per page     |
| `status`	   | string	| ""	     | Filter by status   |
| `priority`	 | string	| ""	     | Filter by priority |


```text
POST /tasks/workflow/:taskcode/:status/:assignedTo
```
* Updates task status and assigns technician.
* Access: MANAGER only

| Parameter    |	Type	  | Description                           |
|--------------|--------|---------------------------------------|
| `taskcode`	  | string	| Task code (e.g., TASK-XXXX-XXX)       |
| `status`	    | string	| New status (see allowed values below) |
| `assignedTo` |	string	| Technician ID to assign               |

* Allowed Status Values:
* `PENDING`
* `APPROVED`
* `REJECTED`
* `COMPLETED`
* `CANCELLED`

```text
POST /tasks/:taskcode/request-materials
```
* Allows technicians to request materials for a task. Changes task status to PENDING for manager approval.
* Access: TECHNICIAN only

| Parameter  |	Type	 | Description                     |
|------------|-------|---------------------------------|
| `taskcode`	|string	| Task code (e.g., TASK-XXXX-XXX) |

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
* Rate limiter
* RBAC

---

# Author

Somesh Shinde\
LinkedIn: https://www.linkedin.com/in/someshshinde1/ \
Email: [shindesomesh@gmail.com](mailto:shindesomesh@gmail.com) \
Mobile: +91-9822214778

