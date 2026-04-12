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

  // Step 1 refs — no useState = no re-render on keystroke
  const fullNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);

  // Step 2 refs
  const companyNameRef = useRef<HTMLInputElement>(null);
  const inspectorTitleRef = useRef<HTMLInputElement>(null);
  const licenseRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const websiteRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const stateRef = useRef<HTMLInputElement>(null);
  const zipRef = useRef<HTMLInputElement>(null);

  const validateStep1 = () => {
    const fullName = fullNameRef.current?.value || "";
    const email = emailRef.current?.value || "";
    const password = passwordRef.current?.value || "";
    const confirm = confirmRef.current?.value || "";
    if (!fullName.trim()) return "Full name is required";
    if (!email.trim()) return "Email is required";
    if (!email.includes("@")) return "Enter a valid email";
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (password !== confirm) return "Passwords do not match";
    return "";
  };

  const validateStep2 = () => {
    if (!companyNameRef.current?.value?.trim())
      return "Company name is required";
    if (!phoneRef.current?.value?.trim()) return "Phone number is required";
    if (!addressRef.current?.value?.trim()) return "Address is required";
    if (!cityRef.current?.value?.trim()) return "City is required";
    if (!stateRef.current?.value?.trim()) return "State is required";
    return "";
  };

  const handleNext = () => {
    setError("");
    if (step === 1) {
      const e = validateStep1();
      if (e) {
        setError(e);
        return;
      }
    }
    if (step === 2) {
      const e = validateStep2();
      if (e) {
        setError(e);
        return;
      }
    }
    setStep((p) => p + 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError("YOU MUST AGREE TO THE TERMS AND CONDITIONS");
      return;
    }

    const email = emailRef.current?.value || "";
    const fullName = fullNameRef.current?.value || "";
    const companyName = companyNameRef.current?.value || "";

    // Save locally FIRST — instant redirect
    localStorage.setItem(
      "user",
      JSON.stringify({ email, fullName, companyName }),
    );
    router.push("/");

    // API in background
    fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName,
        email,
        password: passwordRef.current?.value,
        companyName,
        inspectorTitle: inspectorTitleRef.current?.value,
        licenseNumber: licenseRef.current?.value,
        companyPhone: phoneRef.current?.value,
        companyWebsite: websiteRef.current?.value,
        companyAddress: addressRef.current?.value,
        companyCity: cityRef.current?.value,
        companyState: stateRef.current?.value,
        companyZip: zipRef.current?.value,
        plan,
      }),
    }).catch(() => {});
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

  // Simple field component using ref — no state re-render
  const Field = ({
    label,
    inputRef,
    type = "text",
    placeholder = "",
    maxLength,
  }: {
    label: string;
    inputRef: React.RefObject<HTMLInputElement | null>;
    type?: string;
    placeholder?: string;
    maxLength?: number;
  }) => (
    <div style={{ marginBottom: "14px" }}>
      <label style={lbl}>{label}</label>
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type={type}
        placeholder={placeholder}
        maxLength={maxLength}
        defaultValue=""
        style={inp}
      />
    </div>
  );

  const StepBar = () => (
    <div
      style={{ display: "flex", alignItems: "center", marginBottom: "28px" }}
    >
      {["Account", "Company", "Plan"].map((label, i) => {
        const num = i + 1;
        const done = step > num;
        const active = step === num;
        return (
          <div
            key={label}
            style={{ display: "flex", alignItems: "center", flex: 1 }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flex: 1,
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: 800,
                  marginBottom: "4px",
                  background: done ? "#2D8C4E" : active ? "#0F2A4A" : "#E2E8F0",
                  color: done || active ? "#fff" : "#94A3B8",
                }}
              >
                {done ? "✓" : num}
              </div>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  color: active ? "#0F2A4A" : "#94A3B8",
                }}
              >
                {label}
              </span>
            </div>
            {i < 2 && (
              <div
                style={{
                  height: "2px",
                  flex: 2,
                  marginBottom: "18px",
                  background: step > num ? "#2D8C4E" : "#E2E8F0",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );

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
          maxWidth: "500px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "6px" }}>
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
          Create your inspector account
        </p>

        <StepBar />

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
          {/* STEP 1 — Account */}
          {step === 1 && (
            <div>
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#0F2A4A",
                  marginBottom: "16px",
                }}
              >
                Account Information
              </h3>
              <Field
                label="Full Name *"
                inputRef={fullNameRef}
                placeholder="John Smith"
              />
              <Field
                label="Email Address *"
                inputRef={emailRef}
                type="email"
                placeholder="you@example.com"
              />
              <Field
                label="Password *"
                inputRef={passwordRef}
                type="password"
                placeholder="Min 6 characters"
              />
              <Field
                label="Confirm Password *"
                inputRef={confirmRef}
                type="password"
                placeholder="Re-enter password"
              />
            </div>
          )}

          {/* STEP 2 — Company */}
          {step === 2 && (
            <div>
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#0F2A4A",
                  marginBottom: "16px",
                }}
              >
                Company Information
              </h3>
              <Field
                label="Company Name *"
                inputRef={companyNameRef}
                placeholder="Sewer Labz"
              />
              <Field
                label="Inspector Title"
                inputRef={inspectorTitleRef}
                placeholder="e.g. Certified Sewer Inspector"
              />
              <Field
                label="License Number"
                inputRef={licenseRef}
                placeholder="e.g. LIC-123456"
              />
              <Field
                label="Phone Number *"
                inputRef={phoneRef}
                type="tel"
                placeholder="(702) 000-0000"
              />
              <Field
                label="Company Website"
                inputRef={websiteRef}
                type="url"
                placeholder="https://yourdomain.com"
              />
              <Field
                label="Street Address *"
                inputRef={addressRef}
                placeholder="123 Main St"
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr",
                  gap: "10px",
                  marginBottom: "14px",
                }}
              >
                <div>
                  <label style={lbl}>City *</label>
                  <input
                    ref={cityRef as React.RefObject<HTMLInputElement>}
                    type="text"
                    placeholder="Las Vegas"
                    defaultValue=""
                    style={inp}
                  />
                </div>
                <div>
                  <label style={lbl}>State *</label>
                  <input
                    ref={stateRef as React.RefObject<HTMLInputElement>}
                    type="text"
                    placeholder="NV"
                    maxLength={2}
                    defaultValue=""
                    style={inp}
                  />
                </div>
                <div>
                  <label style={lbl}>ZIP</label>
                  <input
                    ref={zipRef as React.RefObject<HTMLInputElement>}
                    type="text"
                    placeholder="89101"
                    defaultValue=""
                    style={inp}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 — Plan + Terms */}
          {step === 3 && (
            <div>
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#0F2A4A",
                  marginBottom: "16px",
                }}
              >
                Choose Your Plan
              </h3>

              {[
                {
                  id: "FREE",
                  name: "Free",
                  price: "$0/mo",
                  color: "#64748B",
                  features: [
                    "5 reports/month",
                    "Basic templates",
                    "PDF export",
                  ],
                },
                {
                  id: "PRO",
                  name: "Pro",
                  price: "$49/mo",
                  color: "#2D8C4E",
                  features: [
                    "Unlimited reports",
                    "Custom templates",
                    "Priority support",
                    "No watermark",
                  ],
                },
              ].map((p) => (
                <div
                  key={p.id}
                  onClick={() => setPlan(p.id)}
                  style={{
                    border: `2px solid ${plan === p.id ? p.color : "#E2E8F0"}`,
                    borderRadius: "10px",
                    padding: "16px",
                    marginBottom: "12px",
                    cursor: "pointer",
                    background: plan === p.id ? "#F8FAFC" : "#fff",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          border: `2px solid ${p.color}`,
                          background: plan === p.id ? p.color : "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {plan === p.id && (
                          <div
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              background: "#fff",
                            }}
                          />
                        )}
                      </div>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: "14px",
                          color: "#0F2A4A",
                        }}
                      >
                        {p.name}
                      </span>
                    </div>
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: "15px",
                        color: p.color,
                      }}
                    >
                      {p.price}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "6px",
                      paddingLeft: "28px",
                    }}
                  >
                    {p.features.map((f) => (
                      <span
                        key={f}
                        style={{
                          fontSize: "11px",
                          color: "#64748B",
                          background: "#F1F5F9",
                          padding: "2px 8px",
                          borderRadius: "20px",
                          fontWeight: 500,
                        }}
                      >
                        ✓ {f}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {/* ALL CAPS Disclaimer */}
              <div
                style={{
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: "8px",
                  padding: "14px",
                  marginTop: "20px",
                  marginBottom: "16px",
                }}
              >
                <p
                  style={{
                    fontSize: "10px",
                    color: "#64748B",
                    lineHeight: "1.8",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    letterSpacing: "0.03em",
                    margin: 0,
                  }}
                >
                  THIS SOFTWARE AND THE REPORTS GENERATED ARE FOR INFORMATIONAL
                  PURPOSES ONLY. SEWER LABZ IS NOT RESPONSIBLE FOR ANY DECISIONS
                  MADE BASED ON THIS REPORT. ALL INSPECTIONS SHOULD BE VERIFIED
                  BY A LICENSED PLUMBING CONTRACTOR. ALL REPAIRS SHOULD BE
                  PERFORMED BY A COMPETENT LICENSED PLUMBER. ANY WORK REQUIRING
                  BUILDING PERMITS SHOULD BE OBTAINED BY THE AUTHORITY HAVING
                  JURISDICTION. BY CREATING AN ACCOUNT YOU AGREE TO OUR TERMS
                  AND CONDITIONS AND PRIVACY POLICY.
                </p>
              </div>

              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  cursor: "pointer",
                  marginBottom: "20px",
                }}
              >
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  style={{
                    marginTop: "3px",
                    accentColor: "#0F2A4A",
                    width: "16px",
                    height: "16px",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: "11px",
                    color: "#0F2A4A",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                    lineHeight: "1.6",
                  }}
                >
                  I HAVE READ AND AGREE TO THE TERMS AND CONDITIONS ABOVE
                </span>
              </label>

              <button
                type="submit"
                disabled={!agreed}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "none",
                  background: !agreed ? "#94A3B8" : "#2D8C4E",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: !agreed ? "not-allowed" : "pointer",
                }}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Back / Next */}
          {step < 3 && (
            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep((p) => p - 1)}
                  style={{
                    flex: 1,
                    padding: "11px",
                    borderRadius: "8px",
                    border: "1px solid #E2E8F0",
                    background: "#fff",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    color: "#64748B",
                  }}
                >
                  ← Back
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                style={{
                  flex: 2,
                  padding: "11px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#0F2A4A",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Next →
              </button>
            </div>
          )}
        </form>

        <p
          style={{
            textAlign: "center",
            fontSize: "13px",
            color: "#64748B",
            marginTop: "20px",
          }}
        >
          Already have an account?{" "}
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
      </div>
    </div>
  );
}
