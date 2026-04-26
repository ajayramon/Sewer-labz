"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/app/Lib/firebase";

const PUBLIC_PATHS = ["/login", "/signup", "/forget-password"];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [checked, setChecked] = useState(false);
  const [user, setUser] = useState<{
    email: string;
    displayName?: string;
  } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [announcements, setAnnouncements] = useState<
    {
      id: string;
      message: string;
      type: "info" | "warning" | "success";
      target: string;
    }[]
  >([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  // Mobile detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Auth check
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      const isPublic = PUBLIC_PATHS.some((p) => pathname?.endsWith(p));
      if (!firebaseUser && !isPublic) {
        router.replace("/login");
        return;
      }
      if (firebaseUser) {
        setUser({
          email: firebaseUser.email || "",
          displayName: firebaseUser.displayName || "",
        });
        // Fetch announcements after auth
        firebaseUser.getIdToken().then((token) => {
          fetch("/api/announcements", {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((r) => r.json())
            .then((data) => setAnnouncements(data.announcements ?? []))
            .catch(() => {});
        });
      }
      setChecked(true);
    });
    return () => unsub();
  }, [pathname, router]);

  // Load dismissed IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("dismissed_announcements");
      if (stored) setDismissed(new Set(JSON.parse(stored)));
    } catch {}
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  const dismissAnnouncement = (id: string) => {
    const next = new Set([...dismissed, id]);
    setDismissed(next);
    try {
      localStorage.setItem(
        "dismissed_announcements",
        JSON.stringify([...next]),
      );
    } catch {}
  };

  const visibleAnnouncements = announcements.filter(
    (a) => !dismissed.has(a.id),
  );

  const TYPE_STYLES = {
    info: {
      bg: "rgba(96,165,250,0.1)",
      border: "rgba(96,165,250,0.25)",
      color: "#60a5fa",
      icon: "ℹ",
    },
    warning: {
      bg: "rgba(245,158,11,0.1)",
      border: "rgba(245,158,11,0.25)",
      color: "#f59e0b",
      icon: "⚠",
    },
    success: {
      bg: "rgba(45,140,78,0.12)",
      border: "rgba(45,140,78,0.25)",
      color: "#2D8C4E",
      icon: "✓",
    },
  };

  // Loading screen
  if (!checked) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F8FAFC",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{ fontSize: "24px", fontWeight: 900, marginBottom: "8px" }}
          >
            SEWER <span style={{ color: "#2D8C4E" }}>LABZ</span>
          </div>
          <div style={{ fontSize: "13px", color: "#94A3B8" }}>Loading...</div>
        </div>
      </div>
    );
  }

  // Public pages — render children with no nav
  const isPublic = PUBLIC_PATHS.some((p) => pathname?.endsWith(p));
  if (isPublic) return <>{children}</>;

  const navLinks = [
    { href: "/", label: "📋 Dashboard" },
    { href: "/reports", label: "📄 Reports" },
    { href: "/reports/new", label: "+ New Report" },
    { href: "/templates", label: "🗂 Templates" },
    { href: "/settings", label: "⚙️ Settings" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8FAFC",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      {/* ── Nav ── */}
      <nav
        style={{
          background: "#0F2A4A",
          color: "#fff",
          padding: "0 16px",
          height: "52px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <span
            style={{
              fontSize: "20px",
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-0.5px",
            }}
          >
            SEWER <span style={{ color: "#2D8C4E" }}>LABZ</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {navLinks.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: 600,
                    textDecoration: "none",
                    background: active ? "#2D8C4E" : "transparent",
                    color: active ? "#fff" : "#CBD5E1",
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Desktop user + logout */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {user && (
              <span style={{ fontSize: "12px", color: "#94A3B8" }}>
                {user.displayName || user.email}
              </span>
            )}
            <button
              onClick={handleLogout}
              style={{
                padding: "6px 14px",
                borderRadius: "6px",
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.2)",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Sign Out
            </button>
          </div>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: "22px",
              cursor: "pointer",
              padding: "4px 8px",
              lineHeight: 1,
            }}
            aria-label="Toggle menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        )}
      </nav>

      {/* ── Mobile dropdown ── */}
      {isMobile && menuOpen && (
        <div
          style={{
            position: "fixed",
            top: "52px",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Backdrop */}
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
            }}
          />

          {/* Menu panel */}
          <div
            style={{
              position: "relative",
              background: "#0F2A4A",
              padding: "8px 0 16px",
              zIndex: 100,
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            {navLinks.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: "block",
                    padding: "14px 20px",
                    fontSize: "15px",
                    fontWeight: 600,
                    textDecoration: "none",
                    background: active ? "rgba(45,140,78,0.3)" : "transparent",
                    color: active ? "#2D8C4E" : "#CBD5E1",
                    borderLeft: active
                      ? "3px solid #2D8C4E"
                      : "3px solid transparent",
                  }}
                >
                  {label}
                </Link>
              );
            })}

            <div
              style={{
                height: "1px",
                background: "rgba(255,255,255,0.1)",
                margin: "8px 20px",
              }}
            />

            {user && (
              <div
                style={{
                  padding: "8px 20px",
                  fontSize: "12px",
                  color: "#94A3B8",
                }}
              >
                {user.displayName || user.email}
              </div>
            )}

            <button
              onClick={handleLogout}
              style={{
                margin: "4px 20px 0",
                padding: "10px 16px",
                borderRadius: "6px",
                background: "rgba(220,38,38,0.15)",
                color: "#FCA5A5",
                border: "1px solid rgba(220,38,38,0.3)",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                width: "calc(100% - 40px)",
                textAlign: "left",
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* ── Announcement Banners ── */}
      {visibleAnnouncements.length > 0 && (
        <div>
          {visibleAnnouncements.map((a) => {
            const s = TYPE_STYLES[a.type] ?? TYPE_STYLES.info;
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
                  <span
                    style={{ color: s.color, fontSize: "15px", flexShrink: 0 }}
                  >
                    {s.icon}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "#1e293b",
                      lineHeight: 1.5,
                    }}
                  >
                    {a.message}
                  </span>
                </div>
                <button
                  onClick={() => dismissAnnouncement(a.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#94A3B8",
                    cursor: "pointer",
                    fontSize: "18px",
                    lineHeight: 1,
                    padding: "0 4px",
                    flexShrink: 0,
                  }}
                  aria-label="Dismiss announcement"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Page content ── */}
      <main>{children}</main>
    </div>
  );
}
