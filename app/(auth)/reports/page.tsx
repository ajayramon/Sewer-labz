"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Report = {
  id: string;
  title: string;
  location: string;
  clientName: string;
  fileNumber: string;
  inspectedAt: string;
  status: "DRAFT" | "COMPLETE";
};

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "DRAFT" | "COMPLETE">("ALL");
  const [generating, setGenerating] = useState<string | null>(null);
  const [markingDone, setMarkingDone] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      // Load from localStorage first
      const local = localStorage.getItem("sewer_reports");
      if (local) {
        setReports(JSON.parse(local));
        setLoading(false);
      }
      // Then try API
      const res = await fetch("/api/reports");
      const data = await res.json();
      if (data.reports?.length) setReports(data.reports);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handlePDF = async (report: Report) => {
    setGenerating(report.id);
    try {
      const local = localStorage.getItem(`report_${report.id}`);
      const data = local ? JSON.parse(local) : { report, defects: [] };
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
      setGenerating(null);
    }
  };

  const handleEdit = (report: Report) => {
    const local = localStorage.getItem(`report_${report.id}`);
    localStorage.setItem(
      `report_edit_${report.id}`,
      local || JSON.stringify({ report, defects: [] }),
    );
    router.push(`/reports/new?edit=${report.id}`);
  };

  const handleToggleStatus = (report: Report) => {
    setMarkingDone(report.id);
    const newStatus = report.status === "COMPLETE" ? "DRAFT" : "COMPLETE";
    const updated = reports.map((r) =>
      r.id === report.id
        ? { ...r, status: newStatus as "DRAFT" | "COMPLETE" }
        : r,
    );
    setReports(updated);
    localStorage.setItem("sewer_reports", JSON.stringify(updated));
    const local = localStorage.getItem(`report_${report.id}`);
    if (local) {
      const d = JSON.parse(local);
      d.report = { ...d.report, status: newStatus };
      localStorage.setItem(`report_${report.id}`, JSON.stringify(d));
    }
    fetch(`/api/reports/${report.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ report: { ...report, status: newStatus } }),
    }).catch(() => {});
    setTimeout(() => setMarkingDone(null), 1000);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this report? This cannot be undone.")) return;
    const updated = reports.filter((r) => r.id !== id);
    setReports(updated);
    localStorage.setItem("sewer_reports", JSON.stringify(updated));
    localStorage.removeItem(`report_${id}`);
    fetch(`/api/reports/${id}`, { method: "DELETE" }).catch(() => {});
  };

  const filtered = reports.filter((r) => {
    const matchSearch =
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      r.location?.toLowerCase().includes(search.toLowerCase()) ||
      r.fileNumber?.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (filter === "ALL" || r.status === filter);
  });

  const inp: React.CSSProperties = {
    height: "36px",
    borderRadius: "6px",
    border: "1px solid #E2E8F0",
    padding: "0 10px",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
    background: "#F8FAFC",
  };
  const btn = (bg: string, color: string): React.CSSProperties => ({
    padding: "5px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    background: bg,
    color,
  });

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "1100px",
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
              fontSize: "22px",
              fontWeight: 800,
              color: "#0F2A4A",
              margin: 0,
            }}
          >
            Reports
          </h1>
          <p style={{ fontSize: "13px", color: "#94A3B8", marginTop: "4px" }}>
            {reports.length} total ·{" "}
            {reports.filter((r) => r.status === "DRAFT").length} drafts ·{" "}
            {reports.filter((r) => r.status === "COMPLETE").length} complete
          </p>
        </div>
        <Link href="/reports/new">
          <button
            style={{
              background: "#2D8C4E",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            + New Report
          </button>
        </Link>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="Search by title, client, file #, location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inp, flex: 1 }}
        />
        {(["ALL", "DRAFT", "COMPLETE"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "0 16px",
              height: "36px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              border: "none",
              background: filter === f ? "#0F2A4A" : "#F1F5F9",
              color: filter === f ? "#fff" : "#64748B",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #E2E8F0",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div
            style={{ textAlign: "center", padding: "60px", color: "#94A3B8" }}
          >
            Loading reports...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>📄</div>
            <div
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: "#0F2A4A",
                marginBottom: "6px",
              }}
            >
              {search || filter !== "ALL"
                ? "No reports match your search"
                : "No reports yet"}
            </div>
            {!search && filter === "ALL" && (
              <Link href="/reports/new">
                <button
                  style={{
                    background: "#2D8C4E",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 20px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    marginTop: "12px",
                  }}
                >
                  Create First Report
                </button>
              </Link>
            )}
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "#F8FAFC",
                  borderBottom: "1px solid #E2E8F0",
                }}
              >
                {[
                  "Report Title",
                  "File #",
                  "Client",
                  "Date",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 14px",
                      textAlign: "left",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748B",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((report, i) => (
                <tr
                  key={report.id}
                  style={{
                    borderBottom: "1px solid #F1F5F9",
                    background: i % 2 === 0 ? "#fff" : "#FAFAFA",
                  }}
                >
                  <td
                    style={{
                      padding: "13px 14px",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#0F2A4A",
                    }}
                  >
                    {report.title || "Untitled"}
                  </td>
                  <td
                    style={{
                      padding: "13px 14px",
                      fontSize: "13px",
                      color: "#64748B",
                    }}
                  >
                    {report.fileNumber || "—"}
                  </td>
                  <td
                    style={{
                      padding: "13px 14px",
                      fontSize: "13px",
                      color: "#374151",
                    }}
                  >
                    {report.clientName || "—"}
                  </td>
                  <td
                    style={{
                      padding: "13px 14px",
                      fontSize: "13px",
                      color: "#374151",
                    }}
                  >
                    {report.inspectedAt || "—"}
                  </td>
                  <td style={{ padding: "13px 14px" }}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: 700,
                        background:
                          report.status === "DRAFT" ? "#FFFBEB" : "#F0FDF4",
                        color:
                          report.status === "DRAFT" ? "#D97706" : "#16A34A",
                      }}
                    >
                      {report.status || "DRAFT"}
                    </span>
                  </td>
                  <td style={{ padding: "13px 14px" }}>
                    <div
                      style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}
                    >
                      <button
                        onClick={() => router.push(`/reports/${report.id}`)}
                        style={btn("#F1F5F9", "#0F2A4A")}
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(report)}
                        style={btn("#EFF6FF", "#2563EB")}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handlePDF(report)}
                        disabled={generating === report.id}
                        style={btn("#F0FDF4", "#16A34A")}
                      >
                        {generating === report.id ? "..." : "PDF"}
                      </button>
                      {/* Mark Complete / Back to Draft */}
                      <button
                        onClick={() => handleToggleStatus(report)}
                        disabled={markingDone === report.id}
                        style={btn(
                          report.status === "COMPLETE" ? "#FFFBEB" : "#E8F5EE",
                          report.status === "COMPLETE" ? "#D97706" : "#16A34A",
                        )}
                      >
                        {markingDone === report.id
                          ? "✓"
                          : report.status === "COMPLETE"
                            ? "↩ Draft"
                            : "✓ Complete"}
                      </button>
                      <button
                        onClick={() => handleDelete(report.id)}
                        style={btn("#FEF2F2", "#DC2626")}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {filtered.length > 0 && (
        <div
          style={{
            marginTop: "10px",
            fontSize: "12px",
            color: "#94A3B8",
            display: "flex",
            gap: "16px",
          }}
        >
          <span>✓ Complete — marks report as done</span>
          <span>↩ Draft — moves back to draft</span>
        </div>
      )}
    </div>
  );
}
