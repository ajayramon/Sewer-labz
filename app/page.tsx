"use client";
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/app/Lib/firebase";

type Report = {
  id: string;
  title: string;
  location: string;
  clientName: string;
  inspectedAt: string;
  status: "DRAFT" | "COMPLETE";
  createdAt: string;
  fileNumber: string;
};

type Settings = {
  fullName: string;
  email: string;
  companyName: string;
  companyPhone: string;
  companyAddress: string;
  companyWebsite: string;
  licenseNumber: string;
  plan: string;
};

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [trialDismissed, setTrialDismissed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [uid, setUid] = useState<string | null>(null);

  const [activeView, setActiveView] = useState<"dashboard" | "settings">(
    "dashboard",
  );
  const [settingsTab, setSettingsTab] = useState<
    "account" | "company" | "subscription"
  >("account");

  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);

  const [settings, setSettings] = useState<Settings>({
    fullName: "",
    email: "",
    companyName: "",
    companyPhone: "",
    companyAddress: "",
    companyWebsite: "",
    licenseNumber: "",
    plan: "free",
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        window.location.href = "/login";
        return;
      }
      setUid(u.uid);
      setSettings((p) => ({
        ...p,
        email: u.email || "",
        fullName: u.displayName || "",
      }));
      setChecking(false);
      loadReports(u.uid);
      loadSettings(u.uid);
    });
    return () => unsub();
  }, []);

  const loadReports = async (userId: string) => {
    setReportsLoading(true);
    try {
      const local = localStorage.getItem("sewer_reports");
      if (local) setReports(JSON.parse(local));
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/reports", {
        headers: { "x-user-id": userId, Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.reports?.length) {
          setReports(data.reports);
          localStorage.setItem("sewer_reports", JSON.stringify(data.reports));
        }
      }
    } catch {
    } finally {
      setReportsLoading(false);
    }
  };

  const loadSettings = async (userId: string) => {
    const local = localStorage.getItem("sewer_settings");
    if (local) {
      try {
        setSettings((p) => ({ ...p, ...JSON.parse(local) }));
      } catch {}
    }
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/settings", {
        headers: { "x-user-id": userId, Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data) setSettings((p) => ({ ...p, ...data }));
      }
    } catch {}
  };

  const handleSaveSettings = async () => {
    if (!uid) return;
    setSettingsSaving(true);
    try {
      localStorage.setItem("sewer_settings", JSON.stringify(settings));
      const token = await auth.currentUser?.getIdToken();
      await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": uid,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2500);
    } catch {
      localStorage.setItem("sewer_settings", JSON.stringify(settings));
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2500);
    } finally {
      setSettingsSaving(false);
    }
  };

  // ✅ LemonSqueezy checkout — calls real API
  const handleSubscribe = async (planKey: "PRO_MONTHLY" | "PRO_ANNUALLY") => {
    setCheckoutLoading(planKey);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/lemonsqueezy/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: planKey,
          email: settings.email,
          name: settings.fullName,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to create checkout. Please try again.");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handlePDF = async (report: Report) => {
    setPdfLoading(report.id);
    try {
      let data: any = null;
      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch(`/api/reports/${report.id}`, {
          headers: { "x-user-id": uid!, Authorization: `Bearer ${token}` },
        });
        if (res.ok) data = await res.json();
      } catch {}
      if (!data) {
        const local = localStorage.getItem(`report_${report.id}`);
        data = local ? JSON.parse(local) : { report, defects: [] };
      }
      const pdfRes = await fetch("/api/reports/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!pdfRes.ok) throw new Error("PDF failed");
      const blob = await pdfRes.blob();
      const url = URL.createObjectURL(blob);
      const tab = window.open(url, "_blank");
      if (tab) tab.onload = () => setTimeout(() => tab.print(), 500);
      else {
        const a = document.createElement("a");
        a.href = url;
        a.download = `${report.title || "report"}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      setTimeout(() => URL.revokeObjectURL(url), 120_000);
    } catch {
      alert("Failed to generate PDF.");
    } finally {
      setPdfLoading(null);
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!confirm("Delete this report?")) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      await fetch(`/api/reports/${id}`, {
        method: "DELETE",
        headers: { "x-user-id": uid!, Authorization: `Bearer ${token}` },
      });
    } catch {}
    const updated = reports.filter((r) => r.id !== id);
    setReports(updated);
    localStorage.setItem("sewer_reports", JSON.stringify(updated));
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  const goToSettings = (tab: "account" | "company" | "subscription") => {
    setActiveView("settings");
    setSettingsTab(tab);
  };

  if (checking)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{ fontSize: "24px", fontWeight: 900, marginBottom: "8px" }}
          >
            SEWER <span style={{ color: "#2D8C4E" }}>LABZ</span>
          </div>
          <div style={{ fontSize: "13px", color: "#94A3B8" }}>Loading...</div>
        </div>
      </div>
    );

  const isPro = ["pro_monthly", "pro_annual", "pro_annually", "PRO"].includes(
    settings.plan,
  );
  const initials = (settings.fullName || settings.email || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const thisMonth = reports.filter((r) => {
    if (!r.createdAt && !r.inspectedAt) return false;
    const d = new Date(r.createdAt || r.inspectedAt),
      now = new Date();
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  }).length;

  const inp: React.CSSProperties = {
    width: "100%",
    height: "38px",
    borderRadius: "6px",
    border: "1px solid #E2E8F0",
    padding: "0 10px",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
    background: "#F8FAFC",
    color: "#0F172A",
    fontFamily: "inherit",
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
  const subTabBtn = (a: boolean): React.CSSProperties => ({
    padding: "7px 14px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    background: a ? "#0F2A4A" : "#F1F5F9",
    color: a ? "#fff" : "#64748B",
    fontFamily: "inherit",
  });
  const actionBtn = (
    bg: string,
    color: string,
    disabled = false,
  ): React.CSSProperties => ({
    padding: "5px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    border: "none",
    background: disabled ? "#E2E8F0" : bg,
    color: disabled ? "#94A3B8" : color,
    fontFamily: "inherit",
    opacity: disabled ? 0.7 : 1,
  });

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
        background: "#F8FAFC",
      }}
    >
      {/* ── Sidebar ── */}
      <div
        style={{
          width: sidebarOpen ? "240px" : "0",
          minHeight: "100vh",
          background: "#0F2A4A",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.2s",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            padding: "24px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            whiteSpace: "nowrap",
          }}
        >
          <div style={{ fontSize: "22px", fontWeight: 900 }}>
            <span style={{ color: "#ffffff" }}>SEWER </span>
            <span style={{ color: "#2D8C4E" }}>LABZ</span>
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: "11px",
              marginTop: "2px",
            }}
          >
            Inspection Platform
          </div>
        </div>

        <nav style={{ flex: 1, padding: "16px 12px" }}>
          {[
            {
              icon: "⊞",
              label: "Dashboard",
              action: () => setActiveView("dashboard"),
              active: activeView === "dashboard",
            },
            {
              icon: "📄",
              label: "New Report",
              action: () => {
                window.location.href = "/reports/new";
              },
              active: false,
            },
            {
              icon: "📋",
              label: "Templates",
              action: () => {
                window.location.href = "/templates";
              },
              active: false,
            },
            {
              icon: "⚙️",
              label: "Settings",
              action: () => goToSettings("account"),
              active: activeView === "settings",
            },
          ].map((item) => (
            <div
              key={item.label}
              onClick={item.action}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "8px",
                marginBottom: "4px",
                background: item.active ? "#2D8C4E" : "transparent",
                color: item.active ? "#fff" : "rgba(255,255,255,0.65)",
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontSize: "14px",
                fontWeight: item.active ? 600 : 400,
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div
          style={{
            padding: "16px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "#2D8C4E",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 700,
                fontSize: "14px",
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div>
              <div
                style={{
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                {settings.fullName || "Your Name"}
              </div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px" }}>
                {isPro ? "Pro Plan" : "Free Trial"}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              marginTop: "12px",
              width: "100%",
              padding: "8px",
              borderRadius: "6px",
              background: "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.6)",
              fontSize: "12px",
              textAlign: "center",
              cursor: "pointer",
              border: "none",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* Top bar */}
        <div
          style={{
            background: "#fff",
            borderBottom: "1px solid #E2E8F0",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: "none",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
                color: "#64748B",
              }}
            >
              ☰
            </button>
            <h1
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#0F2A4A",
                margin: 0,
              }}
            >
              {activeView === "settings" ? "Settings" : "Dashboard"}
            </h1>
          </div>
          <button
            onClick={() => (window.location.href = "/reports/new")}
            style={{
              background: "#2D8C4E",
              color: "#fff",
              border: "none",
              padding: "9px 18px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            + New Report
          </button>
        </div>

        {/* Trial banner */}
        {!trialDismissed && !isPro && (
          <div
            style={{
              background: "#FFFBEB",
              borderBottom: "1px solid #FDE68A",
              padding: "10px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ color: "#92400E", fontSize: "14px" }}>
              ⚠️ You have <strong>7 days</strong> left on your free trial.
              Upgrade for unlimited reports.
            </span>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button
                onClick={() => goToSettings("subscription")}
                style={{
                  background: "#2D8C4E",
                  color: "#fff",
                  border: "none",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Subscribe Now
              </button>
              <button
                onClick={() => setTrialDismissed(true)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#92400E",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div style={{ padding: "24px", flex: 1 }}>
          {/* ── DASHBOARD VIEW ── */}
          {activeView === "dashboard" && (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "16px",
                  marginBottom: "24px",
                }}
              >
                {[
                  {
                    label: "Total Reports",
                    value: reports.length,
                    icon: "📄",
                    color: "#0F2A4A",
                  },
                  {
                    label: "Completed This Month",
                    value: thisMonth,
                    icon: "✅",
                    color: "#2D8C4E",
                  },
                  {
                    label: "Drafts",
                    value: reports.filter((r) => r.status !== "COMPLETE")
                      .length,
                    icon: "📝",
                    color: "#D97706",
                  },
                  {
                    label: "Templates Used",
                    value: 0,
                    icon: "📋",
                    color: "#2563EB",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      background: "#fff",
                      border: "1px solid #E2E8F0",
                      borderRadius: "12px",
                      padding: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#64748B",
                          marginBottom: "6px",
                        }}
                      >
                        {stat.label}
                      </div>
                      <div
                        style={{
                          fontSize: "28px",
                          fontWeight: 700,
                          color: stat.color,
                        }}
                      >
                        {stat.value}
                      </div>
                    </div>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "10px",
                        background: "#E8F5EE",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                      }}
                    >
                      {stat.icon}
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  background: "#fff",
                  border: "1px solid #E2E8F0",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid #E2E8F0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#0F2A4A",
                      margin: 0,
                    }}
                  >
                    Recent Reports
                  </h2>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "#2D8C4E",
                      fontWeight: 500,
                    }}
                  >
                    View all →
                  </span>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#F8FAFC" }}>
                      {[
                        "Report Title",
                        "Job #",
                        "Client",
                        "Date",
                        "Status",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "12px 20px",
                            textAlign: "left",
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#64748B",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportsLoading ? (
                      <tr>
                        <td
                          colSpan={6}
                          style={{
                            padding: "48px",
                            textAlign: "center",
                            color: "#94A3B8",
                          }}
                        >
                          ⏳ Loading reports...
                        </td>
                      </tr>
                    ) : reports.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          style={{ padding: "48px 20px", textAlign: "center" }}
                        >
                          <div
                            style={{ fontSize: "32px", marginBottom: "12px" }}
                          >
                            📄
                          </div>
                          <div
                            style={{
                              fontWeight: 600,
                              color: "#64748B",
                              marginBottom: "8px",
                            }}
                          >
                            No reports yet
                          </div>
                          <div
                            style={{
                              fontSize: "13px",
                              color: "#94A3B8",
                              marginBottom: "16px",
                            }}
                          >
                            Click <strong>+ New Report</strong> to get started
                          </div>
                          <button
                            onClick={() =>
                              (window.location.href = "/reports/new")
                            }
                            style={{
                              background: "#2D8C4E",
                              color: "#fff",
                              border: "none",
                              padding: "8px 20px",
                              borderRadius: "8px",
                              fontSize: "13px",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            + New Report
                          </button>
                        </td>
                      </tr>
                    ) : (
                      reports.slice(0, 10).map((report) => (
                        <tr
                          key={report.id}
                          style={{ borderBottom: "1px solid #F1F5F9" }}
                        >
                          <td
                            style={{
                              padding: "12px 20px",
                              fontSize: "13px",
                              fontWeight: 600,
                              color: "#0F2A4A",
                            }}
                          >
                            {report.title || "Untitled"}
                          </td>
                          <td
                            style={{
                              padding: "12px 20px",
                              fontSize: "13px",
                              color: "#374151",
                            }}
                          >
                            {report.fileNumber || "—"}
                          </td>
                          <td
                            style={{
                              padding: "12px 20px",
                              fontSize: "13px",
                              color: "#374151",
                            }}
                          >
                            {report.clientName || "—"}
                          </td>
                          <td
                            style={{
                              padding: "12px 20px",
                              fontSize: "13px",
                              color: "#374151",
                            }}
                          >
                            {report.inspectedAt || "—"}
                          </td>
                          <td style={{ padding: "12px 20px" }}>
                            <span
                              style={{
                                padding: "3px 10px",
                                borderRadius: "20px",
                                fontSize: "11px",
                                fontWeight: 700,
                                background:
                                  report.status === "COMPLETE"
                                    ? "#F0FDF4"
                                    : "#FFFBEB",
                                color:
                                  report.status === "COMPLETE"
                                    ? "#16A34A"
                                    : "#D97706",
                              }}
                            >
                              {report.status || "DRAFT"}
                            </span>
                          </td>
                          <td style={{ padding: "12px 20px" }}>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                onClick={() =>
                                  (window.location.href = `/reports/new?edit=${report.id}`)
                                }
                                style={actionBtn("#EFF6FF", "#2563EB")}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handlePDF(report)}
                                disabled={pdfLoading === report.id}
                                style={actionBtn(
                                  "#F0FDF4",
                                  "#16A34A",
                                  pdfLoading === report.id,
                                )}
                              >
                                {pdfLoading === report.id ? "..." : "PDF"}
                              </button>
                              <button
                                onClick={() => handleDeleteReport(report.id)}
                                style={actionBtn("#FEF2F2", "#DC2626")}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── SETTINGS VIEW ── */}
          {activeView === "settings" && (
            <div style={{ maxWidth: "720px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h2
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#0F2A4A",
                    margin: 0,
                  }}
                >
                  Account Settings
                </h2>
                <div
                  style={{ display: "flex", gap: "10px", alignItems: "center" }}
                >
                  {settingsSaved && (
                    <span
                      style={{
                        fontSize: "13px",
                        color: "#16A34A",
                        fontWeight: 600,
                      }}
                    >
                      ✓ Saved
                    </span>
                  )}
                  <button
                    onClick={handleSaveSettings}
                    disabled={settingsSaving}
                    style={{
                      background: settingsSaving ? "#94A3B8" : "#2D8C4E",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 18px",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {settingsSaving ? "Saving..." : "Save Settings"}
                  </button>
                </div>
              </div>

              <div
                style={{ display: "flex", gap: "8px", marginBottom: "20px" }}
              >
                <button
                  style={subTabBtn(settingsTab === "account")}
                  onClick={() => setSettingsTab("account")}
                >
                  👤 Account
                </button>
                <button
                  style={subTabBtn(settingsTab === "company")}
                  onClick={() => setSettingsTab("company")}
                >
                  🏢 Company
                </button>
                <button
                  style={subTabBtn(settingsTab === "subscription")}
                  onClick={() => setSettingsTab("subscription")}
                >
                  💳 Subscription
                </button>
              </div>

              {/* Account Tab */}
              {settingsTab === "account" && (
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #E2E8F0",
                    borderRadius: "12px",
                    padding: "20px",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#0F2A4A",
                      margin: "0 0 16px",
                      textTransform: "uppercase",
                    }}
                  >
                    Account Information
                  </h4>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "14px",
                    }}
                  >
                    {[
                      {
                        label: "Full Name",
                        key: "fullName",
                        placeholder: "Your full name",
                        disabled: false,
                      },
                      {
                        label: "Email Address",
                        key: "email",
                        placeholder: "you@example.com",
                        disabled: true,
                      },
                      {
                        label: "License Number",
                        key: "licenseNumber",
                        placeholder: "LIC-123456",
                        disabled: false,
                      },
                    ].map(({ label, key, placeholder, disabled }) => (
                      <div key={key}>
                        <label style={lbl}>{label}</label>
                        <input
                          value={(settings as any)[key]}
                          disabled={disabled}
                          onChange={(e) =>
                            setSettings((p) => ({
                              ...p,
                              [key]: e.target.value,
                            }))
                          }
                          placeholder={placeholder}
                          style={{
                            ...inp,
                            color: disabled ? "#94A3B8" : "#0F172A",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      marginTop: "20px",
                      paddingTop: "16px",
                      borderTop: "1px solid #E2E8F0",
                    }}
                  >
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
                </div>
              )}

              {/* Company Tab */}
              {settingsTab === "company" && (
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #E2E8F0",
                    borderRadius: "12px",
                    padding: "20px",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#0F2A4A",
                      margin: "0 0 16px",
                      textTransform: "uppercase",
                    }}
                  >
                    Company Information
                  </h4>
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
                          onChange={(e) =>
                            setSettings((p) => ({
                              ...p,
                              [key]: e.target.value,
                            }))
                          }
                          placeholder={placeholder}
                          style={inp}
                        />
                      </div>
                    ))}
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={lbl}>Company Address</label>
                      <input
                        value={settings.companyAddress}
                        onChange={(e) =>
                          setSettings((p) => ({
                            ...p,
                            companyAddress: e.target.value,
                          }))
                        }
                        placeholder="123 Main St, Las Vegas NV 89101"
                        style={inp}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Subscription Tab */}
              {settingsTab === "subscription" && (
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #E2E8F0",
                    borderRadius: "12px",
                    padding: "20px",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#0F2A4A",
                      margin: "0 0 16px",
                      textTransform: "uppercase",
                    }}
                  >
                    Subscription
                  </h4>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "20px",
                    }}
                  >
                    <span
                      style={{
                        padding: "4px 14px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: 700,
                        background: isPro ? "#E8F5EE" : "#F1F5F9",
                        color: isPro ? "#2D8C4E" : "#64748B",
                      }}
                    >
                      {isPro ? "PRO PLAN" : "FREE PLAN"}
                    </span>
                    <span style={{ fontSize: "13px", color: "#64748B" }}>
                      {isPro
                        ? "Unlimited reports · All features"
                        : "Free trial · 5 reports/month"}
                    </span>
                  </div>

                  {!isPro && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "12px",
                      }}
                    >
                      {[
                        {
                          key: "PRO_MONTHLY" as const,
                          name: "Pro Monthly",
                          price: "$49",
                          period: "/mo",
                          features: [
                            "Unlimited reports",
                            "Custom templates",
                            "No watermark",
                            "Priority support",
                          ],
                          color: "#2D8C4E",
                        },
                        {
                          key: "PRO_ANNUALLY" as const,
                          name: "Pro Annual",
                          price: "$499.95",
                          period: "/yr",
                          badge: "Save 15%",
                          features: [
                            "Unlimited reports",
                            "Custom templates",
                            "No watermark",
                            "Priority support",
                          ],
                          color: "#0F2A4A",
                        },
                      ].map((p) => (
                        <div
                          key={p.key}
                          style={{
                            border: `2px solid ${p.color}`,
                            borderRadius: "10px",
                            padding: "16px",
                            position: "relative",
                          }}
                        >
                          {"badge" in p && p.badge && (
                            <div
                              style={{
                                position: "absolute",
                                top: "-10px",
                                right: "12px",
                                background: "#2D8C4E",
                                color: "#fff",
                                fontSize: "10px",
                                fontWeight: 700,
                                padding: "2px 8px",
                                borderRadius: "20px",
                              }}
                            >
                              {p.badge}
                            </div>
                          )}
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: 700,
                              color: p.color,
                            }}
                          >
                            {p.name}
                          </div>
                          <div
                            style={{
                              fontSize: "22px",
                              fontWeight: 800,
                              color: "#0F2A4A",
                              margin: "4px 0 10px",
                            }}
                          >
                            {p.price}
                            <span
                              style={{
                                fontSize: "12px",
                                color: "#64748B",
                                fontWeight: 400,
                              }}
                            >
                              {p.period}
                            </span>
                          </div>
                          {p.features.map((f) => (
                            <div
                              key={f}
                              style={{
                                fontSize: "11px",
                                color: "#64748B",
                                marginBottom: "3px",
                              }}
                            >
                              ✓ {f}
                            </div>
                          ))}
                          <button
                            onClick={() => handleSubscribe(p.key)}
                            disabled={checkoutLoading === p.key}
                            style={{
                              width: "100%",
                              marginTop: "14px",
                              padding: "9px",
                              borderRadius: "7px",
                              border: "none",
                              background:
                                checkoutLoading === p.key ? "#94A3B8" : p.color,
                              color: "#fff",
                              fontSize: "13px",
                              fontWeight: 700,
                              cursor:
                                checkoutLoading === p.key
                                  ? "not-allowed"
                                  : "pointer",
                            }}
                          >
                            {checkoutLoading === p.key
                              ? "Redirecting..."
                              : "Subscribe Now →"}
                          </button>
                        </div>
                      ))}
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
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#64748B",
                          marginBottom: "12px",
                        }}
                      >
                        Your subscription is active. All features unlocked.
                      </div>
                      <a
                        href="https://app.lemonsqueezy.com/billing"
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: "13px",
                          color: "#2D8C4E",
                          fontWeight: 600,
                        }}
                      >
                        Manage Billing →
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
