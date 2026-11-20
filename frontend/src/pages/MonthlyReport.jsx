
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function MonthlyReport() {

    const navigate = useNavigate();

    const today = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata"
    });

    const [selectedDate, setSelectedDate] = useState(today);

    const [currentReport, setCurrentReport] = useState(null);
    const [previousReport, setPreviousReport] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch current month report
    const fetchCurrentReport = async (date = selectedDate) => {

        const response = await API.get(
            "/glucose/report/month-to-date",
            {
                params: { date }
            }
        );

        setCurrentReport(response.data);
    };

    // Fetch previous month report
    const fetchPreviousReport = async () => {

        const response = await API.get(
            "/glucose/report/previous-month"
        );

        setPreviousReport(response.data);
    };

    // Fetch both reports
    const fetchReports = async (date = selectedDate) => {

        try {

            setLoading(true);
            setError("");

            await Promise.all([
                fetchCurrentReport(date),
                fetchPreviousReport()
            ]);

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to fetch monthly reports."
            );

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {
        fetchReports(today);
    }, []);

    const formatDate = (date) => {

        if (!date) return "-";

        const [year, month, day] = String(date).slice(0, 10).split("-");

        return `${day}-${month}-${year}`;
    };

    // Reusable report section
    const ReportSection = ({ title, data }) => {

        if (!data) return null;

        const summary = data.summary || {};
        const readings = data.readings || [];

        return (

            <section className="dashboard-panel">

                <div className="panel-header">
                    <div>
                        <h2>{title}</h2>

                        <p>
                            {formatDate(data.start_date)} to{" "}
                            {formatDate(data.end_date)}
                        </p>
                    </div>
                </div>

                <div className="summary-grid">

                    <div className="summary-card blue">
                        <span>Total Readings</span>
                        <h3>{Number(summary.total_readings || 0)}</h3>
                    </div>

                    <div className="summary-card green">
                        <span>Average Glucose</span>
                        <h3>{summary.average_glucose ?? "--"}</h3>
                        <p>mg/dL</p>
                    </div>

                    <div className="summary-card cyan">
                        <span>Minimum Glucose</span>
                        <h3>{summary.minimum_glucose ?? "--"}</h3>
                        <p>mg/dL</p>
                    </div>

                    <div className="summary-card orange">
                        <span>Maximum Glucose</span>
                        <h3>{summary.maximum_glucose ?? "--"}</h3>
                        <p>mg/dL</p>
                    </div>

                </div>

                <h3>Reading History</h3>

                {readings.length === 0 ? (

                    <p className="empty-message">
                        No readings available for this month.
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

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>

        );
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
                    <Link to="/add-reading" className="nav-link">＋ Add Reading</Link>
                    <Link to="/daily-report" className="nav-link">▥ Daily Report</Link>
                    <Link to="/monthly-report" className="nav-link active">▧ Monthly Report</Link>
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
                        <h1>Monthly Reports</h1>
                        <p>Track and compare your monthly glucose readings.</p>
                    </div>
                </header>

                <section className="dashboard-panel">

                    <h2>Select Current Month Report Date</h2>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            fetchReports(selectedDate);
                        }}
                    >

                        <div className="form-group">

                            <label>Select Date</label>

                            <input
                                type="date"
                                value={selectedDate}
                                max={today}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                required
                            />

                        </div>

                        <button type="submit" disabled={loading}>
                            Generate Reports
                        </button>

                    </form>

                </section>

                {error && (
                    <p className="error-message">{error}</p>
                )}

                {loading && (
                    <p>Loading monthly reports...</p>
                )}

                {!loading && currentReport && (
                    <ReportSection
                        title={`Current Month: ${currentReport.month}`}
                        data={currentReport}
                    />
                )}

                {!loading && previousReport && (
                    <ReportSection
                        title="Previous Month Report"
                        data={previousReport}
                    />
                )}

                <footer className="dashboard-footer">
                    © 2026 Sweety Blood Glucose Tracker
                </footer>

            </main>

        </div>
    );
}

export default MonthlyReport;
