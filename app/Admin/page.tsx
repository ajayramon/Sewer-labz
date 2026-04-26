"use client";

import { useEffect, useState, useCallback } from "react";
import { auth } from "@/app/Lib/firebase";

interface UserRecord {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
  plan: "free" | "pro_monthly" | "pro_annually";
  reportsCount: number;
  lastActive: string;
  subscriptionId?: string;
}

const PLAN_COLORS: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  free: { bg: "rgba(100,116,139,0.15)", color: "#64748b", label: "FREE" },
  pro_monthly: {
    bg: "rgba(74,222,128,0.12)",
    color: "#4ade80",
    label: "PRO / MO",
  },
  pro_annually: {
    bg: "rgba(96,165,250,0.12)",
    color: "#60a5fa",
    label: "PRO / YR",
  },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [selected, setSelected] = useState<UserRecord | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeTarget, setUpgradeTarget] = useState<string>("pro_monthly");
  const [toast, setToast] = useState<{
    msg: string;
    type: "ok" | "err";
  } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data.users);
    } catch (e) {
      showToast("Failed to load users", "err");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handlePlanChange = async (uid: string, plan: string) => {
    setUpgrading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/admin/users/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ uid, plan }),
      });
      if (!res.ok) throw new Error();
      showToast(`Plan updated to ${plan}`, "ok");
      setSelected(null);
      fetchUsers();
    } catch {
      showToast("Failed to update plan", "err");
    } finally {
      setUpgrading(false);
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.displayName || "").toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === "all" || u.plan === planFilter;
    return matchSearch && matchPlan;
  });

  const stats = {
    total: users.length,
    free: users.filter((u) => u.plan === "free").length,
    pro: users.filter((u) => u.plan !== "free").length,
  };

  return (
    <div>
      {/* Toast */}
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
            animation: "fadeIn 0.2s ease",
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
          marginBottom: "28px",
        }}
      >
        {[
          { label: "TOTAL USERS", value: stats.total, accent: "#e2e8f0" },
          { label: "FREE PLAN", value: stats.free, accent: "#64748b" },
          { label: "PRO USERS", value: stats.pro, accent: "#4ade80" },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              background: "#0d1117",
              border: "1px solid #1e293b",
              borderRadius: "8px",
              padding: "20px 24px",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                color: "#475569",
                letterSpacing: "0.15em",
                marginBottom: "8px",
              }}
            >
              {card.label}
            </div>
            <div
              style={{
                fontSize: "32px",
                color: card.accent,
                fontWeight: 500,
                lineHeight: 1,
              }}
            >
              {loading ? "—" : card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "16px",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="SEARCH USERS..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            background: "#0d1117",
            border: "1px solid #1e293b",
            borderRadius: "6px",
            padding: "9px 14px",
            color: "#e2e8f0",
            fontSize: "12px",
            letterSpacing: "0.08em",
            outline: "none",
            fontFamily: "inherit",
          }}
        />
        {["all", "free", "pro_monthly", "pro_annually"].map((f) => (
          <button
            key={f}
            onClick={() => setPlanFilter(f)}
            style={{
              padding: "8px 14px",
              fontSize: "10px",
              letterSpacing: "0.1em",
              background:
                planFilter === f ? "rgba(74,222,128,0.1)" : "transparent",
              border:
                planFilter === f
                  ? "1px solid rgba(74,222,128,0.25)"
                  : "1px solid #1e293b",
              borderRadius: "5px",
              color: planFilter === f ? "#4ade80" : "#475569",
              cursor: "pointer",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
            }}
          >
            {f === "all"
              ? "ALL"
              : f === "free"
                ? "FREE"
                : f === "pro_monthly"
                  ? "PRO/MO"
                  : "PRO/YR"}
          </button>
        ))}
        <button
          onClick={fetchUsers}
          style={{
            padding: "8px 14px",
            fontSize: "10px",
            letterSpacing: "0.1em",
            background: "transparent",
            border: "1px solid #1e293b",
            borderRadius: "5px",
            color: "#475569",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          ↻ REFRESH
        </button>
      </div>

      {/* Users Table */}
      <div
        style={{
          background: "#0d1117",
          border: "1px solid #1e293b",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {/* Table Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1.2fr 1fr 0.8fr 1fr 1fr",
            padding: "10px 20px",
            borderBottom: "1px solid #1e293b",
            fontSize: "10px",
            color: "#334155",
            letterSpacing: "0.12em",
          }}
        >
          <span>USER</span>
          <span>PLAN</span>
          <span>REPORTS</span>
          <span>JOINED</span>
          <span>LAST ACTIVE</span>
          <span style={{ textAlign: "right" }}>ACTIONS</span>
        </div>

        {loading ? (
          <div
            style={{
              padding: "48px",
              textAlign: "center",
              color: "#334155",
              fontSize: "12px",
              letterSpacing: "0.1em",
            }}
          >
            LOADING USERS...
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              padding: "48px",
              textAlign: "center",
              color: "#334155",
              fontSize: "12px",
              letterSpacing: "0.1em",
            }}
          >
            NO USERS FOUND
          </div>
        ) : (
          filtered.map((user, i) => {
            const planMeta = PLAN_COLORS[user.plan] || PLAN_COLORS.free;
            return (
              <div
                key={user.uid}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1.2fr 1fr 0.8fr 1fr 1fr",
                  padding: "14px 20px",
                  borderBottom:
                    i < filtered.length - 1 ? "1px solid #0f172a" : "none",
                  alignItems: "center",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#0f172a")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#e2e8f0",
                      marginBottom: "2px",
                    }}
                  >
                    {user.displayName || "—"}
                  </div>
                  <div style={{ fontSize: "11px", color: "#475569" }}>
                    {user.email}
                  </div>
                </div>

                <div>
                  <span
                    style={{
                      fontSize: "10px",
                      padding: "3px 8px",
                      borderRadius: "4px",
                      background: planMeta.bg,
                      color: planMeta.color,
                      letterSpacing: "0.1em",
                      border: `1px solid ${planMeta.color}22`,
                    }}
                  >
                    {planMeta.label}
                  </span>
                </div>

                <div style={{ fontSize: "13px", color: "#94a3b8" }}>
                  {user.reportsCount}
                </div>

                <div style={{ fontSize: "11px", color: "#475569" }}>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "2-digit",
                      })
                    : "—"}
                </div>

                <div style={{ fontSize: "11px", color: "#475569" }}>
                  {user.lastActive
                    ? new Date(user.lastActive).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "2-digit",
                      })
                    : "—"}
                </div>

                <div style={{ textAlign: "right" }}>
                  <button
                    onClick={() => {
                      setSelected(user);
                      setUpgradeTarget(user.plan);
                    }}
                    style={{
                      padding: "5px 12px",
                      fontSize: "10px",
                      letterSpacing: "0.08em",
                      background: "transparent",
                      border: "1px solid #1e293b",
                      borderRadius: "4px",
                      color: "#64748b",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    MANAGE
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div
        style={{
          marginTop: "12px",
          fontSize: "11px",
          color: "#334155",
          letterSpacing: "0.06em",
        }}
      >
        {filtered.length} of {users.length} users
      </div>

      {/* Manage Modal */}
      {selected && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            backdropFilter: "blur(4px)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <div
            style={{
              background: "#0d1117",
              border: "1px solid #1e293b",
              borderRadius: "10px",
              padding: "28px",
              width: "420px",
              animation: "fadeIn 0.2s ease",
            }}
          >
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  fontSize: "10px",
                  color: "#475569",
                  letterSpacing: "0.15em",
                  marginBottom: "8px",
                }}
              >
                MANAGE USER
              </div>
              <div style={{ fontSize: "15px", color: "#e2e8f0" }}>
                {selected.displayName || selected.email}
              </div>
              <div
                style={{ fontSize: "12px", color: "#475569", marginTop: "2px" }}
              >
                {selected.email}
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  fontSize: "10px",
                  color: "#475569",
                  letterSpacing: "0.12em",
                  marginBottom: "10px",
                }}
              >
                CHANGE PLAN
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {[
                  { value: "free", label: "Free", desc: "Basic access" },
                  {
                    value: "pro_monthly",
                    label: "Pro Monthly",
                    desc: "Full access, billed monthly",
                  },
                  {
                    value: "pro_annually",
                    label: "Pro Annually",
                    desc: "Full access, billed yearly",
                  },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 14px",
                      border: `1px solid ${upgradeTarget === opt.value ? "rgba(74,222,128,0.3)" : "#1e293b"}`,
                      borderRadius: "6px",
                      cursor: "pointer",
                      background:
                        upgradeTarget === opt.value
                          ? "rgba(74,222,128,0.05)"
                          : "transparent",
                    }}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value={opt.value}
                      checked={upgradeTarget === opt.value}
                      onChange={() => setUpgradeTarget(opt.value)}
                      style={{ accentColor: "#4ade80" }}
                    />
                    <div>
                      <div style={{ fontSize: "12px", color: "#e2e8f0" }}>
                        {opt.label}
                      </div>
                      <div style={{ fontSize: "11px", color: "#475569" }}>
                        {opt.desc}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setSelected(null)}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "transparent",
                  border: "1px solid #1e293b",
                  borderRadius: "6px",
                  color: "#475569",
                  fontSize: "12px",
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                CANCEL
              </button>
              <button
                onClick={() => handlePlanChange(selected.uid, upgradeTarget)}
                disabled={upgrading || upgradeTarget === selected.plan}
                style={{
                  flex: 1,
                  padding: "10px",
                  background:
                    upgrading || upgradeTarget === selected.plan
                      ? "rgba(74,222,128,0.05)"
                      : "rgba(74,222,128,0.12)",
                  border: "1px solid rgba(74,222,128,0.25)",
                  borderRadius: "6px",
                  color: "#4ade80",
                  fontSize: "12px",
                  letterSpacing: "0.08em",
                  cursor:
                    upgrading || upgradeTarget === selected.plan
                      ? "not-allowed"
                      : "pointer",
                  fontFamily: "inherit",
                  opacity: upgradeTarget === selected.plan ? 0.5 : 1,
                }}
              >
                {upgrading ? "SAVING..." : "SAVE CHANGES"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
