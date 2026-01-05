// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || "Login failed";
      setErr(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Video Background */}
      <video 
        className="auth-video-bg" 
        autoPlay 
        loop 
        muted 
        playsInline
      >
        <source src="/background.mp4" type="video/mp4" />
      </video>
      <div className="auth-video-overlay"></div>

      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="muted">Sign in to view iPauseAds dashboard</p>

        {err && <div className="alert">{err}</div>}

        <form onSubmit={submit} className="auth-form">
          <label>Email</label>
          <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@company.com" type="email" required />
          <label>Password</label>
          <input value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••••" type="password" required />
          <button className="btn primary" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</button>
        </form>

        <div className="auth-footer">
          <Link to="/register">Create an account</Link>
          <span> • </span>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
      </div>
    </div>
  );
}
