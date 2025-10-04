// src/pages/ResetPassword.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../api/authApi";
import { encryptPassword } from "../api/encrypt";

const ResetPassword = () => {
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(null); // ✅ track success/error
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setIsSuccess(null);

    if (form.password !== form.confirmPassword) {
      setIsSuccess(false);
      return setMsg("Passwords do not match");
    }
    const email = form.email;
    if (!email) {
      setIsSuccess(false);
      return setMsg("Email required");
    }

    // Encrypt passwords before sending
    const encryptedPassword = await encryptPassword(form.password);
    const encryptedConfirmPassword = await encryptPassword(form.confirmPassword);

    const res = await resetPassword(email, encryptedPassword, encryptedConfirmPassword);
    if (res.success) {
      setMsg(res.message || "Password updated");
      setIsSuccess(true);
      // ❌ removed auto navigate
    } else {
      setMsg(res.message || "Reset failed");
      setIsSuccess(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-blue-700 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-xl mb-4 font-bold">Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full mb-3 border border-gray-200 p-3 rounded bg-gray-50 placeholder-gray-500"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="New Password"
            className="w-full mb-3 border border-gray-200 p-3 rounded bg-gray-50 placeholder-gray-500"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            className="w-full mb-3 border border-gray-200 p-3 rounded bg-gray-50 placeholder-gray-500"
            onChange={handleChange}
            required
          />
          <button className="w-full bg-emerald-600 text-white py-3 rounded font-medium">
            Save
          </button>
        </form>

        {msg && (
          <p
            className={`mt-3 text-sm ${
              isSuccess ? "text-green-600" : "text-red-600"
            }`}
          >
            {msg}
          </p>
        )}

        {/* Hyperlink-style navigation buttons */}
        <div className="flex justify-between mt-4">
          <button
            className="text-gray-800 hover:text-gray-900 text-sm"
            onClick={() => navigate("/")}
          >
            Back to Login
          </button>

          <button
            className="text-indigo-600 hover:text-indigo-800 text-sm"
            onClick={() => navigate("/reset")}
          >
            Reset Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
