"use client";

import { useEffect, useState } from "react";
import { auth } from "@/app/Lib/firebase";

interface Announcement {
  id: string;
  message: string;
  type: "info" | "warning" | "success";
  active: boolean;
  createdAt: string;
  target: "all" | "free" | "pro";
}

const TYPE_META = {
  info: { color: "#60a5fa", bg: "rgba(96,165,250,0.1)", label: "INFO" },
  warning: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "WARNING" },
  success: { color: "#4ade80", bg: "rgba(74,222,128,0.1)", label: "SUCCESS" },
};

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "ok" | "err";
  } | null>(null);

  const [form, setForm] = useState({
    message: "",
    type: "info" as "info" | "warning" | "success",
    target: "all" as "all" | "free" | "pro",
  });

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/admin/announcements", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAnnouncements(data.announcements ?? []);
    } catch {
      showToast("Failed to load announcements", "err");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async () => {
    if (!form.message.trim()) return;
    setSaving(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setForm({ message: "", type: "info", target: "all" });
      showToast("Announcement sent!", "ok");
      fetchAnnouncements();
    } catch {
      showToast("Failed to send announcement", "err");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      await fetch(`/api/admin/announcements/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ active: !active }),
      });
      fetchAnnouncements();
    } catch {
      showToast("Failed to update", "err");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      await fetch(`/api/admin/announcements/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Deleted", "ok");
      fetchAnnouncements();
    } catch {
      showToast("Failed to delete", "err");
    }
  };

  return (
    <div>
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "72px",
            right: "24px",
            zIndex: 100,
            padding: "10px 18px",
            background:
              toast.type === "ok"
                ? "rgba(74,222,128,0.15)"
                : "rgba(239,68,68,0.15)",
            border: `1px solid ${toast.type === "ok" ? "rgba(74,222,128,0.3)" : "rgba(239,68,68,0.3)"}`,
            borderRadius: "6px",
            color: toast.type === "ok" ? "#4ade80" : "#ef4444",
            fontSize: "12px",
            letterSpacing: "0.08em",
          }}
        >
          {toast.msg}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.5fr",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* Compose Panel */}
        <div>
          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                fontSize: "10px",
                color: "#475569",
                letterSpacing: "0.15em",
                marginBottom: "4px",
              }}
            >
              NEW ANNOUNCEMENT
            </div>
            <div
              style={{ fontSize: "18px", color: "#e2e8f0", fontWeight: 500 }}
            >
              Broadcast to Users
            </div>
          </div>

          <div
            style={{
              background: "#0d1117",
              border: "1px solid #1e293b",
              borderRadius: "8px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {/* Type */}
            <div>
              <div
                style={{
                  fontSize: "10px",
                  color: "#475569",
                  letterSpacing: "0.12em",
                  marginBottom: "8px",
                }}
              >
                TYPE
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {(["info", "warning", "success"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setForm({ ...form, type: t })}
                    style={{
                      flex: 1,
                      padding: "7px",
                      fontSize: "10px",
                      letterSpacing: "0.1em",
                      background:
                        form.type === t ? TYPE_META[t].bg : "transparent",
                      border: `1px solid ${form.type === t ? TYPE_META[t].color + "44" : "#1e293b"}`,
                      borderRadius: "5px",
                      color: form.type === t ? TYPE_META[t].color : "#475569",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {TYPE_META[t].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target */}
            <div>
              <div
                style={{
                  fontSize: "10px",
                  color: "#475569",
                  letterSpacing: "0.12em",
                  marginBottom: "8px",
                }}
              >
                AUDIENCE
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {(["all", "free", "pro"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setForm({ ...form, target: t })}
                    style={{
                      flex: 1,
                      padding: "7px",
                      fontSize: "10px",
                      letterSpacing: "0.1em",
                      background:
                        form.target === t
                          ? "rgba(74,222,128,0.08)"
                          : "transparent",
                      border: `1px solid ${form.target === t ? "rgba(74,222,128,0.25)" : "#1e293b"}`,
                      borderRadius: "5px",
                      color: form.target === t ? "#4ade80" : "#475569",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {t === "all"
                      ? "ALL USERS"
                      : t === "free"
                        ? "FREE ONLY"
                        : "PRO ONLY"}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <div
                style={{
                  fontSize: "10px",
                  color: "#475569",
                  letterSpacing: "0.12em",
                  marginBottom: "8px",
                }}
              >
                MESSAGE
              </div>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Write your announcement here..."
                rows={4}
                style={{
                  width: "100%",
                  background: "#0a0a0a",
                  border: "1px solid #1e293b",
                  borderRadius: "6px",
                  padding: "10px 14px",
                  color: "#e2e8f0",
                  fontSize: "13px",
                  outline: "none",
                  fontFamily: "inherit",
                  resize: "vertical",
                  lineHeight: 1.6,
                }}
              />
            </div>

            {/* Preview */}
            {form.message && (
              <div
                style={{
                  padding: "12px 14px",
                  background: TYPE_META[form.type].bg,
                  border: `1px solid ${TYPE_META[form.type].color}33`,
                  borderLeft: `3px solid ${TYPE_META[form.type].color}`,
                  borderRadius: "6px",
                  fontSize: "13px",
                  color: "#e2e8f0",
                  lineHeight: 1.6,
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    color: TYPE_META[form.type].color,
                    letterSpacing: "0.1em",
                    marginBottom: "6px",
                  }}
                >
                  PREVIEW
                </div>
                {form.message}
              </div>
            )}

            <button
              onClick={handleCreate}
              disabled={saving || !form.message.trim()}
              style={{
                padding: "11px",
                background:
                  saving || !form.message.trim()
                    ? "rgba(74,222,128,0.05)"
                    : "rgba(74,222,128,0.12)",
                border: "1px solid rgba(74,222,128,0.25)",
                borderRadius: "6px",
                color: "#4ade80",
                fontSize: "12px",
                letterSpacing: "0.1em",
                cursor:
                  saving || !form.message.trim() ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                opacity: !form.message.trim() ? 0.5 : 1,
              }}
            >
              {saving ? "SENDING..." : "⚡ BROADCAST NOW"}
            </button>
          </div>
        </div>

        {/* Existing Announcements */}
        <div>
          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                fontSize: "10px",
                color: "#475569",
                letterSpacing: "0.15em",
                marginBottom: "4px",
              }}
            >
              ACTIVE & PAST
            </div>
            <div
              style={{ fontSize: "18px", color: "#e2e8f0", fontWeight: 500 }}
            >
              All Announcements
            </div>
          </div>

          {loading ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "#334155",
                fontSize: "12px",
                letterSpacing: "0.1em",
              }}
            >
              LOADING...
            </div>
          ) : announcements.length === 0 ? (
            <div
              style={{
                background: "#0d1117",
                border: "1px solid #1e293b",
                borderRadius: "8px",
                padding: "48px",
                textAlign: "center",
                color: "#334155",
                fontSize: "12px",
                letterSpacing: "0.1em",
              }}
            >
              NO ANNOUNCEMENTS YET
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {announcements.map((a) => {
                const meta = TYPE_META[a.type];
                return (
                  <div
                    key={a.id}
                    style={{
                      background: "#0d1117",
                      border: `1px solid ${a.active ? "#1e293b" : "#0f172a"}`,
                      borderLeft: `3px solid ${a.active ? meta.color : "#1e293b"}`,
                      borderRadius: "8px",
                      padding: "16px 18px",
                      opacity: a.active ? 1 : 0.5,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "8px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "9px",
                            padding: "2px 7px",
                            background: meta.bg,
                            color: meta.color,
                            borderRadius: "3px",
                            letterSpacing: "0.1em",
                          }}
                        >
                          {meta.label}
                        </span>
                        <span
                          style={{
                            fontSize: "9px",
                            padding: "2px 7px",
                            background: "rgba(100,116,139,0.1)",
                            color: "#64748b",
                            borderRadius: "3px",
                            letterSpacing: "0.1em",
                          }}
                        >
                          {a.target === "all"
                            ? "ALL USERS"
                            : a.target === "free"
                              ? "FREE"
                              : "PRO"}
                        </span>
                        {a.active && (
                          <span
                            style={{
                              fontSize: "9px",
                              padding: "2px 7px",
                              background: "rgba(74,222,128,0.08)",
                              color: "#4ade80",
                              borderRadius: "3px",
                              letterSpacing: "0.1em",
                            }}
                          >
                            LIVE
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => handleToggle(a.id, a.active)}
                          style={{
                            padding: "4px 10px",
                            fontSize: "9px",
                            letterSpacing: "0.08em",
                            background: "transparent",
                            border: "1px solid #1e293b",
                            borderRadius: "4px",
                            color: "#475569",
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          {a.active ? "PAUSE" : "ACTIVATE"}
                        </button>
                        <button
                          onClick={() => handleDelete(a.id)}
                          style={{
                            padding: "4px 10px",
                            fontSize: "9px",
                            letterSpacing: "0.08em",
                            background: "transparent",
                            border: "1px solid rgba(239,68,68,0.2)",
                            borderRadius: "4px",
                            color: "#ef4444",
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          DELETE
                        </button>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#94a3b8",
                        lineHeight: 1.5,
                        marginBottom: "8px",
                      }}
                    >
                      {a.message}
                    </div>
                    <div style={{ fontSize: "10px", color: "#334155" }}>
                      {new Date(a.createdAt).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
