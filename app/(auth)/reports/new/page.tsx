"use client";
import { useState } from "react";

type DefectImage = { id: string; url: string; name: string };
type Defect = {
  id: string;
  videoTimeH: string;
  videoTimeM: string;
  footageStart: string;
  footageEnd: string;
  conditionType: string;
  severity: string;
  narrative: string;
  images: DefectImage[];
  expanded: boolean;
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
      "Hydro Jet",
      "Cable Cut",
      "Mechanical Root Cutter",
      "Chemical Treatment",
      "N/A",
    ],
  },
  {
    label: "Pipe Repair",
    options: [
      "Spot Repair",
      "CIPP Liner",
      "Full Replacement",
      "Pipe Bursting",
      "N/A",
    ],
  },
  {
    label: "Joint Repair",
    options: [
      "Chemical Grouting",
      "Internal Seal",
      "Spot Liner",
      "Full Replacement",
      "N/A",
    ],
  },
  {
    label: "Cleaning",
    options: ["Hydro Jet", "Mechanical Clean", "Chemical Clean", "N/A"],
  },
  {
    label: "Further Investigation",
    options: [
      "Re-inspect After Cleaning",
      "Excavation",
      "Smoke Test",
      "Dye Test",
      "N/A",
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

export default function ReportBuilder() {
  const [title, setTitle] = useState("New Inspection Report");
  const [editingTitle, setEditingTitle] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "details" | "system" | "conditions" | "recommendations"
  >("details");

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
  const [correctionNotes, setCorrectionNotes] = useState("");

  const [propertyPhotos, setPropertyPhotos] = useState<string[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const updateDetail = (k: string, v: string) =>
    setDetails((p) => ({ ...p, [k]: v }));

  const togglePerson = (person: string) => {
    setDetails((p) => ({
      ...p,
      peoplePresent: p.peoplePresent.includes(person)
        ? p.peoplePresent.filter((x) => x !== person)
        : [...p.peoplePresent, person],
    }));
  };

  const toggleMaterial = (material: string) => {
    setDetails((p) => ({
      ...p,
      pipeMaterials: p.pipeMaterials.includes(material)
        ? p.pipeMaterials.filter((m) => m !== material)
        : [...p.pipeMaterials, material],
    }));
  };

  const updateVideoLink = (index: number, value: string) => {
    const links = [...details.videoLinks];
    links[index] = value;
    setDetails((p) => ({ ...p, videoLinks: links }));
  };

  const addDefect = () => {
    setDefects((p) => [
      ...p,
      {
        id: Date.now().toString(),
        videoTimeH: "",
        videoTimeM: "",
        footageStart: "",
        footageEnd: "",
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
    const toAdd = Array.from(files).slice(0, remaining);
    toAdd.forEach((f) => {
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
    const remaining = 3 - propertyPhotos.length;
    const toAdd = Array.from(files).slice(0, remaining);
    toAdd.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (e) =>
        setPropertyPhotos((p) => [...p, e.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const handleGeneratePDF = async () => {
    setGenerating(true);
    try {
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
      const html = await res.text();
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(html);
        win.document.close();
        setTimeout(() => win.print(), 800);
      }
    } catch {
      alert("Failed to generate PDF.");
    } finally {
      setGenerating(false);
    }
  };

  const inp = {
    height: "36px",
    borderRadius: "6px",
    border: "1px solid #E2E8F0",
    padding: "0 10px",
    fontSize: "13px",
    color: "#0F172A",
    outline: "none",
    boxSizing: "border-box" as const,
    background: "#F8FAFC",
  };

  const lbl = {
    display: "block",
    fontSize: "11px",
    fontWeight: 600 as const,
    color: "#64748B",
    marginBottom: "4px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
  };

  const tab = (active: boolean) => ({
    padding: "8px 14px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: 600 as const,
    cursor: "pointer" as const,
    background: active ? "#0F2A4A" : "transparent",
    color: active ? "#fff" : "#64748B",
    border: "none",
  });

  const card = {
    background: "#fff",
    border: "1px solid #E2E8F0",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "16px",
  };

  const TimeBox = ({
    hKey,
    mKey,
    apKey,
  }: {
    hKey: string;
    mKey: string;
    apKey: string;
  }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <input
        maxLength={2}
        value={(details as any)[hKey]}
        onChange={(e) => updateDetail(hKey, e.target.value.replace(/\D/g, ""))}
        placeholder="HH"
        style={{ ...inp, width: "48px", textAlign: "center" }}
      />
      <span style={{ fontWeight: 700, color: "#64748B" }}>:</span>
      <input
        maxLength={2}
        value={(details as any)[mKey]}
        onChange={(e) => updateDetail(mKey, e.target.value.replace(/\D/g, ""))}
        placeholder="MM"
        style={{ ...inp, width: "48px", textAlign: "center" }}
      />
      {["AM", "PM"].map((x) => (
        <button
          key={x}
          onClick={() => updateDetail(apKey, x)}
          style={{
            padding: "4px 10px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            border: "none",
            background: (details as any)[apKey] === x ? "#0F2A4A" : "#F1F5F9",
            color: (details as any)[apKey] === x ? "#fff" : "#64748B",
          }}
        >
          {x}
        </button>
      ))}
    </div>
  );

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
            href="/"
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
              background: "#F1F5F9",
              color: "#64748B",
              fontSize: "11px",
              fontWeight: 600,
              padding: "3px 8px",
              borderRadius: "20px",
            }}
          >
            DRAFT
          </span>
        </div>
        <button
          onClick={handleGeneratePDF}
          disabled={generating}
          style={{
            background: generating ? "#94A3B8" : "#2D8C4E",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "8px 18px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: generating ? "not-allowed" : "pointer",
          }}
        >
          {generating ? "Generating..." : "Generate PDF"}
        </button>
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
          style={tab(activeTab === "details")}
          onClick={() => setActiveTab("details")}
        >
          📋 Client & Site Info
        </button>
        <button
          style={tab(activeTab === "system")}
          onClick={() => setActiveTab("system")}
        >
          🔧 Sewer System Info
        </button>
        <button
          style={tab(activeTab === "conditions")}
          onClick={() => setActiveTab("conditions")}
        >
          🔍 Pipe Conditions {defects.length > 0 && `(${defects.length})`}
        </button>
        <button
          style={tab(activeTab === "recommendations")}
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
                    <TimeBox
                      hKey="inspectionTimeH"
                      mKey="inspectionTimeM"
                      apKey="inspectionTimeAmPm"
                    />
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
                    style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}
                  >
                    {peopleOptions.map((p) => (
                      <button
                        key={p}
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
                        marginTop: "8px",
                        fontSize: "12px",
                        color: "#64748B",
                      }}
                    >
                      Selected: {details.peoplePresent.join(", ")}
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: "4px" }}>
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
                          <option key={w} value={w}>
                            {w}
                          </option>
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
                          <option key={t} value={t}>
                            {t}
                          </option>
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
                        <option key={s} value={s}>
                          {s}
                        </option>
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
                  Property Photos
                </h3>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#94A3B8",
                    marginBottom: "12px",
                  }}
                >
                  Up to 3 photos — shown on cover page
                </p>
                {propertyPhotos.length < 3 && (
                  <div
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.multiple = true;
                      input.onchange = (e) =>
                        handlePropertyPhotos(
                          (e.target as HTMLInputElement).files,
                        );
                      input.click();
                    }}
                    style={{
                      border: "2px dashed #E2E8F0",
                      borderRadius: "8px",
                      padding: "20px",
                      textAlign: "center",
                      cursor: "pointer",
                      background: "#F8FAFC",
                      marginBottom: "12px",
                    }}
                  >
                    <div style={{ fontSize: "24px", marginBottom: "6px" }}>
                      🏠
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#64748B",
                        fontWeight: 500,
                      }}
                    >
                      Click to upload property photos
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#94A3B8",
                        marginTop: "4px",
                      }}
                    >
                      {propertyPhotos.length}/3 photos added
                    </div>
                  </div>
                )}
                {propertyPhotos.length > 0 && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "8px",
                      marginBottom: "12px",
                    }}
                  >
                    {propertyPhotos.map((photo, index) => (
                      <div
                        key={index}
                        style={{
                          position: "relative",
                          borderRadius: "8px",
                          overflow: "hidden",
                          aspectRatio: "4/3",
                        }}
                      >
                        <img
                          src={photo}
                          alt={`Property ${index + 1}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                        <button
                          onClick={() =>
                            setPropertyPhotos((p) =>
                              p.filter((_, i) => i !== index),
                            )
                          }
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
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                  General Notes
                </h3>
                <textarea
                  value={details.notes}
                  onChange={(e) => updateDetail("notes", e.target.value)}
                  placeholder="Add general notes..."
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

                <div style={{ marginBottom: "14px" }}>
                  <label style={lbl}>Sewer Video Links (up to 4)</label>
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      style={{
                        marginBottom: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#64748B",
                          minWidth: "60px",
                          fontWeight: 600,
                        }}
                      >
                        Link {i + 1}
                      </span>
                      <input
                        type="text"
                        value={details.videoLinks[i]}
                        onChange={(e) => updateVideoLink(i, e.target.value)}
                        placeholder="https://youtu.be/..."
                        style={{ ...inp, flex: 1 }}
                      />
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label style={lbl}>Camera Entry / Cleanout Type</label>
                  <input
                    type="text"
                    value={details.fileNumber}
                    onChange={(e) => updateDetail("fileNumber", e.target.value)}
                    placeholder='e.g. 4" Cast Iron'
                    style={{ ...inp, width: "100%" }}
                  />
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
                  Piping Section
                </h3>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#64748B",
                    marginBottom: "12px",
                  }}
                >
                  Describe the camera directions during inspection
                </p>
                <div style={{ marginBottom: "12px" }}>
                  <label style={lbl}>1st Direction</label>
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
                <div style={{ marginBottom: "12px" }}>
                  <label style={lbl}>2nd Direction</label>
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
                  border: "1px solid #E2E8F0",
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
                    background: "#FAFAFA",
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

                  {/* Time box */}
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
                          e.target.value.replace(/\D/g, ""),
                        )
                      }
                      placeholder="MM"
                      style={{
                        ...inp,
                        width: "38px",
                        textAlign: "center",
                        padding: "0 4px",
                      }}
                    />
                    <span style={{ fontWeight: 700, color: "#64748B" }}>:</span>
                    <input
                      maxLength={2}
                      value={defect.videoTimeM}
                      onChange={(e) =>
                        updateDefect(
                          defect.id,
                          "videoTimeM",
                          e.target.value.replace(/\D/g, ""),
                        )
                      }
                      placeholder="SS"
                      style={{
                        ...inp,
                        width: "38px",
                        textAlign: "center",
                        padding: "0 4px",
                      }}
                    />
                  </div>

                  {/* Footage */}
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

                  {/* Severity with colors */}
                  <select
                    value={defect.severity}
                    onChange={(e) =>
                      updateDefect(defect.id, "severity", e.target.value)
                    }
                    style={{
                      ...inp,
                      width: "160px",
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
                        placeholder="e.g. Root intrusion; unable to determine where roots are originating. Cable or hydro jet to cut."
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
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.multiple = true;
                        input.onchange = (e) =>
                          handleImageUpload(
                            defect.id,
                            (e.target as HTMLInputElement).files,
                          );
                        input.click();
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

        {/* TAB 4 — End of Report / Recommendations */}
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
                <div key={action.label} style={{ marginBottom: "16px" }}>
                  <label style={lbl}>{action.label}</label>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}
                  >
                    {action.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() =>
                          setCorrections((p) => ({ ...p, [action.label]: opt }))
                        }
                        style={{
                          padding: "6px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                          border: "none",
                          background:
                            corrections[action.label] === opt
                              ? "#0F2A4A"
                              : "#F1F5F9",
                          color:
                            corrections[action.label] === opt
                              ? "#fff"
                              : "#64748B",
                        }}
                      >
                        {corrections[action.label] === opt ? "✓ " : ""}
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div style={{ marginTop: "16px" }}>
                <label style={lbl}>Additional Recommendations / Notes</label>
                <textarea
                  value={correctionNotes}
                  onChange={(e) => setCorrectionNotes(e.target.value)}
                  placeholder="e.g. Hydro jet/blade cutting recommended to remove roots. Cast iron line needs to be replaced or lined..."
                  rows={6}
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
                  margin: "0 0 14px",
                }}
              >
                End of Report Summary
              </h3>
              <div
                style={{
                  padding: "12px",
                  background: "#F8FAFC",
                  borderRadius: "8px",
                  fontSize: "13px",
                  lineHeight: "1.8",
                  color: "#374151",
                }}
              >
                <p style={{ marginBottom: "8px" }}>
                  Given the condition(s) above we recommend full evaluations
                  and/or corrections with written findings and costs to cure by
                  a competent licensed plumbing contractor before the end/close
                  of the inspection contingency period.
                </p>
                <p>
                  Recommend sewer inspections after repairs are made to ensure
                  efficacy of work and to inspect any areas of the sewer lateral
                  not visible due to defect(s).
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
