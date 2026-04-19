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

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      const isPublic = PUBLIC_PATHS.some((p) => pathname?.endsWith(p));
      if (!firebaseUser && !isPublic) {
        router.replace("/login");
        return;
      }
      if (firebaseUser)
        setUser({
          email: firebaseUser.email || "",
          displayName: firebaseUser.displayName || "",
        });
      setChecked(true);
    });
    return () => unsub();
  }, [pathname]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  if (!checked)
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
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        )}
      </nav>

      {/* Mobile dropdown menu */}
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

            {/* Divider */}
            <div
              style={{
                height: "1px",
                background: "rgba(255,255,255,0.1)",
                margin: "8px 20px",
              }}
            />

            {/* User info */}
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

      <main>{children}</main>
    </div>
  );
}
