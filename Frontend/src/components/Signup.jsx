import { useActionState, useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signup() {

    const { isAuthenticated } = useAuth();


    // Navigate is a React component for redirecting in JSX.
    // navigate() is a function to programmatically navigate inside your logic (like after form submit).
    // If already logged in, redirect to protected route
    if (isAuthenticated) {
        return <Navigate to="/all-notes" replace />;
    }

    // State to toggle password visibility
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    /**
     * useActionState handles form logic:
     * - Provides pending state
     * - Handles submission logic
     * - We skip complex message state in favor of toasts
     */
    const [_, submitAction, isPending] = useActionState(
        async (_, formData) => {
            try {
                const userData = {
                    name: formData.get("name"),
                    email: formData.get("email"),
                    password: formData.get("password"),
                };

                // API call to signup
                const res = await api.post("/auth/sign-up", userData);

                if (res.data.success) {
                    toast.success(res.data.message || "Account created successfully");
                    navigate("/log-in");
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
        <div className="max-w-md mx-auto p-8 bg-base-100 rounded-xl shadow-lg mt-10 border border-base-300">

            {/* Heading */}
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Create Account</h2>
                <p className="text-base-content/70">Join us to start creating notes</p>
            </div>

            {/**
             * Signup Form:
             * - action={submitAction} connects to useActionState
             * - Graceful fallback: works without JS
             */}
            <form action={submitAction} className="space-y-4">

                {/* Full Name */}
                <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium">Full Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Your Name"
                        className="input input-bordered w-full"
                        required
                        minLength={2}
                        autoComplete="name"
                    />
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="your@email.com"
                        className="input input-bordered w-full"
                        required
                        autoComplete="email"
                    />
                </div>

                {/* Password with toggle */}
                <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            placeholder="••••••••"
                            className="input input-bordered w-full pr-10"
                            required
                            minLength={6}
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 px-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="btn btn-primary w-full py-3 mt-4"
                    disabled={isPending}
                    aria-disabled={isPending}
                >
                    {isPending ? (
                        <>
                            <Loader2 className="animate-spin mr-2" />
                            Creating account...
                        </>
                    ) : (
                        "Sign Up"
                    )}
                </button>
            </form>

            {/* Login link */}
            <div className="text-center text-sm mt-6">
                <span className="text-base-content/70">Already have an account? </span>
                <Link to="/log-in" className="text-primary font-medium hover:underline">
                    Log In
                </Link>
            </div>
        </div>
    );
}
