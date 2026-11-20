
const express = require("express");
const router = express.Router();

const pool = require("../db");
const authenticateToken = require("../middleware/authMiddleware");

// Allowed glucose reading time slots
const allowedSlots = [
    "Morning",
    "After breakfast",
    "After lunch",
    "After dinner"
];

// Common validation function for ADD and UPDATE
function validateReading(glucose_level, reading_date, time_slot) {

    // Validate glucose level
    if (
        glucose_level === undefined ||
        glucose_level === null ||
        glucose_level === "" ||
        !Number.isInteger(Number(glucose_level)) ||
        Number(glucose_level) < 40 ||
        Number(glucose_level) > 600
    ) {
        return "Glucose level must be a whole number between 40 and 600.";
    }

    // Validate required fields
    if (!reading_date || !time_slot) {
        return "Reading date and time slot are required.";
    }

    // Validate time slot
    if (!allowedSlots.includes(time_slot)) {
        return "Invalid time slot.";
    }

    // Validate date format and actual calendar date
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    const parsedDate = new Date(`${reading_date}T00:00:00Z`);

    if (
        typeof reading_date !== "string" ||
        !datePattern.test(reading_date) ||
        Number.isNaN(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !== reading_date
    ) {
        return "Invalid date. Use YYYY-MM-DD format.";
    }

    // Get today's date in India
   // Get today's date in India
const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata"
});

console.log("Received Date:", reading_date);
console.log("Today's Date:", today);
console.log("Future Date:", reading_date > today);

if (reading_date > today) {
    return "Future dates are not allowed.";
}
    return null;
}

// Common error handler
function handleDatabaseError(error, res) {

    if (error.message && error.message.includes("DAILY_LIMIT_REACHED")) {
        return res.status(400).json({
            message: "You can add only 4 readings per day."
        });
    }

    if (error.code === "23505") {
        return res.status(409).json({
            message: "Reading already exists for this date and time slot."
        });
    }

    console.error(error);

    return res.status(500).json({
        message: "Internal server error"
    });
}




// Get today's date according to India timezone
function getTodayIndia() {
    return new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata"
    });
}

// Validate date format
function isValidDate(date) {

    if (typeof date !== "string") {
        return false;
    }

    const pattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!pattern.test(date)) {
        return false;
    }

    const parsedDate = new Date(`${date}T00:00:00Z`);

    return !Number.isNaN(parsedDate.getTime()) &&
        parsedDate.toISOString().slice(0, 10) === date;
}

// Get report data for a particular date range
async function getReportData(userId, startDate, endDate) {

    // Get summary
    const summaryResult = await pool.query(
        `SELECT
            COUNT(*) AS total_readings,
            ROUND(AVG(glucose_level)::numeric, 1) AS average_glucose,
            MIN(glucose_level) AS minimum_glucose,
            MAX(glucose_level) AS maximum_glucose
         FROM readings
         WHERE user_id = $1
         AND reading_date >= $2::date
         AND reading_date < $3::date`,
        [userId, startDate, endDate]
    );

    // Get individual readings
    const readingsResult = await pool.query(
        `SELECT *
         FROM readings
         WHERE user_id = $1
         AND reading_date >= $2::date
         AND reading_date < $3::date
         ORDER BY reading_date ASC, id ASC`,
        [userId, startDate, endDate]
    );

    return {
        summary: summaryResult.rows[0],
        readings: readingsResult.rows
    };
}

router.post("/add", authenticateToken, async (req, res) => {

    console.log("ADD API CALLED");
    console.log("Request Body:", req.body);

    try {

        const { glucose_level, reading_date, time_slot } = req.body;

        console.log("VALIDATION FUNCTION CALLED");

        const validationError = validateReading(
            glucose_level,
            reading_date,
            time_slot
        );

        console.log("Validation Result:", validationError);

        if (validationError) {
            return res.status(400).json({
                message: validationError
            });
        }

        // Insert reading into PostgreSQL
        const result = await pool.query(
            `INSERT INTO readings
            (user_id, glucose_level, reading_date, time_slot)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [
                req.user.userId,
                Number(glucose_level),
                reading_date,
                time_slot
            ]
        );

        return res.status(201).json({
            message: "Glucose reading added successfully",
            reading: result.rows[0]
        });

    } catch (error) {
        return handleDatabaseError(error, res);
    }
});


// ==========================================
// GET ALL GLUCOSE READINGS
// GET /all
// ==========================================


router.get("/all", authenticateToken, async (req, res) => {

    try {

        const result = await pool.query(
            `SELECT
                id,
                user_id,
                glucose_level,
                TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date,
                time_slot,
                created_at
             FROM readings
             WHERE user_id = $1
             ORDER BY reading_date DESC, created_at DESC`,
            [req.user.userId]
        );

        return res.status(200).json({
            message: "Readings fetched successfully",
            readings: result.rows
        });

    } catch (error) {

        console.error("Fetch Readings Error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
});


// ==========================================
// UPDATE GLUCOSE READING
// PUT /update/:id
// ==========================================

router.put("/update/:id", authenticateToken, async (req, res) => {

    try {

        const { glucose_level, reading_date, time_slot } = req.body;

        // Validate reading ID
        const readingId = Number(req.params.id);

        if (!Number.isInteger(readingId) || readingId <= 0) {
            return res.status(400).json({
                message: "Invalid reading ID."
            });
        }

        // Validate input
        const validationError = validateReading(
            glucose_level,
            reading_date,
            time_slot
        );

        if (validationError) {
            return res.status(400).json({
                message: validationError
            });
        }

        // Update only the logged-in user's reading
        const result = await pool.query(
            `UPDATE readings
             SET glucose_level = $1,
                 reading_date = $2,
                 time_slot = $3
             WHERE id = $4 AND user_id = $5
             RETURNING *`,
            [
                Number(glucose_level),
                reading_date,
                time_slot,
                readingId,
                req.user.userId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Reading not found."
            });
        }

        return res.status(200).json({
            message: "Reading updated successfully",
            reading: result.rows[0]
        });

    } catch (error) {
        return handleDatabaseError(error, res);
    }
});


// ==========================================
// DELETE GLUCOSE READING
// DELETE /delete/:id
// ==========================================

router.delete("/delete/:id", authenticateToken, async (req, res) => {

    try {

        const readingId = Number(req.params.id);

        if (!Number.isInteger(readingId) || readingId <= 0) {
            return res.status(400).json({
                message: "Invalid reading ID."
            });
        }

        const result = await pool.query(
            `DELETE FROM readings
             WHERE id = $1 AND user_id = $2
             RETURNING *`,
            [readingId, req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Reading not found."
            });
        }

        return res.status(200).json({
            message: "Reading deleted successfully"
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
});




// ==========================================
// DAILY GLUCOSE REPORT
// GET /report/daily?date=YYYY-MM-DD
// ==========================================

router.get("/report/daily", authenticateToken, async (req, res) => {

    try {

        // If date is not provided, use today's date
        const selectedDate = req.query.date || getTodayIndia();

        if (!isValidDate(selectedDate)) {
            return res.status(400).json({
                message: "Invalid date. Use YYYY-MM-DD format."
            });
        }

        if (selectedDate > getTodayIndia()) {
            return res.status(400).json({
                message: "Future date reports are not allowed."
            });
        }

        // Calculate next date (exclusive end date)
        const nextDate = new Date(`${selectedDate}T00:00:00Z`);
        nextDate.setUTCDate(nextDate.getUTCDate() + 1);

        const endDate = nextDate.toISOString().slice(0, 10);

        const report = await getReportData(
            req.user.userId,
            selectedDate,
            endDate
        );

        return res.status(200).json({
            message: "Daily report fetched successfully",
            date: selectedDate,
            summary: report.summary,
            readings: report.readings
        });

    } catch (error) {

        console.error("Daily Report Error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
});




router.get("/report/month-to-date", authenticateToken, async (req, res) => {
    try {

        // Get selected date or today's date
        const selectedDate = req.query.date || getTodayIndia();

        // Validate date
        if (!isValidDate(selectedDate)) {
            return res.status(400).json({
                message: "Invalid date. Use YYYY-MM-DD format."
            });
        }

        // Prevent future dates
        if (selectedDate > getTodayIndia()) {
            return res.status(400).json({
                message: "Date cannot be in the future."
            });
        }

        // First day of selected month
        const startDate = selectedDate.slice(0, 7) + "-01";

        // Calculate next day (exclusive end date)
        const nextDate = new Date(`${selectedDate}T00:00:00Z`);
        nextDate.setUTCDate(nextDate.getUTCDate() + 1);

        const endDate = nextDate.toISOString().slice(0, 10);

        // Fetch report
        const report = await getReportData(
            req.user.userId,
            startDate,
            endDate
        );

        return res.status(200).json({
            message: "Month-to-date report fetched successfully",
            month: selectedDate.slice(0, 7),
            start_date: startDate,
            end_date: selectedDate,
            summary: report.summary,
            readings: report.readings
        });

    } catch (error) {

        console.error("Month-to-Date Report Error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

// ==========================================
// PREVIOUS MONTHLY REPORT
// GET /report/previous-month
// ==========================================

router.get("/report/previous-month", authenticateToken, async (req, res) => {

    try {

        const today = getTodayIndia();

        // First day of current month
        const currentMonthStart = today.slice(0, 7) + "-01";

        // Calculate first day of previous month
        const currentMonthDate = new Date(
            `${currentMonthStart}T00:00:00Z`
        );

        const previousMonthDate = new Date(Date.UTC(
            currentMonthDate.getUTCFullYear(),
            currentMonthDate.getUTCMonth() - 1,
            1
        ));

        const startDate = previousMonthDate.toISOString().slice(0, 10);

        // Current month start is the exclusive end date
        const endDate = currentMonthStart;

        const report = await getReportData(
            req.user.userId,
            startDate,
            endDate
        );

        return res.status(200).json({
            message: "Previous monthly report fetched successfully",
            start_date: startDate,
            end_date: new Date(
                `${endDate}T00:00:00Z`
            ).toISOString().slice(0, 10),
            summary: report.summary,
            readings: report.readings
        });

    } catch (error) {

        console.error("Previous Monthly Report Error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
});




 // ==========================================
 // USER DASHBOARD API
 // GET /dashboard
 // ==========================================

router.get("/dashboard", authenticateToken, async (req, res) => {

    try {

        // Get today's date in India
        const today = getTodayIndia();

        // Calculate date 6 days before today
        const weekStartDate = new Date(`${today}T00:00:00Z`);
        weekStartDate.setUTCDate(weekStartDate.getUTCDate() - 6);

        const startDate = weekStartDate.toISOString().slice(0, 10);

        // Calculate tomorrow (exclusive end date)
        const tomorrow = new Date(`${today}T00:00:00Z`);
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

        const endDate = tomorrow.toISOString().slice(0, 10);

        // Get logged-in user ID from JWT
        const userId = req.user.userId;


        // ======================================
        // 1. TODAY'S GLUCOSE SUMMARY
        // ======================================

        const summaryResult = await pool.query(
            `SELECT
                COUNT(*) AS total_readings,
                ROUND(AVG(glucose_level)::numeric, 1) AS average_glucose,
                MIN(glucose_level) AS minimum_glucose,
                MAX(glucose_level) AS maximum_glucose
             FROM readings
             WHERE user_id = $1
             AND reading_date = $2::date`,
            [userId, today]
        );


        // ======================================
        // 2. RECENT GLUCOSE READINGS
        // Latest 5 readings
        // ======================================

        const recentResult = await pool.query(
            `SELECT
                id,
                glucose_level,
                TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date,
                time_slot,
                created_at
             FROM readings
             WHERE user_id = $1
             ORDER BY reading_date DESC, id DESC
             LIMIT 5`,
            [userId]
        );


        // ======================================
        // 3. LAST 7 DAYS GLUCOSE REPORT
        // ======================================

        const weeklyResult = await pool.query(
            `SELECT
                TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date,
                COUNT(*) AS total_readings,
                ROUND(AVG(glucose_level)::numeric, 1) AS average_glucose
             FROM readings
             WHERE user_id = $1
             AND reading_date >= $2::date
             AND reading_date < $3::date
             GROUP BY reading_date
             ORDER BY reading_date ASC`,
            [userId, startDate, endDate]
        );


        // ======================================
        // 4. SEND DASHBOARD RESPONSE
        // ======================================

        return res.status(200).json({

            message: "Dashboard data fetched successfully",

            today: today,

            summary: summaryResult.rows[0],

            recent_readings: recentResult.rows,

            weekly_report: weeklyResult.rows

        });

    } catch (error) {

        console.error("Dashboard API Error:", error);

        return res.status(500).json({
            message: "Unable to fetch dashboard data"
        });
    }
});

// ==========================================
// GET SINGLE GLUCOSE READING
// GET /:id
// ==========================================

router.get("/:id", authenticateToken, async (req, res) => {

    try {

        const readingId = Number(req.params.id);

        if (!Number.isInteger(readingId) || readingId <= 0) {
            return res.status(400).json({
                message: "Invalid reading ID."
            });
        }

        const result = await pool.query(
            `SELECT * FROM readings
             WHERE id = $1 AND user_id = $2`,
            [readingId, req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Reading not found."
            });
        }

        return res.status(200).json({
            message: "Reading fetched successfully",
            reading: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
});


module.exports = router;
