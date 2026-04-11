"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);

  const [form, setForm] = useState({
    // Step 1 — Account
    fullName: "",
    email: "",
    password: "",
    confirm: "",
    // Step 2 — Company
    companyName: "",
    companyPhone: "",
    companyAddress: "",
    companyCity: "",
    companyState: "",
    companyZip: "",
    companyWebsite: "",
    licenseNumber: "",
    inspectorTitle: "",
    // Step 3 — Plan
    plan: "FREE",
  });

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const validateStep1 = () => {
    if (!form.fullName.trim()) return "Full name is required";
    if (!form.email.trim()) return "Email is required";
    if (!form.email.includes("@")) return "Enter a valid email";
    if (!form.password) return "Password is required";
    if (form.password.length < 6)
      return "Password must be at least 6 characters";
    if (form.password !== form.confirm) return "Passwords do not match";
    return "";
  };

  const validateStep2 = () => {
    if (!form.companyName.trim()) return "Company name is required";
    if (!form.companyPhone.trim()) return "Phone number is required";
    if (!form.companyAddress.trim()) return "Address is required";
    if (!form.companyCity.trim()) return "City is required";
    if (!form.companyState.trim()) return "State is required";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!agreed) {
      setError("YOU MUST AGREE TO THE TERMS AND CONDITIONS");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Signup failed");
        setLoading(false);
        return;
      }
    } catch {}
    localStorage.setItem(
      "user",
      JSON.stringify({
        email: form.email,
        fullName: form.fullName,
        companyName: form.companyName,
      }),
    );
    router.push("/");
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

  const Field = ({
    label,
    k,
    type = "text",
    placeholder = "",
  }: {
    label: string;
    k: string;
    type?: string;
    placeholder?: string;
  }) => (
    <div style={{ marginBottom: "14px" }}>
      <label style={lbl}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={(form as any)[k]}
        onChange={(e) => update(k, e.target.value)}
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
        {/* Logo */}
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
                k="fullName"
                type="text"
                placeholder="John Smith"
              />
              <Field
                label="Email Address *"
                k="email"
                type="email"
                placeholder="you@example.com"
              />
              <Field
                label="Password *"
                k="password"
                type="password"
                placeholder="Min 6 characters"
              />
              <Field
                label="Confirm Password *"
                k="confirm"
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
                k="companyName"
                placeholder="Sewer Labz"
              />
              <Field
                label="Inspector Title"
                k="inspectorTitle"
                placeholder="e.g. Certified Sewer Inspector"
              />
              <Field
                label="License Number"
                k="licenseNumber"
                placeholder="e.g. LIC-123456"
              />
              <Field
                label="Phone Number *"
                k="companyPhone"
                type="tel"
                placeholder="(702) 000-0000"
              />
              <Field
                label="Company Website"
                k="companyWebsite"
                type="url"
                placeholder="https://yourdomain.com"
              />

              <div style={{ marginBottom: "14px" }}>
                <label style={lbl}>Street Address *</label>
                <input
                  type="text"
                  value={form.companyAddress}
                  onChange={(e) => update("companyAddress", e.target.value)}
                  placeholder="123 Main St"
                  style={inp}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr",
                  gap: "10px",
                }}
              >
                <div>
                  <label style={lbl}>City *</label>
                  <input
                    type="text"
                    value={form.companyCity}
                    onChange={(e) => update("companyCity", e.target.value)}
                    placeholder="Las Vegas"
                    style={inp}
                  />
                </div>
                <div>
                  <label style={lbl}>State *</label>
                  <input
                    type="text"
                    value={form.companyState}
                    onChange={(e) => update("companyState", e.target.value)}
                    placeholder="NV"
                    maxLength={2}
                    style={inp}
                  />
                </div>
                <div>
                  <label style={lbl}>ZIP</label>
                  <input
                    type="text"
                    value={form.companyZip}
                    onChange={(e) => update("companyZip", e.target.value)}
                    placeholder="89101"
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
              ].map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => update("plan", plan.id)}
                  style={{
                    border: `2px solid ${form.plan === plan.id ? plan.color : "#E2E8F0"}`,
                    borderRadius: "10px",
                    padding: "16px",
                    marginBottom: "12px",
                    cursor: "pointer",
                    background: form.plan === plan.id ? "#F8FAFC" : "#fff",
                    transition: "all 0.15s",
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
                          border: `2px solid ${plan.color}`,
                          background:
                            form.plan === plan.id ? plan.color : "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {form.plan === plan.id && (
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
                        {plan.name}
                      </span>
                    </div>
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: "15px",
                        color: plan.color,
                      }}
                    >
                      {plan.price}
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
                    {plan.features.map((f) => (
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
                disabled={loading || !agreed}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "none",
                  background: loading || !agreed ? "#94A3B8" : "#2D8C4E",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: loading || !agreed ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          )}

          {/* Back / Next buttons */}
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
