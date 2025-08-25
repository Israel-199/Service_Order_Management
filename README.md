# Service Order Lifecycle Management (SOLCM)

A web-based Service Order Lifecycle Management System for efficiently handling service requests, employee assignments, customer profiles, and performance reporting.

## Tech Stack

- **Frontend:** React v19.1.0
- **Backend:** Node.js v22.17.1
- **Database:** MySQL 8.0.34
- **Folder Structure:**
├── client # React frontend
├── server # Node.js backend (API logic, controllers)
└── shared # Database schema, SQL files, shared logic

---

## Features

### Service Order Lifecycle Management
- Create, update, delete service orders
- Assign multiple Employees or staff
- Set priority levels (e.g., Normal, Urgent)
- Track service status: `New → Assigned → In Progress → Completed → Closed`
- Attach documents, photos, or voice notes
- Handle recurring service orders/schedules

### Customer Management
- Add/update customer profiles (name, contact info, address)
- View historical orders per customer

### Reporting & Analytics
- Dashboard showing summaries by status, employee, or service type
- Generate daily/weekly/monthly performance reports
- employee efficiency and workload analysis

---

## Project Structure
root/
│
├── client/ # React frontend
│ ├── src/
│ └── public/
│
├── server/ # Node.js backend
│ ├── controllers/
│ ├── routes/
│ ├── models/
│ ├── config/
│ └── app.js
│
└── shared/ # Shared files (schema, SQL, constants)
└── schema

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/SOLCM.git
cd SOLCM

 
### 2. Install dependencies
cd client
npm install

cd ../server
npm install

### 3. Setup environment variables
Create a .env file inside the server folder:

env
Copy
Edit
PORT=5000
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME= SOLCM_db


### 4. Run the App
Backend:

bash
Copy
Edit
cd server
node app.js   # or: nodemon app.js

Frontend:

bash
Copy
Edit
cd client
npm run dev


### API Documentation
All backend routes are prefixed with /api

### Service Orders
POST /api/orders – Create new order

PUT /api/orders/:id – Update order

DELETE /api/orders/:id – Delete order

GET /api/orders – List all orders

### Employees
GET /api/employees – List all Employees

POST /api/employees – Add employee

GET /api/employees/:id – employee profile & assigned services

### Customers
POST /api/customers – Add customer

GET /api/customers/:id/orders – Get customer’s order history

### Reports
GET /api/reports/summary

GET /api/reports/employee/:id

### Database
Located in /shared/schema.sql

### License
MIT License

 

