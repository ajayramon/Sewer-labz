"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";

interface Announcement {
  id: string;
  message: string;
  type: "info" | "warning" | "success";
  target: "all" | "free" | "pro";
  active: boolean;
}

const TYPE_STYLES = {
  info: {
    bg: "rgba(96,165,250,0.08)",
    border: "rgba(96,165,250,0.2)",
    color: "#60a5fa",
    icon: "ℹ",
  },
  warning: {
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
    color: "#f59e0b",
    icon: "⚠",
  },
  success: {
    bg: "rgba(74,222,128,0.08)",
    border: "rgba(74,222,128,0.2)",
    color: "#4ade80",
    icon: "✓",
  },
};

export default function AnnouncementBanner({
  userPlan = "free",
}: {
  userPlan?: string;
}) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const stored = localStorage.getItem("dismissed_announcements");
    if (stored) {
      try {
        setDismissed(new Set(JSON.parse(stored)));
      } catch {}
    }

    (async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch("/api/announcements", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setAnnouncements(data.announcements ?? []);
      } catch {}
    })();
  }, []);

  const dismiss = (id: string) => {
    const next = new Set([...dismissed, id]);
    setDismissed(next);
    localStorage.setItem("dismissed_announcements", JSON.stringify([...next]));
  };

  const isPro = userPlan !== "free";
  const visible = announcements.filter((a) => {
    if (!a.active) return false;
    if (dismissed.has(a.id)) return false;
    if (a.target === "free" && isPro) return false;
    if (a.target === "pro" && !isPro) return false;
    return true;
  });

  if (visible.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {visible.map((a) => {
        const s = TYPE_STYLES[a.type];
        return (
          <div
            key={a.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 20px",
              background: s.bg,
              borderBottom: `1px solid ${s.border}`,
              fontSize: "13px",
              color: "#e2e8f0",
              gap: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flex: 1,
              }}
            >
              <span style={{ color: s.color, fontSize: "14px" }}>{s.icon}</span>
              <span style={{ lineHeight: 1.4 }}>{a.message}</span>
            </div>
            <button
              onClick={() => dismiss(a.id)}
              style={{
                background: "none",
                border: "none",
                color: "#475569",
                cursor: "pointer",
                fontSize: "16px",
                lineHeight: 1,
                padding: "2px 6px",
                flexShrink: 0,
              }}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
