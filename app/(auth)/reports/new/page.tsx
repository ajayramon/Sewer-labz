"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/Lib/firebase";

type DefectImage = { id: string; url: string; name: string };
type Defect = {
  id: string;
  videoTimeH: string;
  videoTimeM: string;
  footageStart: string;
  conditionType: string;
  severity: string;
  narrative: string;
  images: DefectImage[];
  expanded: boolean;
};
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
};

const conditionTypes = [
  "Select Condition Type",
  "Root Intrusion",
  "Offset Joint",
  "Circumferential Crack",
  "Longitudinal Crack",
  "Erosion At Joint",
  "Debris Within Pipe",
  "Deteriorated Pipe Material",
  "Pipe Traversed Material",
  "Joints Performing As Designed - No Defect",
  "Camera Reached Inspection Limit",
  "City Connection Reached",
  "Grease Deposit",
  "Broken Pipe",
  "Belly/Positive Grade",
  "Scale Buildup",
  "Infiltration",
  "Exfiltration",
  "Collapse",
  "Other",
];

const pipeMaterials = [
  "ABS",
  "Cast Iron",
  "Asbestos Cement/Transite",
  "Clay/Terracotta",
  "PVC",
  "SDR",
  "Concrete",
  "Orangeburg",
  "CIPP",
  "HDPE",
  "Galvanized Steel",
  "Copper",
  "Lead",
  "Stainless Steel",
];

const peopleOptions = [
  "Client",
  "Home Inspector",
  "Buyers Agent",
  "Sellers Agent",
  "Realtor",
  "Contractor",
  "Other",
];
const weatherOptions = [
  "Sunny",
  "Cloudy",
  "Overcast",
  "Rain",
  "Light Rain",
  "Hot",
  "Warm",
  "Mild",
  "Cold",
];
const tempOptions = [
  "60-70°F",
  "70-80°F",
  "80-90°F",
  "90-100°F",
  "100-110°F",
  "Below 60°F",
  "Above 110°F",
];
const soilOptions = [
  "Dry at the surface",
  "Moist at the surface",
  "Wet at the surface",
  "Saturated",
  "Frozen",
];

const correctiveActions = [
  {
    label: "Root Removal",
    options: [
      "N/A",
      "Hydro Jet",
      "Cable Cut",
      "Mechanical Root Cutter",
      "Chemical Treatment",
    ],
  },
  {
    label: "Pipe Repair",
    options: [
      "N/A",
      "Spot Repair",
      "CIPP Liner",
      "Full Replacement",
      "Pipe Bursting",
    ],
  },
  {
    label: "Joint Repair",
    options: [
      "N/A",
      "Chemical Grouting",
      "Internal Seal",
      "Spot Liner",
      "Full Replacement",
    ],
  },
  {
    label: "Cleaning",
    options: ["N/A", "Hydro Jet", "Mechanical Clean", "Chemical Clean"],
  },
  {
    label: "Further Investigation",
    options: [
      "N/A",
      "Re-inspect After Cleaning",
      "Excavation",
      "Smoke Test",
      "Dye Test",
    ],
  },
];

const endOfReportOptions = [
  {
    label: "General Recommendation",
    key: "rec1",
    options: [
      "Select...",
      "Given the condition(s) above we recommend full evaluations and/or corrections with written findings and costs to cure by a competent licensed plumbing contractor before the end/close of the inspection contingency period.",
      "No defects found — sewer line is in acceptable condition at time of inspection.",
      "Minor defects noted — monitor and re-inspect within 12 months.",
      "Major defects found — immediate repair recommended prior to closing.",
    ],
  },
  {
    label: "Post Repair Recommendation",
    key: "rec2",
    options: [
      "Select...",
      "Recommend sewer inspections after repairs are made to ensure efficacy of work.",
      "Re-inspection not required if repairs are made by a licensed contractor with written warranty.",
      "Re-inspect after hydro jetting and root removal to confirm clearance.",
    ],
  },
  {
    label: "Liner Recommendation",
    key: "rec3",
    options: [
      "Select...",
      "N/A",
      'If a liner is installed, ensure they mark the cleanout "DO NOT CABLE — LINER INSTALLED".',
      "Lining is recommended as a less invasive and cost-friendly option to replacement.",
      "Full pipe replacement is recommended over lining given extent of deterioration.",
    ],
  },
  {
    label: "Cleaning Recommendation",
    key: "rec4",
    options: [
      "Select...",
      "N/A",
      "Hydro jet/blade cutting is recommended to remove roots and de-scale the pipe.",
      "Chemical root treatment is recommended to inhibit root re-growth.",
      "High pressure hydro jetting is recommended before re-inspection.",
    ],
  },
  {
    label: "Warranty Recommendation",
    key: "rec5",
    options: [
      "Select...",
      "N/A",
      "Ask for all work to be done with a transferable warranty.",
      "Ensure written warranty is provided for all repairs performed.",
      "Request a minimum 1-year warranty on all repair work.",
    ],
  },
];

const severityConfig: Record<string, { bg: string; color: string }> = {
  "No Defect": { bg: "#F0FDF4", color: "#16A34A" },
  Minor: { bg: "#FFFBEB", color: "#D97706" },
  Moderate: { bg: "#FFF7ED", color: "#EA580C" },
  Major: { bg: "#FEF2F2", color: "#DC2626" },
  "Suggested Maintenance": { bg: "#EFF6FF", color: "#2563EB" },
};

const inp: React.CSSProperties = {
  height: "38px",
  borderRadius: "6px",
  border: "1px solid #E2E8F0",
  padding: "0 10px",
  fontSize: "13px",
  color: "#0F172A",
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
const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #E2E8F0",
  borderRadius: "12px",
  padding: "20px",
  marginBottom: "16px",
};

const defaultTemplateSettings: Partial<Template> = {
  companyName: "Sewer Labz",
  companyTagline: "Don't Let Your Drain Be A Pain!",
  companyLogo: "",
  statementOfService:
    "Sewer Labz is a professional sewer inspection company. All inspections are performed using professional-grade CCTV camera equipment.",
  includeDefectGraphic: true,
  showSuggestedMaintenance: true,
  customDropdowns: [],
};

export default function ReportBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [uid, setUid] = useState<string | null>(null);
  const [title, setTitle] = useState("New Inspection Report");
  const [editingTitle, setEditingTitle] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [activeTab, setActiveTab] = useState<
    "details" | "system" | "conditions" | "recommendations"
  >("details");
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [reportStatus, setReportStatus] = useState<"DRAFT" | "COMPLETE">(
    "DRAFT",
  );

  const [details, setDetails] = useState({
    fileNumber: "",
    clientName: "",
    location: "",
    inspectedAt: new Date().toISOString().split("T")[0],
    inspectionTimeH: "",
    inspectionTimeM: "",
    inspectionTimeAmPm: "AM",
    inspector: "",
    peoplePresent: [] as string[],
    buyersAgent: "",
    buildingOccupied: "Yes",
    weatherCondition: "",
    weatherTemp: "",
    weatherSoil: "",
    cleanoutLocation: "",
    pipeMaterials: [] as string[],
    videoLinks: ["", "", "", ""],
    cameraDirection1: "",
    cameraDirection2: "",
    pipingNotes: "",
    notes: "",
  });

  const [corrections, setCorrections] = useState<Record<string, string>>(
    Object.fromEntries(correctiveActions.map((a) => [a.label, "N/A"])),
  );
  const [endOfReport, setEndOfReport] = useState<Record<string, string>>({});
  const [correctionNotes, setCorrectionNotes] = useState("");
  const [propertyPhotos, setPropertyPhotos] = useState<string[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [templateSettings, setTemplateSettings] = useState<Partial<Template>>(
    defaultTemplateSettings,
  );
  const [templateDropdownResponses, setTemplateDropdownResponses] = useState<
    Record<string, string>
  >({});

  // Auth check
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUid(u.uid);
      else router.replace("/login");
    });
    return () => unsub();
  }, []);

  // Fetch templates
  useEffect(() => {
    if (!uid) return;
    const fetchTemplates = async () => {
      try {
        const local = localStorage.getItem("sewer_templates");
        if (local) setTemplates(JSON.parse(local));
      } catch {}
      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch("/api/template", {
          headers: { "x-user-id": uid, Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.templates?.length) {
            setTemplates(data.templates);
            localStorage.setItem(
              "sewer_templates",
              JSON.stringify(data.templates),
            );
          }
        }
      } catch {}
    };
    fetchTemplates();
  }, [uid]);

  // Load edit data
  useEffect(() => {
    if (!editId || !uid) return;
    const loadEdit = async () => {
      try {
        const res = await fetch(`/api/reports/${editId}`, {
          headers: { "x-user-id": uid },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.title) setTitle(data.title);
          if (data.status) setReportStatus(data.status);
          if (data.report) setDetails((p) => ({ ...p, ...data.report }));
          if (data.defects) setDefects(data.defects);
          if (data.report?.corrections) setCorrections(data.report.corrections);
          if (data.report?.correctionNotes)
            setCorrectionNotes(data.report.correctionNotes);
          if (data.report?.propertyPhotos)
            setPropertyPhotos(data.report.propertyPhotos);
          if (data.report?.endOfReport) setEndOfReport(data.report.endOfReport);
          if (data.report?.templateId)
            setSelectedTemplateId(data.report.templateId);
          if (data.report?.templateDropdownResponses)
            setTemplateDropdownResponses(data.report.templateDropdownResponses);
          setTemplateSettings((p) => ({
            ...p,
            companyName: data.report?.companyName ?? p.companyName,
            companyTagline: data.report?.companyTagline ?? p.companyTagline,
            companyLogo: data.report?.companyLogo ?? p.companyLogo,
            statementOfService:
              data.report?.statementOfService ?? p.statementOfService,
            includeDefectGraphic:
              data.report?.includeDefectGraphic ?? p.includeDefectGraphic,
            showSuggestedMaintenance:
              data.report?.showSuggestedMaintenance ??
              p.showSuggestedMaintenance,
            customDropdowns:
              data.report?.customDropdowns ?? p.customDropdowns ?? [],
          }));
          return;
        }
      } catch {}
      const local = localStorage.getItem(`report_edit_${editId}`);
      if (local) {
        const data = JSON.parse(local);
        if (data.title) setTitle(data.title);
        if (data.status) setReportStatus(data.status);
        if (data.report) setDetails((p) => ({ ...p, ...data.report }));
        if (data.defects) setDefects(data.defects);
      }
    };
    loadEdit();
  }, [editId, uid]);

  const buildPayload = (overrideStatus?: "DRAFT" | "COMPLETE") => {
    const id = editId || Date.now().toString();
    const report = {
      ...details,
      id,
      title,
      status: overrideStatus ?? reportStatus,
      templateId: selectedTemplateId || undefined,
      templateName:
        templates.find((t) => t.id === selectedTemplateId)?.name || undefined,
      companyName: templateSettings.companyName,
      companyTagline: templateSettings.companyTagline,
      companyLogo: templateSettings.companyLogo,
      statementOfService: templateSettings.statementOfService,
      includeDefectGraphic: templateSettings.includeDefectGraphic,
      showSuggestedMaintenance: templateSettings.showSuggestedMaintenance,
      customDropdowns: templateSettings.customDropdowns ?? [],
      templateDropdownResponses,
      propertyPhotos,
      corrections,
      correctionNotes,
      endOfReport,
      inspectionTime: `${details.inspectionTimeH || "--"}:${details.inspectionTimeM || "--"} ${details.inspectionTimeAmPm}`,
      weather: [
        details.weatherCondition,
        details.weatherTemp,
        details.weatherSoil,
      ]
        .filter(Boolean)
        .join(", "),
      videoLinks: details.videoLinks.filter((l) => l.trim() !== ""),
    };
    return { report, defects };
  };

  const handleSaveDraft = async (overrideStatus?: "DRAFT" | "COMPLETE") => {
    if (!uid) return;
    setSaving(true);
    try {
      const payload = buildPayload(overrideStatus);
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": uid },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const saved = await res.json();
        localStorage.setItem(`report_${saved.id}`, JSON.stringify(payload));
        const existing = JSON.parse(
          localStorage.getItem("sewer_reports") || "[]",
        );
        const updated = [
          payload.report,
          ...existing.filter((r: any) => r.id !== saved.id),
        ];
        localStorage.setItem("sewer_reports", JSON.stringify(updated));
        if (overrideStatus === "COMPLETE") {
          setReportStatus("COMPLETE");
          setSavedMsg("✓ Marked Complete");
        } else {
          setSavedMsg("✓ Saved");
        }
        setTimeout(() => setSavedMsg(""), 2500);
      } else {
        setSavedMsg("Save failed");
        setTimeout(() => setSavedMsg(""), 2500);
      }
    } catch {
      setSavedMsg("Save failed");
      setTimeout(() => setSavedMsg(""), 2500);
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePDF = async () => {
    setGenerating(true);
    try {
      const payload = buildPayload();
      if (uid) {
        await fetch("/api/reports", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-user-id": uid },
          body: JSON.stringify(payload),
        });
      }
      const res = await fetch("/api/reports/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report: {
            ...details,
            title,
            propertyPhotos,
            corrections,
            correctionNotes,
            endOfReport,
            inspectionTime: `${details.inspectionTimeH || "--"}:${details.inspectionTimeM || "--"} ${details.inspectionTimeAmPm}`,
            weather: [
              details.weatherCondition,
              details.weatherTemp,
              details.weatherSoil,
            ]
              .filter(Boolean)
              .join(", "),
            peoplePresent: details.peoplePresent.join(", "),
            videoLinks: details.videoLinks.filter((l) => l.trim() !== ""),
          },
          defects,
        }),
      });

      if (!res.ok) {
        alert("Failed to generate PDF. Please try again.");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const tab = window.open(url, "_blank");
      if (tab) {
        tab.onload = () => setTimeout(() => tab.print(), 500);
      }
      setTimeout(() => URL.revokeObjectURL(url), 120_000);
    } catch {
      alert("Failed to generate PDF.");
    } finally {
      setGenerating(false);
    }
  };

  const updateDetail = (k: string, v: string) =>
    setDetails((p) => ({ ...p, [k]: v }));

  const togglePerson = (p: string) =>
    setDetails((d) => ({
      ...d,
      peoplePresent: d.peoplePresent.includes(p)
        ? d.peoplePresent.filter((x) => x !== p)
        : [...d.peoplePresent, p],
    }));

  const toggleMaterial = (m: string) =>
    setDetails((d) => ({
      ...d,
      pipeMaterials: d.pipeMaterials.includes(m)
        ? d.pipeMaterials.filter((x) => x !== m)
        : [...d.pipeMaterials, m],
    }));

  const updateVideoLink = (i: number, v: string) => {
    const links = [...details.videoLinks];
    links[i] = v;
    setDetails((p) => ({ ...p, videoLinks: links }));
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (!templateId) {
      setTemplateSettings(defaultTemplateSettings);
      setTemplateDropdownResponses({});
      return;
    }
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setTemplateSettings({ ...template });
      setTemplateDropdownResponses({});
    }
  };

  const addDefect = () => {
    setDefects((p) => [
      ...p,
      {
        id: Date.now().toString(),
        videoTimeH: "",
        videoTimeM: "",
        footageStart: "",
        conditionType: "Select Condition Type",
        severity: "Minor",
        narrative: "",
        images: [],
        expanded: true,
      },
    ]);
    setActiveTab("conditions");
  };

  const updateDefect = (id: string, k: string, v: string) =>
    setDefects((p) => p.map((d) => (d.id === id ? { ...d, [k]: v } : d)));

  const toggleExpand = (id: string) =>
    setDefects((p) =>
      p.map((d) => (d.id === id ? { ...d, expanded: !d.expanded } : d)),
    );

  const deleteDefect = (id: string) =>
    setDefects((p) => p.filter((d) => d.id !== id));

  const handleImageUpload = (defectId: string, files: FileList | null) => {
    if (!files) return;
    const defect = defects.find((d) => d.id === defectId);
    if (!defect) return;
    const remaining = 6 - defect.images.length;
    Array.from(files)
      .slice(0, remaining)
      .forEach((f) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const url = e.target?.result as string;
          setDefects((p) =>
            p.map((d) =>
              d.id === defectId
                ? {
                    ...d,
                    images: [
                      ...d.images,
                      {
                        id: Date.now().toString() + Math.random(),
                        url,
                        name: f.name,
                      },
                    ],
                  }
                : d,
            ),
          );
        };
        reader.readAsDataURL(f);
      });
  };

  const removeImage = (defectId: string, imageId: string) =>
    setDefects((p) =>
      p.map((d) =>
        d.id === defectId
          ? { ...d, images: d.images.filter((i) => i.id !== imageId) }
          : d,
      ),
    );

  const handlePropertyPhotos = (files: FileList | null) => {
    if (!files) return;
    Array.from(files)
      .slice(0, 1)
      .forEach((f) => {
        const reader = new FileReader();
        reader.onload = (e) => setPropertyPhotos([e.target?.result as string]);
        reader.readAsDataURL(f);
      });
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 14px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    background: active ? "#0F2A4A" : "transparent",
    color: active ? "#fff" : "#64748B",
    border: "none",
  });

  const customDropdowns: CustomDropdown[] =
    templateSettings.customDropdowns ?? [];

  return (
    <div
      style={{
        fontFamily: "Inter, sans-serif",
        background: "#F8FAFC",
        minHeight: "100vh",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #E2E8F0",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a
            href="/reports"
            style={{
              color: "#64748B",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            ← Reports
          </a>
          <span style={{ color: "#E2E8F0" }}>|</span>
          {editingTitle ? (
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              style={{
                ...inp,
                width: "280px",
                fontWeight: 600,
                fontSize: "15px",
              }}
            />
          ) : (
            <span
              onClick={() => setEditingTitle(true)}
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: "#0F2A4A",
                cursor: "pointer",
              }}
            >
              {title} ✏️
            </span>
          )}
          <span
            style={{
              background: reportStatus === "COMPLETE" ? "#F0FDF4" : "#F1F5F9",
              color: reportStatus === "COMPLETE" ? "#16A34A" : "#64748B",
              fontSize: "11px",
              fontWeight: 600,
              padding: "3px 8px",
              borderRadius: "20px",
              border:
                reportStatus === "COMPLETE" ? "1px solid #BBF7D0" : "none",
            }}
          >
            {reportStatus === "COMPLETE" ? "✓ COMPLETE" : "DRAFT"}
          </span>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {savedMsg && (
            <span
              style={{ fontSize: "13px", color: "#16A34A", fontWeight: 600 }}
            >
              {savedMsg}
            </span>
          )}
          {reportStatus !== "COMPLETE" && (
            <button
              onClick={() => handleSaveDraft("COMPLETE")}
              disabled={saving}
              style={{
                background: saving ? "#94A3B8" : "#2D8C4E",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "8px 18px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              ✅ Mark Complete
            </button>
          )}
          <button
            onClick={() => handleSaveDraft("DRAFT")}
            disabled={saving}
            style={{
              background: saving ? "#94A3B8" : "#0F2A4A",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "8px 18px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : "💾 Save Draft"}
          </button>
          <button
            onClick={handleGeneratePDF}
            disabled={generating}
            style={{
              background: generating ? "#94A3B8" : "#1D4ED8",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "8px 18px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: generating ? "not-allowed" : "pointer",
            }}
          >
            {generating ? "Generating..." : "📄 Generate PDF"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #E2E8F0",
          padding: "8px 24px",
          display: "flex",
          gap: "6px",
          flexWrap: "wrap",
        }}
      >
        <button
          style={tabStyle(activeTab === "details")}
          onClick={() => setActiveTab("details")}
        >
          📋 Client & Site Info
        </button>
        <button
          style={tabStyle(activeTab === "system")}
          onClick={() => setActiveTab("system")}
        >
          🔧 Sewer System Info
        </button>
        <button
          style={tabStyle(activeTab === "conditions")}
          onClick={() => setActiveTab("conditions")}
        >
          🔍 Pipe Conditions {defects.length > 0 && `(${defects.length})`}
        </button>
        <button
          style={tabStyle(activeTab === "recommendations")}
          onClick={() => setActiveTab("recommendations")}
        >
          📝 End of Report
        </button>
      </div>

      <div style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}>
        {/* TAB 1 — Client & Site Info */}
        {activeTab === "details" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={card}>
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#0F2A4A",
                    margin: "0 0 14px",
                  }}
                >
                  Report Template
                </h3>
                <label style={lbl}>Select Template</label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleSelectTemplate(e.target.value)}
                  style={{ ...inp, width: "100%" }}
                >
                  <option value="">Default layout</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#94A3B8",
                    marginTop: "10px",
                  }}
                >
                  Apply a saved template to prefill company branding,
                  statements, and custom dropdown options.
                </p>
              </div>
            </div>

            <div>
              <div style={card}>
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#0F2A4A",
                    margin: "0 0 14px",
                  }}
                >
                  File & Client Information
                </h3>
                {[
                  {
                    label: "File Number",
                    key: "fileNumber",
                    placeholder: "McNeil/1590",
                  },
                  {
                    label: "Client Name",
                    key: "clientName",
                    placeholder: "Justin McNeil",
                  },
                  {
                    label: "Property Address",
                    key: "location",
                    placeholder: "1590 Main St, Las Vegas NV",
                  },
                  {
                    label: "Buyer's Agent",
                    key: "buyersAgent",
                    placeholder: "Agent name",
                  },
                  {
                    label: "Inspector Name",
                    key: "inspector",
                    placeholder: "Full name",
                  },
                ].map(({ label, key, placeholder }) => (
                  <div key={key} style={{ marginBottom: "12px" }}>
                    <label style={lbl}>{label}</label>
                    <input
                      type="text"
                      value={(details as any)[key]}
                      onChange={(e) => updateDetail(key, e.target.value)}
                      placeholder={placeholder}
                      style={{ ...inp, width: "100%" }}
                    />
                  </div>
                ))}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                    marginBottom: "12px",
                  }}
                >
                  <div>
                    <label style={lbl}>Inspection Date</label>
                    <input
                      type="date"
                      value={details.inspectedAt}
                      onChange={(e) =>
                        updateDetail("inspectedAt", e.target.value)
                      }
                      style={{ ...inp, width: "100%" }}
                    />
                  </div>
                  <div>
                    <label style={lbl}>Time</label>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <input
                        maxLength={2}
                        value={details.inspectionTimeH}
                        onChange={(e) =>
                          updateDetail(
                            "inspectionTimeH",
                            e.target.value.replace(/\D/g, "").slice(0, 2),
                          )
                        }
                        onKeyUp={(e) => {
                          if ((e.target as HTMLInputElement).value.length === 2)
                            (
                              document.getElementById("tbm") as HTMLInputElement
                            )?.focus();
                        }}
                        placeholder="HH"
                        style={{
                          ...inp,
                          width: "42px",
                          textAlign: "center",
                          padding: "0 4px",
                        }}
                      />
                      <span style={{ fontWeight: 700, color: "#64748B" }}>
                        :
                      </span>
                      <input
                        id="tbm"
                        maxLength={2}
                        value={details.inspectionTimeM}
                        onChange={(e) =>
                          updateDetail(
                            "inspectionTimeM",
                            e.target.value.replace(/\D/g, "").slice(0, 2),
                          )
                        }
                        placeholder="MM"
                        style={{
                          ...inp,
                          width: "42px",
                          textAlign: "center",
                          padding: "0 4px",
                        }}
                      />
                      {["AM", "PM"].map((x) => (
                        <button
                          key={x}
                          type="button"
                          onClick={() => updateDetail("inspectionTimeAmPm", x)}
                          style={{
                            padding: "4px 8px",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: 600,
                            cursor: "pointer",
                            border: "none",
                            background:
                              details.inspectionTimeAmPm === x
                                ? "#0F2A4A"
                                : "#F1F5F9",
                            color:
                              details.inspectionTimeAmPm === x
                                ? "#fff"
                                : "#64748B",
                          }}
                        >
                          {x}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={lbl}>Building Occupied</label>
                  <select
                    value={details.buildingOccupied}
                    onChange={(e) =>
                      updateDetail("buildingOccupied", e.target.value)
                    }
                    style={{ ...inp, width: "100%" }}
                  >
                    <option>Yes</option>
                    <option>No</option>
                    <option>Unknown</option>
                  </select>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={lbl}>People Present</label>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "6px",
                      marginBottom: "6px",
                    }}
                  >
                    {peopleOptions.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePerson(p)}
                        style={{
                          padding: "5px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                          border: "none",
                          background: details.peoplePresent.includes(p)
                            ? "#0F2A4A"
                            : "#F1F5F9",
                          color: details.peoplePresent.includes(p)
                            ? "#fff"
                            : "#64748B",
                        }}
                      >
                        {details.peoplePresent.includes(p) ? "✓ " : ""}
                        {p}
                      </button>
                    ))}
                  </div>
                  {details.peoplePresent.length > 0 && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#2D8C4E",
                        fontWeight: 500,
                      }}
                    >
                      ✓ {details.peoplePresent.join(", ")}
                    </div>
                  )}
                </div>

                <div>
                  <label style={lbl}>Weather / Soil Conditions</label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <div>
                      <label style={{ ...lbl, fontSize: "10px" }}>
                        Condition
                      </label>
                      <select
                        value={details.weatherCondition}
                        onChange={(e) =>
                          updateDetail("weatherCondition", e.target.value)
                        }
                        style={{ ...inp, width: "100%" }}
                      >
                        <option value="">Select...</option>
                        {weatherOptions.map((w) => (
                          <option key={w}>{w}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ ...lbl, fontSize: "10px" }}>
                        Temperature
                      </label>
                      <select
                        value={details.weatherTemp}
                        onChange={(e) =>
                          updateDetail("weatherTemp", e.target.value)
                        }
                        style={{ ...inp, width: "100%" }}
                      >
                        <option value="">Select...</option>
                        {tempOptions.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ ...lbl, fontSize: "10px" }}>
                      Soil Condition
                    </label>
                    <select
                      value={details.weatherSoil}
                      onChange={(e) =>
                        updateDetail("weatherSoil", e.target.value)
                      }
                      style={{ ...inp, width: "100%" }}
                    >
                      <option value="">Select...</option>
                      {soilOptions.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div style={card}>
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#0F2A4A",
                    margin: "0 0 4px",
                  }}
                >
                  Cover Photo
                </h3>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#94A3B8",
                    marginBottom: "12px",
                  }}
                >
                  1 photo — centered on PDF cover page
                </p>
                {propertyPhotos.length === 0 ? (
                  <div
                    onClick={() => {
                      const i = document.createElement("input");
                      i.type = "file";
                      i.accept = "image/*";
                      i.onchange = (e) =>
                        handlePropertyPhotos(
                          (e.target as HTMLInputElement).files,
                        );
                      i.click();
                    }}
                    style={{
                      border: "2px dashed #E2E8F0",
                      borderRadius: "8px",
                      padding: "32px",
                      textAlign: "center",
                      cursor: "pointer",
                      background: "#F8FAFC",
                    }}
                  >
                    <div style={{ fontSize: "32px", marginBottom: "8px" }}>
                      🏠
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#64748B",
                        fontWeight: 500,
                      }}
                    >
                      Click to upload cover photo
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#94A3B8",
                        marginTop: "4px",
                      }}
                    >
                      1 photo only
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      position: "relative",
                      borderRadius: "8px",
                      overflow: "hidden",
                      aspectRatio: "16/9",
                    }}
                  >
                    <img
                      src={propertyPhotos[0]}
                      alt="Cover"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    <button
                      onClick={() => setPropertyPhotos([])}
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        background: "#DC2626",
                        color: "#fff",
                        border: "none",
                        borderRadius: "50%",
                        width: "24px",
                        height: "24px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: 700,
                      }}
                    >
                      ×
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
                  General Notes
                </h3>
                <textarea
                  value={details.notes}
                  onChange={(e) => updateDetail("notes", e.target.value)}
                  placeholder="Add general notes about the inspection..."
                  rows={5}
                  style={{
                    ...inp,
                    width: "100%",
                    height: "auto",
                    padding: "10px 12px",
                    resize: "vertical",
                    lineHeight: "1.6",
                  }}
                />
                {customDropdowns.length > 0 && (
                  <div style={{ marginTop: "16px" }}>
                    <h4
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#334155",
                        marginBottom: "10px",
                      }}
                    >
                      Custom Template Fields
                    </h4>
                    {customDropdowns.map((dropdown) => (
                      <div
                        key={dropdown.label}
                        style={{ marginBottom: "12px" }}
                      >
                        <label style={lbl}>{dropdown.label}</label>
                        <select
                          value={
                            templateDropdownResponses[dropdown.label] || ""
                          }
                          onChange={(e) =>
                            setTemplateDropdownResponses((prev) => ({
                              ...prev,
                              [dropdown.label]: e.target.value,
                            }))
                          }
                          style={{ ...inp, width: "100%" }}
                        >
                          <option value="">Select a response</option>
                          {dropdown.options.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2 — Sewer System Info */}
        {activeTab === "system" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            <div>
              <div style={card}>
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#0F2A4A",
                    margin: "0 0 14px",
                  }}
                >
                  Sewer System Details
                </h3>
                <div style={{ marginBottom: "14px" }}>
                  <label style={lbl}>Cleanout Location</label>
                  <textarea
                    value={details.cleanoutLocation}
                    onChange={(e) =>
                      updateDetail("cleanoutLocation", e.target.value)
                    }
                    placeholder="e.g. Located at front side of structure, left to main entry."
                    rows={3}
                    style={{
                      ...inp,
                      width: "100%",
                      height: "auto",
                      padding: "10px 12px",
                      resize: "vertical",
                      lineHeight: "1.6",
                    }}
                  />
                </div>
                <div>
                  <label style={lbl}>Sewer Video Links (up to 4)</label>
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} style={{ marginBottom: "8px" }}>
                      <label
                        style={{
                          ...lbl,
                          fontSize: "10px",
                          marginBottom: "3px",
                        }}
                      >
                        Link {i + 1}
                      </label>
                      <input
                        type="text"
                        value={details.videoLinks[i]}
                        onChange={(e) => updateVideoLink(i, e.target.value)}
                        placeholder="https://youtu.be/..."
                        style={{ ...inp, width: "100%" }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div style={card}>
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#0F2A4A",
                    margin: "0 0 8px",
                  }}
                >
                  Piping Section
                </h3>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#64748B",
                    marginBottom: "14px",
                  }}
                >
                  Describe camera direction(s) during inspection
                </p>
                <div style={{ marginBottom: "10px" }}>
                  <label style={lbl}>1st Camera Direction</label>
                  <input
                    type="text"
                    value={details.cameraDirection1}
                    onChange={(e) =>
                      updateDetail("cameraDirection1", e.target.value)
                    }
                    placeholder="e.g. approx. time 0 - 18 min towards Clean-out to City Connection"
                    style={{ ...inp, width: "100%" }}
                  />
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <label style={lbl}>2nd Camera Direction (optional)</label>
                  <input
                    type="text"
                    value={details.cameraDirection2}
                    onChange={(e) =>
                      updateDetail("cameraDirection2", e.target.value)
                    }
                    placeholder="e.g. approx. time 19 - 26 min towards building's drain system"
                    style={{ ...inp, width: "100%" }}
                  />
                </div>
                <div>
                  <label style={lbl}>Additional Piping Notes</label>
                  <textarea
                    value={details.pipingNotes}
                    onChange={(e) =>
                      updateDetail("pipingNotes", e.target.value)
                    }
                    placeholder="Any additional notes about the piping..."
                    rows={2}
                    style={{
                      ...inp,
                      width: "100%",
                      height: "auto",
                      padding: "10px 12px",
                      resize: "vertical",
                      lineHeight: "1.6",
                    }}
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
                  margin: "0 0 14px",
                }}
              >
                Pipe Materials Found
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {pipeMaterials.map((material) => (
                  <button
                    key={material}
                    type="button"
                    onClick={() => toggleMaterial(material)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: "none",
                      background: details.pipeMaterials.includes(material)
                        ? "#0F2A4A"
                        : "#F1F5F9",
                      color: details.pipeMaterials.includes(material)
                        ? "#fff"
                        : "#64748B",
                    }}
                  >
                    {details.pipeMaterials.includes(material) ? "✓ " : ""}
                    {material}
                  </button>
                ))}
              </div>
              {details.pipeMaterials.length > 0 && (
                <div
                  style={{
                    marginTop: "12px",
                    padding: "10px",
                    background: "#F8FAFC",
                    borderRadius: "8px",
                    fontSize: "13px",
                    color: "#0F2A4A",
                  }}
                >
                  <strong>Selected:</strong> {details.pipeMaterials.join(", ")}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3 — Pipe Conditions */}
        {activeTab === "conditions" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
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
                Pipe Conditions {defects.length > 0 && `(${defects.length})`}
              </h2>
              <button
                type="button"
                onClick={addDefect}
                style={{
                  background: "#2D8C4E",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                + Add Condition
              </button>
            </div>

            {defects.length === 0 && (
              <div
                style={{
                  background: "#fff",
                  border: "2px dashed #E2E8F0",
                  borderRadius: "12px",
                  padding: "48px 24px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔍</div>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#0F2A4A",
                    marginBottom: "6px",
                  }}
                >
                  No conditions added yet
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#94A3B8",
                    marginBottom: "20px",
                  }}
                >
                  Add conditions observed during the inspection
                </div>
                <button
                  type="button"
                  onClick={addDefect}
                  style={{
                    background: "#2D8C4E",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 20px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Add First Condition
                </button>
              </div>
            )}

            {defects.map((defect, index) => (
              <div
                key={defect.id}
                style={{
                  background: "#fff",
                  border: `1px solid ${severityConfig[defect.severity]?.color || "#E2E8F0"}`,
                  borderRadius: "12px",
                  marginBottom: "16px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 16px",
                    borderBottom: defect.expanded
                      ? "1px solid #F1F5F9"
                      : "none",
                    background:
                      severityConfig[defect.severity]?.bg || "#FAFAFA",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#0F2A4A",
                      minWidth: "28px",
                    }}
                  >
                    #{index + 1}
                  </span>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#94A3B8",
                        fontWeight: 600,
                      }}
                    >
                      @
                    </span>
                    <input
                      maxLength={2}
                      value={defect.videoTimeH}
                      onChange={(e) =>
                        updateDefect(
                          defect.id,
                          "videoTimeH",
                          e.target.value.replace(/\D/g, "").slice(0, 2),
                        )
                      }
                      onKeyUp={(e) => {
                        if ((e.target as HTMLInputElement).value.length === 2)
                          document.getElementById(`dm-${defect.id}`)?.focus();
                      }}
                      placeholder="MM"
                      style={{
                        ...inp,
                        width: "36px",
                        textAlign: "center",
                        padding: "0 4px",
                      }}
                    />
                    <span style={{ fontWeight: 700, color: "#64748B" }}>:</span>
                    <input
                      id={`dm-${defect.id}`}
                      maxLength={2}
                      value={defect.videoTimeM}
                      onChange={(e) =>
                        updateDefect(
                          defect.id,
                          "videoTimeM",
                          e.target.value.replace(/\D/g, "").slice(0, 2),
                        )
                      }
                      placeholder="SS"
                      style={{
                        ...inp,
                        width: "36px",
                        textAlign: "center",
                        padding: "0 4px",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                    }}
                  >
                    <input
                      value={defect.footageStart}
                      onChange={(e) =>
                        updateDefect(defect.id, "footageStart", e.target.value)
                      }
                      placeholder="ft"
                      style={{ ...inp, width: "52px", textAlign: "center" }}
                    />
                    <span style={{ fontSize: "11px", color: "#94A3B8" }}>
                      ft
                    </span>
                  </div>

                  <select
                    value={defect.conditionType}
                    onChange={(e) =>
                      updateDefect(defect.id, "conditionType", e.target.value)
                    }
                    style={{ ...inp, flex: 1, minWidth: "180px" }}
                  >
                    {conditionTypes.map((ct) => (
                      <option key={ct} value={ct}>
                        {ct}
                      </option>
                    ))}
                  </select>

                  <select
                    value={defect.severity}
                    onChange={(e) =>
                      updateDefect(defect.id, "severity", e.target.value)
                    }
                    style={{
                      ...inp,
                      width: "170px",
                      flex: "none",
                      background:
                        severityConfig[defect.severity]?.bg || "#F1F5F9",
                      color:
                        severityConfig[defect.severity]?.color || "#64748B",
                      fontWeight: 600,
                    }}
                  >
                    {Object.keys(severityConfig).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => toggleExpand(defect.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "#64748B",
                    }}
                  >
                    {defect.expanded ? "▲" : "▼"}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteDefect(defect.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "#DC2626",
                    }}
                  >
                    🗑
                  </button>
                </div>

                {defect.expanded && (
                  <div style={{ padding: "16px" }}>
                    <div style={{ marginBottom: "14px" }}>
                      <label style={lbl}>Detailed Narrative</label>
                      <textarea
                        value={defect.narrative}
                        onChange={(e) =>
                          updateDefect(defect.id, "narrative", e.target.value)
                        }
                        placeholder="e.g. Root intrusion observed at joint. Hydro jetting recommended."
                        rows={3}
                        style={{
                          ...inp,
                          width: "100%",
                          height: "auto",
                          padding: "10px 12px",
                          resize: "vertical",
                          lineHeight: "1.6",
                        }}
                      />
                    </div>

                    <label style={lbl}>Photos ({defect.images.length}/6)</label>
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(defect.id);
                      }}
                      onDragLeave={() => setDragOver(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(null);
                        handleImageUpload(defect.id, e.dataTransfer.files);
                      }}
                      onClick={() => {
                        if (defect.images.length >= 6) return;
                        const i = document.createElement("input");
                        i.type = "file";
                        i.accept = "image/*";
                        i.multiple = true;
                        i.onchange = (e) =>
                          handleImageUpload(
                            defect.id,
                            (e.target as HTMLInputElement).files,
                          );
                        i.click();
                      }}
                      style={{
                        border: `2px dashed ${dragOver === defect.id ? "#2D8C4E" : "#E2E8F0"}`,
                        borderRadius: "8px",
                        padding: "14px",
                        textAlign: "center",
                        background:
                          dragOver === defect.id ? "#F0FDF4" : "#F8FAFC",
                        marginBottom: "10px",
                        cursor:
                          defect.images.length >= 6 ? "not-allowed" : "pointer",
                      }}
                    >
                      <div style={{ fontSize: "18px", marginBottom: "4px" }}>
                        📸
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748B" }}>
                        {defect.images.length >= 6
                          ? "Maximum 6 photos reached"
                          : "Drag & drop or click to upload"}
                      </div>
                    </div>

                    {defect.images.length > 0 && (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3, 1fr)",
                          gap: "8px",
                        }}
                      >
                        {defect.images.map((img, imgIndex) => (
                          <div
                            key={img.id}
                            style={{
                              position: "relative",
                              borderRadius: "8px",
                              overflow: "hidden",
                              aspectRatio: "4/3",
                            }}
                          >
                            <img
                              src={img.url}
                              alt={img.name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                            <div
                              style={{
                                position: "absolute",
                                top: "4px",
                                left: "4px",
                                background: "rgba(0,0,0,0.7)",
                                color: "#fff",
                                fontSize: "10px",
                                fontWeight: 700,
                                padding: "2px 6px",
                                borderRadius: "4px",
                              }}
                            >
                              {imgIndex + 1}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeImage(defect.id, img.id)}
                              style={{
                                position: "absolute",
                                top: "4px",
                                right: "4px",
                                background: "#DC2626",
                                color: "#fff",
                                border: "none",
                                borderRadius: "50%",
                                width: "20px",
                                height: "20px",
                                cursor: "pointer",
                                fontSize: "12px",
                                fontWeight: 700,
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {defects.length > 0 && (
              <button
                type="button"
                onClick={addDefect}
                style={{
                  width: "100%",
                  padding: "14px",
                  border: "2px dashed #E2E8F0",
                  borderRadius: "12px",
                  background: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#64748B",
                  fontWeight: 500,
                }}
              >
                + Add Another Condition
              </button>
            )}
          </div>
        )}

        {/* TAB 4 — End of Report */}
        {activeTab === "recommendations" && (
          <div>
            <div style={card}>
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#0F2A4A",
                  margin: "0 0 4px",
                }}
              >
                Corrective Action Recommendations
              </h3>
              <p
                style={{
                  fontSize: "12px",
                  color: "#64748B",
                  marginBottom: "16px",
                }}
              >
                Select recommended corrective actions for each category
              </p>
              {correctiveActions.map((action) => (
                <div key={action.label} style={{ marginBottom: "14px" }}>
                  <label style={lbl}>{action.label}</label>
                  <select
                    value={corrections[action.label] || "N/A"}
                    onChange={(e) =>
                      setCorrections((p) => ({
                        ...p,
                        [action.label]: e.target.value,
                      }))
                    }
                    style={{ ...inp, width: "100%" }}
                  >
                    {action.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              <div style={{ marginTop: "16px" }}>
                <label style={lbl}>Additional Recommendations / Notes</label>
                <textarea
                  value={correctionNotes}
                  onChange={(e) => setCorrectionNotes(e.target.value)}
                  placeholder="e.g. Hydro jet recommended. Cast iron line needs to be replaced or lined..."
                  rows={4}
                  style={{
                    ...inp,
                    width: "100%",
                    height: "auto",
                    padding: "10px 12px",
                    resize: "vertical",
                    lineHeight: "1.6",
                  }}
                />
              </div>
            </div>

            <div style={card}>
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#0F2A4A",
                  margin: "0 0 4px",
                }}
              >
                End of Report Summary
              </h3>
              <p
                style={{
                  fontSize: "12px",
                  color: "#64748B",
                  marginBottom: "16px",
                }}
              >
                Select standard statements to include at the end of the report
              </p>
              {endOfReportOptions.map(({ label, key, options }) => (
                <div key={key} style={{ marginBottom: "16px" }}>
                  <label style={lbl}>{label}</label>
                  <select
                    value={endOfReport[key] || "Select..."}
                    onChange={(e) =>
                      setEndOfReport((p) => ({ ...p, [key]: e.target.value }))
                    }
                    style={{
                      ...inp,
                      width: "100%",
                      height: "auto",
                      padding: "10px 12px",
                    }}
                  >
                    {options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt.length > 80 ? opt.slice(0, 80) + "..." : opt}
                      </option>
                    ))}
                  </select>
                  {endOfReport[key] && endOfReport[key] !== "Select..." && (
                    <div
                      style={{
                        marginTop: "6px",
                        padding: "10px 12px",
                        background: "#F0FDF4",
                        borderRadius: "6px",
                        fontSize: "12px",
                        color: "#166534",
                        lineHeight: "1.6",
                        border: "1px solid #BBF7D0",
                      }}
                    >
                      {endOfReport[key]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
