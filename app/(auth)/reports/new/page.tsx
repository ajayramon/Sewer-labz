"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditReportPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  useEffect(() => {
    if (!id) return;

    // Try localStorage first — fastest
    const local = localStorage.getItem(`report_${id}`);
    if (local) {
      localStorage.setItem(`report_edit_${id}`, local);
      router.replace(`/reports/new?edit=${id}`);
      return;
    }

    // Try API fallback
    fetch(`/api/reports/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          localStorage.setItem(`report_edit_${id}`, JSON.stringify(data));
        } else {
          // Even if not found — still go to builder with empty edit
          localStorage.setItem(
            `report_edit_${id}`,
            JSON.stringify({ report: { id }, defects: [] }),
          );
        }
        router.replace(`/reports/new?edit=${id}`);
      })
      .catch(() => {
        router.replace(`/reports/new?edit=${id}`);
      });
  }, [id]);

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
