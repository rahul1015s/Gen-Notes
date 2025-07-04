import { useActionState, useState } from "react";
import { useNavigate, Link, Navigate} from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext"; 
export default function Login() {

    const {isAuthenticated} = useAuth();

    // Navigate is a React component for redirecting in JSX.
    // navigate() is a function to programmatically navigate inside your logic (like after form submit).
    // If already logged in, redirect to protected route
    if(isAuthenticated) {
        return <Navigate to='/all-notes' replace />
    }


    // Toggle for password visibility (show/hide password input)
    const [showPassword, setShowPassword] = useState(false);

    // React Router hook to navigate programmatically
    const navigate = useNavigate();

    // Access login method from AuthContext
    const { login } = useAuth();

    /**
     * useActionState from React 19:
     * - Handles form submission logic cleanly.
     * - Tracks pending state (loading).
     * - Returns state (unused here), action function, and loading flag.
     */
    const [state, submitAction, isPending] = useActionState(
        async (prevState, formData) => {
            try {
                // Extract email and password from form data
                const email = formData.get("email");
                const password = formData.get("password");

                // API call to your backend authentication route
                const res = await api.post("/auth/sign-in", { email, password });

                /**
                 * Check if backend sent a valid token
                 * This prevents false positives if backend response is inconsistent
                 */
                if (res.data?.data?.token) {
                    // Use AuthContext login method to store token & update state
                    login(res.data.data.token);

                    // Show success message using react-hot-toast
                    toast.success(res.data.message || "Login successful");

                    // Navigate to protected route
                    navigate("/all-notes");

                    // Return empty state (no need to manage message locally)
                    return {};
                }
            } catch (err) {
                // Show error toast if login fails
                toast.error(err.response?.data?.message || "Invalid credentials");
                return {};
            }
        },
        // No need for message state, so initial state is empty
        {}
    );

    return (
        <div className="max-w-md mx-auto p-8 bg-base-100 rounded-xl shadow-lg mt-10 border border-base-300">
            
            {/* Form Heading */}
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
                <p className="text-base-content/70">Sign in to access your notes</p>
            </div>

            {/**
             * Form:
             * - action={submitAction} connects to useActionState.
             * - No manual onSubmit handler needed.
             * - Graceful fallback: works without JS.
             */}
            <form action={submitAction} className="space-y-6" aria-busy={isPending}>
                
                {/* Email Field */}
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

                {/* Password Field with Visibility Toggle */}
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
                            // minLength={6}
                            autoComplete="current-password"
                        />
                        {/* Toggle Button to Show/Hide Password */}
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

                {/* Submit Button with Loading State */}
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

            {/* Divider and Sign Up Link */}
            <div className="divider my-6">OR</div>

            <div className="text-center text-sm">
                <span className="text-base-content/70">Don't have an account? </span>
                <Link
                    to="/sign-up"
                    className="text-primary font-medium hover:underline"
                    state={{ fromLogin: true }} // Optional: Pass state if you want
                >
                    Create account
                </Link>
            </div>
        </div>
    );
}
