\# Sweety – Blood Glucose Tracker



A full-stack web application that helps diabetes patients record, manage, and monitor their daily blood glucose readings. Users can track up to four readings per day and view daily, month-to-date, and previous monthly reports.



\## 🚀 Technologies Used



\### Frontend

\- React.js

\- JavaScript

\- HTML5

\- CSS3

\- Vite

\- Axios



\### Backend

\- Node.js

\- Express.js

\- PostgreSQL

\- JWT Authentication

\- bcrypt



\## ✨ Features



\### 1. User Authentication

\- User registration and login.

\- Password hashing using bcrypt.

\- JWT-based authentication.

\- Users can access only their own glucose readings.



\### 2. Glucose Reading Management

\- Add new glucose readings.

\- View all recorded readings.

\- Edit existing readings.

\- Delete readings.

\- Four daily time slots:

&#x20; - Morning (Fasting)

&#x20; - After breakfast

&#x20; - After lunch

&#x20; - After dinner



\### 3. Reading Validation

\- Glucose value is required.

\- Glucose value must be a whole number between 40 and 600 mg/dl.

\- Only one reading per time slot per day.

\- Maximum four readings per day.

\- Future dates are not allowed.



\### 4. Reports and Dashboard

\- Dashboard with glucose reading summaries.

\- Daily report with individual readings.

\- Month-to-date report.

\- Previous monthly report.

\- Highest, lowest, average, and total reading count.

\- Friendly empty states when no readings are available.



\## 📁 Project Structure



```text

Sweety/

│

├── backend/

│   ├── middleware/

│   │   └── authMiddleware.js

│   ├── routes/

│   │   ├── glucoseRoutes.js

│   │   └── usersRoutes.js

│   ├── .env.example

│   ├── db.js

│   ├── package.json

│   └── server.js

│

├── frontend/

│   ├── public/

│   ├── src/

│   │   ├── assets/

│   │   ├── pages/

│   │   ├── services/

│   │   ├── App.jsx

│   │   ├── App.css

│   │   └── index.css

│   ├── package.json

│   └── vite.config.js

│

├── .gitignore

└── README.md

```



\## 🛠️ Installation and Setup



\### Prerequisites



Install the following:

\- Node.js and npm

\- PostgreSQL

\- pgAdmin 4

\- Git



\### 1. Clone the Repository



```bash

git clone https://github.com/SriNarendra/Sweety-Blood-Glucose-Tracker.git

```



```bash

cd Sweety-Blood-Glucose-Tracker

```



\### 2. Database Setup



1\. Open PostgreSQL using pgAdmin 4.

2\. Create a database named `sweety`.

3\. Select the database and open Query Tool.

4\. Execute the following SQL:



```sql

CREATE TABLE users (

&#x20;   id SERIAL PRIMARY KEY,

&#x20;   name VARCHAR NOT NULL,

&#x20;   email VARCHAR NOT NULL,

&#x20;   password VARCHAR NOT NULL,

&#x20;   created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP

);



CREATE TABLE readings (

&#x20;   id SERIAL PRIMARY KEY,

&#x20;   user\_id INTEGER NOT NULL,

&#x20;   glucose\_level INTEGER NOT NULL,

&#x20;   reading\_date DATE NOT NULL,

&#x20;   time\_slot VARCHAR NOT NULL,

&#x20;   created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,

&#x20;   CONSTRAINT fk\_readings\_users

&#x20;       FOREIGN KEY (user\_id)

&#x20;       REFERENCES users(id)

);

```



\### 3. Backend Setup



Open a terminal:



```bash

cd backend

npm install

```



Create a `.env` file inside the backend folder using `.env.example` as a reference.



Configure your PostgreSQL connection:



```env

DB\_USER=your\_database\_user

DB\_HOST=localhost

DB\_NAME=sweety

DB\_PASSWORD=your\_database\_password

DB\_PORT=5432

PORT=8000

JWT\_SECRET=your\_secret\_key

```



Start the backend:



```bash

node server.js

```



\### 4. Frontend Setup



Open another terminal:



```bash

cd frontend

npm install

```



Start the React development server:



```bash

npm run dev

```



Open the application in your browser using the local URL displayed by Vite, usually:



```text

http://localhost:5173

```



\## 🗄️ Database Design



The application uses two PostgreSQL tables.



\### Users Table



| Column | Description |

|---|---|

| id | Primary key |

| name | User's name |

| email | User's email |

| password | Hashed password |

| created\_at | Account creation timestamp |



\### Readings Table



| Column | Description |

|---|---|

| id | Primary key |

| user\_id | Foreign key referencing users.id |

| glucose\_level | Glucose value in mg/dl |

| reading\_date | Reading date |

| time\_slot | Reading time slot |

| created\_at | Reading creation timestamp |



Relationship: One user can have multiple glucose readings.



\## 🔐 Security



\- Passwords are hashed using bcrypt.

\- JWT authentication protects private routes.

\- User-specific data access is enforced.

\- Environment variables are used for sensitive configuration.

\- Database credentials and secrets are excluded from Git.



\## 📝 Assumptions and Future Improvements



\- Each user can record a maximum of four readings per day.

\- Each time slot can have only one reading per day.

\- Glucose readings are recorded in mg/dl.

\- Future improvements include graphical glucose trend analysis, pagination, automated testing, and deployment to a cloud platform.



\## 👨‍💻 Developer



\*\*Sarnala Sri Narendra\*\*



B.Tech – Artificial Intelligence and Data Science



GitHub: https://github.com/SriNarendra



\---



\*\*Project:\*\* Sweety – Blood Glucose Tracker



\*\*Developed using:\*\* React.js, Node.js, Express.js and PostgreSQL.

