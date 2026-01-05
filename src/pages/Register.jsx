// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const res = await api.post("/auth/register", { fullName, email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (error) {
      setErr(error.response?.data?.error || error.response?.data?.message || "Registration failed");
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
        <h1>Create account</h1>
        <p className="muted">Get access to the analytics dashboard</p>

        {err && <div className="alert">{err}</div>}

        <form onSubmit={submit} className="auth-form">
          <label>Full name</label>
          <input value={fullName} onChange={(e)=>setFullName(e.target.value)} placeholder="Jane Doe" required minLength={3} />
          <label>Email</label>
          <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@company.com" type="email" required />
          <label>Password</label>
          <input value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Choose a password" type="password" required minLength={8} />
          <button className="btn primary" disabled={loading}>{loading ? "Creating..." : "Create account"}</button>
        </form>

        <div className="auth-footer">
          <Link to="/login">Already registered? Sign in</Link>
        </div>
      </div>
    </div>
  );
}
