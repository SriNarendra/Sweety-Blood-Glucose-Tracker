
import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Profile() {

    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
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
                    <Link to="/monthly-report" className="nav-link">▧ Monthly Report</Link>
                    <Link to="/profile" className="nav-link active">♙ Profile</Link>
                </nav>

                <button
                    className="logout-button"
                    onClick={handleLogout}
                >
                    ↪ Logout
                </button>

            </aside>

            <main className="dashboard-main">

                <header className="dashboard-header">

                    <div>
                        <h1>My Profile</h1>
                        <p>View your account information.</p>
                    </div>

                </header>

                <section className="dashboard-panel">

                    <div className="user-info">

                        <div className="user-avatar">
                            {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>

                        <div>
                            <h2>{user.name || "User"}</h2>
                            <p>{user.email || "Email not available"}</p>
                        </div>

                    </div>

                    <div className="profile-details">

                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                value={user.name || ""}
                                readOnly
                            />
                        </div>

                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                value={user.email || ""}
                                readOnly
                            />
                        </div>

                    </div>

                    <p>
                        Your profile information is currently displayed
                        from your login session.
                    </p>

                    <button onClick={handleLogout}>
                        Logout
                    </button>

                </section>

                <footer className="dashboard-footer">
                    © 2026 Sweety Blood Glucose Tracker
                </footer>

            </main>

        </div>
    );
}

export default Profile;
