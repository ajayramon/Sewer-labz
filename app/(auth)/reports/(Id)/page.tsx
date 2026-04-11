"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

type Defect = {
  id: string;
  videoTimeH: string;
  videoTimeM: string;
  footageStart: string;
  conditionType: string;
  severity: string;
  narrative: string;
  images: { id: string; url: string; name: string }[];
};

type Report = {
  id: string;
  title: string;
  fileNumber: string;
  clientName: string;
  location: string;
  inspectedAt: string;
  inspectionTime: string;
  inspector: string;
  peoplePresent: string;
  buildingOccupied: string;
  weather: string;
  cleanoutLocation: string;
  pipeMaterials: string[];
  videoLinks: string[];
  cameraDirection1: string;
  cameraDirection2: string;
  pipingNotes: string;
  generalNotes: string;
  corrections: Record<string, string>;
  correctionNotes: string;
  propertyPhotos: string[];
  status: "DRAFT" | "COMPLETE";
};

const severityColors: Record<string, string> = {
  "No Defect": "#16A34A",
  Minor: "#D97706",
  Moderate: "#EA580C",
  Major: "#DC2626",
  "Suggested Maintenance": "#2563EB",
};

export default function ViewReportPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [report, setReport] = useState<Report | null>(null);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (id) fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      const res = await fetch(`/api/reports/${id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setReport(data.report || data);
      setDefects(data.defects || []);
    } catch {
      // Try localStorage fallback
      const local = localStorage.getItem(`report_${id}`);
      if (local) {
        const data = JSON.parse(local);
        setReport(data.report);
        setDefects(data.defects || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!report) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/reports/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report, defects }),
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

  const card: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #E2E8F0",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "16px",
  };

  const lbl: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: 600,
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  const val: React.CSSProperties = {
    fontSize: "14px",
    color: "#0F172A",
    marginTop: "2px",
  };

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", color: "#94A3B8" }}>
          Loading report...
        </div>
      </div>
    );

  if (!report)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>📄</div>
          <div
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: "#0F2A4A",
              marginBottom: "8px",
            }}
          >
            Report not found
          </div>
          <Link href="/">
            <button
              style={{
                background: "#0F2A4A",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              ← Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "900px",
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "4px",
            }}
          >
            <Link
              href="/"
              style={{
                color: "#64748B",
                textDecoration: "none",
                fontSize: "13px",
              }}
            >
              ← Dashboard
            </Link>
            <span style={{ color: "#E2E8F0" }}>|</span>
            <span
              style={{
                background: report.status === "DRAFT" ? "#FFFBEB" : "#F0FDF4",
                color: report.status === "DRAFT" ? "#D97706" : "#16A34A",
                fontSize: "11px",
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: "20px",
              }}
            >
              {report.status || "DRAFT"}
            </span>
          </div>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "#0F2A4A",
              margin: 0,
            }}
          >
            {report.title || "Inspection Report"}
          </h1>
          <p style={{ fontSize: "13px", color: "#94A3B8", marginTop: "4px" }}>
            {report.fileNumber && `File #${report.fileNumber} · `}
            {report.inspectedAt}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => router.push(`/reports/${id}/edit`)}
            style={{
              padding: "8px 18px",
              borderRadius: "8px",
              border: "1px solid #E2E8F0",
              background: "#fff",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              color: "#0F2A4A",
            }}
          >
            ✏️ Edit
          </button>
          <button
            onClick={handleGeneratePDF}
            disabled={generating}
            style={{
              padding: "8px 18px",
              borderRadius: "8px",
              border: "none",
              background: generating ? "#94A3B8" : "#2D8C4E",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 700,
              cursor: generating ? "not-allowed" : "pointer",
            }}
          >
            {generating ? "Generating..." : "📄 Generate PDF"}
          </button>
        </div>
      </div>

      {/* Property Photos */}
      {report.propertyPhotos?.length > 0 && (
        <div style={card}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${Math.min(report.propertyPhotos.length, 3)}, 1fr)`,
              gap: "10px",
            }}
          >
            {report.propertyPhotos.map((photo, i) => (
              <img
                key={i}
                src={photo}
                alt={`Property ${i + 1}`}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                  objectPosition: "center",
                  borderRadius: "8px",
                  display: "block",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Client & Site Info */}
      <div style={card}>
        <h3
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: "#0F2A4A",
            margin: "0 0 16px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Client & Site Information
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          {[
            { label: "Client Name", value: report.clientName },
            { label: "Property Address", value: report.location },
            { label: "File Number", value: report.fileNumber },
            { label: "Inspector", value: report.inspector },
            { label: "Inspection Date", value: report.inspectedAt },
            { label: "Inspection Time", value: report.inspectionTime },
            { label: "People Present", value: report.peoplePresent },
            { label: "Building Occupied", value: report.buildingOccupied },
            { label: "Weather / Soil", value: report.weather },
          ]
            .filter(({ value }) => value)
            .map(({ label, value }) => (
              <div key={label}>
                <div style={lbl}>{label}</div>
                <div style={val}>{value}</div>
              </div>
            ))}
        </div>
      </div>

      {/* Sewer System Info */}
      <div style={card}>
        <h3
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: "#0F2A4A",
            margin: "0 0 16px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Sewer System Information
        </h3>

        {report.cleanoutLocation && (
          <div style={{ marginBottom: "14px" }}>
            <div style={lbl}>Cleanout Location</div>
            <div
              style={{
                ...val,
                padding: "10px",
                background: "#F8FAFC",
                borderRadius: "6px",
                marginTop: "4px",
              }}
            >
              {report.cleanoutLocation}
            </div>
          </div>
        )}

        {report.pipeMaterials?.length > 0 && (
          <div style={{ marginBottom: "14px" }}>
            <div style={lbl}>Pipe Materials</div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
                marginTop: "6px",
              }}
            >
              {report.pipeMaterials.map((m: string) => (
                <span
                  key={m}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: 600,
                    background: "#0F2A4A",
                    color: "#fff",
                  }}
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}

        {(report.cameraDirection1 || report.cameraDirection2) && (
          <div style={{ marginBottom: "14px" }}>
            <div style={lbl}>Camera Directions</div>
            {report.cameraDirection1 && (
              <div style={{ ...val, marginTop: "4px" }}>
                <strong>1st:</strong> {report.cameraDirection1}
              </div>
            )}
            {report.cameraDirection2 && (
              <div style={{ ...val, marginTop: "4px" }}>
                <strong>2nd:</strong> {report.cameraDirection2}
              </div>
            )}
          </div>
        )}

        {report.videoLinks?.length > 0 && (
          <div style={{ marginBottom: "14px" }}>
            <div style={lbl}>Video Links</div>
            {report.videoLinks.map((link: string, i: number) => (
              <div key={i} style={{ marginTop: "6px" }}>
                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: "#2563EB",
                    fontSize: "13px",
                    textDecoration: "none",
                  }}
                >
                  🔗 Link {i + 1}: {link}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pipe Conditions */}
      <div style={card}>
        <h3
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: "#0F2A4A",
            margin: "0 0 16px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Pipe Conditions {defects.length > 0 && `(${defects.length})`}
        </h3>

        {defects.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "24px",
              color: "#94A3B8",
              fontSize: "13px",
            }}
          >
            No conditions recorded
          </div>
        ) : (
          defects.map((defect, i) => (
            <div
              key={defect.id}
              style={{
                borderBottom:
                  i < defects.length - 1 ? "1px solid #F1F5F9" : "none",
                paddingBottom: "16px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "8px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#0F2A4A",
                  }}
                >
                  #{i + 1}
                </span>
                {(defect.videoTimeH || defect.videoTimeM) && (
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#64748B",
                      background: "#F1F5F9",
                      padding: "2px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    @ {defect.videoTimeH || "--"}:{defect.videoTimeM || "--"}
                  </span>
                )}
                {defect.footageStart && (
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#64748B",
                      background: "#F1F5F9",
                      padding: "2px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    {defect.footageStart} ft
                  </span>
                )}
                {defect.conditionType !== "Select Condition Type" && (
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#0F2A4A",
                    }}
                  >
                    {defect.conditionType}
                  </span>
                )}
                {defect.severity && (
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: "20px",
                      color: severityColors[defect.severity] || "#64748B",
                      background: "#F8FAFC",
                      border: `1px solid ${severityColors[defect.severity] || "#E2E8F0"}`,
                    }}
                  >
                    {defect.severity}
                  </span>
                )}
              </div>
              {defect.narrative && (
                <p
                  style={{
                    fontSize: "13px",
                    color: "#374151",
                    lineHeight: "1.7",
                    margin: "0 0 10px",
                  }}
                >
                  {defect.narrative}
                </p>
              )}
              {defect.images?.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "8px",
                  }}
                >
                  {defect.images.map((img, idx) => (
                    <img
                      key={img.id}
                      src={img.url}
                      alt={`Photo ${idx + 1}`}
                      style={{
                        width: "100%",
                        height: "160px",
                        objectFit: "cover",
                        objectPosition: "center",
                        borderRadius: "6px",
                        display: "block",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* General Notes */}
      {report.generalNotes && (
        <div style={card}>
          <h3
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#0F2A4A",
              margin: "0 0 12px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            General Notes
          </h3>
          <p
            style={{
              fontSize: "13px",
              color: "#374151",
              lineHeight: "1.7",
              whiteSpace: "pre-wrap",
              margin: 0,
            }}
          >
            {report.generalNotes}
          </p>
        </div>
      )}

      {/* Corrective Actions */}
      {report.corrections &&
        Object.values(report.corrections).some((v) => v && v !== "N/A") && (
          <div style={card}>
            <h3
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#0F2A4A",
                margin: "0 0 16px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Corrective Action Recommendations
            </h3>
            {Object.entries(report.corrections)
              .filter(([, v]) => v && v !== "N/A")
              .map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    marginBottom: "10px",
                    paddingBottom: "10px",
                    borderBottom: "1px solid #F1F5F9",
                  }}
                >
                  <span style={{ ...lbl, minWidth: "180px" }}>{label}</span>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "#0F172A",
                      fontWeight: 600,
                    }}
                  >
                    {value as string}
                  </span>
                </div>
              ))}
            {report.correctionNotes && (
              <div style={{ marginTop: "12px" }}>
                <div style={lbl}>Additional Notes</div>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#374151",
                    lineHeight: "1.7",
                    marginTop: "4px",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {report.correctionNotes}
                </p>
              </div>
            )}
          </div>
        )}

      {/* Bottom actions */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          justifyContent: "flex-end",
          marginTop: "8px",
        }}
      >
        <Link href="/">
          <button
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "1px solid #E2E8F0",
              background: "#fff",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              color: "#64748B",
            }}
          >
            ← Back
          </button>
        </Link>
        <button
          onClick={() => router.push(`/reports/${id}/edit`)}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            background: "#0F2A4A",
            color: "#fff",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          ✏️ Edit Report
        </button>
        <button
          onClick={handleGeneratePDF}
          disabled={generating}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            background: generating ? "#94A3B8" : "#2D8C4E",
            color: "#fff",
            fontSize: "13px",
            fontWeight: 700,
            cursor: generating ? "not-allowed" : "pointer",
          }}
        >
          {generating ? "Generating..." : "📄 PDF"}
        </button>
      </div>
    </div>
  );
}
