
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function DailyReport() {

    const navigate = useNavigate();

    const today = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata"
    });

    const [selectedDate, setSelectedDate] = useState(today);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchReport = async (date = selectedDate) => {

        try {

            setLoading(true);
            setError("");

            const response = await API.get(
                "/glucose/report/daily",
                {
                    params: { date }
                }
            );

            setReport(response.data);

        } catch (err) {

            setReport(null);

            setError(
                err.response?.data?.message ||
                "Unable to fetch daily report."
            );

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {
        fetchReport(today);
    }, []);

    const formatDate = (date) => {

        if (!date) return "-";

        const [year, month, day] = String(date).slice(0, 10).split("-");

        return `${day}-${month}-${year}`;
    };

    const summary = report?.summary || {};

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
                    <Link to="/add-reading" className="nav-link">＋ Add Reading</Link>
                    <Link to="/daily-report" className="nav-link active">▥ Daily Report</Link>
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
                        <h1>Daily Glucose Report</h1>
                        <p>View your glucose measurements for a selected day.</p>
                    </div>
                </header>

                <section className="dashboard-panel">

                    <h2>Select Date</h2>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            fetchReport(selectedDate);
                        }}
                    >

                        <div className="form-group">

                            <label>Report Date</label>

                            <input
                                type="date"
                                value={selectedDate}
                                max={today}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                required
                            />

                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? "Loading..." : "Generate Report"}
                        </button>

                    </form>

                </section>

                {error && (
                    <p className="error-message">{error}</p>
                )}

                {loading && (
                    <p>Loading daily report...</p>
                )}

                {report && !loading && (

                    <>

                        <section className="summary-section">

                            <h2>Summary for {formatDate(report.date)}</h2>

                            <div className="summary-grid">

                                <div className="summary-card blue">
                                    <div className="card-top">
                                        <span>Total Readings</span>
                                    </div>
                                    <h3>{Number(summary.total_readings || 0)}</h3>
                                    <p>Readings recorded</p>
                                </div>

                                <div className="summary-card green">
                                    <div className="card-top">
                                        <span>Average Glucose</span>
                                    </div>
                                    <h3>{summary.average_glucose ?? "--"}</h3>
                                    <p>mg/dL</p>
                                </div>

                                <div className="summary-card cyan">
                                    <div className="card-top">
                                        <span>Minimum Glucose</span>
                                    </div>
                                    <h3>{summary.minimum_glucose ?? "--"}</h3>
                                    <p>mg/dL</p>
                                </div>

                                <div className="summary-card orange">
                                    <div className="card-top">
                                        <span>Maximum Glucose</span>
                                    </div>
                                    <h3>{summary.maximum_glucose ?? "--"}</h3>
                                    <p>mg/dL</p>
                                </div>

                            </div>

                        </section>

                        <section className="dashboard-panel">

                            <h2>Daily Readings</h2>

                            {report.readings?.length === 0 ? (

                                <p className="empty-message">
                                    No readings found for this date.
                                </p>

                            ) : (

                                <div className="table-container">

                                    <table className="readings-table">

                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Glucose Level</th>
                                                <th>Time Slot</th>
                                            </tr>
                                        </thead>

                                        <tbody>

                                            {report.readings.map(reading => (

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

                                                </tr>

                                            ))}

                                        </tbody>

                                    </table>

                                </div>

                            )}

                        </section>

                    </>

                )}

                <footer className="dashboard-footer">
                    © 2026 Sweety Blood Glucose Tracker
                </footer>

            </main>

        </div>
    );
}

export default DailyReport;
