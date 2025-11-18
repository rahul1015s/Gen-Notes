import { useActionState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/axios";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [state, submitAction, isPending] = useActionState(
    async (prev, formData) => {
      try {
        const password = formData.get("password");

        const res = await api.post(`/api/v1/auth/reset-password/${token}`, {
          password,
        });

        toast.success(res.data.message);
        navigate("/log-in");
      } catch (err) {
        toast.error(err.response?.data?.message || "Link expired");
      }
      return {};
    },
    {}
  );

  return (
    <div className="max-w-md mx-auto p-8 bg-base-100 rounded-xl shadow-lg mt-10">
      <h2 className="text-3xl font-bold text-center mb-6">Reset Password</h2>

      <form action={submitAction} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">New Password</label>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            className="input input-bordered w-full"
            placeholder="New password"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isPending}
        >
          {isPending ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
