// src/components/SignUp.jsx
import { useActionState, useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signup() {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Navigate to="/all-notes" replace />;
    }

    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const [_, submitAction, isPending] = useActionState(
        async (_, formData) => {
            try {
                const userData = {
                    name: formData.get("name"),
                    email: formData.get("email"),
                    password: formData.get("password"),
                };

                // API call to signup
                const res = await api.post("/api/v1/auth/sign-up", userData);

                if (res.data.success) {
                    if (res.data.data.requiresVerification) {
                        toast.success("Account created! Please verify your email.");
                        navigate("/verify-otp", { 
                            state: { email: res.data.data.email } 
                        });
                    } else {
                        toast.success(res.data.message || "Account created successfully");
                        navigate("/log-in");
                    }
                    return {};
                }
            } catch (err) {
                toast.error(err.response?.data?.message || "Registration failed");
                return {};
            }
        },
        {}
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
            <div className="w-full max-w-md p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg mb-4">
                        <span className="text-white font-bold text-xl">N</span>
                    </div>
                    <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Create Account</h2>
                    <p className="text-slate-600 dark:text-slate-400">Join us to start creating notes</p>
                </div>

                <form action={submitAction} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Your Name"
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                            minLength={2}
                            autoComplete="name"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="your@email.com"
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10"
                                required
                                minLength={6}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"
                        disabled={isPending}
                        aria-disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Creating account...
                            </>
                        ) : (
                            "Sign Up"
                        )}
                    </button>
                </form>

                <div className="text-center text-sm mt-6">
                    <span className="text-slate-600 dark:text-slate-400">Already have an account? </span>
                    <Link to="/log-in" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                        Log In
                    </Link>
                </div>
            </div>
        </div>
    );
}