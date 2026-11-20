
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");

        try {
            setLoading(true);

            // Call backend login API
            const response = await API.post("/users/login", {
                email,
                password
            });

            // Get response data
            const { token, user, message } = response.data;

            // Store JWT token
            localStorage.setItem("token", token);

            // Store logged-in user details
            localStorage.setItem("user", JSON.stringify(user));

            alert(message);

            // Navigate to Dashboard
            navigate("/dashboard");

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Login failed. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">

            <h1>Sweety</h1>
            <p>Blood Glucose Tracker</p>

            <form onSubmit={handleLogin}>

                {error && (
                    <p style={{ color: "red" }}>
                        {error}
                    </p>
                )}

                <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>

            </form>

            <p>
                Don't have an account?{" "}
                <Link to="/register">Register here</Link>
            </p>

        </div>
    );
}

export default Login;
