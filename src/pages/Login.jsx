import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!loading && isAuthenticated) {
    const redirectTo = location.state?.from || "/";
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      const redirectTo = location.state?.from || "/";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Impossible de se connecter");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-secondary-container/20 rounded-full blur-[80px]"></div>
      </div>

      <main className="relative z-10 w-full max-w-[440px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-xl">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-xl mb-md shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-on-primary text-[32px]">
              menu_book
            </span>
          </div>
          <h1 className="font-display-lg text-display-lg text-primary tracking-tight">
            Libris
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Knowledge Manager
          </p>
        </div>

        <div className="glass-card bg-surface-container-lowest rounded-xl p-xl shadow-xl shadow-surface-variant/30">
          {error && (
            <div className="mb-lg flex items-center gap-sm bg-error-container text-on-error-container rounded-lg px-md py-sm font-body-sm text-body-sm">
              <span className="material-symbols-outlined text-[20px]">
                error
              </span>
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-lg" onSubmit={handleSubmit}>
            <div className="space-y-xs">
              <label
                className="font-label-md text-label-md text-on-surface-variant block ml-1"
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">
                    mail
                  </span>
                </div>
                <input
                  className="w-full bg-surface-container-low border-surface-variant border rounded-lg py-md pl-11 pr-md font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  id="email"
                  name="email"
                  placeholder="name@institution.edu"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                />
              </div>
            </div>

            <div className="space-y-xs">
              <div className="flex justify-between items-center px-1">
                <label
                  className="font-label-md text-label-md text-on-surface-variant block"
                  htmlFor="password"
                >
                  Password
                </label>
                <a
                  className="font-label-sm text-label-sm text-primary hover:text-primary-container transition-colors"
                  href="#"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">
                    lock
                  </span>
                </div>
                <input
                  className="w-full bg-surface-container-low border-surface-variant border rounded-lg py-md pl-11 pr-md font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                />
                <button
                  className="absolute inset-y-0 right-0 pr-md flex items-center text-outline hover:text-on-surface-variant transition-colors"
                  onClick={() => setShowPassword((v) => !v)}
                  type="button"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center px-1">
              <input
                className="w-4 h-4 text-primary bg-surface-container-low border-surface-variant rounded focus:ring-primary focus:ring-offset-background"
                id="remember"
                type="checkbox"
              />
              <label
                className="ml-sm font-body-sm text-body-sm text-on-surface-variant select-none"
                htmlFor="remember"
              >
                Remember this device
              </label>
            </div>

            <button
              className="w-full bg-primary text-on-primary font-label-md text-label-md py-md rounded-lg shadow-md hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-sm group disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
              disabled={submitting}
            >
              <span>{submitting ? "Signing In…" : "Sign In"}</span>
              {!submitting && (
                <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              )}
            </button>
          </form>
        </div>

        <p className="text-center font-body-sm text-body-sm text-outline mt-lg">
          Demo account: alex.thompson@libris.io / libris123
        </p>

        <footer className="mt-xl text-center">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Don't have an account?
            <a
              className="font-label-sm text-label-sm text-primary hover:underline ml-1"
              href="#"
            >
              Request Access
            </a>
          </p>
          <div className="mt-lg flex justify-center gap-md font-label-sm text-label-sm text-outline">
            <a
              className="hover:text-on-surface-variant transition-colors"
              href="#"
            >
              Privacy Policy
            </a>
            <span className="w-1 h-1 bg-outline-variant rounded-full mt-[10px]"></span>
            <a
              className="hover:text-on-surface-variant transition-colors"
              href="#"
            >
              Terms of Service
            </a>
            <span className="w-1 h-1 bg-outline-variant rounded-full mt-[10px]"></span>
            <a
              className="hover:text-on-surface-variant transition-colors"
              href="#"
            >
              Documentation
            </a>
          </div>
        </footer>
      </main>

      <div
        className="fixed w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none opacity-0 transition-opacity duration-300 z-0"
        id="glow"
      ></div>
    </div>
  );
}
