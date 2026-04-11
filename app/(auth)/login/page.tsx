"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Enter email and password");
      return;
    }
    setLoading(true);
    // Fake login — frontend only
    localStorage.setItem("user", JSON.stringify({ email }));
    router.push("/");
    setLoading(false);
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
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "8px" }}>
          <span
            style={{ fontSize: "28px", fontWeight: 900, letterSpacing: "-1px" }}
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

        <h2
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "#0F2A4A",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          Sign In
        </h2>

        <form onSubmit={handleLogin}>
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
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1px solid #E2E8F0",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
                background: "#F8FAFC",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
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
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1px solid #E2E8F0",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
                background: "#F8FAFC",
              }}
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
            {loading ? "Signing in..." : "Sign In"}
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
          No account?{" "}
          <Link
            href="/signup"
            style={{
              color: "#2D8C4E",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Sign up
          </Link>
        </p>

        {/* FIX: Disclaimer ALL CAPS */}
        <div
          style={{
            marginTop: "24px",
            padding: "14px",
            background: "#F8FAFC",
            borderRadius: "8px",
            border: "1px solid #E2E8F0",
          }}
        >
          <p
            style={{
              fontSize: "10px",
              color: "#94A3B8",
              lineHeight: "1.7",
              textAlign: "center",
              textTransform: "uppercase", // ← ALL CAPS
              fontWeight: 600,
              letterSpacing: "0.03em",
            }}
          >
            THIS SOFTWARE AND REPORTS GENERATED ARE FOR INFORMATIONAL PURPOSES
            ONLY. SEWER LABZ IS NOT RESPONSIBLE FOR ANY DECISIONS MADE BASED ON
            THIS REPORT. ALL INSPECTIONS SHOULD BE VERIFIED BY A LICENSED
            PLUMBING CONTRACTOR. BY LOGGING IN YOU AGREE TO OUR TERMS AND
            CONDITIONS.
          </p>
        </div>
      </div>
    </div>
  );
}
