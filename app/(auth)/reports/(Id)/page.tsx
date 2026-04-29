"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/Lib/firebase";

const severityColor: Record<string, { bg: string; color: string }> = {
  "No Defect": { bg: "#F0FDF4", color: "#16A34A" },
  Minor: { bg: "#FFFBEB", color: "#D97706" },
  Moderate: { bg: "#FFF7ED", color: "#EA580C" },
  Major: { bg: "#FEF2F2", color: "#DC2626" },
  "Suggested Maintenance": { bg: "#EFF6FF", color: "#2563EB" },
};

function Spinner() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{ animation: "sl-spin 0.8s linear infinite", flexShrink: 0 }}
    >
      <style>{`@keyframes sl-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

export default function ViewReportPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [uid, setUid] = useState<string | null>(null);
  const [report, setReport] = useState<any>(null);
  const [defects, setDefects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [pdfError, setPdfError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUid(u.uid);
      else router.replace("/login");
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!id || !uid) return;
    loadReport(uid);
  }, [id, uid]);

  const loadReport = async (userId: string) => {
    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/reports/${id}`, {
        headers: { "x-user-id": userId, Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // ✅ FIX: API returns { report, defects } — handle both shapes
        const reportData = data.report || data;
        const defectsData = data.defects || reportData.defects || [];
        setReport(reportData);
        setDefects(defectsData);
        localStorage.setItem(
          `report_${id}`,
          JSON.stringify({ report: reportData, defects: defectsData }),
        );
      } else {
        throw new Error("Not found");
      }
    } catch {
      // Fall back to localStorage
      const local = localStorage.getItem(`report_${id}`);
      if (local) {
        const data = JSON.parse(local);
        setReport(data.report || data);
        setDefects(data.defects || []);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX: Edit loads correct data shape before navigating
  const handleEdit = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/reports/${id}`, {
        headers: { "x-user-id": uid!, Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(`report_edit_${id}`, JSON.stringify(data));
      } else {
        throw new Error("API failed");
      }
    } catch {
      // Use cached data
      const local = localStorage.getItem(`report_${id}`);
      if (local) {
        localStorage.setItem(`report_edit_${id}`, local);
      } else {
        localStorage.setItem(
          `report_edit_${id}`,
          JSON.stringify({ report, defects }),
        );
      }
    }
    router.push(`/reports/new?edit=${id}`);
  };

  const handlePDF = async () => {
    setGenerating(true);
    setPdfError("");
    try {
      let data: any = null;
      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch(`/api/reports/${id}`, {
          headers: { "x-user-id": uid!, Authorization: `Bearer ${token}` },
        });
        if (res.ok) data = await res.json();
      } catch {}

      if (!data) {
        const local = localStorage.getItem(`report_${id}`);
        data = local ? JSON.parse(local) : { report, defects };
      }

      const res = await fetch("/api/reports/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `PDF generation failed (${res.status})`);
      }

      // ✅ Blob URL — never blocked by browsers
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const tab = window.open(url, "_blank");
      if (tab) {
        tab.onload = () => setTimeout(() => tab.print(), 500);
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = `${report?.title || "inspection-report"}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      setTimeout(() => URL.revokeObjectURL(url), 120_000);
    } catch (err: any) {
      console.error("PDF error:", err);
      setPdfError(err?.message || "PDF generation failed. Please try again.");
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
  const secTitle: React.CSSProperties = {
    fontSize: "14px",
    fontWeight: 700,
    color: "#0F2A4A",
    margin: "0 0 16px",
    textTransform: "uppercase",
    borderBottom: "1px solid #E2E8F0",
    paddingBottom: "8px",
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
          {/* ✅ FIX: back goes to dashboard not /reports */}
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

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "4px",
          }}
        >
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
                cursor: generating ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {generating ? <Spinner /> : "📄"}
              {generating ? "Generating..." : "Download PDF"}
            </button>
          </div>
          {pdfError && (
            <span
              style={{
                fontSize: "11px",
                color: "#DC2626",
                maxWidth: "320px",
                textAlign: "right",
              }}
            >
              ⚠ {pdfError}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}>
        {/* Client & Site Info */}
        <div style={card}>
          <h3 style={secTitle}>Client & Site Information</h3>
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

          {report.propertyPhotos?.length > 0 && (
            <div style={{ marginTop: "16px" }}>
              <div style={lbl}>Cover Photo</div>
              <div style={{ marginTop: "8px", maxWidth: "400px" }}>
                <img
                  src={report.propertyPhotos[0]}
                  alt="Cover"
                  style={{
                    width: "100%",
                    height: "220px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid #E2E8F0",
                    display: "block",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Sewer System Info */}
        <div style={card}>
          <h3 style={secTitle}>Sewer System Information</h3>

          {report.cleanoutLocation && (
            <div style={{ marginBottom: "12px" }}>
              <div style={lbl}>Cleanout Location</div>
              <div style={val}>{report.cleanoutLocation}</div>
            </div>
          )}

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

          {(report.cameraDirection1 || report.cameraDirection2) && (
            <div
              style={{
                marginBottom: "12px",
                padding: "12px",
                background: "#F8FAFC",
                borderRadius: "8px",
                border: "1px solid #E2E8F0",
              }}
            >
              <div style={{ ...lbl, marginBottom: "8px" }}>
                Piping Section — Camera Directions
              </div>
              {report.cameraDirection1 && (
                <div style={{ marginBottom: "8px" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#2D8C4E",
                      textTransform: "uppercase",
                    }}
                  >
                    1st Direction:{" "}
                  </span>
                  <span style={{ fontSize: "13px", color: "#374151" }}>
                    {report.cameraDirection1}
                  </span>
                </div>
              )}
              {report.cameraDirection2 && (
                <div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#2D8C4E",
                      textTransform: "uppercase",
                    }}
                  >
                    2nd Direction:{" "}
                  </span>
                  <span style={{ fontSize: "13px", color: "#374151" }}>
                    {report.cameraDirection2}
                  </span>
                </div>
              )}
            </div>
          )}

          {report.pipingNotes && (
            <div style={{ marginBottom: "12px" }}>
              <div style={lbl}>Piping Notes</div>
              <div style={val}>{report.pipingNotes}</div>
            </div>
          )}

          {report.videoLinks?.filter((l: string) => l).length > 0 && (
            <div>
              <div style={lbl}>Video Links</div>
              {report.videoLinks
                .filter((l: string) => l)
                .map((link: string, i: number) => (
                  <div key={i} style={{ marginTop: "6px" }}>
                    <a
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: "#2563EB",
                        fontSize: "13px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      🎥 Video {i + 1}: {link}
                    </a>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Pipe Conditions */}
        {defects.length > 0 && (
          <div style={card}>
            <h3 style={secTitle}>Pipe Conditions ({defects.length})</h3>
            {defects.map((d: any, i: number) => (
              <div
                key={d.id || i}
                style={{
                  border: `1px solid ${severityColor[d.severity]?.color || "#E2E8F0"}`,
                  borderLeft: `4px solid ${severityColor[d.severity]?.color || "#E2E8F0"}`,
                  borderRadius: "8px",
                  padding: "14px",
                  marginBottom: "12px",
                  background: severityColor[d.severity]?.bg || "#fff",
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
                  {(d.videoTimeH || d.videoTimeM) && (
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#64748B",
                        background: "#fff",
                        padding: "2px 8px",
                        borderRadius: "20px",
                        border: "1px solid #E2E8F0",
                      }}
                    >
                      @ {d.videoTimeH || "--"}:{d.videoTimeM || "--"}
                    </span>
                  )}
                  {d.footageStart && (
                    <span style={{ fontSize: "12px", color: "#64748B" }}>
                      {d.footageStart} ft
                    </span>
                  )}
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: "13px",
                      color: "#0F2A4A",
                    }}
                  >
                    {d.conditionType !== "Select Condition Type"
                      ? d.conditionType
                      : "Observation"}
                  </span>
                  {d.severity && (
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: 700,
                        background:
                          severityColor[d.severity]?.color || "#64748B",
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
                      lineHeight: "1.7",
                      margin: "0 0 8px",
                    }}
                  >
                    {d.narrative}
                  </p>
                )}

                {d.images?.length > 0 && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3,1fr)",
                      gap: "8px",
                      marginTop: "8px",
                    }}
                  >
                    {d.images.map((img: any, idx: number) => (
                      <img
                        key={img.id || idx}
                        src={img.url}
                        alt={`Photo ${idx + 1}`}
                        style={{
                          width: "100%",
                          height: "120px",
                          objectFit: "cover",
                          borderRadius: "6px",
                          border: "1px solid #E2E8F0",
                          display: "block",
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
        {(report.notes || report.generalNotes) && (
          <div style={card}>
            <h3 style={secTitle}>General Notes</h3>
            <p
              style={{
                fontSize: "14px",
                color: "#374151",
                lineHeight: "1.8",
                whiteSpace: "pre-wrap",
                margin: 0,
              }}
            >
              {report.notes || report.generalNotes}
            </p>
          </div>
        )}

        {/* Corrective Actions */}
        {report.corrections &&
          Object.values(report.corrections).some(
            (v: any) => v && v !== "N/A",
          ) && (
            <div style={card}>
              <h3 style={secTitle}>Corrective Action Recommendations</h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                }}
              >
                {Object.entries(report.corrections)
                  .filter(([, v]) => v && v !== "N/A")
                  .map(([label, value]) => (
                    <div
                      key={label}
                      style={{
                        padding: "10px",
                        background: "#F8FAFC",
                        borderRadius: "8px",
                        border: "1px solid #E2E8F0",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#64748B",
                          textTransform: "uppercase",
                          marginBottom: "4px",
                        }}
                      >
                        {label}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#0F2A4A",
                          fontWeight: 600,
                        }}
                      >
                        {value as string}
                      </div>
                    </div>
                  ))}
              </div>
              {report.correctionNotes && (
                <div
                  style={{
                    marginTop: "12px",
                    padding: "12px",
                    background: "#F8FAFC",
                    borderRadius: "8px",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <div style={lbl}>Additional Notes</div>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#374151",
                      marginTop: "4px",
                      whiteSpace: "pre-wrap",
                      lineHeight: "1.7",
                    }}
                  >
                    {report.correctionNotes}
                  </p>
                </div>
              )}
            </div>
          )}

        {/* End of Report Statements */}
        {report.endOfReport &&
          Object.values(report.endOfReport).some(
            (v: any) => v && v !== "Select...",
          ) && (
            <div style={card}>
              <h3 style={secTitle}>End of Report</h3>
              {Object.values(report.endOfReport)
                .filter((v: any) => v && v !== "Select...")
                .map((v: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      padding: "12px",
                      background: "#F0FDF4",
                      borderRadius: "8px",
                      borderLeft: "3px solid #2D8C4E",
                      marginBottom: "10px",
                      fontSize: "13px",
                      color: "#166534",
                      lineHeight: "1.7",
                    }}
                  >
                    {v}
                  </div>
                ))}
            </div>
          )}
      </div>
    </div>
  );
}
