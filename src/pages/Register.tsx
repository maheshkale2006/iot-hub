import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  async function handleRegister(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

    /* =========================
       VALIDATION
    ========================= */

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const data = await registerUser(
        name,
        email,
        password
      );

      /*
       * If email confirmation is enabled
       * Supabase returns a user but no session.
       */

      if (data.user && !data.session) {
        setSuccess(
          "Account created successfully! Please check your email and verify your account before logging in."
        );

        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");

        return;
      }

      /*
       * If email confirmation is disabled,
       * the user can immediately enter the app.
       */

      navigate("/");

    } catch (err: any) {
      console.error(
        "Registration error:",
        err
      );

      if (
        err?.message
          ?.toLowerCase()
          .includes("already registered")
      ) {
        setError(
          "An account with this email already exists."
        );
      } else {
        setError(
          err?.message ||
            "Unable to create account. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-5 py-10">

      {/* BACKGROUND */}

      <div className="fixed inset-0 pointer-events-none overflow-hidden">

        <div className="absolute -top-40 -left-40 w-[420px] h-[420px] rounded-full bg-[#0ea5e9]/10 blur-3xl" />

        <div className="absolute -bottom-40 -right-40 w-[420px] h-[420px] rounded-full bg-[#06b6d4]/10 blur-3xl" />

      </div>

      {/* CONTAINER */}

      <div className="relative w-full max-w-[1050px]">

        <div className="bg-white rounded-[24px] border border-[#dce5ed] shadow-[0_20px_60px_rgba(15,23,42,0.08)] overflow-hidden grid grid-cols-1 md:grid-cols-2">

          {/* ================= LEFT ================= */}

          <div className="hidden md:flex relative bg-gradient-to-br from-[#0284c7] via-[#0891b2] to-[#0e7490] text-white p-12 flex-col justify-between overflow-hidden">

            {/* DECORATION */}

            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full border border-white/10" />

            <div className="absolute -bottom-32 -left-24 w-80 h-80 rounded-full border border-white/10" />

            <div className="relative z-10">

              {/* LOGO */}

              <Link
                to="/"
                className="inline-flex items-center gap-3"
              >

                <div className="w-11 h-11 rounded-[12px] bg-white/15 backdrop-blur flex items-center justify-center text-xl">
                  ⚡
                </div>

                <div>

                  <div className="text-xl font-bold">
                    IoT Hub
                  </div>

                  <div className="text-xs text-white/70">
                    Smart. Connected. Simple.
                  </div>

                </div>

              </Link>

              {/* HERO */}

              <div className="mt-16">

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs mb-5">
                  🚀 Start your IoT journey
                </div>

                <h1 className="text-[38px] leading-[1.15] font-bold">

                  Build.

                  <br />

                  Connect.

                  <br />

                  <span className="text-cyan-100">
                    Innovate.
                  </span>

                </h1>

                <p className="mt-6 text-[15px] leading-7 text-white/80 max-w-[410px]">

                  Create your IoT Hub account and
                  discover everything you need to build
                  smarter connected projects.

                </p>

              </div>

            </div>

            {/* FEATURES */}

            <div className="relative z-10 space-y-4">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                  ✓
                </div>

                <span className="text-sm text-white/90">
                  Explore IoT Components
                </span>

              </div>

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                  ✓
                </div>

                <span className="text-sm text-white/90">
                  Learn from IoT Projects
                </span>

              </div>

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                  ✓
                </div>

                <span className="text-sm text-white/90">
                  Get AI-powered assistance
                </span>

              </div>

            </div>

          </div>

          {/* ================= RIGHT ================= */}

          <div className="p-7 sm:p-10 md:p-12">

            {/* MOBILE LOGO */}

            <div className="md:hidden mb-8">

              <Link
                to="/"
                className="flex items-center gap-3"
              >

                <div className="w-10 h-10 rounded-xl bg-[#e0f2fe] flex items-center justify-center">
                  ⚡
                </div>

                <span className="text-xl font-bold text-[#0f172b]">
                  IoT Hub
                </span>

              </Link>

            </div>

            {/* HEADING */}

            <div className="mb-7">

              <h2 className="text-[28px] font-bold text-[#0f172b]">
                Create your account
              </h2>

              <p className="mt-2 text-[14px] text-[#64748b]">
                Join IoT Hub and start building smarter projects
              </p>

            </div>

            {/* ERROR */}

            {error && (
              <div className="mb-5 p-3 rounded-[10px] bg-red-50 border border-red-100 text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div className="mb-5 p-3 rounded-[10px] bg-green-50 border border-green-100 text-green-700 text-sm leading-5">
                {success}
              </div>
            )}

            {/* FORM */}

            <form
              onSubmit={handleRegister}
              className="space-y-5"
            >

              {/* NAME */}

              <div>

                <label className="block text-[13px] font-semibold text-[#334155] mb-2">
                  Full Name
                </label>

                <div className="relative">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]">
                    👤
                  </span>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    placeholder="Enter your full name"
                    autoComplete="name"
                    className="w-full h-[48px] pl-11 pr-4 rounded-[10px] border border-[#d8e1eb] bg-white outline-none text-sm text-[#0f172b] placeholder:text-[#94a3b8] focus:border-[#0ea5e9] focus:ring-4 focus:ring-[#0ea5e9]/10 transition"
                  />

                </div>

              </div>

              {/* EMAIL */}

              <div>

                <label className="block text-[13px] font-semibold text-[#334155] mb-2">
                  Email Address
                </label>

                <div className="relative">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]">
                    ✉
                  </span>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full h-[48px] pl-11 pr-4 rounded-[10px] border border-[#d8e1eb] bg-white outline-none text-sm text-[#0f172b] placeholder:text-[#94a3b8] focus:border-[#0ea5e9] focus:ring-4 focus:ring-[#0ea5e9]/10 transition"
                  />

                </div>

              </div>

              {/* PASSWORD */}

              <div>

                <label className="block text-[13px] font-semibold text-[#334155] mb-2">
                  Password
                </label>

                <div className="relative">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]">
                    🔒
                  </span>

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Create a password"
                    autoComplete="new-password"
                    className="w-full h-[48px] pl-11 pr-12 rounded-[10px] border border-[#d8e1eb] bg-white outline-none text-sm text-[#0f172b] placeholder:text-[#94a3b8] focus:border-[#0ea5e9] focus:ring-4 focus:ring-[#0ea5e9]/10 transition"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#008bd0]"
                  >
                    {showPassword
                      ? "🙈"
                      : "👁"}
                  </button>

                </div>

                <p className="text-[11px] text-[#94a3b8] mt-2">
                  Password must contain at least 6 characters.
                </p>

              </div>

              {/* CONFIRM PASSWORD */}

              <div>

                <label className="block text-[13px] font-semibold text-[#334155] mb-2">
                  Confirm Password
                </label>

                <div className="relative">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]">
                    🔒
                  </span>

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    className="w-full h-[48px] pl-11 pr-12 rounded-[10px] border border-[#d8e1eb] bg-white outline-none text-sm text-[#0f172b] placeholder:text-[#94a3b8] focus:border-[#0ea5e9] focus:ring-4 focus:ring-[#0ea5e9]/10 transition"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#008bd0]"
                  >
                    {showConfirmPassword
                      ? "🙈"
                      : "👁"}
                  </button>

                </div>

              </div>

              {/* TERMS */}

              <div className="flex items-start gap-2">

                <input
                  type="checkbox"
                  required
                  className="mt-1 w-4 h-4 accent-[#0ea5df]"
                />

                <p className="text-[12px] leading-5 text-[#64748b]">

                  I agree to the{" "}

                  <button
                    type="button"
                    className="text-[#008bd0] font-medium hover:underline"
                  >
                    Terms of Service
                  </button>

                  {" "}and{" "}

                  <button
                    type="button"
                    className="text-[#008bd0] font-medium hover:underline"
                  >
                    Privacy Policy
                  </button>

                </p>

              </div>

              {/* REGISTER */}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[48px] rounded-[11px] bg-[#0ea5df] hover:bg-[#0795cc] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition shadow-[0_5px_18px_rgba(14,165,223,0.2)]"
              >

                {loading
                  ? "Creating account..."
                  : "Create Account"}

              </button>

            </form>

            {/* DIVIDER */}

            <div className="flex items-center gap-4 my-7">

              <div className="flex-1 h-px bg-[#e2e8f0]" />

              <span className="text-xs text-[#94a3b8]">
                OR
              </span>

              <div className="flex-1 h-px bg-[#e2e8f0]" />

            </div>

            {/* GOOGLE */}

            <button
              type="button"
              className="w-full h-[46px] rounded-[11px] border border-[#d8e1eb] bg-white hover:bg-[#f8fafc] text-[#334155] font-medium text-sm transition flex items-center justify-center gap-3"
              onClick={() => {
                setError(
                  "Google login requires Google Provider to be enabled in Supabase."
                );
              }}
            >

              <span className="font-bold text-[17px]">
                G
              </span>

              Continue with Google

            </button>

            {/* LOGIN */}

            <p className="text-center text-[13px] text-[#64748b] mt-7">

              Already have an account?{" "}

              <Link
                to="/login"
                className="font-semibold text-[#008bd0] hover:underline"
              >
                Sign in
              </Link>

            </p>

          </div>

        </div>

        {/* FOOTER */}

        <p className="text-center text-xs text-[#94a3b8] mt-5">
          © {new Date().getFullYear()} IoT Hub. All rights reserved.
        </p>

      </div>

    </div>
  );
}