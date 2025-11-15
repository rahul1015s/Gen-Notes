import { useActionState } from "react";
import api from "../lib/axios";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [state, submitAction, isPending] = useActionState(
    async (prev, formData) => {
      try {
        const email = formData.get("email");

        const res = await api.post("/auth/forgot-password", { email });

        toast.success(res.data.message || "Password reset email sent!");
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Something went wrong"
        );
      }
      return {};
    },
    {}
  );

  return (
    <div className="max-w-md mx-auto p-8 bg-base-100 rounded-xl shadow-lg mt-10">
      <h2 className="text-3xl font-bold text-center mb-6">Forgot Password</h2>
      <p className="text-center text-base-content/70 mb-6">
        Enter your email, and we'll send you reset instructions.
      </p>

      <form action={submitAction} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            required
            className="input input-bordered w-full"
            placeholder="you@example.com"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isPending}
        >
          {isPending ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}
