"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type UserSettings = {
  email: string;
  fullName: string;
  companyName: string;
  companyPhone: string;
  companyAddress: string;
  companyWebsite: string;
  licenseNumber: string;
};

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "account" | "company" | "subscription"
  >("account");
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
  const [plan] = useState("FREE");

  // ✅ FIX 1 — Properly merge user email + saved settings without overwriting
  useEffect(() => {
    const stored = localStorage.getItem("user");
    const savedSettings = localStorage.getItem("sewer_settings");

    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      // Pull email from user if missing in saved settings
      if (stored && !parsed.email) {
        parsed.email = JSON.parse(stored).email || "";
      }
      setSettings(parsed);
    } else if (stored) {
      const u = JSON.parse(stored);
      setSettings((p) => ({ ...p, email: u.email || "" }));
    }
  }, []);

  const update = (k: string, v: string) =>
    setSettings((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("API failed");
    } catch (err) {
      console.error("Settings API error:", err);
    }
    // Always save to localStorage as fallback
    localStorage.setItem("sewer_settings", JSON.stringify(settings));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.replace("/login");
  };

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

  const tab = (active: boolean): React.CSSProperties => ({
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
          style={tab(activeTab === "account")}
          onClick={() => setActiveTab("account")}
        >
          👤 Account
        </button>
        <button
          style={tab(activeTab === "company")}
          onClick={() => setActiveTab("company")}
        >
          🏢 Company
        </button>
        <button
          style={tab(activeTab === "subscription")}
          onClick={() => setActiveTab("subscription")}
        >
          💳 Subscription
        </button>
      </div>

      {/* Account Tab */}
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
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="you@example.com"
                  style={{ ...inp, color: "#94A3B8" }}
                  disabled
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
              Password reset is handled via email. Click below to receive a
              reset link.
            </div>
            <button
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

      {/* Company Tab */}
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
            This info is used as defaults in your reports. You can override
            per-template in the Templates tab.
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

      {/* Subscription Tab */}
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
                  background: plan === "FREE" ? "#F1F5F9" : "#F0FDF4",
                  color: plan === "FREE" ? "#64748B" : "#16A34A",
                }}
              >
                {plan}
              </div>
              <div style={{ fontSize: "13px", color: "#64748B" }}>
                {plan === "FREE"
                  ? "Limited to 5 reports per month"
                  : "Unlimited reports"}
              </div>
            </div>

            {plan === "FREE" && (
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
              No billing history available on the free plan.
            </div>
          </div>
        </>
      )}
    </div>
  );
}
