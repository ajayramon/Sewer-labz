"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditReportPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) loadAndRedirect();
  }, [id]);

  const loadAndRedirect = async () => {
    try {
      // Try API first
      const res = await fetch(`/api/reports/${id}`);
      if (res.ok) {
        const data = await res.json();
        // Store in localStorage so report builder can load it
        localStorage.setItem(`report_edit_${id}`, JSON.stringify(data));
        router.replace(`/reports/new?edit=${id}`);
        return;
      }
    } catch {}

    // Try localStorage fallback
    const local = localStorage.getItem(`report_${id}`);
    if (local) {
      localStorage.setItem(`report_edit_${id}`, local);
      router.replace(`/reports/new?edit=${id}`);
      return;
    }

    setError("Report not found");
    setLoading(false);
  };

  if (error)
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
            {error}
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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div style={{ textAlign: "center", color: "#94A3B8" }}>
        <div style={{ fontSize: "24px", marginBottom: "8px" }}>⏳</div>
        <div>Loading report for editing...</div>
      </div>
    </div>
  );
}
