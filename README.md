# Sweety – Blood Glucose Tracker

A full-stack web application that helps diabetes patients record, manage, and monitor their daily blood glucose readings.

Users can record up to four glucose readings per day and view daily, month-to-date, and previous monthly reports.

## 🚀 Technologies Used

### Frontend
- React.js
- JavaScript
- HTML5
- CSS3
- Vite
- Axios

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- bcrypt

## ✨ Features

### 1. User Authentication
- User registration and login.
- Password hashing using bcrypt.
- JWT-based authentication.
- Protected API routes.
- Users can access only their own glucose readings.

### 2. Glucose Reading Management
- Add new glucose readings.
- View recorded readings.
- Edit existing readings.
- Delete readings.
- Each reading includes a date, time slot, and glucose value in mg/dl.

**Supported daily time slots:**
- Morning (Fasting)
- After breakfast
- After lunch
- After dinner

### 3. Reading Validation

The application implements the following validation rules:

- Glucose value is required.
- Glucose value must be a whole number between 40 and 600 mg/dl.
- Only one reading is allowed per time slot per day.
- A maximum of four readings is allowed per day.
- Future dates are not allowed.
- Appropriate error messages are displayed when validation fails.

### 4. Dashboard and Reports

**Dashboard**
- Displays glucose reading summaries.
- Shows today's reading information.
- Provides an overview of recorded readings.

**Daily Report**
- Displays readings for a selected date.
- Lists individual readings with their time slots.
- Shows highest, lowest, average, and total readings.

**Month-to-Date Report**
- Displays readings from the first day of the selected month up to the selected date.
- Provides glucose reading statistics.

**Previous Monthly Report**
- Displays readings for the entire previous calendar month.
- Provides highest, lowest, average, and total readings.

All report averages are rounded to one decimal place. Friendly empty states are displayed when no readings are available.

## 📁 Project Structure

```text
Sweety-Blood-Glucose-Tracker/
│
├── backend/
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   ├── routes/
│   │   ├── glucoseRoutes.js
│   │   └── usersRoutes.js
│   │
│   ├── .env.example
│   ├── db.js
│   ├── package.json
│   ├── seed.js
│   └── server.js
│
├── frontend/
│   │
│   ├── public/
│   │
│   ├── src/
│   │   ├── assets/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   │
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## 🛠️ Installation and Setup

### Prerequisites

Install the following software:

- Node.js and npm
- PostgreSQL
- pgAdmin 4
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/SriNarendra/Sweety-Blood-Glucose-Tracker.git
```

Navigate to the project directory:

```bash
cd Sweety-Blood-Glucose-Tracker
```

### 2. Database Setup

1. Open PostgreSQL using pgAdmin 4.
2. Create a database named `sweety`.
3. Select the database and open Query Tool.
4. Execute the following SQL commands:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    password VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE readings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    glucose_level INTEGER NOT NULL,
    reading_date DATE NOT NULL,
    time_slot VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_readings_users
        FOREIGN KEY (user_id)
        REFERENCES users(id)
);
```

### 3. Backend Setup

Open a terminal and navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the backend directory using `.env.example` as a reference.

Configure the PostgreSQL connection and application settings:

```env
DB_USER=your_database_user
DB_HOST=localhost
DB_NAME=sweety
DB_PASSWORD=your_database_password
DB_PORT=5432
PORT=8000
JWT_SECRET=your_secret_key
```

Replace the example values with your local PostgreSQL credentials and a secure JWT secret.

### 4. Seed Demo Data

The project includes a seed script to create a demo user and insert sample glucose readings.

Run the following command from the backend directory:

```bash
npm run seed
```

The seed script:

- Creates a demo user if one does not already exist.
- Hashes the demo password using bcrypt.
- Inserts four sample glucose readings.
- Avoids duplicate readings when executed again.

**Demo Login Credentials**

| Field | Value |
|---|---|
| Email | demo@sweety.com |
| Password | Sweety@123 |

### 5. Start the Backend Server

From the backend directory, execute:

```bash
npm start
```

The backend server will run on:

```text
http://localhost:8000
```

### 6. Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm run dev
```

Open the application in your browser:

```text
http://localhost:5173
```

## 🗄️ Database Design

The application uses PostgreSQL with two main tables.

### Users Table

| Column | Description |
|---|---|
| id | Primary key |
| name | User's name |
| email | User's email |
| password | Bcrypt-hashed password |
| created_at | Account creation timestamp |

### Readings Table

| Column | Description |
|---|---|
| id | Primary key |
| user_id | Foreign key referencing users.id |
| glucose_level | Glucose value in mg/dl |
| reading_date | Reading date |
| time_slot | Reading time slot |
| created_at | Reading creation timestamp |

**Relationship:** One user can have multiple glucose readings. Each reading belongs to one user.

## 🔐 Security

- Passwords are hashed using bcrypt.
- JWT authentication protects private API routes.
- User-specific data access is enforced.
- Environment variables are used for sensitive configuration.
- Database credentials and JWT secrets are excluded from Git.
- Authenticated users can access only their own readings.

## 📝 Assumptions and Future Improvements

### Assumptions

- Each user can record a maximum of four readings per day.
- Each time slot can have only one reading per day.
- Glucose readings are recorded in mg/dl.
- Future dates are not allowed.
- Users must authenticate before accessing their glucose readings and reports.

### Future Improvements

- Graphical glucose trend analysis.
- Pagination for glucose readings.
- Automated backend and frontend testing.
- Docker-based application setup.
- Cloud deployment.
- Additional healthcare reporting features.

## 👨‍💻 Developer

**Sarnala Sri Narendra**

B.Tech – Artificial Intelligence and Data Science

GitHub: https://github.com/SriNarendra

## 📌 Project Information

**Project Name:** Sweety – Blood Glucose Tracker

**Developed Using:** React.js, Node.js, Express.js, and PostgreSQL.

**Assignment:** Junior Full Stack Developer – JavaScript & AI

**Organization:** Kenpath

---

Thank you for reviewing my project!
