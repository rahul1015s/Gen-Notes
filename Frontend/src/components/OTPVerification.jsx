import { useActionState, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function OTPVerification() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [resendCooldown, setResendCooldown] = useState(0);
    
    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            toast.error("No email provided for verification");
            navigate("/sign-up");
        }
    }, [email, navigate]);

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const [state, submitAction, isPending] = useActionState(
        async (prevState, formData) => {
            try {
                const otp = formData.get("otp");

                const res = await api.post("/auth/verify-otp", { 
                    email, 
                    otp 
                });

                if (res.data?.data?.token) {
                    login(res.data.data.token);
                    toast.success("Email verified successfully!");
                    navigate("/all-notes");
                    return {};
                }
            } catch (err) {
                toast.error(err.response?.data?.message || "Invalid verification code");
                return {};
            }
        },
        {}
    );

    const handleResendOTP = async () => {
        try {
            await api.post("/auth/resend-otp", { email });
            setResendCooldown(60);
            toast.success("Verification code sent successfully!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to resend code");
        }
    };

    const handleOTPInput = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        e.target.value = value;
        
        if (value.length === 6) {
            e.target.form.requestSubmit();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').replace(/\D/g, '');
        if (pasteData.length === 6) {
            e.target.value = pasteData;
            e.target.form.requestSubmit();
        }
    };

    return (
        <div className="max-w-md mx-auto p-8 bg-base-100 rounded-xl shadow-lg mt-10 border border-base-300">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Verify Your Email</h2>
                <p className="text-base-content/70">
                    Enter the 6-digit code sent to<br />
                    <span className="font-semibold text-primary">{email}</span>
                </p>
            </div>

            <form action={submitAction} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="otp" className="block text-sm font-medium">
                        Verification Code
                    </label>
                    <input
                        type="text"
                        id="otp"
                        name="otp"
                        placeholder="000000"
                        className="input input-bordered w-full text-center text-2xl font-mono tracking-widest"
                        maxLength={6}
                        pattern="[0-9]{6}"
                        required
                        onInput={handleOTPInput}
                        onPaste={handlePaste}
                        autoComplete="one-time-code"
                        autoFocus
                    />
                    <p className="text-sm text-base-content/60 text-center">
                        Enter the 6-digit code from your email
                    </p>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary w-full py-3 rounded-lg"
                    disabled={isPending}
                >
                    {isPending ? (
                        <>
                            <Loader2 className="animate-spin mr-2" />
                            Verifying...
                        </>
                    ) : (
                        "Verify Email"
                    )}
                </button>
            </form>

            <div className="divider my-6">OR</div>

            <div className="text-center">
                <button
                    onClick={handleResendOTP}
                    disabled={resendCooldown > 0 || isPending}
                    className="btn btn-ghost text-sm"
                >
                    {resendCooldown > 0 
                        ? `Resend code in ${resendCooldown}s`
                        : "Didn't receive code? Resend"
                    }
                </button>
            </div>

            <div className="text-center mt-6 text-sm text-base-content/60">
                <p>Code expires in 10 minutes</p>
            </div>

            <div className="text-center mt-4">
                <button
                    onClick={() => navigate("/sign-up")}
                    className="btn btn-link text-sm"
                >
                    ← Back to Sign Up
                </button>
            </div>
        </div>
    );
}