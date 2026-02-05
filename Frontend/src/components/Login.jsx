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
                    // Store user data in localStorage for use throughout the app
                    const userData = res.data.data.user || {};
                    console.log('Login Response:', res.data);
                    console.log('User Data to store:', userData);
                    
                    localStorage.setItem('userEmail', userData.email || email);
                    localStorage.setItem('userName', userData.name || 'User');
                    localStorage.setItem('userId', userData._id || '');
                    
                    // Store for biometric unlock on next app load
                    localStorage.setItem('lastLoginUserId', userData._id || '');
                    localStorage.setItem('lastLoginEmail', userData.email || email);
                    
                    console.log('Stored email:', localStorage.getItem('userEmail'));
                    console.log('Stored name:', localStorage.getItem('userName'));
                    
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
            <div className="w-full max-w-md p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg mb-4">
                        <span className="text-white font-bold text-xl">N</span>
                    </div>
                    <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Welcome Back</h2>
                    <p className="text-slate-600 dark:text-slate-400">Sign in to access your notes</p>
                </div>

                <form action={submitAction} className="space-y-6" aria-busy={isPending}>
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
                                autoComplete="current-password"
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
                        <div className="text-right">
                            <Link
                                to="/forgot-password"
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                Forgot Password?
                            </Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        disabled={isPending}
                        aria-disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Signing in...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>

                <div className="my-6 flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-300 dark:bg-slate-600"></div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">OR</span>
                    <div className="flex-1 h-px bg-slate-300 dark:bg-slate-600"></div>
                </div>

                <div className="text-center text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Don't have an account? </span>
                    <Link
                        to="/sign-up"
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        state={{ fromLogin: true }}
                    >
                        Create account
                    </Link>
                </div>
            </div>
        </div>
    );
}