import { useState } from "react";

const initialForm = {
    name: "",
    email: "",
    password: "",
    role: "user",
};

export default function Register() {
    const [form, setForm] = useState(initialForm);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.name || !form.email || !form.password) {
            setError("All fields are required.");
            return;
        }

        if (form.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Something went wrong.");
                setLoading(false);
                return;
            }

            setSuccess(true);
            setForm(initialForm);
        } catch (err) {
            console.error(err);
            setError("Could not reach the server. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full rounded-[3px] border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-sm text-stone-900 outline-none transition focus:border-amber-800 focus:ring-[3px] focus:ring-amber-800/15";

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-stone-50 px-6">
                <div className="w-full max-w-sm rounded-[3px] border border-stone-200 bg-white p-12 text-center shadow-[0_24px_48px_-32px_rgba(20,22,26,0.35)]">
                    <span className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-amber-800 text-lg text-amber-800">
                        ✓
                    </span>
                    <h1 className="mb-2 font-serif text-2xl font-semibold text-stone-900">
                        Account created
                    </h1>
                    <p className="mb-6 text-sm text-stone-500">
                        Your account is ready. You can sign in now.
                    </p>
                    <button
                        type="button"
                        onClick={() => setSuccess(false)}
                        className="w-full rounded-[3px] bg-stone-900 py-3 text-sm font-medium text-stone-50 transition hover:bg-amber-800"
                    >
                        Register another
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-stone-50 px-6">
            <div className="w-full max-w-sm rounded-[3px] border border-stone-200 bg-white p-9 shadow-[0_24px_48px_-32px_rgba(20,22,26,0.35)]">
                <span className="mb-2.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-amber-800">
                    Create account
                </span>
                <h1 className="mb-1.5 font-serif text-[26px] font-semibold tracking-tight text-stone-900">
                    Join the ledger
                </h1>
                <p className="mb-6 text-[13px] text-stone-500">
                    Fill in your details to get started.
                </p>

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    <div className="space-y-1.5">
                        <label
                            htmlFor="name"
                            className="text-[11px] font-medium uppercase tracking-[0.08em] text-stone-500"
                        >
                            Full name
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Jane Cooper"
                            value={form.name}
                            onChange={handleChange}
                            autoComplete="name"
                            className={inputClass}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="email"
                            className="text-[11px] font-medium uppercase tracking-[0.08em] text-stone-500"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="jane@company.com"
                            value={form.email}
                            onChange={handleChange}
                            autoComplete="email"
                            className={inputClass}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="password"
                            className="text-[11px] font-medium uppercase tracking-[0.08em] text-stone-500"
                        >
                            Password
                        </label>
                        <div className="relative flex items-center">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="At least 6 characters"
                                value={form.password}
                                onChange={handleChange}
                                autoComplete="new-password"
                                className={`${inputClass} pr-16`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                className="absolute right-2.5 px-1.5 py-1 text-[11px] font-medium uppercase tracking-[0.04em] text-amber-800 hover:text-stone-900"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="role"
                            className="text-[11px] font-medium uppercase tracking-[0.08em] text-stone-500"
                        >
                            Role
                        </label>
                        <select
                            id="role"
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                            className={inputClass}
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    {error && (
                        <div className="rounded-[3px] border border-red-800/30 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-800">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-1.5 w-full rounded-[3px] bg-stone-900 py-3 text-sm font-medium text-stone-50 transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Creating account…" : "Create account"}
                    </button>
                </form>

                <p className="mt-5 text-center text-[13px] text-stone-500">
                    Already have an account?{" "}
                    <a href="/login" className="font-medium text-amber-800 hover:underline">
                        Sign in
                    </a>
                </p>
            </div>
        </div>
    );
}
