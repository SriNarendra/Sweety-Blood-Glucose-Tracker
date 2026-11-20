
import React, { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";

function Register() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Handle input changes
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Handle registration
    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (!formData.name || !formData.email || !formData.password) {
            setError("All fields are required");
            return;
        }

        try {
            setLoading(true);

            const response = await API.post("/users/register", formData);

            setMessage(response.data.message);

            setFormData({
                name: "",
                email: "",
                password: ""
            });

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Registration failed. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">

            <div className="register-card">

                <h2>Create Account</h2>
                <p>Register to start using Sweety</p>

                {message && (
                    <p style={{ color: "green" }}>{message}</p>
                )}

                {error && (
                    <p style={{ color: "red" }}>{error}</p>
                )}

                <form onSubmit={handleSubmit}>

                    <div>
                        <label>Name</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Create password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? "Registering..." : "Register"}
                    </button>

                </form>

                <p>
                    Already have an account?{" "}
                    <Link to="/login">Login</Link>
                </p>

            </div>

        </div>
    );
}

export default Register;
