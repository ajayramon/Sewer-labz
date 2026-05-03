"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/app/Lib/firebase";

type CustomDropdown = { label: string; options: string[] };
type Template = {
  id: string;
  name: string;
  companyName: string;
  companyTagline: string;
  companyLogo: string;
  statementOfService: string;
  includeDefectGraphic: boolean;
  showSuggestedMaintenance: boolean;
  customDropdowns: CustomDropdown[];
  createdAt: string;
};

const emptyTemplate = (): Omit<Template, "id" | "createdAt"> => ({
  name: "",
  companyName: "Sewer Labz",
  companyTagline: "Don't Let Your Drain Be A Pain!",
  companyLogo: "",
  statementOfService:
    "Sewer Labz is a professional sewer inspection company. All inspections are performed in accordance with industry standards using professional-grade CCTV camera equipment.",
  includeDefectGraphic: true,
  showSuggestedMaintenance: true,
  customDropdowns: [],
});

export default function TemplatesPage() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editing, setEditing] = useState<Partial<Template> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

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
      fetchTemplates(u.uid);
    });
    return () => unsub();
  }, []);

  const fetchTemplates = async (userId: string) => {
    setLoading(true);
    try {
      // Show localStorage instantly
      const local = localStorage.getItem("sewer_templates");
      if (local) setTemplates(JSON.parse(local));

      // Load from Firestore
      const res = await fetch("/api/template", {
        headers: { "x-user-id": userId },
      });
      const data = await res.json();
      if (data.templates?.length) {
        setTemplates(data.templates);
        localStorage.setItem("sewer_templates", JSON.stringify(data.templates));
      }
    } catch {
      const local = localStorage.getItem("sewer_templates");
      if (local) setTemplates(JSON.parse(local));
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditing(emptyTemplate());
    setIsNew(true);
  };
  const handleEdit = (t: Template) => {
    setEditing({ ...t });
    setIsNew(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    try {
      await fetch(`/api/template/${id}`, {
        method: "DELETE",
        headers: { "x-user-id": uid! },
      });
    } catch {}
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    localStorage.setItem("sewer_templates", JSON.stringify(updated));
  };

  const handleSave = async () => {
    if (!editing?.name?.trim()) {
      alert("Template name is required");
      return;
    }
    setSaving(true);
    try {
      let saved: Template;
      if (isNew) {
        const res = await fetch("/api/template", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-user-id": uid! },
          body: JSON.stringify(editing),
        });
        saved = await res.json();
        const updated = [saved, ...templates];
        setTemplates(updated);
        localStorage.setItem("sewer_templates", JSON.stringify(updated));
      } else {
        const res = await fetch(`/api/template/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "x-user-id": uid! },
          body: JSON.stringify(editing),
        });
        saved = await res.json();
        const updated = templates.map((t) => (t.id === saved.id ? saved : t));
        setTemplates(updated);
        localStorage.setItem("sewer_templates", JSON.stringify(updated));
      }
      setEditing(null);
    } catch {
      // localStorage fallback
      const fallback: Template = {
        ...(editing as Template),
        id: (editing as any).id || Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      const updated = isNew
        ? [fallback, ...templates]
        : templates.map((t) => (t.id === fallback.id ? fallback : t));
      setTemplates(updated);
      localStorage.setItem("sewer_templates", JSON.stringify(updated));
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const updateEditing = (k: string, v: any) =>
    setEditing((p) => (p ? { ...p, [k]: v } : p));
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) =>
      updateEditing("companyLogo", ev.target?.result as string);
    reader.readAsDataURL(file);
  };
  const addDropdown = () =>
    updateEditing("customDropdowns", [
      ...(editing?.customDropdowns || []),
      { label: "", options: [""] },
    ]);
  const updateDropdownLabel = (i: number, val: string) => {
    const a = [...(editing?.customDropdowns || [])];
    a[i] = { ...a[i], label: val };
    updateEditing("customDropdowns", a);
  };
  const addDropdownOption = (i: number) => {
    const a = [...(editing?.customDropdowns || [])];
    a[i] = { ...a[i], options: [...a[i].options, ""] };
    updateEditing("customDropdowns", a);
  };
  const updateDropdownOption = (di: number, oi: number, val: string) => {
    const a = [...(editing?.customDropdowns || [])];
    const o = [...a[di].options];
    o[oi] = val;
    a[di] = { ...a[di], options: o };
    updateEditing("customDropdowns", a);
  };
  const removeDropdownOption = (di: number, oi: number) => {
    const a = [...(editing?.customDropdowns || [])];
    a[di] = { ...a[di], options: a[di].options.filter((_, i) => i !== oi) };
    updateEditing("customDropdowns", a);
  };
  const removeDropdown = (i: number) =>
    updateEditing(
      "customDropdowns",
      (editing?.customDropdowns || []).filter((_, idx) => idx !== i),
    );

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
    padding: isMobile ? "14px" : "20px",
    marginBottom: "16px",
  };

  // ── EDITOR VIEW ──────────────────────────────────────────────
  if (editing !== null)
    return (
      <div
        style={{
          padding: isMobile ? "12px" : "24px",
          maxWidth: "800px",
          margin: "0 auto",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <h1
            style={{
              fontSize: isMobile ? "18px" : "20px",
              fontWeight: 800,
              color: "#0F2A4A",
              margin: 0,
            }}
          >
            {isNew ? "New Template" : "Edit Template"}
          </h1>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setEditing(null)}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
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
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                border: "none",
                background: saving ? "#94A3B8" : "#2D8C4E",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Saving..." : "Save Template"}
            </button>
          </div>
        </div>

        {/* Template Name */}
        <div style={card}>
          <h3
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#0F2A4A",
              margin: "0 0 14px",
            }}
          >
            Template Info
          </h3>
          <label style={lbl}>Template Name *</label>
          <input
            value={editing.name || ""}
            onChange={(e) => updateEditing("name", e.target.value)}
            placeholder="e.g. Standard Residential Inspection"
            style={inp}
          />
        </div>

        {/* Company Branding */}
        <div style={card}>
          <h3
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#0F2A4A",
              margin: "0 0 14px",
            }}
          >
            Company Branding
          </h3>
          <div style={{ marginBottom: "14px" }}>
            <label style={lbl}>Company Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              style={{
                display: "block",
                fontSize: "13px",
                color: "#64748B",
                marginBottom: "8px",
              }}
            />
            {editing.companyLogo && (
              <img
                src={editing.companyLogo}
                alt="Logo"
                style={{
                  maxHeight: "60px",
                  objectFit: "contain",
                  border: "1px solid #E2E8F0",
                  borderRadius: "6px",
                  padding: "4px",
                }}
              />
            )}
          </div>
          <div style={{ marginBottom: "12px" }}>
            <label style={lbl}>Company Name</label>
            <input
              value={editing.companyName || ""}
              onChange={(e) => updateEditing("companyName", e.target.value)}
              placeholder="Sewer Labz"
              style={inp}
            />
          </div>
          <div>
            <label style={lbl}>Tagline</label>
            <input
              value={editing.companyTagline || ""}
              onChange={(e) => updateEditing("companyTagline", e.target.value)}
              placeholder="Don't Let Your Drain Be A Pain!"
              style={inp}
            />
          </div>
        </div>

        {/* Statement of Service */}
        <div style={card}>
          <h3
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#0F2A4A",
              margin: "0 0 14px",
            }}
          >
            Statement of Service
          </h3>
          <label style={lbl}>Custom Statement (appears in every report)</label>
          <textarea
            value={editing.statementOfService || ""}
            onChange={(e) =>
              updateEditing("statementOfService", e.target.value)
            }
            rows={5}
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
        <div style={card}>
          <h3
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#0F2A4A",
              margin: "0 0 14px",
            }}
          >
            Report Options
          </h3>
          {[
            {
              key: "includeDefectGraphic",
              label: "Include Common Sewer Defect Graphic in reports",
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
                marginBottom: "12px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={!!(editing as any)[key]}
                onChange={(e) => updateEditing(key, e.target.checked)}
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
        <div style={card}>
          <h3
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#0F2A4A",
              margin: "0 0 4px",
            }}
          >
            Custom Dropdowns
          </h3>
          <p
            style={{ fontSize: "12px", color: "#94A3B8", marginBottom: "14px" }}
          >
            These dropdowns appear in the General Notes tab of every report
            using this template.
          </p>
          {(editing.customDropdowns || []).map((dd, i) => (
            <div
              key={i}
              style={{
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
                padding: "14px",
                marginBottom: "12px",
                background: "#FAFAFA",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <input
                  value={dd.label}
                  onChange={(e) => updateDropdownLabel(i, e.target.value)}
                  placeholder="Dropdown label (e.g. Pipe Condition)"
                  style={{ ...inp, flex: 1, marginRight: "10px" }}
                />
                <button
                  onClick={() => removeDropdown(i)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#DC2626",
                    cursor: "pointer",
                    fontSize: "18px",
                  }}
                >
                  ×
                </button>
              </div>
              {dd.options.map((opt, oi) => (
                <div
                  key={oi}
                  style={{ display: "flex", gap: "6px", marginBottom: "6px" }}
                >
                  <input
                    value={opt}
                    onChange={(e) =>
                      updateDropdownOption(i, oi, e.target.value)
                    }
                    placeholder={`Option ${oi + 1}`}
                    style={{ ...inp, flex: 1 }}
                  />
                  {dd.options.length > 1 && (
                    <button
                      onClick={() => removeDropdownOption(i, oi)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#DC2626",
                        cursor: "pointer",
                        fontSize: "16px",
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
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
            onClick={addDropdown}
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
    );

  // ── LIST VIEW ────────────────────────────────────────────────
  return (
    <div
      style={{
        padding: isMobile ? "12px" : "24px",
        maxWidth: "1000px",
        margin: "0 auto",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
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
              fontSize: isMobile ? "18px" : "22px",
              fontWeight: 800,
              color: "#0F2A4A",
              margin: 0,
            }}
          >
            Templates
          </h1>
          <p style={{ fontSize: "13px", color: "#94A3B8", marginTop: "4px" }}>
            Create and manage report templates
          </p>
        </div>
        <button
          onClick={handleNew}
          style={{
            background: "#2D8C4E",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: isMobile ? "8px 12px" : "10px 20px",
            fontSize: isMobile ? "12px" : "13px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          + {isMobile ? "New" : "New Template"}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#94A3B8" }}>
          Loading templates...
        </div>
      ) : templates.length === 0 ? (
        <div
          style={{
            background: "#fff",
            border: "2px dashed #E2E8F0",
            borderRadius: "12px",
            padding: "60px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>🗂</div>
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
            style={{ fontSize: "13px", color: "#94A3B8", marginBottom: "20px" }}
          >
            Create a template to customize your reports with your company
            branding
          </div>
          <button
            onClick={handleNew}
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
            Create First Template
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
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
                padding: isMobile ? "14px" : "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "12px",
                }}
              >
                <div style={{ flex: 1 }}>
                  {t.companyLogo && (
                    <img
                      src={t.companyLogo}
                      alt="Logo"
                      style={{
                        maxHeight: "36px",
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
                    }}
                  >
                    {t.name}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#94A3B8",
                      marginTop: "2px",
                    }}
                  >
                    {t.companyName}
                  </div>
                </div>
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748B",
                  marginBottom: "14px",
                  lineHeight: "1.6",
                }}
              >
                {t.includeDefectGraphic && (
                  <span style={{ marginRight: "8px" }}>✓ Defect Graphic</span>
                )}
                {t.showSuggestedMaintenance && (
                  <span style={{ marginRight: "8px" }}>
                    ✓ Suggested Maintenance
                  </span>
                )}
                {t.customDropdowns?.length > 0 && (
                  <span>
                    ✓ {t.customDropdowns.length} dropdown
                    {t.customDropdowns.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => handleEdit(t)}
                  style={{
                    flex: 1,
                    padding: "8px",
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
                  onClick={() => handleDelete(t.id)}
                  style={{
                    padding: "8px 14px",
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
  );
}
