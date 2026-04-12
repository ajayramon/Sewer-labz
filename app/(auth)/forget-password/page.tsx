"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {}
    // Always show success — don't reveal if email exists
    setSent(true);
    setLoading(false);
  };

  const inp: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #E2E8F0",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    background: "#F8FAFC",
    color: "#0F172A",
  };

  const lbl: React.CSSProperties = {
    display: "block",
    fontSize: "11px",
    fontWeight: 600,
    color: "#64748B",
    marginBottom: "4px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F8FAFC",
        fontFamily: "Inter, Arial, sans-serif",
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "40px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "8px" }}>
          <span
            style={{
              fontSize: "28px",
              fontWeight: 900,
              letterSpacing: "-1px",
              color: "#0F2A4A",
            }}
          >
            SEWER <span style={{ color: "#2D8C4E" }}>LABZ</span>
          </span>
        </div>

        {sent ? (
          /* Success state */
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📧</div>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#0F2A4A",
                marginBottom: "10px",
              }}
            >
              Check Your Email
            </h2>
            <p
              style={{
                fontSize: "13px",
                color: "#64748B",
                lineHeight: "1.7",
                marginBottom: "24px",
              }}
            >
              If an account exists for <strong>{email}</strong>, we've sent a
              password reset link. Check your inbox and spam folder.
            </p>
            <div
              style={{
                background: "#F0FDF4",
                border: "1px solid #BBF7D0",
                borderRadius: "8px",
                padding: "12px 16px",
                marginBottom: "24px",
                fontSize: "12px",
                color: "#16A34A",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.03em",
              }}
            >
              RESET LINK SENT — LINK EXPIRES IN 24 HOURS
            </div>
            <Link href="/login">
              <button
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#0F2A4A",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ← Back to Sign In
              </button>
            </Link>
          </div>
        ) : (
          /* Form state */
          <>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#0F2A4A",
                textAlign: "center",
                marginBottom: "8px",
              }}
            >
              Reset Password
            </h2>
            <p
              style={{
                fontSize: "13px",
                color: "#64748B",
                textAlign: "center",
                marginBottom: "28px",
                lineHeight: "1.6",
              }}
            >
              Enter your email address and we'll send you a link to reset your
              password.
            </p>

            {error && (
              <div
                style={{
                  background: "#FEF2F2",
                  border: "1px solid #FECACA",
                  borderRadius: "6px",
                  padding: "10px 14px",
                  fontSize: "12px",
                  color: "#DC2626",
                  marginBottom: "16px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "20px" }}>
                <label style={lbl}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={inp}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "none",
                  background: loading ? "#94A3B8" : "#2D8C4E",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            {/* ALL CAPS disclaimer */}
            <div
              style={{
                marginTop: "20px",
                padding: "12px",
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
              }}
            >
              <p
                style={{
                  fontSize: "10px",
                  color: "#94A3B8",
                  lineHeight: "1.7",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  letterSpacing: "0.03em",
                  margin: 0,
                  textAlign: "center",
                }}
              >
                FOR SECURITY, PASSWORD RESET LINKS EXPIRE AFTER 24 HOURS. IF YOU
                DID NOT REQUEST A RESET, PLEASE IGNORE THIS PAGE.
              </p>
            </div>

            <p
              style={{
                textAlign: "center",
                fontSize: "13px",
                color: "#64748B",
                marginTop: "20px",
              }}
            >
              Remember your password?{" "}
              <Link
                href="/login"
                style={{
                  color: "#2D8C4E",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Sign In
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
