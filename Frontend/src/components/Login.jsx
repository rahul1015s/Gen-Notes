import { useActionState, useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const { isAuthenticated, login } = useAuth();

    if (isAuthenticated) {
        return <Navigate to='/all-notes' replace />
    }

    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const [state, submitAction, isPending] = useActionState(
        async (prevState, formData) => {
            try {
                const email = formData.get("email");
                const password = formData.get("password");

                const res = await api.post("/api/v1/auth/sign-in", { email, password });

                // Check if user needs verification
                if (res.data?.data?.requiresVerification) {
                    toast.error("Please verify your email before signing in");
                    navigate("/verify-otp", { 
                        state: { email: res.data.data.email } 
                    });
                    return {};
                }

                if (res.data?.data?.token) {
                    login(res.data.data.token);
                    toast.success(res.data.message || "Login successful");
                    navigate("/all-notes");
                    return {};
                }
            } catch (err) {
                toast.error(err.response?.data?.message || "Invalid credentials");
                return {};
            }
        },
        {}
    );

    return (
        <div className="max-w-md mx-auto p-8 bg-base-100 rounded-xl shadow-lg mt-10 border border-base-300">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
                <p className="text-base-content/70">Sign in to access your notes</p>
            </div>

            <form action={submitAction} className="space-y-6" aria-busy={isPending}>
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="your@email.com"
                        className="input input-bordered w-full focus:ring-2 focus:ring-primary"
                        required
                        autoComplete="email"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            placeholder="••••••••"
                            className="input input-bordered w-full focus:ring-2 focus:ring-primary pr-10"
                            required
                            autoComplete="current-password"
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
                    <div className="text-right">
                        <Link
                            to="/forgot-password"
                            className="text-primary text-sm hover:underline"
                        >
                            Forgot Password?
                        </Link>
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary w-full py-3 rounded-lg"
                    disabled={isPending}
                    aria-disabled={isPending}
                >
                    {isPending ? (
                        <>
                            <Loader2 className="animate-spin mr-2" />
                            Signing in...
                        </>
                    ) : (
                        "Sign In"
                    )}
                </button>
            </form>

            <div className="divider my-6">OR</div>

            <div className="text-center text-sm">
                <span className="text-base-content/70">Don't have an account? </span>
                <Link
                    to="/sign-up"
                    className="text-primary font-medium hover:underline"
                    state={{ fromLogin: true }}
                >
                    Create account
                </Link>
            </div>
        </div>
    );
}