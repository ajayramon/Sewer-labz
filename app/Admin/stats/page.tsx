"use client";

import { useEffect, useState } from "react";
import { auth } from "@/app/Lib/firebase";

interface StatsData {
  signupsPerMonth: { month: string; count: number }[];
  reportsPerMonth: { month: string; count: number }[];
  totalReports: number;
  totalUsers: number;
  proUsers: number;
  reportsThisMonth: number;
  signupsThisMonth: number;
}

function Bar({
  value,
  max,
  color,
}: {
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      <div
        style={{
          width: "100%",
          height: `${pct}%`,
          minHeight: pct > 0 ? "3px" : "0",
          background: color,
          borderRadius: "3px 3px 0 0",
          transition: "height 0.5s ease",
          opacity: 0.85,
        }}
      />
    </div>
  );
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch("/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        setStats(await res.json());
      } catch {
        // show empty state
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const maxSignups = Math.max(
    ...(stats?.signupsPerMonth.map((m) => m.count) ?? [1]),
    1,
  );
  const maxReports = Math.max(
    ...(stats?.reportsPerMonth.map((m) => m.count) ?? [1]),
    1,
  );

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <div
          style={{
            fontSize: "10px",
            color: "#475569",
            letterSpacing: "0.15em",
            marginBottom: "6px",
          }}
        >
          USAGE ANALYTICS
        </div>
        <div style={{ fontSize: "20px", color: "#e2e8f0", fontWeight: 500 }}>
          Platform Stats
        </div>
      </div>

      {/* KPI Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "12px",
          marginBottom: "28px",
        }}
      >
        {[
          { label: "TOTAL USERS", value: stats?.totalUsers, color: "#e2e8f0" },
          {
            label: "PRO SUBSCRIBERS",
            value: stats?.proUsers,
            color: "#4ade80",
          },
          {
            label: "TOTAL REPORTS",
            value: stats?.totalReports,
            color: "#60a5fa",
          },
          {
            label: "REPORTS / THIS MO.",
            value: stats?.reportsThisMonth,
            color: "#f59e0b",
          },
          {
            label: "SIGNUPS / THIS MO.",
            value: stats?.signupsThisMonth,
            color: "#a78bfa",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: "#0d1117",
              border: "1px solid #1e293b",
              borderRadius: "8px",
              padding: "18px 20px",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                color: "#334155",
                letterSpacing: "0.12em",
                marginBottom: "10px",
              }}
            >
              {kpi.label}
            </div>
            <div
              style={{
                fontSize: "28px",
                color: kpi.color,
                fontWeight: 500,
                lineHeight: 1,
              }}
            >
              {loading ? "—" : (kpi.value ?? 0)}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
      >
        {/* Signups Chart */}
        <div
          style={{
            background: "#0d1117",
            border: "1px solid #1e293b",
            borderRadius: "8px",
            padding: "24px",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              color: "#475569",
              letterSpacing: "0.12em",
              marginBottom: "20px",
            }}
          >
            SIGNUPS PER MONTH
          </div>
          {loading ? (
            <div
              style={{
                height: "160px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#334155",
                fontSize: "12px",
              }}
            >
              LOADING...
            </div>
          ) : (
            <div>
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  height: "160px",
                  alignItems: "flex-end",
                  borderBottom: "1px solid #1e293b",
                  paddingBottom: "0",
                }}
              >
                {(stats?.signupsPerMonth ?? []).map((m) => (
                  <div
                    key={m.month}
                    style={{
                      flex: 1,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      gap: "6px",
                    }}
                  >
                    <Bar value={m.count} max={maxSignups} color="#4ade80" />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                {(stats?.signupsPerMonth ?? []).map((m) => (
                  <div
                    key={m.month}
                    style={{
                      flex: 1,
                      textAlign: "center",
                      fontSize: "9px",
                      color: "#334155",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {m.month}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: "6px", marginTop: "2px" }}>
                {(stats?.signupsPerMonth ?? []).map((m) => (
                  <div
                    key={m.month}
                    style={{
                      flex: 1,
                      textAlign: "center",
                      fontSize: "10px",
                      color: "#64748b",
                    }}
                  >
                    {m.count}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reports Chart */}
        <div
          style={{
            background: "#0d1117",
            border: "1px solid #1e293b",
            borderRadius: "8px",
            padding: "24px",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              color: "#475569",
              letterSpacing: "0.12em",
              marginBottom: "20px",
            }}
          >
            REPORTS GENERATED PER MONTH
          </div>
          {loading ? (
            <div
              style={{
                height: "160px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#334155",
                fontSize: "12px",
              }}
            >
              LOADING...
            </div>
          ) : (
            <div>
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  height: "160px",
                  alignItems: "flex-end",
                  borderBottom: "1px solid #1e293b",
                }}
              >
                {(stats?.reportsPerMonth ?? []).map((m) => (
                  <div
                    key={m.month}
                    style={{
                      flex: 1,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Bar value={m.count} max={maxReports} color="#60a5fa" />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                {(stats?.reportsPerMonth ?? []).map((m) => (
                  <div
                    key={m.month}
                    style={{
                      flex: 1,
                      textAlign: "center",
                      fontSize: "9px",
                      color: "#334155",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {m.month}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: "6px", marginTop: "2px" }}>
                {(stats?.reportsPerMonth ?? []).map((m) => (
                  <div
                    key={m.month}
                    style={{
                      flex: 1,
                      textAlign: "center",
                      fontSize: "10px",
                      color: "#64748b",
                    }}
                  >
                    {m.count}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Conversion rate */}
      {stats && (
        <div
          style={{
            marginTop: "16px",
            background: "#0d1117",
            border: "1px solid #1e293b",
            borderRadius: "8px",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            gap: "32px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "10px",
                color: "#334155",
                letterSpacing: "0.12em",
                marginBottom: "6px",
              }}
            >
              CONVERSION RATE
            </div>
            <div
              style={{ fontSize: "24px", color: "#f59e0b", fontWeight: 500 }}
            >
              {stats.totalUsers > 0
                ? ((stats.proUsers / stats.totalUsers) * 100).toFixed(1)
                : "0.0"}
              %
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                height: "6px",
                background: "#1e293b",
                borderRadius: "3px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${stats.totalUsers > 0 ? (stats.proUsers / stats.totalUsers) * 100 : 0}%`,
                  background: "linear-gradient(90deg, #4ade80, #f59e0b)",
                  borderRadius: "3px",
                  transition: "width 0.8s ease",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "6px",
                fontSize: "10px",
                color: "#334155",
              }}
            >
              <span>{stats.proUsers} PRO</span>
              <span>{stats.totalUsers - stats.proUsers} FREE</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
