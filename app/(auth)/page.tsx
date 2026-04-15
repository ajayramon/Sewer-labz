"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Report = {
  id: string;
  title: string;
  location: string;
  clientName: string; // FIX: was "staring" — typo causing build error
  inspectedAt: string;
  status: "DRAFT" | "COMPLETE";
  createdAt: string;
  fileNumber: string;
};

type Template = {
  id: string;
  name: string;
  companyName: string;
  companyLogo: string;
  companyTagline: string;
  statementOfService: string;
  includeDefectGraphic: boolean;
  showSuggestedMaintenance: boolean;
  customDropdowns: { label: string; options: string[] }[];
};

type Settings = {
  fullName: string;
  email: string;
  companyName: string;
  companyPhone: string;
  companyAddress: string;
  companyWebsite: string;
  licenseNumber: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "reports" | "templates" | "settings"
  >("reports");

  // Reports state
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Templates state
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editingTemplate, setEditingTemplate] =
    useState<Partial<Template> | null>(null);
  const [isNewTemplate, setIsNewTemplate] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<Settings>({
    fullName: "",
    email: "",
    companyName: "",
    companyPhone: "",
    companyAddress: "",
    companyWebsite: "",
    licenseNumber: "",
  });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsTab, setSettingsTab] = useState<
    "account" | "company" | "subscription"
  >("account");

  useEffect(() => {
    loadReports();
    loadTemplates();
    loadSettings();
  }, []);

  // FIX: Load reports from localStorage first, then try API
  const loadReports = async () => {
    try {
      // Load from localStorage first (immediate)
      const local = localStorage.getItem("sewer_reports");
      if (local) {
        const localReports = JSON.parse(local);
        setReports(localReports);
        setLoading(false);
      }
      // Then try API
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      if (data.reports?.length) {
        setReports(data.reports);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = () => {
    try {
      const local = localStorage.getItem("sewer_templates");
      if (local) setTemplates(JSON.parse(local));
    } catch {}
  };

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem("sewer_settings");
      if (saved) {
        setSettings(JSON.parse(saved));
        return;
      }
      const user = localStorage.getItem("user");
      if (user) {
        const u = JSON.parse(user);
        setSettings((p) => ({
          ...p,
          email: u.email || "",
          fullName: u.fullName || "",
          companyName: u.companyName || "",
        }));
      }
    } catch {}
  };

  // ── Reports ──────────────────────────────────────────────────
  // FIX: PDF loads from localStorage
  const handlePDF = async (report: Report) => {
    try {
      const local = localStorage.getItem(`report_${report.id}`);
      let data = local ? JSON.parse(local) : { report, defects: [] };
      const pdfRes = await fetch("/api/reports/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const html = await pdfRes.text();
      const win = window.open("", "_blank");
      if (win) {
        win.document.open();
        win.document.write(html);
        win.document.close();
        win.onload = () => setTimeout(() => win.print(), 1000);
        setTimeout(() => {
          if (win && !win.closed) win.print();
        }, 2500);
      }
    } catch {
      alert("Failed to generate PDF.");
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!confirm("Delete this report?")) return;
    await fetch(`/api/reports/${id}`, { method: "DELETE" }).catch(() => {});
    const updated = reports.filter((r) => r.id !== id);
    setReports(updated);
    localStorage.setItem("sewer_reports", JSON.stringify(updated));
    localStorage.removeItem(`report_${id}`);
  };

  // FIX: Edit button stores data then redirects to report builder
  const handleEdit = (report: Report) => {
    // Try all possible localStorage key formats
    const key1 = localStorage.getItem(`report_${report.id}`);
    const key2 = localStorage.getItem(`report_edit_${report.id}`);
    const data = key1 || key2;
    if (data) {
      localStorage.setItem(`report_edit_${report.id}`, data);
    } else {
      localStorage.setItem(
        `report_edit_${report.id}`,
        JSON.stringify({ report, defects: [] }),
      );
    }
    router.push(`/reports/new?edit=${report.id}`);
  };

  // ── Templates ────────────────────────────────────────────────
  const handleNewTemplate = () => {
    setEditingTemplate({
      name: "",
      companyName: "Sewer Labz",
      companyTagline: "Don't Let Your Drain Be A Pain!",
      companyLogo: "",
      includeDefectGraphic: true,
      showSuggestedMaintenance: true,
      customDropdowns: [],
      statementOfService:
        "Sewer Labz is a professional sewer inspection company. All inspections are performed in accordance with industry standards using professional-grade CCTV camera equipment.",
    });
    setIsNewTemplate(true);
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate?.name?.trim()) {
      alert("Template name is required");
      return;
    }
    setSavingTemplate(true);
    const saved: Template = {
      ...(editingTemplate as Template),
      id: isNewTemplate ? Date.now().toString() : editingTemplate.id!,
    };
    const updated = isNewTemplate
      ? [...templates, saved]
      : templates.map((t) => (t.id === saved.id ? saved : t));
    setTemplates(updated);
    localStorage.setItem("sewer_templates", JSON.stringify(updated));
    setEditingTemplate(null);
    setSavingTemplate(false);
  };

  const handleDeleteTemplate = (id: string) => {
    if (!confirm("Delete this template?")) return;
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    localStorage.setItem("sewer_templates", JSON.stringify(updated));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) =>
      setEditingTemplate((p) =>
        p ? { ...p, companyLogo: ev.target?.result as string } : p,
      );
    reader.readAsDataURL(file);
  };

  // Add/remove custom dropdown options
  const addCustomDropdown = () => {
    const current = editingTemplate?.customDropdowns || [];
    setEditingTemplate((p) =>
      p
        ? { ...p, customDropdowns: [...current, { label: "", options: [""] }] }
        : p,
    );
  };

  const updateDropdownLabel = (i: number, val: string) => {
    const arr = [...(editingTemplate?.customDropdowns || [])];
    arr[i] = { ...arr[i], label: val };
    setEditingTemplate((p) => (p ? { ...p, customDropdowns: arr } : p));
  };

  const addDropdownOption = (i: number) => {
    const arr = [...(editingTemplate?.customDropdowns || [])];
    arr[i] = { ...arr[i], options: [...arr[i].options, ""] };
    setEditingTemplate((p) => (p ? { ...p, customDropdowns: arr } : p));
  };

  const updateDropdownOption = (di: number, oi: number, val: string) => {
    const arr = [...(editingTemplate?.customDropdowns || [])];
    const opts = [...arr[di].options];
    opts[oi] = val;
    arr[di] = { ...arr[di], options: opts };
    setEditingTemplate((p) => (p ? { ...p, customDropdowns: arr } : p));
  };

  const removeDropdown = (i: number) => {
    setEditingTemplate((p) =>
      p
        ? {
            ...p,
            customDropdowns: (p.customDropdowns || []).filter(
              (_, idx) => idx !== i,
            ),
          }
        : p,
    );
  };

  // ── Settings ─────────────────────────────────────────────────
  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
    } catch {}
    localStorage.setItem("sewer_settings", JSON.stringify(settings));
    setSettingsSaving(false);
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

  // ── Styles ───────────────────────────────────────────────────
  const tabBtn = (active: boolean): React.CSSProperties => ({
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

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "1100px",
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

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {[
          { label: "Total Reports", value: reports.length, color: "#0F2A4A" },
          {
            label: "This Month",
            value: reports.filter((r) => r.status === "COMPLETE").length,
            color: "#2D8C4E",
          },
          {
            label: "Drafts",
            value: reports.filter((r) => r.status !== "COMPLETE").length,
            color: "#D97706",
          },
          {
            label: "Templates Used",
            value: templates.length,
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

      {/* Main Tabs */}
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
            style={tabBtn(activeTab === "reports")}
            onClick={() => setActiveTab("reports")}
          >
            📄 Reports
          </button>
          <button
            style={tabBtn(activeTab === "templates")}
            onClick={() => setActiveTab("templates")}
          >
            🗂 Templates
          </button>
          <button
            style={tabBtn(activeTab === "settings")}
            onClick={() => setActiveTab("settings")}
          >
            ⚙️ Settings
          </button>
        </div>

        {/* REPORTS TAB */}
        {activeTab === "reports" && (
          <div style={{ padding: "16px" }}>
            <div style={{ marginBottom: "14px" }}>
              <input
                type="text"
                placeholder="Search by client, location, title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ ...inp, height: "38px" }}
              />
            </div>
            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px",
                  color: "#94A3B8",
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
                      "File #",
                      "Client",
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
                        {report.fileNumber || "—"}
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
                          {/* FIX: Edit stores data before redirect */}
                          <button
                            onClick={() => handleEdit(report)}
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
                            onClick={() => handleDeleteReport(report.id)}
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

        {/* TEMPLATES TAB */}
        {activeTab === "templates" && (
          <div style={{ padding: "20px" }}>
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
                  <div style={{ marginBottom: "12px" }}>
                    <label style={lbl}>Company Tagline</label>
                    <input
                      value={editingTemplate.companyTagline || ""}
                      onChange={(e) =>
                        setEditingTemplate((p) =>
                          p ? { ...p, companyTagline: e.target.value } : p,
                        )
                      }
                      placeholder="Don't Let Your Drain Be A Pain!"
                      style={inp}
                    />
                  </div>
                </div>

                {/* Statement of Service */}
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
                    Statement of Service
                  </h4>
                  <textarea
                    value={editingTemplate.statementOfService || ""}
                    onChange={(e) =>
                      setEditingTemplate((p) =>
                        p ? { ...p, statementOfService: e.target.value } : p,
                      )
                    }
                    rows={5}
                    placeholder="Enter your statement of service..."
                    style={{
                      ...inp,
                      height: "auto",
                      padding: "10px 12px",
                      resize: "vertical",
                      lineHeight: "1.6",
                    }}
                  />
                </div>

                {/* Report Options */}
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

                {/* Custom Dropdowns */}
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
                      margin: "0 0 4px",
                      textTransform: "uppercase",
                    }}
                  >
                    Custom Dropdowns
                  </h4>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#94A3B8",
                      marginBottom: "14px",
                    }}
                  >
                    These appear in the General Notes tab of reports using this
                    template.
                  </p>
                  {(editingTemplate.customDropdowns || []).map((dd, i) => (
                    <div
                      key={i}
                      style={{
                        border: "1px solid #E2E8F0",
                        borderRadius: "8px",
                        padding: "12px",
                        marginBottom: "10px",
                        background: "#FAFAFA",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          marginBottom: "8px",
                        }}
                      >
                        <input
                          value={dd.label}
                          onChange={(e) =>
                            updateDropdownLabel(i, e.target.value)
                          }
                          placeholder="Dropdown label"
                          style={{ ...inp, flex: 1 }}
                        />
                        <button
                          onClick={() => removeDropdown(i)}
                          style={{
                            padding: "0 10px",
                            borderRadius: "6px",
                            border: "none",
                            background: "#FEF2F2",
                            color: "#DC2626",
                            cursor: "pointer",
                            fontWeight: 700,
                          }}
                        >
                          ✕
                        </button>
                      </div>
                      {dd.options.map((opt, oi) => (
                        <input
                          key={oi}
                          value={opt}
                          onChange={(e) =>
                            updateDropdownOption(i, oi, e.target.value)
                          }
                          placeholder={`Option ${oi + 1}`}
                          style={{
                            ...inp,
                            marginBottom: "6px",
                            display: "block",
                          }}
                        />
                      ))}
                      <button
                        onClick={() => addDropdownOption(i)}
                        style={{
                          fontSize: "12px",
                          color: "#2563EB",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          marginTop: "4px",
                        }}
                      >
                        + Add Option
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addCustomDropdown}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "6px",
                      border: "1px solid #E2E8F0",
                      background: "#F8FAFC",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      color: "#0F2A4A",
                    }}
                  >
                    + Add Dropdown
                  </button>
                </div>
              </div>
            ) : (
              <div>
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
                    onClick={handleNewTemplate}
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
                    <div style={{ fontSize: "32px", marginBottom: "12px" }}>
                      🗂
                    </div>
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
                      Create a template to customize your reports
                    </div>
                    <button
                      onClick={handleNewTemplate}
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
                        {t.companyLogo && (
                          <img
                            src={t.companyLogo}
                            alt="logo"
                            style={{
                              maxHeight: "32px",
                              objectFit: "contain",
                              marginBottom: "8px",
                              display: "block",
                            }}
                          />
                        )}
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#0F2A4A",
                            marginBottom: "4px",
                          }}
                        >
                          {t.name}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#94A3B8",
                            marginBottom: "10px",
                          }}
                        >
                          {t.companyName}
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
                            <span style={{ marginRight: "8px" }}>
                              ✓ Suggested Maintenance
                            </span>
                          )}
                          {t.customDropdowns?.length > 0 && (
                            <span>
                              ✓ {t.customDropdowns.length} Custom Dropdown
                              {t.customDropdowns.length > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => {
                              setEditingTemplate(t);
                              setIsNewTemplate(false);
                            }}
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
          </div>
        )}

        {/* SETTINGS TAB */}
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
                  {settingsSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: "6px", marginBottom: "20px" }}>
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

            {settingsTab === "account" && (
              <div
                style={{
                  padding: "16px",
                  border: "1px solid #E2E8F0",
                  borderRadius: "10px",
                  marginBottom: "16px",
                }}
              >
                <h4
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#0F2A4A",
                    margin: "0 0 14px",
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
                <div
                  style={{
                    marginTop: "16px",
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

            {settingsTab === "company" && (
              <div
                style={{
                  padding: "16px",
                  border: "1px solid #E2E8F0",
                  borderRadius: "10px",
                  marginBottom: "16px",
                }}
              >
                <h4
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#0F2A4A",
                    margin: "0 0 14px",
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
            )}

            {settingsTab === "subscription" && (
              <div
                style={{
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
                {/* FIX: 3 plans — Free, Monthly, Annual */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "12px",
                    marginBottom: "16px",
                  }}
                >
                  {[
                    {
                      name: "Free",
                      price: "$0",
                      period: "/mo",
                      features: ["5 reports/mo", "Basic templates"],
                      color: "#64748B",
                    },
                    {
                      name: "Monthly",
                      price: "$49",
                      period: "/mo",
                      features: [
                        "Unlimited reports",
                        "Custom templates",
                        "No watermark",
                      ],
                      color: "#2D8C4E",
                    },
                    {
                      name: "Annual",
                      price: "$499.95",
                      period: "/yr",
                      features: [
                        "Unlimited reports",
                        "Custom templates",
                        "No watermark",
                        "Save 15%",
                      ],
                      color: "#0F2A4A",
                    },
                  ].map((plan) => (
                    <div
                      key={plan.name}
                      style={{
                        border: `1px solid ${plan.color}`,
                        borderRadius: "10px",
                        padding: "16px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: plan.color,
                          marginBottom: "4px",
                        }}
                      >
                        {plan.name}
                      </div>
                      <div
                        style={{
                          fontSize: "20px",
                          fontWeight: 800,
                          color: "#0F2A4A",
                        }}
                      >
                        {plan.price}
                        <span style={{ fontSize: "12px", color: "#64748B" }}>
                          {plan.period}
                        </span>
                      </div>
                      <div style={{ marginTop: "8px", marginBottom: "12px" }}>
                        {plan.features.map((f) => (
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
                      </div>
                      <button
                        style={{
                          width: "100%",
                          padding: "7px",
                          borderRadius: "6px",
                          border: "none",
                          background: plan.color,
                          color: "#fff",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {plan.name === "Free" ? "Current Plan" : "Subscribe"}
                      </button>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    padding: "16px",
                    border: "1px solid #E2E8F0",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#0F2A4A",
                      marginBottom: "8px",
                    }}
                  >
                    Billing History
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#94A3B8",
                      textAlign: "center",
                      padding: "16px",
                    }}
                  >
                    No billing history on free plan.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
