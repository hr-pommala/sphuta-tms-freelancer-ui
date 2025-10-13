// src/pages/SignInSignUp.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, signup } from "../api/authApi";
import { encryptPassword } from "../api/encrypt";
import ctd from "country-telephone-data"; // ensure this package is installed

const SignInSignUp = () => {
  const [activeTab, setActiveTab] = useState("signin");
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const countries =
    (ctd && (ctd.allCountries || (ctd.default && ctd.default.allCountries))) ||
    [];

  const defaultCountryIso =
    form.countryCode ||
    (countries[0] && (countries[0].iso2 || countries[0].iso2?.toUpperCase())) ||
    "IN";

  const getCountryMetaByIso2 = (iso2) =>
    countries.find(
      (c) => (c.iso2 || "").toUpperCase() === (iso2 || "").toUpperCase()
    );

  const derivePhoneLengths = (iso2) => {
    const country = getCountryMetaByIso2(iso2);
    if (!country) return { lengths: null, maxLen: 10 };

    if (Array.isArray(country.lengths) && country.lengths.length > 0) {
      const lengths = country.lengths.map((l) => Number(l)).filter(Boolean);
      if (lengths.length > 0) {
        return { lengths, maxLen: Math.max(...lengths) };
      }
    }

    if (typeof country.format === "string" && country.format.length > 0) {
      const dotCount = (country.format.match(/\./g) || []).length;
      const xCount = (country.format.match(/X/gi) || []).length;
      const nineCount = (country.format.match(/9/g) || []).length;
      const totalPlaceholders = Math.max(dotCount, xCount, nineCount);
      if (totalPlaceholders > 0) {
        return { lengths: null, maxLen: totalPlaceholders };
      }
    }

    const example =
      country.example ||
      country.exampleNumber ||
      country.nationalExample ||
      country.national_number;
    if (example) {
      const digits = String(example).replace(/\D/g, "");
      if (digits.length > 0) {
        return { lengths: null, maxLen: digits.length };
      }
    }

    return { lengths: null, maxLen: 10 };
  };

  const getPhonePlaceholder = (iso2) => {
    const { maxLen } = derivePhoneLengths(iso2);
    return `Enter ${maxLen} digits`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const digits = (value || "").replace(/\D/g, "");
      const iso2 = (form.countryCode || defaultCountryIso).toUpperCase();
      const { maxLen } = derivePhoneLengths(iso2);
      setForm((prev) => ({ ...prev, phone: digits.slice(0, maxLen) }));
    } else if (name === "countryCode") {
      const newIso2 = (value || "").toUpperCase();
      const { maxLen } = derivePhoneLengths(newIso2);
      const existingDigits = (form.phone || "")
        .replace(/\D/g, "")
        .slice(0, maxLen);
      setForm((prev) => ({
        ...prev,
        countryCode: newIso2,
        phone: existingDigits,
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validatePassword = (password) =>
    /^(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&]).{8,}$/.test(password);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const encryptedPassword = await encryptPassword(form.password);
      const res = await login(form.email, encryptedPassword);
      if (res.success) {
        navigate("/dashboard");
      } else {
        setError(res.message || "Invalid credentials");
      }
    } catch {
      setError("Email doesn't exist");
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validatePassword(form.password)) {
      setError(
        "Password must be strong (8+ chars, include uppercase, number and special character)"
      );
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const iso2 = (form.countryCode || defaultCountryIso).toUpperCase();
    const { lengths, maxLen } = derivePhoneLengths(iso2);
    const phoneDigits = (form.phone || "").replace(/\D/g, "");

    if (lengths && Array.isArray(lengths)) {
      if (!lengths.includes(phoneDigits.length)) {
        setError(
          `Mobile number must be ${lengths.join(" or ")} digits for ${iso2} (entered ${phoneDigits.length})`
        );
        return;
      }
    } else if (phoneDigits.length !== maxLen) {
      setError(
        `Mobile number must be exactly ${maxLen} digits for ${iso2} (entered ${phoneDigits.length})`
      );
      return;
    }

    const meta = getCountryMetaByIso2(iso2);
    const dialCode = meta && meta.dialCode ? Number(meta.dialCode) : Number(91);
    const dialCodeWithSymbol = `+${String(dialCode)}`;

    const encryptedPassword = await encryptPassword(form.password);
    const encryptedConfirmPassword = await encryptPassword(
      form.confirmPassword
    );

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: encryptedPassword,
      confirmPassword: encryptedConfirmPassword,
      phone: form.phone,
      countryCode: dialCode,
      countryCodeWithSymbol: dialCodeWithSymbol,
    };

    try {
      setLoading(true);
      const res = await signup(payload);
      setLoading(false);

      if (res.success) {
        setSuccess("Account created successfully. Please sign in.");
        setError("");
        setForm({});
      } else {
        setError(res.message || "Signup failed");
      }
    } catch {
      setLoading(false);
      setError("Signup failed");
    }
  };

  const currentIso2 = (form.countryCode || defaultCountryIso).toUpperCase();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-blue-700 p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        {/* Tabs */}
        <div className="flex rounded-t-lg overflow-hidden mb-6">
          <button
            className={`flex-1 py-3 text-center font-semibold ${
              activeTab === "signin"
                ? "bg-gray-100 text-gray-800"
                : "bg-transparent text-gray-500"
            }`}
            onClick={() => {
              setActiveTab("signin");
              setError("");
              setSuccess("");
            }}
          >
            Sign In
          </button>
          <button
            className={`flex-1 py-3 text-center font-semibold ${
              activeTab === "signup"
                ? "bg-indigo-600 text-white"
                : "bg-transparent text-gray-500"
            }`}
            onClick={() => {
              setActiveTab("signup");
              setError("");
              setSuccess("");
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Sign In */}
        {activeTab === "signin" ? (
          <form onSubmit={handleSignIn}>
            <input
              type="email"
              name="email"
              placeholder="EMAIL"
              value={form.email || ""}
              className="w-full mb-3 border border-gray-200 p-3 rounded bg-gray-50 placeholder-gray-500"
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="PASSWORD"
              value={form.password || ""}
              className="w-full mb-3 border border-gray-200 p-3 rounded bg-gray-50 placeholder-gray-500"
              onChange={handleChange}
              required
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded font-medium shadow-sm"
            >
              LOGIN
            </button>
            <div className="text-right mt-3">
              <Link
                to="/forgot"
                className="text-sm text-gray-800 hover:text-gray-900"
              >
                Forgot password?
              </Link>
            </div>
            {error && <p className="text-red-500 mt-3 text-sm">{error}</p>}
            {success && <p className="text-green-600 mt-3 text-sm">{success}</p>}
          </form>
        ) : (
          /* Sign Up */
          <form onSubmit={handleSignUp}>
            {success && (
              <p className="text-green-600 text-center font-medium mb-4">
                {success}
              </p>
            )}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Create account
            </h2>

            {/* Name */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                name="firstName"
                placeholder="First name"
                value={form.firstName || ""}
                onChange={handleChange}
                className="px-3 py-3 rounded bg-slate-100 border border-transparent"
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last name"
                value={form.lastName || ""}
                onChange={handleChange}
                className="px-3 py-3 rounded bg-slate-100 border border-transparent"
                required
              />
            </div>

            {/* Email */}
            <div className="mb-3">
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email || ""}
                onChange={handleChange}
                className="w-full px-3 py-3 rounded bg-slate-100 border border-transparent"
                required
              />
            </div>

            {/* Phone */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              <select
                name="countryCode"
                value={form.countryCode || defaultCountryIso}
                onChange={handleChange}
                className="col-span-1 px-3 py-3 rounded bg-slate-100 border border-transparent"
              >
                {countries.length === 0 ? (
                  <option value="IN">IN +91</option>
                ) : (
                  countries.map((c) => (
                    <option
                      key={c.iso2}
                      value={(c.iso2 || "").toUpperCase()}
                    >
                      {c.name} {c.dialCode}
                    </option>
                  ))
                )}
              </select>
              <input
                type="tel"
                name="phone"
                placeholder={getPhonePlaceholder(currentIso2)}
                value={form.phone || ""}
                onChange={handleChange}
                inputMode="numeric"
                pattern="\d*"
                className="col-span-2 px-3 py-3 rounded bg-slate-100 border border-transparent"
                required
              />
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password || ""}
                onChange={handleChange}
                className="w-full px-3 py-3 rounded bg-slate-100 border border-transparent"
                required
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword || ""}
                onChange={handleChange}
                className="w-full px-3 py-3 rounded bg-slate-100 border border-transparent"
                required
              />
            </div>

            <div className="text-center mb-3">
              <button
                type="submit"
                disabled={loading}
                className={`inline-block px-8 py-3 rounded-lg font-medium ${
                  loading
                    ? "bg-emerald-300 text-white"
                    : "bg-emerald-600 text-white hover:bg-emerald-500"
                }`}
              >
                {loading ? "Creating..." : "Create an account"}
              </button>
            </div>
            {error && <p className="text-red-500 mt-3 text-sm">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
};

export default SignInSignUp;
