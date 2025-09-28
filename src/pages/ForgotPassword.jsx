// src/pages/ForgotPassword.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../api/authApi";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(null); // ✅ track success or error
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setIsSuccess(null);
    const res = await forgotPassword(email);
    if (res.success) {
      setMsg(res.message || "Reset link sent if email exists");
      setIsSuccess(true);
    } else {
      setMsg(res.message || "Email doesn't exist");
      setIsSuccess(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-blue-700 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-xl mb-4 font-bold">Forgot Password</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter registered email"
            className="w-full mb-3 border border-gray-200 p-3 rounded bg-gray-50 placeholder-gray-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="w-full bg-indigo-600 text-white py-3 rounded font-medium">
            Send Reset Link
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

        {/* Navigation buttons */}
        <div className="flex justify-between mt-4">
          <button
            className="text-gray-700 hover:text-gray-900 text-sm"
            onClick={() => navigate("/")}
          >
            Back to Login
          </button>

          <button
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            onClick={() => navigate("/reset")}
          >
            Reset Password
          </button>
        </div>
      </div>
    </div>
  );
}
 