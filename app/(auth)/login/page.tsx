"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/app/Lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailRef.current?.value || "";
    const password = passwordRef.current?.value || "";

    if (!email || !password) {
      setError("Enter email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err: any) {
      console.error("Firebase login error:", err);
      console.error("Error code:", err?.code);
      console.error("Error message:", err?.message);

      const code = err?.code || "";
      if (
        code === "auth/user-not-found" ||
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential" ||
        code === "auth/invalid-email"
      ) {
        setError("INVALID EMAIL OR PASSWORD");
      } else if (code === "auth/too-many-requests") {
        setError("TOO MANY ATTEMPTS — TRY AGAIN LATER");
      } else if (code === "auth/network-request-failed") {
        setError("NETWORK ERROR — CHECK YOUR CONNECTION");
      } else if (
        code === "auth/configuration-not-found" ||
        code === "auth/api-key-not-valid"
      ) {
        setError("FIREBASE CONFIG ERROR — CHECK ENV VARIABLES");
      } else {
        setError(`LOGIN FAILED — CODE: ${code || "UNKNOWN"}`);
      }
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
        <p
          style={{
            textAlign: "center",
            fontSize: "13px",
            color: "#64748B",
            marginBottom: "28px",
          }}
        >
          Professional Sewer Inspection Reports
        </p>

        {/* Error */}
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
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin}>
          {/* Email */}
          <div style={{ marginBottom: "14px" }}>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 600,
                color: "#64748B",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Email
            </label>
            <input
              ref={emailRef}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1px solid #E2E8F0",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
                background: "#F8FAFC",
                color: "#0F172A",
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "6px" }}>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 600,
                color: "#64748B",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Password
            </label>
            <input
              ref={passwordRef}
              type="password"
              placeholder="••••••••••"
              autoComplete="current-password"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1px solid #E2E8F0",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
                background: "#F8FAFC",
                color: "#0F172A",
              }}
            />
          </div>

          {/* Forgot password */}
          <div style={{ textAlign: "right", marginBottom: "20px" }}>
            <Link
              href="/forget-password"
              style={{
                fontSize: "12px",
                color: "#2D8C4E",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
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
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "background 0.2s",
            }}
          >
            {loading && <Spinner />}
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Disclaimer */}
        <div
          style={{
            marginTop: "24px",
            padding: "12px",
            background: "#F8FAFC",
            borderRadius: "6px",
            border: "1px solid #E2E8F0",
          }}
        >
          <p
            style={{
              fontSize: "10px",
              color: "#94A3B8",
              textAlign: "center",
              lineHeight: "1.7",
              textTransform: "uppercase",
              fontWeight: 600,
              letterSpacing: "0.03em",
              margin: 0,
            }}
          >
            THIS SOFTWARE AND REPORTS GENERATED ARE FOR INFORMATIONAL PURPOSES
            ONLY. SEWER LABZ IS NOT RESPONSIBLE FOR ANY DECISIONS MADE BASED ON
            THIS REPORT. ALL INSPECTIONS SHOULD BE VERIFIED BY A LICENSED
            PLUMBING CONTRACTOR. BY LOGGING IN YOU AGREE TO OUR TERMS AND
            CONDITIONS.
          </p>
        </div>

        {/* Sign up link */}
        <p
          style={{
            textAlign: "center",
            fontSize: "13px",
            color: "#64748B",
            marginTop: "20px",
          }}
        >
          Don't have an account?{" "}
          <Link
            href="/signup"
            style={{
              color: "#2D8C4E",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Sign up →
          </Link>
        </p>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{ animation: "sl-spin 0.8s linear infinite" }}
    >
      <style>{`@keyframes sl-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
