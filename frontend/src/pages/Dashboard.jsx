
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Dashboard() {

    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    // =====================================
    // FETCH DASHBOARD DATA
    // =====================================

    const fetchDashboard = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await API.get("/glucose/dashboard");

            setDashboard(response.data);

        } catch (error) {

            console.error("Dashboard Error:", error);

            setError(
                error.response?.data?.message ||
                "Unable to load dashboard data."
            );

            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {

                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/login");
            }

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {

        fetchDashboard();

    }, []);

    // =====================================
    // LOGOUT
    // =====================================

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");

    };

    // =====================================
    // FORMAT DATE
    // =====================================

    const formatDate = (date) => {

        if (!date) return "-";

        const [year, month, day] = date.split("-");

        return `${day}-${month}-${year}`;

    };

    // =====================================
    // LOADING
    // =====================================

    if (loading) {

        return (
            <div className="dashboard-loading">

                <div className="loader"></div>

                <h3>Loading your dashboard...</h3>

            </div>
        );

    }

    // =====================================
    // ERROR
    // =====================================

    if (error) {

        return (
            <div className="dashboard-error">

                <h2>Something went wrong</h2>

                <p>{error}</p>

                <button onClick={fetchDashboard}>
                    Try Again
                </button>

            </div>
        );

    }

    if (!dashboard) {

        return <h2>No dashboard data available.</h2>;

    }

    // =====================================
    // BACKEND RESPONSE DATA
    // =====================================

    const summary = dashboard.summary || {};

    const recentReadings = dashboard.recent_readings || [];

    const weeklyReport = dashboard.weekly_report || [];

    // Convert PostgreSQL numeric values into numbers
    const totalReadings = Number(summary.total_readings || 0);

    const averageGlucose =
        summary.average_glucose !== null
            ? summary.average_glucose
            : "--";

    const minimumGlucose =
        summary.minimum_glucose !== null
            ? summary.minimum_glucose
            : "--";

    const maximumGlucose =
        summary.maximum_glucose !== null
            ? summary.maximum_glucose
            : "--";

    // Find maximum weekly average for chart
    const maxWeeklyGlucose = Math.max(
        ...weeklyReport.map(item =>
            Number(item.average_glucose) || 0
        ),
        1
    );

    // =====================================
    // DASHBOARD UI
    // =====================================

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

                    <Link
                        to="/dashboard"
                        className="nav-link active"
                    >
                        ▦ Dashboard
                    </Link>

                    <Link
                        to="/readings"
                        className="nav-link"
                    >
                        ▤ Glucose Readings
                    </Link>

                    <Link
                        to="/add-reading"
                        className="nav-link"
                    >
                        ＋ Add Reading
                    </Link>

                    <Link
                        to="/daily-report"
                        className="nav-link"
                    >
                        ▥ Daily Report
                    </Link>

                    <Link
                        to="/monthly-report"
                        className="nav-link"
                    >
                        ▧ Monthly Report
                    </Link>

                    <Link
                        to="/profile"
                        className="nav-link"
                    >
                        ♙ Profile
                    </Link>

                </nav>

                <button
                    className="logout-button"
                    onClick={handleLogout}
                >
                    ↪ Logout
                </button>

            </aside>

            {/* MAIN CONTENT */}

            <main className="dashboard-main">

                {/* HEADER */}

                <header className="dashboard-header">

                    <div>
                        <h1>Dashboard</h1>

                        <p>
                            Monitor and manage your glucose readings.
                        </p>
                    </div>

                    <div className="user-info">

                        <div className="user-avatar">

                            {user.name?.charAt(0).toUpperCase() || "U"}

                        </div>

                        <div>
                            <h4>{user.name || "User"}</h4>

                            <p>{user.email || ""}</p>
                        </div>

                    </div>

                </header>

                {/* WELCOME SECTION */}

                <section className="welcome-section">

                    <div>

                        <h2>
                            Welcome back, {user.name || "User"}!
                        </h2>

                        <p>
                            Here is your glucose summary for today.
                        </p>

                    </div>

                    <span className="today-date">
                        {formatDate(dashboard.today)}
                    </span>

                </section>

                {/* TODAY SUMMARY */}

                <section className="summary-section">

                    <h2>Today's Summary</h2>

                    <div className="summary-grid">

                        <div className="summary-card blue">

                            <div className="card-top">
                                <span>Total Readings</span>
                                <span className="card-icon">▤</span>
                            </div>

                            <h3>{totalReadings}</h3>

                            <p>Readings recorded today</p>

                        </div>

                        <div className="summary-card green">

                            <div className="card-top">
                                <span>Average Glucose</span>
                                <span className="card-icon">⌁</span>
                            </div>

                            <h3>{averageGlucose}</h3>

                            <p>mg/dL</p>

                        </div>

                        <div className="summary-card cyan">

                            <div className="card-top">
                                <span>Minimum Glucose</span>
                                <span className="card-icon">↓</span>
                            </div>

                            <h3>{minimumGlucose}</h3>

                            <p>mg/dL</p>

                        </div>

                        <div className="summary-card orange">

                            <div className="card-top">
                                <span>Maximum Glucose</span>
                                <span className="card-icon">↑</span>
                            </div>

                            <h3>{maximumGlucose}</h3>

                            <p>mg/dL</p>

                        </div>

                    </div>

                </section>

                {/* WEEKLY REPORT */}

                <section className="dashboard-panel">

                    <div className="panel-header">

                        <div>
                            <h2>Last 7 Days</h2>

                            <p>
                                Average glucose readings by day
                            </p>
                        </div>

                    </div>

                    {weeklyReport.length === 0 ? (

                        <p className="empty-message">
                            No readings available for the last 7 days.
                        </p>

                    ) : (

                        <div className="weekly-chart">

                            {weeklyReport.map((item, index) => {

                                const value =
                                    Number(item.average_glucose) || 0;

                                const barWidth =
                                    (value / maxWeeklyGlucose) * 100;

                                return (

                                    <div
                                        className="weekly-row"
                                        key={item.reading_date || index}
                                    >

                                        <span className="weekly-date">
                                            {formatDate(item.reading_date)}
                                        </span>

                                        <div className="weekly-bar-bg">

                                            <div
                                                className="weekly-bar"
                                                style={{
                                                    width: `${barWidth}%`
                                                }}
                                            ></div>

                                        </div>

                                        <span className="weekly-value">
                                            {value} mg/dL
                                        </span>

                                    </div>

                                );

                            })}

                        </div>

                    )}

                </section>

                {/* RECENT READINGS */}

                <section className="dashboard-panel">

                    <div className="panel-header">

                        <div>
                            <h2>Recent Readings</h2>

                            <p>
                                Your latest 5 glucose readings
                            </p>
                        </div>

                        <Link
                            to="/readings"
                            className="view-all"
                        >
                            View All →
                        </Link>

                    </div>

                    {recentReadings.length === 0 ? (

                        <p className="empty-message">
                            No glucose readings recorded yet.
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

                                    {recentReadings.map(reading => (

                                        <tr key={reading.id}>

                                            <td>
                                                {formatDate(
                                                    reading.reading_date
                                                )}
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

                {/* FOOTER */}

                <footer className="dashboard-footer">

                    © 2026 Sweety Blood Glucose Tracker

                </footer>

            </main>

        </div>

    );

}

export default Dashboard;
