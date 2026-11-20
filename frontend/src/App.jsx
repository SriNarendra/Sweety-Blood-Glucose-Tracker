
import React from "react";

import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";

import GlucoseReadings from "./pages/GlucoseReading.jsx";
import AddReading from "./pages/AddReadings.jsx";
import DailyReport from "./pages/DailyReport.jsx";
import MonthlyReport from "./pages/MonthlyReport.jsx";
import Profile from "./pages/Profile.jsx";

import "./App.css";

// =====================================
// PROTECTED ROUTE
// =====================================

function ProtectedRoute({ children }) {

    const token = localStorage.getItem("token");

    return token ? children : <Navigate to="/login" />;

}

// =====================================
// APP ROUTES
// =====================================

function App() {

    return (

        <BrowserRouter>

            <Routes>

                {/* Default Route */}

                <Route
                    path="/"
                    element={<Navigate to="/login" />}
                />

                {/* Public Routes */}

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                {/* Protected Routes */}

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/readings"
                    element={
                        <ProtectedRoute>
                            <GlucoseReadings />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/add-reading"
                    element={
                        <ProtectedRoute>
                            <AddReading />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/daily-report"
                    element={
                        <ProtectedRoute>
                            <DailyReport />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/monthly-report"
                    element={
                        <ProtectedRoute>
                            <MonthlyReport />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />

                {/* Unknown Routes */}

                <Route
                    path="*"
                    element={<Navigate to="/dashboard" />}
                />

            </Routes>

        </BrowserRouter>

    );

}

export default App;
