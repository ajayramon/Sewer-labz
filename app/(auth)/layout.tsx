"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    // Firebase real-time auth listener
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
      }

      setChecked(true);
    });

    return () => unsub(); // cleanup listener on unmount
  }, [pathname]);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  // Still checking auth
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

  // Public pages — no nav
  const isPublic = PUBLIC_PATHS.some((p) => pathname?.endsWith(p));
  if (isPublic) return <>{children}</>;

  // Protected pages — show nav
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
          padding: "0 24px",
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

        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {[
            { href: "/", label: "📋 Dashboard" },
            { href: "/reports", label: "📄 Reports" },
            { href: "/reports/new", label: "+ New Report" },
            { href: "/templates", label: "🗂 Templates" },
            { href: "/settings", label: "⚙️ Settings" },
          ].map(({ href, label }) => {
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
      </nav>

      <main>{children}</main>
    </div>
  );
}
