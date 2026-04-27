"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/app/Lib/firebase";

type UserSettings = {
  email: string;
  fullName: string;
  companyName: string;
  companyPhone: string;
  companyAddress: string;
  companyWebsite: string;
  licenseNumber: string;
};

const PLAN_LABELS: Record<string, string> = {
  free: "FREE",
  pro_monthly: "PRO MONTHLY",
  pro_annual: "PRO ANNUAL",
};

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "account" | "company" | "subscription"
  >("account");
  const [uid, setUid] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings>({
    email: "",
    fullName: "",
    companyName: "",
    companyPhone: "",
    companyAddress: "",
    companyWebsite: "",
    licenseNumber: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [plan, setPlan] = useState("free");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.replace("/login");
        return;
      }
      setUid(u.uid);

      // Pre-fill from Firebase Auth immediately
      setSettings((p) => ({
        ...p,
        email: u.email || "",
        fullName: u.displayName || "",
      }));

      // Load saved settings from Firestore — send token for auth
      try {
        const token = await u.getIdToken();
        const res = await fetch("/api/settings", {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-user-id": u.uid,
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setSettings((p) => ({
              ...p,
              ...data,
              email: u.email || p.email, // email always comes from Firebase Auth
            }));
            if (data.plan) setPlan(data.plan);
          }
        }
      } catch {
        // Fall back to localStorage cache
        const local = localStorage.getItem("sewer_settings");
        if (local) {
          const cached = JSON.parse(local);
          setSettings((p) => ({ ...p, ...cached, email: u.email || p.email }));
        }
      }
    });
    return () => unsub();
  }, []);

  const update = (k: string, v: string) =>
    setSettings((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!uid) return;
    setSaving(true);
    setSaveError("");
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-user-id": uid,
        },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Save failed");
      }

      // Cache locally as backup
      localStorage.setItem("sewer_settings", JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      // Still save locally so work isn't lost
      localStorage.setItem("sewer_settings", JSON.stringify(settings));
      setSaveError(err?.message || "Could not save to server — saved locally");
      setTimeout(() => setSaveError(""), 4000);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!settings.email) return;
    try {
      await sendPasswordResetEmail(auth, settings.email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 4000);
    } catch {}
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  const isPro = plan === "pro_monthly" || plan === "pro_annual";

  // ── Styles ──────────────────────────────────────────────────────────────────

  const inp: React.CSSProperties = {
    height: "36px",
    borderRadius: "6px",
    border: "1px solid #E2E8F0",
    padding: "0 10px",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
    background: "#F8FAFC",
    width: "100%",
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
  const card: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #E2E8F0",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "16px",
  };
  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 18px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    background: active ? "#0F2A4A" : "transparent",
    color: active ? "#fff" : "#64748B",
  });

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "800px",
        margin: "0 auto",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "#0F2A4A",
              margin: 0,
            }}
          >
            Settings
          </h1>
          <p style={{ fontSize: "13px", color: "#94A3B8", marginTop: "4px" }}>
            Manage your account and preferences
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {saved && (
            <span
              style={{ fontSize: "13px", color: "#16A34A", fontWeight: 600 }}
            >
              ✓ Saved
            </span>
          )}
          {saveError && (
            <span style={{ fontSize: "12px", color: "#DC2626", maxWidth: 200 }}>
              {saveError}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: saving ? "#94A3B8" : "#2D8C4E",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "8px 20px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          marginBottom: "20px",
          background: "#fff",
          padding: "8px",
          borderRadius: "10px",
          border: "1px solid #E2E8F0",
        }}
      >
        <button
          style={tabStyle(activeTab === "account")}
          onClick={() => setActiveTab("account")}
        >
          👤 Account
        </button>
        <button
          style={tabStyle(activeTab === "company")}
          onClick={() => setActiveTab("company")}
        >
          🏢 Company
        </button>
        <button
          style={tabStyle(activeTab === "subscription")}
          onClick={() => setActiveTab("subscription")}
        >
          💳 Subscription
        </button>
      </div>

      {/* ── ACCOUNT TAB ── */}
      {activeTab === "account" && (
        <>
          <div style={card}>
            <h3
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#0F2A4A",
                margin: "0 0 16px",
              }}
            >
              Account Information
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
              }}
            >
              <div>
                <label style={lbl}>Full Name</label>
                <input
                  value={settings.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  placeholder="Your full name"
                  style={inp}
                />
              </div>
              <div>
                <label style={lbl}>Email Address</label>
                <input
                  value={settings.email}
                  disabled
                  style={{ ...inp, color: "#94A3B8" }}
                />
              </div>
              <div>
                <label style={lbl}>License Number</label>
                <input
                  value={settings.licenseNumber}
                  onChange={(e) => update("licenseNumber", e.target.value)}
                  placeholder="Inspector license #"
                  style={inp}
                />
              </div>
            </div>
          </div>

          <div style={card}>
            <h3
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#0F2A4A",
                margin: "0 0 16px",
              }}
            >
              Security
            </h3>
            <div
              style={{
                padding: "12px",
                background: "#F8FAFC",
                borderRadius: "8px",
                fontSize: "13px",
                color: "#64748B",
                marginBottom: "12px",
              }}
            >
              Password reset link will be sent to {settings.email}
            </div>
            {resetSent && (
              <div
                style={{
                  padding: "10px",
                  background: "#F0FDF4",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#16A34A",
                  fontWeight: 600,
                  marginBottom: "12px",
                }}
              >
                ✓ Reset email sent — check your inbox
              </div>
            )}
            <button
              onClick={handlePasswordReset}
              style={{
                padding: "8px 18px",
                borderRadius: "6px",
                border: "1px solid #E2E8F0",
                background: "#fff",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                color: "#0F2A4A",
              }}
            >
              Send Password Reset Email
            </button>
          </div>

          <div style={card}>
            <h3
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#DC2626",
                margin: "0 0 12px",
              }}
            >
              Danger Zone
            </h3>
            <button
              onClick={handleLogout}
              style={{
                padding: "8px 18px",
                borderRadius: "6px",
                border: "none",
                background: "#FEF2F2",
                color: "#DC2626",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Sign Out
            </button>
          </div>
        </>
      )}

      {/* ── COMPANY TAB ── */}
      {activeTab === "company" && (
        <div style={card}>
          <h3
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#0F2A4A",
              margin: "0 0 16px",
            }}
          >
            Company Information
          </h3>
          <p
            style={{ fontSize: "12px", color: "#94A3B8", marginBottom: "16px" }}
          >
            This info is used as defaults in your reports.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px",
            }}
          >
            {[
              {
                label: "Company Name",
                key: "companyName",
                placeholder: "Sewer Labz",
              },
              {
                label: "Phone Number",
                key: "companyPhone",
                placeholder: "(702) 000-0000",
              },
              {
                label: "Website",
                key: "companyWebsite",
                placeholder: "https://sewerlabz.com",
              },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label style={lbl}>{label}</label>
                <input
                  value={(settings as any)[key]}
                  onChange={(e) => update(key, e.target.value)}
                  placeholder={placeholder}
                  style={inp}
                />
              </div>
            ))}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={lbl}>Company Address</label>
              <input
                value={settings.companyAddress}
                onChange={(e) => update("companyAddress", e.target.value)}
                placeholder="123 Main St, Las Vegas NV 89101"
                style={inp}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── SUBSCRIPTION TAB ── */}
      {activeTab === "subscription" && (
        <>
          <div style={card}>
            <h3
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#0F2A4A",
                margin: "0 0 16px",
              }}
            >
              Current Plan
            </h3>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  padding: "8px 20px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: 800,
                  background: isPro ? "#E8F5EE" : "#F1F5F9",
                  color: isPro ? "#2D8C4E" : "#64748B",
                }}
              >
                {PLAN_LABELS[plan] ?? plan.toUpperCase()}
              </div>
              <div style={{ fontSize: "13px", color: "#64748B" }}>
                {isPro
                  ? "Unlimited reports · All features unlocked"
                  : "Limited to 5 reports per month"}
              </div>
            </div>

            {/* Only show upgrade card if not already pro */}
            {!isPro && (
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #0F2A4A 0%, #1e4a7a 100%)",
                  borderRadius: "10px",
                  padding: "20px",
                  color: "#fff",
                }}
              >
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: 800,
                    marginBottom: "6px",
                  }}
                >
                  Upgrade to Pro
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#CBD5E1",
                    marginBottom: "16px",
                    lineHeight: "1.6",
                  }}
                >
                  Unlimited reports · Custom templates · Priority support · PDF
                  watermark removed
                </div>
                <button
                  onClick={() => router.push("/billing")}
                  style={{
                    background: "#2D8C4E",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 24px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Subscribe Now
                </button>
              </div>
            )}

            {isPro && (
              <div
                style={{
                  background: "#F0FDF4",
                  border: "1px solid #BBF7D0",
                  borderRadius: "10px",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#16A34A",
                    marginBottom: "4px",
                  }}
                >
                  ✓ Pro Active
                </div>
                <div style={{ fontSize: "13px", color: "#64748B" }}>
                  To manage or cancel your subscription, visit your LemonSqueezy
                  customer portal.
                </div>
              </div>
            )}
          </div>

          <div style={card}>
            <h3
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#0F2A4A",
                margin: "0 0 12px",
              }}
            >
              Billing History
            </h3>
            <div
              style={{
                fontSize: "13px",
                color: "#94A3B8",
                padding: "20px",
                textAlign: "center",
              }}
            >
              {isPro
                ? "For invoices and billing history, check your email receipts from LemonSqueezy."
                : "No billing history available on the free plan."}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
