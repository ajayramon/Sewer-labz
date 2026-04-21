"use client";
// components/DownloadPDFButton.tsx
// Drop this button on any report page.
//
// Usage:
//   import DownloadPDFButton from "@/components/DownloadPDFButton";
//   <DownloadPDFButton report={report} defects={defects} />

import { useState } from "react";

interface Defect {
  conditionType?: string;
  severity?: string;
  narrative?: string;
  footageStart?: string;
  videoTimeH?: string;
  videoTimeM?: string;
  images?: { url: string }[];
}

interface Props {
  report: Record<string, any>; // your Firestore report object
  defects?: Defect[]; // your defects array
}

export default function DownloadPDFButton({ report, defects = [] }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  async function handleDownload() {
    setStatus("loading");
    setErrMsg("");

    try {
      const res = await fetch("/api/reports/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report, defects }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Server error ${res.status}`);
      }

      // Stream PDF → trigger browser download
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const ref = report.fileNumber || report.clientName || "Report";
      const date = report.inspectedAt || "";
      a.href = url;
      a.download = `SewerLabz-${ref}-${date}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus("idle");
    } catch (err: any) {
      console.error("[PDF Download]", err);
      setErrMsg(err?.message || "PDF failed. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: 6 }}>
      <button
        onClick={handleDownload}
        disabled={status === "loading"}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 22px",
          borderRadius: 8,
          border: "none",
          background: status === "loading" ? "#94A3B8" : "#2D8C4E",
          color: "#fff",
          fontSize: 14,
          fontWeight: 700,
          cursor: status === "loading" ? "not-allowed" : "pointer",
          transition: "background 0.2s",
          whiteSpace: "nowrap",
        }}
      >
        {status === "loading" ? <Spinner /> : <PDFIcon />}
        {status === "loading" ? "Generating PDF…" : "Download PDF Report"}
      </button>

      {status === "error" && (
        <span style={{ fontSize: 12, color: "#DC2626" }}>⚠ {errMsg}</span>
      )}
    </div>
  );
}

function PDFIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      style={{ animation: "sl-spin 0.8s linear infinite" }}
    >
      <style>{`@keyframes sl-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
