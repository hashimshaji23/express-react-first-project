import React, { useState } from "react";
import axios from "axios";

const Register = () => {
    // form state
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user"); // default role

    // message state (to show success/error to user)
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault(); // stop page from refreshing

        // simple frontend check
        if (!name || !email || !password) {
            setMessage("All fields are required");
            return;
        }

        try {
            setLoading(true);
            setMessage("");

            const res = await axios.post("http://localhost:4000/register", {
                name,
                email,
                password,
                role,
            });

            setMessage(res.data.message || "Registered successfully!");

            // clear form after success
            setName("");
            setEmail("");
            setPassword("");
            setRole("user");

        } catch (err) {
            console.log(err);
            // backend sends message like "email already exist"
            if (err.response && err.response.data && err.response.data.message) {
                setMessage(err.response.data.message);
            } else {
                setMessage("Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "50px auto" }}>
            <h2>Register</h2>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "10px" }}>
                    <label>Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        style={{ width: "100%", padding: "8px" }}
                    />
                </div>

                <div style={{ marginBottom: "10px" }}>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        style={{ width: "100%", padding: "8px" }}
                    />
                </div>

                <div style={{ marginBottom: "10px" }}>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        style={{ width: "100%", padding: "8px" }}
                    />
                </div>

                <div style={{ marginBottom: "10px" }}>
                    <label>Role</label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        style={{ width: "100%", padding: "8px" }}
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <button type="submit" disabled={loading} style={{ width: "100%", padding: "10px" }}>
                    {loading ? "Registering..." : "Register"}
                </button>
            </form>

            {message && <p style={{ marginTop: "10px" }}>{message}</p>}
        </div>
    );
};

export default Register;