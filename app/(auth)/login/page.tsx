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
      const code = err?.code || "";
      if (
        code === "auth/user-not-found" ||
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential"
      ) {
        setError("INVALID EMAIL OR PASSWORD");
      } else if (code === "auth/too-many-requests") {
        setError("TOO MANY ATTEMPTS — TRY AGAIN LATER");
      } else {
        setError("LOGIN FAILED — PLEASE TRY AGAIN");
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
          Professional Sewer Inspection Reports
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

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "14px" }}>
            <label style={lbl}>Email</label>
            <input
              ref={emailRef}
              type="email"
              placeholder="you@example.com"
              defaultValue=""
              style={inp}
            />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={lbl}>Password</label>
            <input
              ref={passwordRef}
              type="password"
              placeholder="••••••••"
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
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "14px",
          }}
        >
          <Link
            href="/forget-password"
            style={{
              fontSize: "13px",
              color: "#2D8C4E",
              textDecoration: "none",
            }}
          >
            Forgot password?
          </Link>
          <Link
            href="/signup"
            style={{
              fontSize: "13px",
              color: "#2D8C4E",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Sign up →
          </Link>
        </div>

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
