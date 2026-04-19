"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/Lib/firebase";

export default function ViewReportPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [report, setReport] = useState<any>(null);
  const [defects, setDefects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [uid, setUid] = useState<string | null>(null);

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUid(u.uid);
      else router.replace("/login");
    });
    return () => unsub();
  }, []);

  // ── Load report ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id || !uid) return;
    loadReport(uid);
  }, [id, uid]);

  const loadReport = async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/${id}`, {
        headers: { "x-user-id": userId },
      });
      if (res.ok) {
        const data = await res.json();
        setReport(data.report || data);
        setDefects(data.defects || []);
        localStorage.setItem(`report_${id}`, JSON.stringify(data));
      } else {
        const local = localStorage.getItem(`report_${id}`);
        if (local) {
          const data = JSON.parse(local);
          setReport(data.report || data);
          setDefects(data.defects || []);
        }
      }
    } catch {
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

  // ── Edit ──────────────────────────────────────────────────────────────────
  const handleEdit = async () => {
    try {
      const res = await fetch(`/api/reports/${id}`, {
        headers: { "x-user-id": uid! },
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(`report_edit_${id}`, JSON.stringify(data));
      } else {
        const local = localStorage.getItem(`report_${id}`);
        if (local) localStorage.setItem(`report_edit_${id}`, local);
      }
    } catch {
      const local = localStorage.getItem(`report_${id}`);
      if (local) localStorage.setItem(`report_edit_${id}`, local);
    }
    router.push(`/reports/new?edit=${id}`);
  };

  // ── PDF — now downloads a real PDF via Puppeteer ──────────────────────────
  const handlePDF = async () => {
    setGenerating(true);
    setPdfError("");

    try {
      // Get latest data — Firestore first, localStorage fallback
      let data: any = null;
      try {
        const res = await fetch(`/api/reports/${id}`, {
          headers: { "x-user-id": uid! },
        });
        if (res.ok) data = await res.json();
      } catch {}

      if (!data) {
        const local = localStorage.getItem(`report_${id}`);
        data = local ? JSON.parse(local) : { report, defects };
      }

      // ✅ POST to Puppeteer PDF route — returns real PDF binary
      const res = await fetch("/api/reports/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Server error ${res.status}`);
      }

      // ✅ Stream PDF blob → trigger browser download
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const ref = report?.fileNumber || report?.clientName || "Report";
      const date = report?.inspectedAt || "";
      a.href = url;
      a.download = `SewerLabz-${ref}-${date}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("[PDF]", err);
      setPdfError(err?.message || "PDF generation failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  // ── Severity colors ───────────────────────────────────────────────────────
  const severityColor: Record<string, string> = {
    "No Defect": "#16A34A",
    Minor: "#D97706",
    Moderate: "#EA580C",
    Major: "#DC2626",
    "Suggested Maintenance": "#2563EB",
  };

  // ── Loading / not found states ────────────────────────────────────────────
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

  return (
    <div
      style={{
        fontFamily: "Inter, Arial, sans-serif",
        background: "#F8FAFC",
        minHeight: "100vh",
      }}
    >
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
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
            onClick={() => router.push("/reports")}
            style={{
              background: "none",
              border: "none",
              color: "#64748B",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            ← Reports
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
            {/* Edit button */}
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

            {/* ✅ PDF download button — now downloads real PDF */}
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
                transition: "background 0.2s",
              }}
            >
              {generating ? <Spinner /> : "📄"}
              {generating ? "Generating PDF…" : "Download PDF"}
            </button>
          </div>

          {/* Error message under buttons */}
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

      {/* ── Content ──────────────────────────────────────────────────────── */}
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

          {report.propertyPhotos?.length > 0 && (
            <div style={{ marginTop: "16px" }}>
              <div style={lbl}>Property Photos</div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
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
          {report.cameraDirection1 && (
            <div style={{ marginBottom: "12px" }}>
              <div style={lbl}>1st Camera Direction</div>
              <div style={val}>{report.cameraDirection1}</div>
            </div>
          )}
          {report.cameraDirection2 && (
            <div style={{ marginBottom: "12px" }}>
              <div style={lbl}>2nd Camera Direction</div>
              <div style={val}>{report.cameraDirection2}</div>
            </div>
          )}
          {report.pipingNotes && (
            <div style={{ marginBottom: "12px" }}>
              <div style={lbl}>Piping Notes</div>
              <div style={val}>{report.pipingNotes}</div>
            </div>
          )}
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
                      gridTemplateColumns: "repeat(3,1fr)",
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

// ── Spinner icon ──────────────────────────────────────────────────────────────
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
