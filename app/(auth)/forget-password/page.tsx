"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [step, setStep] = useState<"find" | "reset" | "done">("find");
  const [error, setError] = useState("");

  const handleFind = () => {
    setError("");
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const exists = users.find((u: any) => u.email === email);
    if (!exists) {
      setError("No account found with that email.");
      return;
    }
    setStep("reset");
  };

  const handleReset = () => {
    setError("");
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const updated = users.map((u: any) =>
      u.email === email ? { ...u, password: newPassword } : u,
    );
    localStorage.setItem("users", JSON.stringify(updated));
    setStep("done");
  };

  const inp: React.CSSProperties = {
    width: "100%",
    height: "42px",
    borderRadius: "8px",
    border: "1px solid #E2E8F0",
    padding: "0 12px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    background: "#F8FAFC",
  };

  const lbl: React.CSSProperties = {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    color: "#64748B",
    marginBottom: "6px",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F1F5F9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "40px",
          width: "100%",
          maxWidth: "400px",
          border: "1px solid #E2E8F0",
        }}
      >
        {/* Step: Find account */}
        {step === "find" && (
          <>
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#0F2A4A",
                  margin: 0,
                }}
              >
                Forgot Password
              </h1>
              <p
                style={{ fontSize: "13px", color: "#94A3B8", marginTop: "6px" }}
              >
                Enter your email to reset your password
              </p>
            </div>

            {error && (
              <div
                style={{
                  background: "#FEF2F2",
                  border: "1px solid #FECACA",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  fontSize: "13px",
                  color: "#DC2626",
                  marginBottom: "16px",
                }}
              >
                {error}
              </div>
            )}

            <div style={{ marginBottom: "24px" }}>
              <label style={lbl}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={inp}
              />
            </div>

            <button
              onClick={handleFind}
              style={{
                width: "100%",
                height: "42px",
                background: "#0F2A4A",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                marginBottom: "20px",
              }}
            >
              Continue
            </button>
          </>
        )}

        {/* Step: Reset password */}
        {step === "reset" && (
          <>
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#0F2A4A",
                  margin: 0,
                }}
              >
                Reset Password
              </h1>
              <p
                style={{ fontSize: "13px", color: "#94A3B8", marginTop: "6px" }}
              >
                Choose a new password for <strong>{email}</strong>
              </p>
            </div>

            {error && (
              <div
                style={{
                  background: "#FEF2F2",
                  border: "1px solid #FECACA",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  fontSize: "13px",
                  color: "#DC2626",
                  marginBottom: "16px",
                }}
              >
                {error}
              </div>
            )}

            <div style={{ marginBottom: "16px" }}>
              <label style={lbl}>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters"
                style={inp}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={lbl}>Confirm New Password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                style={inp}
              />
            </div>

            <button
              onClick={handleReset}
              style={{
                width: "100%",
                height: "42px",
                background: "#2D8C4E",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                marginBottom: "20px",
              }}
            >
              Reset Password
            </button>
          </>
        )}

        {/* Step: Done */}
        {step === "done" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
            <h1
              style={{
                fontSize: "22px",
                fontWeight: 800,
                color: "#0F2A4A",
                margin: "0 0 8px",
              }}
            >
              Password Reset!
            </h1>
            <p
              style={{
                fontSize: "13px",
                color: "#64748B",
                marginBottom: "24px",
              }}
            >
              Your password has been updated successfully.
            </p>
            <Link
              href="/login"
              style={{
                display: "inline-block",
                background: "#0F2A4A",
                color: "#fff",
                borderRadius: "8px",
                padding: "10px 28px",
                fontSize: "14px",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Back to Login
            </Link>
          </div>
        )}

        {/* Back to login */}
        {step !== "done" && (
          <p
            style={{
              textAlign: "center",
              fontSize: "13px",
              color: "#64748B",
              margin: 0,
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
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
