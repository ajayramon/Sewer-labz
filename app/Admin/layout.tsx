"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/app/Lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";

const ADMIN_EMAILS = ["your-email@gmail.com", "client-email@gmail.com"];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user || !ADMIN_EMAILS.includes(user.email ?? "")) {
        router.replace("/");
      } else {
        setAuthorized(true);
      }
      setChecking(false);
    });
    return () => unsub();
  }, [router]);

  if (checking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'DM Mono', monospace",
          color: "#4ade80",
          fontSize: "14px",
          letterSpacing: "0.1em",
        }}
      >
        VERIFYING ACCESS...
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        fontFamily: "'DM Mono', monospace",
        color: "#e2e8f0",
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid #1e293b",
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "56px",
          background: "#0d1117",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#4ade80",
                boxShadow: "0 0 8px #4ade80",
                animation: "pulse 2s infinite",
              }}
            />
            <span
              style={{
                color: "#4ade80",
                fontSize: "12px",
                letterSpacing: "0.15em",
                fontWeight: 600,
              }}
            >
              SEWER LABZ / ADMIN
            </span>
          </div>

          <nav style={{ display: "flex", gap: "4px" }}>
            {[
              { id: "users", label: "USERS", href: "/admin" },
              { id: "stats", label: "STATS", href: "/admin/stats" },
              {
                id: "announcements",
                label: "ANNOUNCE",
                href: "/admin/announcements",
              },
            ].map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                style={{
                  padding: "6px 14px",
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  color: activeTab === tab.id ? "#4ade80" : "#64748b",
                  textDecoration: "none",
                  borderRadius: "4px",
                  background:
                    activeTab === tab.id
                      ? "rgba(74,222,128,0.08)"
                      : "transparent",
                  border:
                    activeTab === tab.id
                      ? "1px solid rgba(74,222,128,0.2)"
                      : "1px solid transparent",
                  transition: "all 0.15s",
                }}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>

        <Link
          href="/"
          style={{
            fontSize: "11px",
            color: "#475569",
            textDecoration: "none",
            letterSpacing: "0.08em",
            padding: "5px 10px",
            border: "1px solid #1e293b",
            borderRadius: "4px",
          }}
        >
          ← BACK TO APP
        </Link>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 2px; }
      `}</style>

      <main
        style={{
          padding: "32px",
          maxWidth: "1400px",
          margin: "0 auto",
          animation: "fadeIn 0.3s ease",
        }}
      >
        {children}
      </main>
    </div>
  );
}
