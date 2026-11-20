
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function GlucoseReadings() {

    const [readings, setReadings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [editingReading, setEditingReading] = useState(null);

    const [formData, setFormData] = useState({
        glucose_level: "",
        reading_date: "",
        time_slot: ""
    });

    const slots = [
        "Morning",
        "After breakfast",
        "After lunch",
        "After dinner"
    ];

    // Convert database date into YYYY-MM-DD safely
    const getDateValue = (date) => {

        if (!date) return "";

        // PostgreSQL DATE commonly arrives as a string
        if (typeof date === "string") {
            return date.slice(0, 10);
        }

        // Handle JavaScript Date objects using local date parts
        if (date instanceof Date && !isNaN(date.getTime())) {

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");

            return `${year}-${month}-${day}`;
        }

        return "";
    };

    // Display date as DD-MM-YYYY
    const formatDate = (date) => {

        const value = getDateValue(date);

        if (!value) return "-";

        const [year, month, day] = value.split("-");

        return `${day}-${month}-${year}`;
    };

    // Fetch all readings
    const fetchReadings = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await API.get("/glucose/all");

            setReadings(response.data.readings || []);

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to fetch glucose readings."
            );

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReadings();
    }, []);

    // Open edit form
    const handleEdit = (reading) => {

        setEditingReading(reading.id);

        setFormData({
            glucose_level: reading.glucose_level,
            reading_date: getDateValue(reading.reading_date),
            time_slot: reading.time_slot
        });

        setError("");
        setSuccess("");
    };

    // Handle form changes
    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData(previous => ({
            ...previous,
            [name]: value
        }));
    };

    // Cancel edit
    const handleCancel = () => {

        setEditingReading(null);

        setFormData({
            glucose_level: "",
            reading_date: "",
            time_slot: ""
        });

        setError("");
    };

    // Update reading
    const handleUpdate = async (e) => {

        e.preventDefault();

        try {

            setError("");
            setSuccess("");

            const response = await API.put(
                `/glucose/update/${editingReading}`,
                {
                    glucose_level: Number(formData.glucose_level),
                    reading_date: formData.reading_date,
                    time_slot: formData.time_slot
                }
            );

            setSuccess(
                response.data.message ||
                "Reading updated successfully."
            );

            setEditingReading(null);

            await fetchReadings();

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to update reading."
            );
        }
    };

    // Delete reading
    const handleDelete = async (id) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this reading?"
        );

        if (!confirmDelete) return;

        try {

            setError("");
            setSuccess("");

            const response = await API.delete(
                `/glucose/delete/${id}`
            );

            setSuccess(
                response.data.message ||
                "Reading deleted successfully."
            );

            await fetchReadings();

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to delete reading."
            );
        }
    };

    if (loading) {

        return (
            <div className="dashboard-loading">
                <div className="loader"></div>
                <h3>Loading glucose readings...</h3>
            </div>
        );
    }

    return (

        <div className="dashboard-page">

            {/* SIDEBAR */}

            <aside className="dashboard-sidebar">

                <div className="brand">
                    <span className="brand-icon">♥</span>

                    <div>
                        <h2>Sweety</h2>
                        <p>Glucose Tracker</p>
                    </div>
                </div>

                <nav className="sidebar-nav">

                    <Link to="/dashboard" className="nav-link">
                        ▦ Dashboard
                    </Link>

                    <Link to="/readings" className="nav-link active">
                        ▤ Glucose Readings
                    </Link>

                    <Link to="/add-reading" className="nav-link">
                        ＋ Add Reading
                    </Link>

                    <Link to="/daily-report" className="nav-link">
                        ▥ Daily Report
                    </Link>

                    <Link to="/monthly-report" className="nav-link">
                        ▧ Monthly Report
                    </Link>

                    <Link to="/profile" className="nav-link">
                        ♙ Profile
                    </Link>

                </nav>

                <button
                    className="logout-button"
                    onClick={() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        window.location.href = "/login";
                    }}
                >
                    ↪ Logout
                </button>

            </aside>

            {/* MAIN CONTENT */}

            <main className="dashboard-main">

                <header className="dashboard-header">

                    <div>
                        <h1>Glucose Readings</h1>
                        <p>View and manage your glucose history.</p>
                    </div>

                    <Link to="/add-reading" className="view-all">
                        + Add Reading
                    </Link>

                </header>

                {/* ERROR MESSAGE */}

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {/* SUCCESS MESSAGE */}

                {success && (
                    <div className="success-message">
                        {success}
                    </div>
                )}

                {/* EDIT FORM */}

                {editingReading !== null && (

                    <section className="dashboard-panel">

                        <h2>Edit Glucose Reading</h2>

                        <form onSubmit={handleUpdate}>

                            <div className="form-group">

                                <label>Glucose Level (mg/dL)</label>

                                <input
                                    type="number"
                                    name="glucose_level"
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

                                    <option value="">
                                        Select time slot
                                    </option>

                                    {slots.map(slot => (
                                        <option key={slot} value={slot}>
                                            {slot}
                                        </option>
                                    ))}

                                </select>

                            </div>

                            <button type="submit">
                                Update Reading
                            </button>

                            <button
                                type="button"
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>

                        </form>

                    </section>
                )}

                {/* READINGS TABLE */}

                <section className="dashboard-panel">

                    <div className="panel-header">

                        <div>
                            <h2>All Readings</h2>

                            <p>
                                Total readings: {readings.length}
                            </p>
                        </div>

                        <button onClick={fetchReadings}>
                            Refresh
                        </button>

                    </div>

                    {readings.length === 0 ? (

                        <p className="empty-message">
                            No glucose readings available.
                        </p>

                    ) : (

                        <div className="table-container">

                            <table className="readings-table">

                                <thead>

                                    <tr>
                                        <th>Date</th>
                                        <th>Glucose Level</th>
                                        <th>Time Slot</th>
                                        <th>Actions</th>
                                    </tr>

                                </thead>

                                <tbody>

                                    {readings.map(reading => (

                                        <tr key={reading.id}>

                                            <td>
                                                {formatDate(reading.reading_date)}
                                            </td>

                                            <td className="glucose-value">
                                                {reading.glucose_level} mg/dL
                                            </td>

                                            <td>
                                                <span className="time-badge">
                                                    {reading.time_slot}
                                                </span>
                                            </td>

                                            <td>

                                                <button
                                                    type="button"
                                                    onClick={() => handleEdit(reading)}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(reading.id)}
                                                >
                                                    Delete
                                                </button>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

                <footer className="dashboard-footer">
                    © 2026 Sweety Blood Glucose Tracker
                </footer>

            </main>

        </div>
    );
}

export default GlucoseReadings;
