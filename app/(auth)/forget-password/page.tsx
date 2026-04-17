"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/app/Lib/firebase";

export default function ForgotPasswordPage() {
  const emailRef = useRef<HTMLInputElement>(null);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailRef.current?.value || "";
    if (!email) {
      setError("ENTER YOUR EMAIL ADDRESS");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err: any) {
      setError("COULD NOT SEND RESET EMAIL — CHECK ADDRESS AND TRY AGAIN");
    } finally {
      setLoading(false);
    }
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
        <p
          style={{
            textAlign: "center",
            fontSize: "13px",
            color: "#64748B",
            marginBottom: "28px",
          }}
        >
          Reset your password
        </p>

        {sent ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📧</div>
            <p
              style={{
                fontWeight: 700,
                color: "#0F2A4A",
                textTransform: "uppercase",
                fontSize: "13px",
              }}
            >
              Reset Email Sent
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "#64748B",
                lineHeight: "1.7",
                marginBottom: "24px",
              }}
            >
              CHECK YOUR INBOX AND FOLLOW THE LINK TO RESET YOUR PASSWORD. CHECK
              YOUR SPAM FOLDER IF YOU DON&apos;T SEE IT.
            </p>
            <Link
              href="/login"
              style={{ color: "#2D8C4E", fontWeight: 700, fontSize: "13px" }}
            >
              ← Back to Login
            </Link>
          </div>
        ) : (
          <>
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
            <form onSubmit={handleReset}>
              <div style={{ marginBottom: "20px" }}>
                <label style={lbl}>Email Address</label>
                <input
                  ref={emailRef}
                  type="email"
                  placeholder="you@example.com"
                  defaultValue=""
                  style={inp}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  background: loading ? "#94A3B8" : "#2D8C4E",
                  color: "#fff",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Sending..." : "Send Reset Email"}
              </button>
            </form>
            <p
              style={{
                textAlign: "center",
                fontSize: "13px",
                color: "#64748B",
                marginTop: "16px",
              }}
            >
              <Link
                href="/login"
                style={{
                  color: "#2D8C4E",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                ← Back to Login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  fontWeight: 600,
  color: "#64748B",
  marginBottom: "4px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
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
