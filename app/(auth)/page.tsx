"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Report = {
  id: string;
  title: string;
  location: string;
  clientName: string;
  inspectedAt: string;
  status: "DRAFT" | "COMPLETE";
  createdAt: string;
=========
};

type Template = {
  id: string;
  name: string;
  companyName: string;
  companyLogo: string;
  includeDefectGraphic: boolean;
  showSuggestedMaintenance: boolean;
>>>>>>>>> Temporary merge branch 2
};

type Stats = {
  totalReports: number;
  monthReports: number;
  drafts: number;
  templatesUsed: number;
};
<<<<<<<<< Temporary merge branch 1
=========

type Settings = {
  fullName: string;
  email: string;
  companyName: string;
  companyPhone: string;
  companyAddress: string;
  companyWebsite: string;
  licenseNumber: string;
};
>>>>>>>>> Temporary merge branch 2

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "reports" | "templates" | "settings"
  >("reports");

  // Reports state
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalReports: 0,
    monthReports: 0,
    drafts: 0,
    templatesUsed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
<<<<<<<<< Temporary merge branch 1

  useEffect(() => {
    fetchDashboard();
=========
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    fullName: "",
    email: "",
    companyName: "",
    companyPhone: "",
    companyAddress: "",
    companyWebsite: "",
    licenseNumber: "",
  });

  useEffect(() => {
    fetchDashboard();
    loadTemplates();
    loadSettings();
>>>>>>>>> Temporary merge branch 2
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      setStats(data.stats || {});
      setReports(data.reports || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };
<<<<<<<<< Temporary merge branch 1
=========

  const loadTemplates = () => {
    try {
      const local = localStorage.getItem("sewer_templates");
      if (local) setTemplates(JSON.parse(local));
    } catch {}
  };

  const loadSettings = () => {
    try {
      const user = localStorage.getItem("user");
      const saved = localStorage.getItem("sewer_settings");
      if (user) {
        const u = JSON.parse(user);
        setSettings((p) => ({
          ...p,
          email: u.email || "",
          fullName: u.fullName || "",
        }));
      }
      if (saved) setSettings(JSON.parse(saved));
    } catch {}
  };
>>>>>>>>> Temporary merge branch 2

  // ── Reports ─────────────────────────────────────────────────
  const handlePDF = async (report: Report) => {
    try {
      const res = await fetch(`/api/reports/${report.id}`);
      const data = await res.json();
      const pdfRes = await fetch("/api/reports/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const html = await pdfRes.text();
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(html);
        win.document.close();
        setTimeout(() => win.print(), 800);
      }
    } catch {
      alert("Failed to generate PDF.");
    }
  };

<<<<<<<<< Temporary merge branch 1
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this report?")) return;
    await fetch(`/api/reports/${id}`, { method: "DELETE" }).catch(() => {});
    setReports((p) => p.filter((r) => r.id !== id));
  };

  const filtered = reports.filter(
    (r) =>
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      r.location?.toLowerCase().includes(search.toLowerCase()),
  );

  const tab = (active: boolean): React.CSSProperties => ({
=========
  const handleDeleteReport = async (id: string) => {
    if (!confirm("Delete this report?")) return;
    await fetch(`/api/reports/${id}`, { method: "DELETE" }).catch(() => {});
    setReports((p) => p.filter((r) => r.id !== id));
  };

  const handleDeleteTemplate = (id: string) => {
    if (!confirm("Delete this template?")) return;
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    localStorage.setItem("sewer_templates", JSON.stringify(updated));
  };

  const handleSaveSettings = async () => {
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
    } catch {}
    localStorage.setItem("sewer_settings", JSON.stringify(settings));
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.replace("/login");
  };

  const filtered = reports.filter(
    (r) =>
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      r.location?.toLowerCase().includes(search.toLowerCase()),
  );

  // ── Styles ──────────────────────────────────────────────────────
  const tabBtn = (active: boolean): React.CSSProperties => ({
>>>>>>>>> Temporary merge branch 2
    padding: "8px 20px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    background: active ? "#0F2A4A" : "transparent",
    color: active ? "#fff" : "#64748B",
  });

  const subTabBtn = (active: boolean): React.CSSProperties => ({
    padding: "6px 16px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    background: active ? "#0F2A4A" : "#F1F5F9",
    color: active ? "#fff" : "#64748B",
  });

  const card: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #E2E8F0",
    borderRadius: "12px",
    padding: "20px",
  };
<<<<<<<<< Temporary merge branch 1
=========

  const inp: React.CSSProperties = {
    width: "100%",
    height: "36px",
    borderRadius: "6px",
    border: "1px solid #E2E8F0",
    padding: "0 10px",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
    background: "#F8FAFC",
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

  const actionBtn = (bg: string, color: string): React.CSSProperties => ({
    padding: "5px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    background: bg,
    color,
  });
>>>>>>>>> Temporary merge branch 2

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "1100px",
        margin: "0 auto",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
<<<<<<<<< Temporary merge branch 1
      {/* ── Header ── */}
=========
      {/* Header */}
>>>>>>>>> Temporary merge branch 2
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
            Dashboard
          </h1>
          <p style={{ fontSize: "13px", color: "#94A3B8", marginTop: "4px" }}>
            Manage your inspection reports and templates
          </p>
        </div>
        <Link href="/reports/new">
          <button
            style={{
              background: "#2D8C4E",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            + New Report
          </button>
        </Link>
      </div>

<<<<<<<<< Temporary merge branch 1
      {/* ── Stats ── */}
=========
      {/* Stats */}
>>>>>>>>> Temporary merge branch 2
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
            value: stats.totalReports,
            color: "#0F2A4A",
          },
          { label: "This Month", value: stats.monthReports, color: "#2D8C4E" },
          { label: "Drafts", value: stats.drafts, color: "#D97706" },
          {
            label: "Templates Used",
            value: stats.templatesUsed,
            color: "#2563EB",
          },
        ].map(({ label, value, color }) => (
          <div key={label} style={card}>
            <div style={{ fontSize: "28px", fontWeight: 800, color }}>
              {value}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#94A3B8",
                marginTop: "4px",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

<<<<<<<<< Temporary merge branch 1
      {/* ── Tabs ── */}
=========
      {/* Main Tabs */}
>>>>>>>>> Temporary merge branch 2
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
            display: "flex",
            gap: "4px",
            padding: "12px 16px",
            borderBottom: "1px solid #E2E8F0",
            background: "#FAFAFA",
          }}
        >
          <button
<<<<<<<<< Temporary merge branch 1
            style={tab(activeTab === "reports")}
=========
            style={tabBtn(activeTab === "reports")}
>>>>>>>>> Temporary merge branch 2
            onClick={() => setActiveTab("reports")}
          >
            📄 Reports
          </button>
          <button
<<<<<<<<< Temporary merge branch 1
            style={tab(activeTab === "templates")}
=========
            style={tabBtn(activeTab === "templates")}
>>>>>>>>> Temporary merge branch 2
            onClick={() => setActiveTab("templates")}
          >
            🗂 Templates
          </button>
          <button
<<<<<<<<< Temporary merge branch 1
            style={tab(activeTab === "settings")}
=========
            style={tabBtn(activeTab === "settings")}
>>>>>>>>> Temporary merge branch 2
            onClick={() => setActiveTab("settings")}
          >
            ⚙️ Settings
          </button>
        </div>

<<<<<<<<< Temporary merge branch 1
        {/* ── Reports Tab ── */}
=========
        {/* ════════════════════════════════════
            REPORTS TAB
        ════════════════════════════════════ */}
>>>>>>>>> Temporary merge branch 2
        {activeTab === "reports" && (
          <div style={{ padding: "16px" }}>
            <div style={{ marginBottom: "14px" }}>
              <input
                type="text"
                placeholder="Search by client, location, title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
<<<<<<<<< Temporary merge branch 1
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #E2E8F0",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                  background: "#F8FAFC",
                }}
=========
                style={{ ...inp, height: "38px" }}
>>>>>>>>> Temporary merge branch 2
              />
            </div>
            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px",
                  color: "#94A3B8",
<<<<<<<<< Temporary merge branch 1
                  fontSize: "14px",
=========
>>>>>>>>> Temporary merge branch 2
                }}
              >
                Loading...
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px" }}>
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>📄</div>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#0F2A4A",
                    marginBottom: "6px",
                  }}
                >
                  No reports yet
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#94A3B8",
                    marginBottom: "20px",
                  }}
                >
                  Create your first inspection report
                </div>
                <Link href="/reports/new">
                  <button
                    style={{
                      background: "#2D8C4E",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "10px 20px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    + New Report
                  </button>
                </Link>
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F8FAFC" }}>
                    {[
                      "Title",
                      "Client",
                      "Location",
                      "Date",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 12px",
                          textAlign: "left",
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#64748B",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          borderBottom: "1px solid #E2E8F0",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((report) => (
                    <tr
                      key={report.id}
                      style={{ borderBottom: "1px solid #F1F5F9" }}
                    >
                      <td
                        style={{
                          padding: "12px",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#0F2A4A",
                        }}
                      >
                        {report.title || "Untitled"}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          fontSize: "13px",
                          color: "#374151",
                        }}
                      >
                        {report.clientName || "—"}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          fontSize: "13px",
                          color: "#374151",
                        }}
                      >
                        {report.location || "—"}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          fontSize: "13px",
                          color: "#374151",
                        }}
                      >
                        {report.inspectedAt || "—"}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span
                          style={{
                            padding: "3px 10px",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: 700,
                            background:
                              report.status === "DRAFT" ? "#FFFBEB" : "#F0FDF4",
                            color:
                              report.status === "DRAFT" ? "#D97706" : "#16A34A",
                          }}
                        >
                          {report.status || "DRAFT"}
                        </span>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            onClick={() => router.push(`/reports/${report.id}`)}
                            style={actionBtn("#F1F5F9", "#0F2A4A")}
                          >
                            View
                          </button>
                          <button
                            onClick={() =>
                              router.push(`/reports/${report.id}/edit`)
                            }
                            style={actionBtn("#EFF6FF", "#2563EB")}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handlePDF(report)}
                            style={actionBtn("#F0FDF4", "#16A34A")}
                          >
                            PDF
                          </button>
                          <button
<<<<<<<<< Temporary merge branch 1
                            onClick={() => handleDelete(report.id)}
=========
                            onClick={() => handleDeleteReport(report.id)}
>>>>>>>>> Temporary merge branch 2
                            style={actionBtn("#FEF2F2", "#DC2626")}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

<<<<<<<<< Temporary merge branch 1
        {/* ── Templates Tab ── */}
        {activeTab === "templates" && (
          <div style={{ padding: "20px" }}>
            {/* Template editor */}
            {editingTemplate ? (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#0F2A4A",
                      margin: 0,
                    }}
                  >
                    {isNewTemplate ? "New Template" : "Edit Template"}
                  </h3>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => setEditingTemplate(null)}
                      style={{
                        padding: "7px 16px",
                        borderRadius: "6px",
                        border: "1px solid #E2E8F0",
                        background: "#fff",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                        color: "#64748B",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveTemplate}
                      disabled={savingTemplate}
                      style={{
                        padding: "7px 16px",
                        borderRadius: "6px",
                        border: "none",
                        background: "#2D8C4E",
                        color: "#fff",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {savingTemplate ? "Saving..." : "Save Template"}
                    </button>
                  </div>
                </div>

                {/* Template Name */}
                <div style={{ marginBottom: "14px" }}>
                  <label style={lbl}>Template Name *</label>
                  <input
                    value={editingTemplate.name || ""}
                    onChange={(e) =>
                      setEditingTemplate((p) =>
                        p ? { ...p, name: e.target.value } : p,
                      )
                    }
                    placeholder="e.g. Standard Residential Inspection"
                    style={inp}
                  />
                </div>

                {/* Company Branding */}
                <div
                  style={{
                    padding: "16px",
                    border: "1px solid #E2E8F0",
                    borderRadius: "10px",
                    marginBottom: "14px",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#0F2A4A",
                      margin: "0 0 12px",
                      textTransform: "uppercase",
                    }}
                  >
                    Company Branding
                  </h4>
                  <div style={{ marginBottom: "12px" }}>
                    <label style={lbl}>Company Logo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      style={{ fontSize: "13px", color: "#64748B" }}
                    />
                    {editingTemplate.companyLogo && (
                      <img
                        src={editingTemplate.companyLogo}
                        alt="Logo"
                        style={{
                          maxHeight: "40px",
                          marginTop: "8px",
                          display: "block",
                        }}
                      />
                    )}
                  </div>
                  <div style={{ marginBottom: "12px" }}>
                    <label style={lbl}>Company Name</label>
                    <input
                      value={editingTemplate.companyName || ""}
                      onChange={(e) =>
                        setEditingTemplate((p) =>
                          p ? { ...p, companyName: e.target.value } : p,
                        )
                      }
                      placeholder="Sewer Labz"
                      style={inp}
                    />
                  </div>
                </div>

                {/* Options */}
                <div
                  style={{
                    padding: "16px",
                    border: "1px solid #E2E8F0",
                    borderRadius: "10px",
                    marginBottom: "14px",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#0F2A4A",
                      margin: "0 0 12px",
                      textTransform: "uppercase",
                    }}
                  >
                    Report Options
                  </h4>
                  {[
                    {
                      key: "includeDefectGraphic",
                      label: "Include Common Sewer Defect Graphic",
                    },
                    {
                      key: "showSuggestedMaintenance",
                      label: 'Enable "Suggested Maintenance" severity option',
                    },
                  ].map(({ key, label }) => (
                    <label
                      key={key}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "10px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={!!(editingTemplate as any)[key]}
                        onChange={(e) =>
                          setEditingTemplate((p) =>
                            p ? { ...p, [key]: e.target.checked } : p,
                          )
                        }
                        style={{
                          width: "16px",
                          height: "16px",
                          accentColor: "#0F2A4A",
                        }}
                      />
                      <span style={{ fontSize: "13px", color: "#374151" }}>
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
=========
        {/* ════════════════════════════════════
            TEMPLATES TAB — full content
        ════════════════════════════════════ */}
        {activeTab === "templates" && (
          <div style={{ padding: "20px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#0F2A4A",
                    margin: 0,
                  }}
                >
                  Report Templates
                </h3>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#94A3B8",
                    marginTop: "4px",
                  }}
                >
                  Create and manage your report templates
                </p>
              </div>
              <button
                onClick={() => router.push("/templates")}
                style={{
                  background: "#2D8C4E",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                + New Template
              </button>
>>>>>>>>> Temporary merge branch 2
            </div>

            {templates.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px",
                  border: "2px dashed #E2E8F0",
                  borderRadius: "10px",
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>🗂</div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#0F2A4A",
                    marginBottom: "6px",
                  }}
                >
                  No templates yet
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#94A3B8",
                    marginBottom: "16px",
                  }}
                >
                  Create a template to customize your reports with company
                  branding
                </div>
                <button
                  onClick={() => router.push("/templates")}
                  style={{
                    background: "#0F2A4A",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 20px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Create Template
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "14px",
                }}
              >
                {templates.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      border: "1px solid #E2E8F0",
                      borderRadius: "10px",
                      padding: "16px",
                      background: "#FAFAFA",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "10px",
                      }}
                    >
                      <div>
                        {t.companyLogo && (
                          <img
                            src={t.companyLogo}
                            alt="logo"
                            style={{
                              maxHeight: "32px",
                              objectFit: "contain",
                              marginBottom: "6px",
                              display: "block",
                            }}
                          />
                        )}
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#0F2A4A",
                          }}
                        >
                          {t.name}
                        </div>
                        <div style={{ fontSize: "12px", color: "#94A3B8" }}>
                          {t.companyName}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#64748B",
                        marginBottom: "12px",
                      }}
                    >
                      {t.includeDefectGraphic && (
                        <span style={{ marginRight: "8px" }}>
                          ✓ Defect Graphic
                        </span>
                      )}
                      {t.showSuggestedMaintenance && (
                        <span>✓ Suggested Maintenance</span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => router.push("/templates")}
                        style={{
                          flex: 1,
                          padding: "7px",
                          borderRadius: "6px",
                          border: "none",
                          background: "#EFF6FF",
                          color: "#2563EB",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(t.id)}
                        style={{
                          padding: "7px 12px",
                          borderRadius: "6px",
                          border: "none",
                          background: "#FEF2F2",
                          color: "#DC2626",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

<<<<<<<<< Temporary merge branch 1
        {/* ── Settings Tab ── */}
        {activeTab === "settings" && (
          <div style={{ padding: "16px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: "14px",
              }}
            >
              <Link href="/settings">
                <button
                  style={{
                    background: "#0F2A4A",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Go to Settings →
                </button>
              </Link>
            </div>
            <div
              style={{ textAlign: "center", padding: "48px", color: "#94A3B8" }}
            >
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>⚙️</div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#0F2A4A",
                  marginBottom: "6px",
                }}
              >
                Account Settings
              </div>
              <div style={{ fontSize: "13px" }}>
                Go to the Settings page to manage your account, company info and
                subscription.
              </div>
=========
        {/* ════════════════════════════════════
            SETTINGS TAB — full content
        ════════════════════════════════════ */}
        {activeTab === "settings" && (
          <div style={{ padding: "20px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#0F2A4A",
                    margin: 0,
                  }}
                >
                  Account Settings
                </h3>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#94A3B8",
                    marginTop: "4px",
                  }}
                >
                  Manage your account and company information
                </p>
              </div>
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
                  style={{
                    background: "#2D8C4E",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 18px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>

            {/* Account Info */}
            <div
              style={{
                marginBottom: "20px",
                padding: "16px",
                border: "1px solid #E2E8F0",
                borderRadius: "10px",
              }}
            >
              <h4
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#0F2A4A",
                  margin: "0 0 14px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
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
                  },
                ].map(({ label, key, placeholder, disabled }) => (
                  <div key={key}>
                    <label style={lbl}>{label}</label>
                    <input
                      value={(settings as any)[key]}
                      disabled={disabled}
                      onChange={(e) =>
                        setSettings((p) => ({ ...p, [key]: e.target.value }))
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
            </div>

            {/* Company Info */}
            <div
              style={{
                marginBottom: "20px",
                padding: "16px",
                border: "1px solid #E2E8F0",
                borderRadius: "10px",
              }}
            >
              <h4
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#0F2A4A",
                  margin: "0 0 14px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
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
                        setSettings((p) => ({ ...p, [key]: e.target.value }))
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

            {/* Subscription */}
            <div
              style={{
                padding: "16px",
                border: "1px solid #E2E8F0",
                borderRadius: "10px",
                marginBottom: "20px",
              }}
            >
              <h4
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#0F2A4A",
                  margin: "0 0 14px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Subscription
              </h4>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <span
                  style={{
                    padding: "4px 14px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: 700,
                    background: "#F1F5F9",
                    color: "#64748B",
                  }}
                >
                  FREE PLAN
                </span>
                <span style={{ fontSize: "13px", color: "#64748B" }}>
                  5 reports/month
                </span>
              </div>
              <div
                style={{
                  background: "linear-gradient(135deg, #0F2A4A, #1e4a7a)",
                  borderRadius: "10px",
                  padding: "18px",
                  color: "#fff",
                }}
              >
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 800,
                    marginBottom: "6px",
                  }}
                >
                  Upgrade to Pro — $49/mo
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#CBD5E1",
                    marginBottom: "14px",
                  }}
                >
                  Unlimited reports · Custom templates · No watermark · Priority
                  support
                </div>
                <button
                  style={{
                    background: "#2D8C4E",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 20px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Subscribe Now
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div
              style={{
                padding: "16px",
                border: "1px solid #FECACA",
                borderRadius: "10px",
                background: "#FFF5F5",
              }}
            >
              <h4
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#DC2626",
                  margin: "0 0 10px",
                }}
              >
                Danger Zone
              </h4>
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
>>>>>>>>> Temporary merge branch 2
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
<<<<<<<<< Temporary merge branch 1

const actionBtn = (bg: string, color: string): React.CSSProperties => ({
  padding: "5px 10px",
  borderRadius: "6px",
  fontSize: "12px",
  fontWeight: 600,
  cursor: "pointer",
  border: "none",
  background: bg,
  color,
});
=========
>>>>>>>>> Temporary merge branch 2
