"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  plan: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const mainPanelRef = useRef<HTMLDivElement>(null);

  const [uid, setUid] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "reports" | "templates" | "settings"
  >("reports");
  const [isMobile, setIsMobile] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [editingTemplate, setEditingTemplate] =
    useState<Partial<Template> | null>(null);
  const [isNewTemplate, setIsNewTemplate] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

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
  const [settingsSaved, setSavedMsg] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsTab, setSettingsTab] = useState<
    "account" | "company" | "subscription"
  >("account");
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const goToTab = (
    tab: "reports" | "templates" | "settings",
    subTab?: "account" | "company" | "subscription",
  ) => {
    setActiveTab(tab);
    if (subTab) setSettingsTab(subTab);
    setShowProfile(false);
    setTimeout(() => {
      mainPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  };

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.replace("/login");
        return;
      }
      setUid(u.uid);
      setSettings((p) => ({
        ...p,
        email: u.email || "",
        fullName: u.displayName || "",
      }));
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!uid) return;
    loadReports(uid);
    loadSettings(uid);
    loadTemplates();
  }, [uid]);

  const loadReports = async (userId: string) => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  const loadSettings = async (userId: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/settings", {
        headers: { "x-user-id": userId, Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data) setSettings((p) => ({ ...p, ...data }));
      }
    } catch {
      const local = localStorage.getItem("sewer_settings");
      if (local) {
        try {
          setSettings((p) => ({ ...p, ...JSON.parse(local) }));
        } catch {}
      }
    }
  };

  const loadTemplates = () => {
    try {
      const local = localStorage.getItem("sewer_templates");
      if (local) setTemplates(JSON.parse(local));
    } catch {}
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
      if (!pdfRes.ok) throw new Error("PDF generation failed");
      const blob = await pdfRes.blob();
      const url = URL.createObjectURL(blob);
      const tab = window.open(url, "_blank");
      if (tab) {
        tab.onload = () => setTimeout(() => tab.print(), 500);
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = `${report.title || "report"}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      setTimeout(() => URL.revokeObjectURL(url), 120_000);
    } catch {
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setPdfLoading(null);
    }
  };

  const handleView = async (report: Report) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      fetch(`/api/reports/${report.id}`, {
        headers: { "x-user-id": uid!, Authorization: `Bearer ${token}` },
      }).catch(() => {});
    } catch {}
    router.push(`/reports/${report.id}`);
  };

  const handleEdit = async (report: Report) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/reports/${report.id}`, {
        headers: { "x-user-id": uid!, Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(`report_edit_${report.id}`, JSON.stringify(data));
      }
    } catch {
      const local = localStorage.getItem(`report_${report.id}`);
      localStorage.setItem(
        `report_edit_${report.id}`,
        local || JSON.stringify({ report, defects: [] }),
      );
    }
    router.push(`/reports/new?edit=${report.id}`);
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
    localStorage.removeItem(`report_${id}`);
  };

  const handleSaveSettings = async () => {
    if (!uid) return;
    setSettingsSaving(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": uid,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Save failed");
      localStorage.setItem("sewer_settings", JSON.stringify(settings));
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2500);
    } catch {
      localStorage.setItem("sewer_settings", JSON.stringify(settings));
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2500);
    } finally {
      setSettingsSaving(false);
    }
  };

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

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

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
        "Sewer Labz is a professional sewer inspection company.",
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

  const addCustomDropdown = () =>
    setEditingTemplate((p) =>
      p
        ? {
            ...p,
            customDropdowns: [
              ...(p.customDropdowns || []),
              { label: "", options: [""] },
            ],
          }
        : p,
    );

  const removeDropdown = (i: number) =>
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

  const updateDropdownLabel = (i: number, val: string) => {
    const a = [...(editingTemplate?.customDropdowns || [])];
    a[i] = { ...a[i], label: val };
    setEditingTemplate((p) => (p ? { ...p, customDropdowns: a } : p));
  };

  const addDropdownOption = (i: number) => {
    const a = [...(editingTemplate?.customDropdowns || [])];
    a[i] = { ...a[i], options: [...a[i].options, ""] };
    setEditingTemplate((p) => (p ? { ...p, customDropdowns: a } : p));
  };

  const updateDropdownOption = (di: number, oi: number, val: string) => {
    const a = [...(editingTemplate?.customDropdowns || [])];
    const o = [...a[di].options];
    o[oi] = val;
    a[di] = { ...a[di], options: o };
    setEditingTemplate((p) => (p ? { ...p, customDropdowns: a } : p));
  };

  const filtered = reports.filter(
    (r) =>
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      r.location?.toLowerCase().includes(search.toLowerCase()),
  );

  const thisMonth = reports.filter((r) => {
    if (!r.createdAt && !r.inspectedAt) return false;
    const d = new Date(r.createdAt || r.inspectedAt),
      now = new Date();
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  }).length;

  const isPro = ["pro_monthly", "pro_annual", "PRO"].includes(settings.plan);
  const initials = (settings.fullName || settings.email || "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // ── Styles ──
  const tabBtn = (a: boolean): React.CSSProperties => ({
    padding: isMobile ? "8px 12px" : "8px 20px",
    borderRadius: "6px",
    fontSize: isMobile ? "12px" : "13px",
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    background: a ? "#0F2A4A" : "transparent",
    color: a ? "#fff" : "#64748B",
    fontFamily: "inherit",
  });

  const subTabBtn = (a: boolean): React.CSSProperties => ({
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    background: a ? "#0F2A4A" : "#F1F5F9",
    color: a ? "#fff" : "#64748B",
    fontFamily: "inherit",
  });

  const card: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #E2E8F0",
    borderRadius: "12px",
    padding: isMobile ? "14px" : "20px",
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
        padding: isMobile ? "12px" : "24px",
        maxWidth: "1100px",
        margin: "0 auto",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: isMobile ? "18px" : "22px",
              fontWeight: 800,
              color: "#0F2A4A",
              margin: 0,
            }}
          >
            Dashboard
          </h1>
          <p style={{ fontSize: "12px", color: "#94A3B8", marginTop: "2px" }}>
            {settings.fullName
              ? `Welcome back, ${settings.fullName}`
              : "Manage your inspection reports"}
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {!isPro && !isMobile && (
            <button
              onClick={() => goToTab("settings", "subscription")}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: "none",
                background: "linear-gradient(135deg, #2D8C4E, #1a6b38)",
                color: "#fff",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              ⚡ Subscribe Now
            </button>
          )}

          <Link href="/reports/new">
            <button
              style={{
                background: "#2D8C4E",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: isMobile ? "8px 12px" : "10px 20px",
                fontSize: isMobile ? "12px" : "13px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {isMobile ? "+ New" : "+ New Report"}
            </button>
          </Link>

          {/* ── Profile Avatar ── */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "#0F2A4A",
                color: "#fff",
                border: "2px solid #2D8C4E",
                fontSize: "13px",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "inherit",
              }}
            >
              {initials}
            </button>

            {showProfile && (
              <>
                <div
                  onClick={() => setShowProfile(false)}
                  style={{ position: "fixed", inset: 0, zIndex: 49 }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "44px",
                    right: 0,
                    zIndex: 50,
                    background: "#fff",
                    border: "1px solid #E2E8F0",
                    borderRadius: "12px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                    width: "260px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "16px",
                      background: "linear-gradient(135deg, #0F2A4A, #1a3d6b)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "50%",
                          background: "#2D8C4E",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "16px",
                          fontWeight: 800,
                          color: "#fff",
                        }}
                      >
                        {initials}
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#fff",
                          }}
                        >
                          {settings.fullName || "Your Name"}
                        </div>
                        <div style={{ fontSize: "11px", color: "#94A3B8" }}>
                          {settings.email}
                        </div>
                        <span
                          style={{
                            display: "inline-block",
                            marginTop: "4px",
                            padding: "2px 8px",
                            borderRadius: "20px",
                            fontSize: "10px",
                            fontWeight: 700,
                            background: isPro
                              ? "rgba(45,140,78,0.3)"
                              : "rgba(255,255,255,0.1)",
                            color: isPro ? "#4ade80" : "#94A3B8",
                          }}
                        >
                          {isPro ? "PRO" : "FREE PLAN"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: "8px" }}>
                    <button
                      onClick={() => goToTab("settings", "account")}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "10px 12px",
                        textAlign: "left",
                        background: "none",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "13px",
                        color: "#374151",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        fontWeight: 500,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#F8FAFC")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "none")
                      }
                    >
                      ⚙️ Settings
                    </button>
                    <button
                      onClick={() => {
                        router.push("/billing");
                        setShowProfile(false);
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "10px 12px",
                        textAlign: "left",
                        background: "none",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "13px",
                        color: "#374151",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        fontWeight: 500,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#F8FAFC")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "none")
                      }
                    >
                      💳 Billing
                    </button>
                    {!isPro && (
                      <button
                        onClick={() => goToTab("settings", "subscription")}
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "10px 12px",
                          textAlign: "left",
                          background: "rgba(45,140,78,0.08)",
                          border: "1px solid rgba(45,140,78,0.2)",
                          borderRadius: "6px",
                          fontSize: "13px",
                          color: "#2D8C4E",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          fontWeight: 700,
                          marginTop: "4px",
                        }}
                      >
                        ⚡ Upgrade to Pro
                      </button>
                    )}
                    <div
                      style={{
                        height: "1px",
                        background: "#F1F5F9",
                        margin: "8px 0",
                      }}
                    />
                    <button
                      onClick={handleLogout}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "10px 12px",
                        textAlign: "left",
                        background: "none",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "13px",
                        color: "#DC2626",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        fontWeight: 600,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#FEF2F2")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "none")
                      }
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Free trial banner ── */}
      {!isPro && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            marginBottom: "16px",
            background: "#FFFBEB",
            border: "1px solid #FDE68A",
            borderRadius: "10px",
          }}
        >
          <div style={{ fontSize: "13px", color: "#92400E" }}>
            ⚠ You have <strong>7 days</strong> left on your free trial. Upgrade
            for unlimited reports and no watermark.
          </div>
          <button
            onClick={() => handleSubscribe("PRO_MONTHLY")}
            disabled={checkoutLoading === "PRO_MONTHLY"}
            style={{
              padding: "7px 16px",
              borderRadius: "7px",
              border: "none",
              background:
                checkoutLoading === "PRO_MONTHLY" ? "#94A3B8" : "#2D8C4E",
              color: "#fff",
              fontSize: "12px",
              fontWeight: 700,
              cursor:
                checkoutLoading === "PRO_MONTHLY" ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
              marginLeft: "12px",
            }}
          >
            {checkoutLoading === "PRO_MONTHLY"
              ? "Redirecting..."
              : "Subscribe Now"}
          </button>
        </div>
      )}

      {/* ── Stats ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
          gap: isMobile ? "10px" : "16px",
          marginBottom: "16px",
        }}
      >
        {[
          {
            label: "Total Reports",
            value: reports.length,
            color: "#0F2A4A",
            icon: "📄",
          },
          {
            label: "Completed This Month",
            value: thisMonth,
            color: "#2D8C4E",
            icon: "✅",
          },
          {
            label: "Drafts",
            value: reports.filter((r) => r.status !== "COMPLETE").length,
            color: "#D97706",
            icon: "✏️",
          },
          {
            label: "Templates Used",
            value: templates.length,
            color: "#2563EB",
            icon: "🗂",
          },
        ].map(({ label, value, color, icon }) => (
          <div key={label} style={card}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: isMobile ? "22px" : "28px",
                    fontWeight: 800,
                    color,
                  }}
                >
                  {value}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#94A3B8",
                    marginTop: "2px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  {label}
                </div>
              </div>
              <span style={{ fontSize: "20px", opacity: 0.4 }}>{icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Panel ── */}
      <div
        ref={mainPanelRef}
        style={{
          background: "#fff",
          border: "1px solid #E2E8F0",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        {/* Tab bar */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            padding: "10px 12px",
            borderBottom: "1px solid #E2E8F0",
            background: "#FAFAFA",
            overflowX: "auto",
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
            onClick={() => goToTab("settings", "account")}
          >
            ⚙️ Settings
          </button>
        </div>

        {/* ── REPORTS TAB ── */}
        {activeTab === "reports" && (
          <div style={{ padding: isMobile ? "12px" : "16px" }}>
            <input
              type="text"
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inp, height: "38px", marginBottom: "14px" }}
            />

            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px",
                  color: "#94A3B8",
                }}
              >
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>⏳</div>
                Loading reports...
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
                <p
                  style={{
                    fontSize: "13px",
                    color: "#94A3B8",
                    marginBottom: "16px",
                  }}
                >
                  Click <strong>+ New Report</strong> to get started
                </p>
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
                      fontFamily: "inherit",
                    }}
                  >
                    + New Report
                  </button>
                </Link>
              </div>
            ) : isMobile ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {filtered.map((report) => (
                  <div
                    key={report.id}
                    style={{
                      border: "1px solid #E2E8F0",
                      borderRadius: "10px",
                      padding: "14px",
                      background: "#FAFAFA",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "8px",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#0F2A4A",
                            marginBottom: "2px",
                          }}
                        >
                          {report.title || "Untitled"}
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748B" }}>
                          {report.clientName || "—"} ·{" "}
                          {report.inspectedAt || "—"}
                        </div>
                      </div>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: "20px",
                          fontSize: "10px",
                          fontWeight: 700,
                          background:
                            report.status === "COMPLETE"
                              ? "#F0FDF4"
                              : "#FFFBEB",
                          color:
                            report.status === "COMPLETE"
                              ? "#16A34A"
                              : "#D97706",
                          marginLeft: "8px",
                        }}
                      >
                        {report.status || "DRAFT"}
                      </span>
                    </div>
                    <div
                      style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}
                    >
                      <button
                        onClick={() => handleView(report)}
                        style={actionBtn("#F1F5F9", "#0F2A4A")}
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(report)}
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
                  </div>
                ))}
              </div>
            ) : (
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
                      <td style={{ padding: "12px" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            onClick={() => handleView(report)}
                            style={actionBtn("#F1F5F9", "#0F2A4A")}
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(report)}
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
                            {pdfLoading === report.id ? "Generating..." : "PDF"}
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

        {/* ── TEMPLATES TAB ── */}
        {activeTab === "templates" && (
          <div style={{ padding: isMobile ? "12px" : "20px" }}>
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
                        padding: "7px 14px",
                        borderRadius: "6px",
                        border: "1px solid #E2E8F0",
                        background: "#fff",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                        color: "#64748B",
                        fontFamily: "inherit",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveTemplate}
                      disabled={savingTemplate}
                      style={{
                        padding: "7px 14px",
                        borderRadius: "6px",
                        border: "none",
                        background: "#2D8C4E",
                        color: "#fff",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {savingTemplate ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>

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

                {[
                  {
                    title: "Company Branding",
                    children: (
                      <>
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
                            style={inp}
                          />
                        </div>
                        <div>
                          <label style={lbl}>Tagline</label>
                          <input
                            value={editingTemplate.companyTagline || ""}
                            onChange={(e) =>
                              setEditingTemplate((p) =>
                                p
                                  ? { ...p, companyTagline: e.target.value }
                                  : p,
                              )
                            }
                            style={inp}
                          />
                        </div>
                      </>
                    ),
                  },
                  {
                    title: "Statement of Service",
                    children: (
                      <textarea
                        value={editingTemplate.statementOfService || ""}
                        onChange={(e) =>
                          setEditingTemplate((p) =>
                            p
                              ? { ...p, statementOfService: e.target.value }
                              : p,
                          )
                        }
                        rows={4}
                        style={{
                          ...inp,
                          height: "auto",
                          padding: "10px 12px",
                          resize: "vertical",
                          lineHeight: "1.6",
                        }}
                      />
                    ),
                  },
                  {
                    title: "Report Options",
                    children: (
                      <>
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
                            <span
                              style={{ fontSize: "13px", color: "#374151" }}
                            >
                              {label}
                            </span>
                          </label>
                        ))}
                      </>
                    ),
                  },
                ].map(({ title, children }) => (
                  <div
                    key={title}
                    style={{
                      padding: "14px",
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
                      {title}
                    </h4>
                    {children}
                  </div>
                ))}

                {/* Custom Dropdowns */}
                <div
                  style={{
                    padding: "14px",
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
                    Appear in the General Notes tab.
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
                            fontFamily: "inherit",
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
                          fontFamily: "inherit",
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
                      fontFamily: "inherit",
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
                      padding: "8px 14px",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    + New
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
                        marginTop: "8px",
                        fontFamily: "inherit",
                      }}
                    >
                      Create Template
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
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
                              fontFamily: "inherit",
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
                              fontFamily: "inherit",
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

        {/* ── SETTINGS TAB ── */}
        {activeTab === "settings" && (
          <div style={{ padding: isMobile ? "12px" : "20px" }}>
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
                    padding: "8px 16px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: settingsSaving ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {settingsSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "6px",
                marginBottom: "20px",
                overflowX: "auto",
              }}
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
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
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
                      fontFamily: "inherit",
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
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
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
                  <div style={{ gridColumn: isMobile ? "1" : "1 / -1" }}>
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
                      : "5 reports/month"}
                  </span>
                </div>

                {!isPro && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
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
                            fontFamily: "inherit",
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
                    <div style={{ fontSize: "13px", color: "#64748B" }}>
                      Manage your subscription via your LemonSqueezy customer
                      portal.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
