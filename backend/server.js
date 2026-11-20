
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

const PORT = process.env.PORT || 8000;

// 1. Enable CORS before all routes
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// 2. JSON middleware
app.use(express.json());

console.log("JWT Secret Loaded:", !!process.env.JWT_SECRET);

// 3. Test API
app.get("/", (req, res) => {
    res.send("Welcome to Sweety Blood Glucose Tracker!");
});

// 4. Test PostgreSQL API
app.get("/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.status(200).json({
            message: "Database connected successfully!",
            time: result.rows[0].now
        });

    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            message: "Database connection failed"
        });
    }
});

// 5. Routes
const usersRoutes = require("./routes/usersRoutes");
app.use("/api/users", usersRoutes);

const glucoseRoutes = require("./routes/glucoseRoutes");
app.use("/api/glucose", glucoseRoutes);

// 6. Start server LAST
app.listen(PORT, () => {
    console.log(`Sweety server running on port ${PORT}`);
});
