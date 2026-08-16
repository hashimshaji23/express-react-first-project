import { useState } from "react";
import API from "../api/axios.js";
import { useNavigate } from "react-router-dom";
import "./LoginForm.css";

// Point this at wherever your login route is mounted, e.g. "/api/auth/login"
// const LOGIN_ENDPOINT = "/api/auth/login";

export default function LoginForm({ onLoginSuccess }) {
    const navigate = useNavigate();

    console.log("start");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    console.log("email", email);
    console.log("password", password)
    console.log("showapss", showPassword)

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "email") setEmail(value);
        if (name === "password") setPassword(value);
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError("Please provide email and password");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await API.post("/api/auth/login", {
                email,
                password
            });

            const data = res.data;

            localStorage.setItem("token", data.token);

            if (onLoginSuccess) {
                onLoginSuccess(data.user, data.token);
            }

            if (data.user.role === "admin") {
                navigate("/admin-main-dash");
            } else {
                navigate("/Product");
            }

        } catch (err) {
            console.error("Login request failed:", err);

            setError(
                err.response?.data?.message ||
                "Unable to reach the server. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h1 className="login-title">Welcome back</h1>
                <p className="login-subtitle">Sign in to your account to continue.</p>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Password
                        </label>
                        <div className="password-field">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                value={password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="form-input password-input"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((s) => !s)}
                                className="toggle-password-btn"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p role="alert" className="form-error">
                            {error}
                        </p>
                    )}

                    <button type="submit" disabled={loading} className="submit-btn">
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>
            </div>
        </div>
    );
}