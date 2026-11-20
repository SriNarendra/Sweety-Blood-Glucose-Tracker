
const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");

const router = express.Router();

// User Registration API
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Check whether email already exists
        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        // Encrypt password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database
        const result = await pool.query(
            `INSERT INTO users (name, email, password)
             VALUES ($1, $2, $3)
             RETURNING id, name, email`,
            [name, email, hashedPassword]
        );

        return res.status(201).json({
            message: "Registration successful",
            user: result.rows[0]
        });

    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

module.exports = router;


const jwt = require("jsonwebtoken");

// User Login API
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Find user by email
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const user = result.rows[0];

        // Compare password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // Send response
        return res.status(200).json({
            message: "Login successful",
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

const authenticateToken = require("../middleware/authMiddleware");

// Protected Profile API
router.get("/profile", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, name, email FROM users WHERE id = $1",
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "Profile fetched successfully",
            user: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
});
