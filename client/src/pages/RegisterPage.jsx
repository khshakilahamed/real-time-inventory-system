import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeIcon, EyeOffIcon } from "../components/Icons";
import { useAuth } from "../context/AuthContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(firstName, lastName, email, password) {
  const errs = {};
  if (!firstName.trim()) errs.firstName = "First name is required.";
  else if (firstName.trim().length < 1)
    errs.firstName = "First name must be at least 1 characters.";
  else if (firstName.trim().length > 50)
    errs.firstName = "First name must be 50 characters or fewer.";
  else if (!/^[a-zA-Z]+$/.test(firstName.trim()))
    errs.firstName = "First name can only contain letters.";

  if (!lastName.trim()) errs.lastName = "Last name is required.";
  else if (lastName.trim().length < 1)
    errs.lastName = "Last name must be at least 1 characters.";
  else if (lastName.trim().length > 50)
    errs.lastName = "Last name must be 50 characters or fewer.";
  else if (!/^[a-zA-Z]+$/.test(lastName.trim()))
    errs.lastName = "First name can only contain letters.";

  if (!email.trim()) errs.email = "Email is required.";
  else if (!EMAIL_RE.test(email)) errs.email = "Enter a valid email address.";

  if (!password) errs.password = "Password is required.";
  else if (password.length < 6)
    errs.password = "Password must be at least 6 characters.";

  return errs;
}

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-600">{msg}</p>;
}

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const errs = validate(firstName, lastName, email, password);
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setLoading(true);

    try {
      await register(firstName, lastName, email, password);
      navigate("/");
    } catch (err) {
      const { data } = err.response;
      setServerError(data.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent ${
      fieldErrors[field]
        ? "border-red-400 focus:ring-red-400"
        : "border-gray-300 focus:ring-indigo-500"
    }`;

  const clear = (field) => setFieldErrors((p) => ({ ...p, [field]: "" }));

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-md">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-indigo-600 transition-colors mb-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to home
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-sm text-gray-500 mt-1">
            Join SneakerDrop to reserve limited drops
          </p>
        </div>

        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mb-5">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  clear("firstName");
                }}
                autoFocus
                maxLength={50}
                className={inputClass("firstName")}
                placeholder="John"
              />
              <FieldError msg={fieldErrors.firstName} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  clear("lastName");
                }}
                maxLength={50}
                className={inputClass("lastName")}
                placeholder="Doe"
              />
              <FieldError msg={fieldErrors.lastName} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clear("email");
              }}
              className={inputClass("email")}
              placeholder="you@example.com"
            />
            <FieldError msg={fieldErrors.email} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clear("password");
                }}
                className={`${inputClass("password")} pr-10`}
                placeholder="min. 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            <FieldError msg={fieldErrors.password} />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors mt-2"
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-5">
          Have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-600 font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
