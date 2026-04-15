"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [plan, setPlan] = useState("FREE");
  const [showTerms, setShowTerms] = useState(false);

  const fullNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);

  const companyNameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const stateRef = useRef<HTMLInputElement>(null);

  const validateStep1 = () => {
    const fullName = fullNameRef.current?.value || "";
    const email = emailRef.current?.value || "";
    const password = passwordRef.current?.value || "";
    const confirm = confirmRef.current?.value || "";

    if (!fullName.trim()) return "Full name is required";
    if (!email.includes("@")) return "Enter a valid email";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (password !== confirm) return "Passwords do not match";
    return "";
  };

  const validateStep2 = () => {
    if (!companyNameRef.current?.value) return "Company name required";
    if (!phoneRef.current?.value) return "Phone required";
    if (!addressRef.current?.value) return "Address required";
    if (!cityRef.current?.value) return "City required";
    if (!stateRef.current?.value) return "State required";
    return "";
  };

  const handleNext = () => {
    setError("");
    if (step === 1) {
      const e = validateStep1();
      if (e) return setError(e);
    }
    if (step === 2) {
      const e = validateStep2();
      if (e) return setError(e);
    }
    setStep((s) => s + 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreed) {
      setError("You must agree to terms");
      return;
    }

    localStorage.setItem(
      "user",
      JSON.stringify({
        name: fullNameRef.current?.value,
        email: emailRef.current?.value,
        plan,
      }),
    );

    router.push("/");
  };

  const plans = [
    {
      id: "FREE",
      name: "Free Trial",
      price: "$0",
      color: "#64748B",
      features: ["5 reports/month", "Basic templates"],
    },
    {
      id: "MONTHLY",
      name: "Pro Monthly",
      price: "$49/mo",
      color: "#0F2A4A",
      features: ["Unlimited reports", "Priority support"],
    },
    {
      id: "YEARLY",
      name: "Pro Yearly",
      price: "$499/year",
      color: "#2D8C4E",
      features: ["Unlimited reports", "Priority support", "Best value"],
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#F8FAFC",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "40px",
          borderRadius: "12px",
          width: "400px",
        }}
      >
        <h2 style={{ textAlign: "center" }}>SEWER LABZ</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <input ref={fullNameRef} placeholder="Full Name" />
              <br />
              <br />
              <input ref={emailRef} placeholder="Email" />
              <br />
              <br />
              <input ref={passwordRef} type="password" placeholder="Password" />
              <br />
              <br />
              <input
                ref={confirmRef}
                type="password"
                placeholder="Confirm Password"
              />
            </>
          )}

          {step === 2 && (
            <>
              <input ref={companyNameRef} placeholder="Company Name" />
              <br />
              <br />
              <input ref={phoneRef} placeholder="Phone" />
              <br />
              <br />
              <input ref={addressRef} placeholder="Address" />
              <br />
              <br />
              <input ref={cityRef} placeholder="City" />
              <br />
              <br />
              <input ref={stateRef} placeholder="State" />
            </>
          )}

          {step === 3 && (
            <>
              <h3>Select Plan</h3>

              {plans.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setPlan(p.id)}
                  style={{
                    border: `2px solid ${plan === p.id ? p.color : "#ccc"}`,
                    padding: "10px",
                    marginBottom: "10px",
                    cursor: "pointer",
                  }}
                >
                  {p.name} - {p.price}
                </div>
              ))}

              <label>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                Agree to{" "}
                <span
                  onClick={() => setShowTerms(true)}
                  style={{ color: "blue", cursor: "pointer" }}
                >
                  Terms
                </span>
              </label>

              <br />
              <br />

              <button disabled={!agreed}>Create Account</button>
            </>
          )}

          <br />

          {step < 3 && (
            <button type="button" onClick={handleNext}>
              Next
            </button>
          )}
        </form>

        <p>
          Already have account? <Link href="/login">Login</Link>
        </p>
      </div>

      {/* TERMS MODAL */}
      {showTerms && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ background: "#fff", padding: "20px", width: "400px" }}>
            <h3>Terms & Conditions</h3>

            <ol>
              <li>
                <b>Software Disclaimer</b> – Tool only, not professional advice.
              </li>
              <li>
                <b>No Warranty</b> – Provided “AS IS”.
              </li>
              <li>
                <b>User Responsibility</b> – You verify all reports.
              </li>
              <li>
                <b>Limitation</b> – No liability for damages.
              </li>
              <li>
                <b>Billing</b> – Auto-renew subscription.
              </li>
            </ol>

            <button
              onClick={() => {
                setAgreed(true);
                setShowTerms(false);
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
