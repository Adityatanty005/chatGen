import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const { login, resetPassword, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate("/chat");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      await login(email, password);
      navigate("/chat");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Please enter your email address first");
      return;
    }
    
    setError("");
    setLoading(true);
    
    try {
      await resetPassword(email);
      setResetSent(true);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl">
        <div className="p-8 sm:p-10">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-semibold text-white">Welcome back</h2>
            <p className="text-sm text-slate-400 mt-1">Sign in to continue to Chatgen</p>
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-300 bg-red-900/20 border border-red-800 rounded-md px-3 py-2 text-center">
              {error}
            </div>
          )}
          {resetSent && (
            <div className="mb-4 text-sm text-emerald-300 bg-emerald-900/20 border border-emerald-800 rounded-md px-3 py-2 text-center">
              Password reset email sent! Check your inbox.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1 text-slate-300">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-md border border-slate-700 bg-slate-900 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm mb-1 text-slate-300">Password</label>
                <button type="button" onClick={handleResetPassword} className="text-xs text-orange-400 hover:text-orange-300">Forgot password?</button>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-md border border-slate-700 bg-slate-900 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-orange-600 text-white font-medium hover:bg-orange-700 disabled:bg-slate-700 transition-colors"
            >
              {loading ? "Verifying…" : "Sign In"}
              <span>→</span>
            </button>
          </form>

          <div className="mt-4">
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <span className="inline-block h-5 w-5 rounded-sm bg-white" />
              Sign in with Google
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-slate-400">
            Don't have an account? {""}
            <Link to="/signup" className="text-orange-400 hover:text-orange-300 underline">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
