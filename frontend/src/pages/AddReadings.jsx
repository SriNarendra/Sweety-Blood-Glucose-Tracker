
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function AddReading() {

    const navigate = useNavigate();

    const today = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata"
    });

    const [formData, setFormData] = useState({
        glucose_level: "",
        reading_date: today,
        time_slot: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const slots = [
        "Morning",
        "After breakfast",
        "After lunch",
        "After dinner"
    ];

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");

        const glucose = Number(formData.glucose_level);

        if (
            !Number.isInteger(glucose) ||
            glucose < 40 ||
            glucose > 600
        ) {
            setError("Enter a whole glucose value between 40 and 600.");
            return;
        }

        if (!formData.reading_date || !formData.time_slot) {
            setError("Please fill in all fields.");
            return;
        }

        if (formData.reading_date > today) {
            setError("Future dates are not allowed.");
            return;
        }

        try {

            setLoading(true);

            const response = await API.post("/glucose/add", {
                glucose_level: glucose,
                reading_date: formData.reading_date,
                time_slot: formData.time_slot
            });

            setSuccess(
                response.data.message ||
                "Glucose reading added successfully."
            );

            setFormData({
                glucose_level: "",
                reading_date: today,
                time_slot: ""
            });

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to add glucose reading."
            );

        } finally {

            setLoading(false);

        }
    };

    return (

        <div className="dashboard-page">

            <aside className="dashboard-sidebar">

                <div className="brand">
                    <span className="brand-icon">♥</span>
                    <div>
                        <h2>Sweety</h2>
                        <p>Glucose Tracker</p>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/dashboard" className="nav-link">▦ Dashboard</Link>
                    <Link to="/readings" className="nav-link">▤ Glucose Readings</Link>
                    <Link to="/add-reading" className="nav-link active">＋ Add Reading</Link>
                    <Link to="/daily-report" className="nav-link">▥ Daily Report</Link>
                    <Link to="/monthly-report" className="nav-link">▧ Monthly Report</Link>
                    <Link to="/profile" className="nav-link">♙ Profile</Link>
                </nav>

                <button
                    className="logout-button"
                    onClick={() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        navigate("/login");
                    }}
                >
                    ↪ Logout
                </button>

            </aside>

            <main className="dashboard-main">

                <header className="dashboard-header">
                    <div>
                        <h1>Add Glucose Reading</h1>
                        <p>Record your glucose measurement.</p>
                    </div>
                </header>

                <section className="dashboard-panel">

                    <h2>Reading Details</h2>

                    {error && (
                        <p className="error-message">{error}</p>
                    )}

                    {success && (
                        <p className="success-message">{success}</p>
                    )}

                    <form onSubmit={handleSubmit}>

                        <div className="form-group">
                            <label>Glucose Level (mg/dL)</label>

                            <input
                                type="number"
                                name="glucose_level"
                                placeholder="Enter glucose level"
                                min="40"
                                max="600"
                                step="1"
                                value={formData.glucose_level}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Reading Date</label>

                            <input
                                type="date"
                                name="reading_date"
                                value={formData.reading_date}
                                max={today}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Time Slot</label>

                            <select
                                name="time_slot"
                                value={formData.time_slot}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select time slot</option>

                                {slots.map(slot => (
                                    <option key={slot} value={slot}>
                                        {slot}
                                    </option>
                                ))}

                            </select>
                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save Reading"}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/readings")}
                        >
                            View All Readings
                        </button>

                    </form>

                </section>

                <footer className="dashboard-footer">
                    © 2026 Sweety Blood Glucose Tracker
                </footer>

            </main>

        </div>
    );
}

export default AddReading;
