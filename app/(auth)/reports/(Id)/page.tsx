"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ViewReportPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [report, setReport] = useState<any>(null);
  const [defects, setDefects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadReport();
  }, [id]);

  const loadReport = () => {
    try {
      // Load from localStorage first
      const local = localStorage.getItem(`report_${id}`);
      if (local) {
        const data = JSON.parse(local);
        setReport(data.report || data);
        setDefects(data.defects || []);
        setLoading(false);
        return;
      }
      // Try API
      fetch(`/api/reports/${id}`)
        .then((r) => r.json())
        .then((data) => {
          setReport(data.report || data);
          setDefects(data.defects || []);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } catch {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    const local = localStorage.getItem(`report_${id}`);
    if (local) localStorage.setItem(`report_edit_${id}`, local);
    router.push(`/reports/new?edit=${id}`);
  };

  const handlePDF = async () => {
    setGenerating(true);
    try {
      const local = localStorage.getItem(`report_${id}`);
      const data = local ? JSON.parse(local) : { report, defects };
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
    } finally {
      setGenerating(false);
    }
  };

  const severityColor: Record<string, string> = {
    "No Defect": "#16A34A",
    Minor: "#D97706",
    Moderate: "#EA580C",
    Major: "#DC2626",
    "Suggested Maintenance": "#2563EB",
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
          <div style={{ fontSize: "24px", marginBottom: "8px" }}>⏳</div>
          <div>Loading report...</div>
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
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>⚠️</div>
          <div
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: "#0F2A4A",
              marginBottom: "16px",
            }}
          >
            Report not found
          </div>
          <button
            onClick={() => router.push("/")}
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
        </div>
      </div>
    );

  const card: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #E2E8F0",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "16px",
  };
  const lbl: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: 700,
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "2px",
  };
  const val: React.CSSProperties = {
    fontSize: "14px",
    color: "#0F2A4A",
    fontWeight: 500,
  };
  const row = (label: string, value: any) =>
    value ? (
      <div key={label} style={{ marginBottom: "12px" }}>
        <div style={lbl}>{label}</div>
        <div style={val}>{value}</div>
      </div>
    ) : null;

  return (
    <div
      style={{
        fontFamily: "Inter, Arial, sans-serif",
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
          <button
            onClick={() => router.push("/")}
            style={{
              background: "none",
              border: "none",
              color: "#64748B",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            ← Dashboard
          </button>
          <span style={{ color: "#E2E8F0" }}>|</span>
          <span style={{ fontSize: "15px", fontWeight: 600, color: "#0F2A4A" }}>
            {report.title || "Inspection Report"}
          </span>
          <span
            style={{
              background: report.status === "COMPLETE" ? "#E8F5EE" : "#FFFBEB",
              color: report.status === "COMPLETE" ? "#2D8C4E" : "#D97706",
              fontSize: "11px",
              fontWeight: 700,
              padding: "3px 8px",
              borderRadius: "20px",
            }}
          >
            {report.status || "DRAFT"}
          </span>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handleEdit}
            style={{
              background: "#0F2A4A",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "8px 18px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ✏️ Edit Report
          </button>
          <button
            onClick={handlePDF}
            disabled={generating}
            style={{
              background: generating ? "#94A3B8" : "#2D8C4E",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "8px 18px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {generating ? "Generating..." : "📄 Generate PDF"}
          </button>
        </div>
      </div>

      <div style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}>
        {/* Client & Site Info */}
        <div style={card}>
          <h3
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#0F2A4A",
              margin: "0 0 16px",
              textTransform: "uppercase",
              borderBottom: "1px solid #E2E8F0",
              paddingBottom: "8px",
            }}
          >
            Client & Site Information
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0 24px",
            }}
          >
            {[
              ["File Number", report.fileNumber],
              ["Client Name", report.clientName],
              ["Property Address", report.location],
              ["Buyer's Agent", report.buyersAgent],
              ["Inspector", report.inspector],
              ["Date", report.inspectedAt],
              ["Time", report.inspectionTime],
              ["Building Occupied", report.buildingOccupied],
              [
                "People Present",
                Array.isArray(report.peoplePresent)
                  ? report.peoplePresent.join(", ")
                  : report.peoplePresent,
              ],
              ["Weather / Soil", report.weather],
            ].map(([l, v]) =>
              v ? (
                <div key={l} style={{ marginBottom: "12px" }}>
                  <div style={lbl}>{l}</div>
                  <div style={val}>{v}</div>
                </div>
              ) : null,
            )}
          </div>

          {/* Property photos */}
          {report.propertyPhotos?.length > 0 && (
            <div style={{ marginTop: "16px" }}>
              <div style={lbl}>Property Photos</div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "8px",
                  marginTop: "8px",
                }}
              >
                {report.propertyPhotos.map((photo: string, i: number) => (
                  <img
                    key={i}
                    src={photo}
                    alt={`Property ${i + 1}`}
                    style={{
                      width: "100%",
                      height: "140px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "1px solid #E2E8F0",
                    }}
                  />
                ))}
              </div>
            </div>
          )}
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
              borderBottom: "1px solid #E2E8F0",
              paddingBottom: "8px",
            }}
          >
            Sewer System Information
          </h3>
          {row("Cleanout Location", report.cleanoutLocation)}
          {report.pipeMaterials?.length > 0 && (
            <div style={{ marginBottom: "12px" }}>
              <div style={lbl}>Pipe Materials</div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                  marginTop: "4px",
                }}
              >
                {(Array.isArray(report.pipeMaterials)
                  ? report.pipeMaterials
                  : [report.pipeMaterials]
                ).map((m: string) => (
                  <span
                    key={m}
                    style={{
                      background: "#0F2A4A",
                      color: "#fff",
                      padding: "3px 10px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}
          {row("1st Camera Direction", report.cameraDirection1)}
          {row("2nd Camera Direction", report.cameraDirection2)}
          {row("Piping Notes", report.pipingNotes)}
          {report.videoLinks?.filter((l: string) => l).length > 0 && (
            <div style={{ marginBottom: "12px" }}>
              <div style={lbl}>Video Links</div>
              {report.videoLinks
                .filter((l: string) => l)
                .map((link: string, i: number) => (
                  <div key={i} style={{ marginTop: "4px" }}>
                    <a
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "#2563EB", fontSize: "13px" }}
                    >
                      Video {i + 1}: {link}
                    </a>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Pipe Conditions */}
        {defects.length > 0 && (
          <div style={card}>
            <h3
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#0F2A4A",
                margin: "0 0 16px",
                textTransform: "uppercase",
                borderBottom: "1px solid #E2E8F0",
                paddingBottom: "8px",
              }}
            >
              Pipe Conditions ({defects.length})
            </h3>
            {defects.map((d: any, i: number) => (
              <div
                key={d.id}
                style={{
                  border: "1px solid #E2E8F0",
                  borderRadius: "8px",
                  padding: "14px",
                  marginBottom: "12px",
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
                  <span style={{ fontWeight: 700, color: "#0F2A4A" }}>
                    #{i + 1}
                  </span>
                  <span style={{ fontSize: "13px", color: "#64748B" }}>
                    @ {d.videoTimeH}:{d.videoTimeM}
                    {d.footageStart ? ` / ${d.footageStart} ft` : ""}
                  </span>
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: "13px",
                      color: "#0F2A4A",
                    }}
                  >
                    {d.conditionType}
                  </span>
                  {d.severity && (
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: 700,
                        background: severityColor[d.severity] || "#64748B",
                        color: "#fff",
                      }}
                    >
                      {d.severity}
                    </span>
                  )}
                </div>
                {d.narrative && (
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#374151",
                      lineHeight: "1.6",
                      marginBottom: "8px",
                    }}
                  >
                    {d.narrative}
                  </p>
                )}
                {d.images?.length > 0 && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "8px",
                      marginTop: "8px",
                    }}
                  >
                    {d.images.map((img: any, idx: number) => (
                      <img
                        key={img.id}
                        src={img.url}
                        alt={`Photo ${idx + 1}`}
                        style={{
                          width: "100%",
                          height: "120px",
                          objectFit: "cover",
                          borderRadius: "6px",
                          border: "1px solid #E2E8F0",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

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
                borderBottom: "1px solid #E2E8F0",
                paddingBottom: "8px",
              }}
            >
              General Notes
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "#374151",
                lineHeight: "1.8",
                whiteSpace: "pre-wrap",
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
                  margin: "0 0 12px",
                  textTransform: "uppercase",
                  borderBottom: "1px solid #E2E8F0",
                  paddingBottom: "8px",
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
                      gap: "12px",
                      marginBottom: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: "12px",
                        color: "#64748B",
                        textTransform: "uppercase",
                        minWidth: "160px",
                      }}
                    >
                      {label}
                    </span>
                    <span style={{ fontSize: "13px", color: "#0F2A4A" }}>
                      {value as string}
                    </span>
                  </div>
                ))}
              {report.correctionNotes && (
                <div
                  style={{
                    marginTop: "12px",
                    padding: "10px",
                    background: "#F8FAFC",
                    borderRadius: "6px",
                  }}
                >
                  <div style={lbl}>Additional Notes</div>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#374151",
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
      </div>
    </div>
  );
}
