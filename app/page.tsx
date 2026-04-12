("use client");
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Report = {
  id: string;
  title: string;
  fileNumber: string;
  clientName: string;
  inspectedAt: string;
  status: "DRAFT" | "COMPLETE";
};

type Template = {
  id: string;
  name: string;
  companyName: string;
  companyLogo: string;
  includeDefectGraphic: boolean;
  showSuggestedMaintenance: boolean;
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

export default function Dashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [trialDismissed, setTrialDismissed] = useState(false);
  const [activePage, setActivePage] = useState<
    "dashboard" | "reports" | "templates" | "settings"
  >("dashboard");
  const [reports, setReports] = useState<Report[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsTab, setSettingsTab] = useState<
    "account" | "company" | "subscription"
  >("account");
  const [editingTemplate, setEditingTemplate] =
    useState<Partial<Template> | null>(null);
  const [isNewTemplate, setIsNewTemplate] = useState(false);
  const [user, setUser] = useState<{
    email: string;
    fullName?: string;
    companyName?: string;
  } | null>(null);
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
    // Load user
    const stored = localStorage.getItem("user");
    if (stored) {
      const u = JSON.parse(stored);
      setUser(u);
      setSettings((p) => ({
        ...p,
        email: u.email || "",
        fullName: u.fullName || "",
        companyName: u.companyName || "",
      }));
    }
    // Load saved settings
    const savedSettings = localStorage.getItem("sewer_settings");
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    // Load reports from localStorage
    const savedReports = localStorage.getItem("sewer_reports");
    if (savedReports) setReports(JSON.parse(savedReports));
    // Load templates
    const savedTemplates = localStorage.getItem("sewer_templates");
    if (savedTemplates) setTemplates(JSON.parse(savedTemplates));
    // Fetch from API
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => {
        if (data.reports?.length) setReports(data.reports);
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.replace("/login");
  };

  const handlePDF = async (report: Report) => {
    try {
      const local = localStorage.getItem(`report_${report.id}`);
      const data = local ? JSON.parse(local) : { report, defects: [] };
      const res = await fetch("/api/reports/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const html = await res.text();
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

  const handleDeleteReport = (id: string) => {
    if (!confirm("Delete this report?")) return;
    const updated = reports.filter((r) => r.id !== id);
    setReports(updated);
    localStorage.setItem("sewer_reports", JSON.stringify(updated));
    localStorage.removeItem(`report_${id}`);
  };

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    localStorage.setItem("sewer_settings", JSON.stringify(settings));
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
    } catch {}
    setSettingsSaving(false);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const handleNewTemplate = () => {
    setEditingTemplate({
      name: "",
      companyName: "Sewer Labz",
      companyLogo: "",
      includeDefectGraphic: true,
      showSuggestedMaintenance: true,
    });
    setIsNewTemplate(true);
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate?.name?.trim()) {
      alert("Template name required");
      return;
    }
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

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "U";

  // ── Styles ──────────────────────────────────────────────────
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
  const card: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #E2E8F0",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "16px",
  };
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

  const navItems = [
    { icon: "⊞", label: "Dashboard", page: "dashboard" as const },
    { icon: "📄", label: "Reports", page: "reports" as const },
    { icon: "📋", label: "Templates", page: "templates" as const },
    { icon: "⚙️", label: "Settings", page: "settings" as const },
  ];

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
            <span style={{ color: "#fff" }}>SEWER </span>
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
          {navItems.map((item) => (
            <div
              key={item.label}
              onClick={() => setActivePage(item.page)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "8px",
                marginBottom: "4px",
                background:
                  activePage === item.page ? "#2D8C4E" : "transparent",
                color:
                  activePage === item.page ? "#fff" : "rgba(255,255,255,0.65)",
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontSize: "14px",
                fontWeight: activePage === item.page ? 600 : 400,
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
          <div
            onClick={() => router.push("/reports/new")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "8px",
              marginBottom: "4px",
              background: "#1a3a5c",
              color: "rgba(255,255,255,0.65)",
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontSize: "14px",
              marginTop: "8px",
            }}
          >
            <span>+</span>
            <span>New Report</span>
          </div>
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
                {user?.fullName || user?.email || "Inspector"}
              </div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px" }}>
                {user?.companyName || "Sewer Labz"}
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
            Sign Out
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
                textTransform: "capitalize",
              }}
            >
              {activePage}
            </h1>
          </div>
          <button
            onClick={() => router.push("/reports/new")}
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
        {!trialDismissed && (
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
              ⚠️ You have <strong>5 days</strong> left on your free trial.
            </span>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button
                onClick={() => setActivePage("settings")}
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
                  fontSize: "18px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div style={{ padding: "24px", flex: 1, overflowY: "auto" }}>
          {/* ══════════════════════════════════════
              DASHBOARD PAGE
          ══════════════════════════════════════ */}
          {activePage === "dashboard" && (
            <>
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
                  {
                    label: "Total Reports",
                    value: reports.length,
                    icon: "📄",
                    color: "#0F2A4A",
                  },
                  {
                    label: "Completed This Month",
                    value: reports.filter((r) => r.status === "COMPLETE")
                      .length,
                    icon: "✅",
                    color: "#2D8C4E",
                  },
                  {
                    label: "Drafts",
                    value: reports.filter((r) => r.status === "DRAFT").length,
                    icon: "📝",
                    color: "#D97706",
                  },
                  {
                    label: "Templates Used",
                    value: templates.length,
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

              {/* Recent Reports Table */}
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
                    onClick={() => setActivePage("reports")}
                    style={{
                      fontSize: "13px",
                      color: "#2D8C4E",
                      cursor: "pointer",
                      fontWeight: 500,
                    }}
                  >
                    View all →
                  </span>
                </div>
                {reports.length === 0 ? (
                  <div style={{ padding: "48px", textAlign: "center" }}>
                    <div style={{ fontSize: "32px", marginBottom: "12px" }}>
                      📄
                    </div>
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
                    <button
                      onClick={() => router.push("/reports/new")}
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
                  </div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#F8FAFC" }}>
                        {[
                          "Report Title",
                          "File #",
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
                      {reports.slice(0, 5).map((r, i) => (
                        <tr
                          key={r.id}
                          style={{ borderTop: "1px solid #F1F5F9" }}
                        >
                          <td
                            style={{
                              padding: "14px 20px",
                              fontSize: "14px",
                              fontWeight: 600,
                              color: "#0F2A4A",
                            }}
                          >
                            {r.title || "Untitled"}
                          </td>
                          <td
                            style={{
                              padding: "14px 20px",
                              fontSize: "14px",
                              color: "#64748B",
                            }}
                          >
                            {r.fileNumber || "—"}
                          </td>
                          <td
                            style={{
                              padding: "14px 20px",
                              fontSize: "14px",
                              color: "#64748B",
                            }}
                          >
                            {r.clientName || "—"}
                          </td>
                          <td
                            style={{
                              padding: "14px 20px",
                              fontSize: "14px",
                              color: "#64748B",
                            }}
                          >
                            {r.inspectedAt || "—"}
                          </td>
                          <td style={{ padding: "14px 20px" }}>
                            <span
                              style={{
                                padding: "4px 12px",
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: 600,
                                background:
                                  r.status === "COMPLETE"
                                    ? "#E8F5EE"
                                    : "#FFFBEB",
                                color:
                                  r.status === "COMPLETE"
                                    ? "#2D8C4E"
                                    : "#D97706",
                              }}
                            >
                              {r.status || "DRAFT"}
                            </span>
                          </td>
                          <td style={{ padding: "14px 20px" }}>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                onClick={() => router.push(`/reports/${r.id}`)}
                                style={{
                                  background: "none",
                                  border: "1px solid #E2E8F0",
                                  borderRadius: "6px",
                                  padding: "5px 10px",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                  color: "#64748B",
                                }}
                              >
                                View
                              </button>
                              <button
                                onClick={() =>
                                  router.push(`/reports/${r.id}/edit`)
                                }
                                style={{
                                  background: "none",
                                  border: "1px solid #E2E8F0",
                                  borderRadius: "6px",
                                  padding: "5px 10px",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                  color: "#64748B",
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handlePDF(r)}
                                style={{
                                  background: "#2D8C4E",
                                  border: "none",
                                  borderRadius: "6px",
                                  padding: "5px 10px",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                  color: "#fff",
                                }}
                              >
                                PDF
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* ══════════════════════════════════════
              REPORTS PAGE
          ══════════════════════════════════════ */}
          {activePage === "reports" && (
            <div>
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
                  All Reports ({reports.length})
                </h2>
                <button
                  onClick={() => router.push("/reports/new")}
                  style={{
                    background: "#2D8C4E",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "9px 18px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  + New Report
                </button>
              </div>
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #E2E8F0",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                {reports.length === 0 ? (
                  <div style={{ padding: "48px", textAlign: "center" }}>
                    <div style={{ fontSize: "32px", marginBottom: "12px" }}>
                      📄
                    </div>
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
                    <button
                      onClick={() => router.push("/reports/new")}
                      style={{
                        background: "#2D8C4E",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "10px 20px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                        marginTop: "12px",
                      }}
                    >
                      Create First Report
                    </button>
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
                              padding: "12px 20px",
                              textAlign: "left",
                              fontSize: "12px",
                              fontWeight: 700,
                              color: "#64748B",
                              textTransform: "uppercase",
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((r) => (
                        <tr
                          key={r.id}
                          style={{ borderTop: "1px solid #F1F5F9" }}
                        >
                          <td
                            style={{
                              padding: "14px 20px",
                              fontSize: "14px",
                              fontWeight: 600,
                              color: "#0F2A4A",
                            }}
                          >
                            {r.title || "Untitled"}
                          </td>
                          <td
                            style={{
                              padding: "14px 20px",
                              fontSize: "13px",
                              color: "#64748B",
                            }}
                          >
                            {r.fileNumber || "—"}
                          </td>
                          <td
                            style={{
                              padding: "14px 20px",
                              fontSize: "13px",
                              color: "#64748B",
                            }}
                          >
                            {r.clientName || "—"}
                          </td>
                          <td
                            style={{
                              padding: "14px 20px",
                              fontSize: "13px",
                              color: "#64748B",
                            }}
                          >
                            {r.inspectedAt || "—"}
                          </td>
                          <td style={{ padding: "14px 20px" }}>
                            <span
                              style={{
                                padding: "4px 12px",
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: 600,
                                background:
                                  r.status === "COMPLETE"
                                    ? "#E8F5EE"
                                    : "#FFFBEB",
                                color:
                                  r.status === "COMPLETE"
                                    ? "#2D8C4E"
                                    : "#D97706",
                              }}
                            >
                              {r.status || "DRAFT"}
                            </span>
                          </td>
                          <td style={{ padding: "14px 20px" }}>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                onClick={() => router.push(`/reports/${r.id}`)}
                                style={{
                                  background: "#F1F5F9",
                                  border: "none",
                                  borderRadius: "6px",
                                  padding: "5px 10px",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                  color: "#0F2A4A",
                                  fontWeight: 600,
                                }}
                              >
                                View
                              </button>
                              <button
                                onClick={() =>
                                  router.push(`/reports/${r.id}/edit`)
                                }
                                style={{
                                  background: "#EFF6FF",
                                  border: "none",
                                  borderRadius: "6px",
                                  padding: "5px 10px",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                  color: "#2563EB",
                                  fontWeight: 600,
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handlePDF(r)}
                                style={{
                                  background: "#F0FDF4",
                                  border: "none",
                                  borderRadius: "6px",
                                  padding: "5px 10px",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                  color: "#16A34A",
                                  fontWeight: 600,
                                }}
                              >
                                PDF
                              </button>
                              <button
                                onClick={() => handleDeleteReport(r.id)}
                                style={{
                                  background: "#FEF2F2",
                                  border: "none",
                                  borderRadius: "6px",
                                  padding: "5px 10px",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                  color: "#DC2626",
                                  fontWeight: 600,
                                }}
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
            </div>
          )}

          {/* ══════════════════════════════════════
              TEMPLATES PAGE
          ══════════════════════════════════════ */}
          {activePage === "templates" && (
            <div>
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
                    <h2
                      style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "#0F2A4A",
                        margin: 0,
                      }}
                    >
                      {isNewTemplate ? "New Template" : "Edit Template"}
                    </h2>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => setEditingTemplate(null)}
                        style={{
                          padding: "8px 16px",
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
                        style={{
                          padding: "8px 16px",
                          borderRadius: "6px",
                          border: "none",
                          background: "#2D8C4E",
                          color: "#fff",
                          fontSize: "13px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Save Template
                      </button>
                    </div>
                  </div>
                  <div style={card}>
                    <div style={{ marginBottom: "14px" }}>
                      <label style={lbl}>Template Name *</label>
                      <input
                        value={editingTemplate.name || ""}
                        onChange={(e) =>
                          setEditingTemplate((p) =>
                            p ? { ...p, name: e.target.value } : p,
                          )
                        }
                        placeholder="e.g. Standard Residential"
                        style={inp}
                      />
                    </div>
                    <div style={{ marginBottom: "14px" }}>
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
                    <div style={{ marginBottom: "14px" }}>
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
                    {[
                      {
                        key: "includeDefectGraphic",
                        label: "Include Common Sewer Defect Graphic",
                      },
                      {
                        key: "showSuggestedMaintenance",
                        label: 'Enable "Suggested Maintenance" severity',
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
              ) : (
                <div>
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
                      Templates ({templates.length})
                    </h2>
                    <button
                      onClick={handleNewTemplate}
                      style={{
                        background: "#2D8C4E",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "9px 18px",
                        fontSize: "14px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      + New Template
                    </button>
                  </div>
                  {templates.length === 0 ? (
                    <div
                      style={{
                        background: "#fff",
                        border: "2px dashed #E2E8F0",
                        borderRadius: "12px",
                        padding: "60px",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: "32px", marginBottom: "12px" }}>
                        🗂
                      </div>
                      <div
                        style={{
                          fontSize: "15px",
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
                          marginBottom: "20px",
                        }}
                      >
                        Create templates to customize your reports
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
                        gap: "16px",
                      }}
                    >
                      {templates.map((t) => (
                        <div
                          key={t.id}
                          style={{
                            background: "#fff",
                            border: "1px solid #E2E8F0",
                            borderRadius: "12px",
                            padding: "20px",
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
                              fontSize: "15px",
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
                              marginBottom: "12px",
                            }}
                          >
                            {t.companyName}
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#64748B",
                              marginBottom: "14px",
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
                                padding: "7px 14px",
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

          {/* ══════════════════════════════════════
              SETTINGS PAGE
          ══════════════════════════════════════ */}
          {activePage === "settings" && (
            <div>
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
                  Settings
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
                    {settingsSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>

              {/* Sub-tabs */}
              <div
                style={{ display: "flex", gap: "6px", marginBottom: "20px" }}
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

              {/* Account */}
              {settingsTab === "account" && (
                <div style={card}>
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

              {/* Company */}
              {settingsTab === "company" && (
                <div style={card}>
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

              {/* Subscription */}
              {settingsTab === "subscription" && (
                <div style={card}>
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
                  <div
                    style={{
                      background: "linear-gradient(135deg, #0F2A4A, #1e4a7a)",
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
                      Upgrade to Pro — $49/mo
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#CBD5E1",
                        marginBottom: "14px",
                        lineHeight: "1.6",
                      }}
                    >
                      Unlimited reports · Custom templates · No watermark ·
                      Priority support
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
                  <div
                    style={{
                      marginTop: "16px",
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
    </div>
  );
}
