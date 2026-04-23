"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/Lib/firebase";

type UserPlan = {
  plan: string;
  subscriptionStatus: string;
  email: string;
  fullName: string;
  lemonsqueezyCustomerId: string | null;
};

const plans = [
  {
    id: "FREE",
    name: "Free",
    price: "$0",
    period: "/mo",
    color: "#64748B",
    borderColor: "#E2E8F0",
    badge: null,
    features: [
      "5 reports/month",
      "Basic templates",
      "PDF export",
      "Email support",
    ],
  },
  {
    id: "PRO_MONTHLY",
    name: "Pro Monthly",
    price: "$49.99",
    period: "/mo",
    color: "#2D8C4E",
    borderColor: "#2D8C4E",
    badge: "Most Popular",
    features: [
      "Unlimited reports",
      "Custom templates",
      "Priority support",
      "No watermark",
      "Logo upload",
      "Custom dropdowns",
    ],
  },
  {
    id: "PRO_ANNUALLY",
    name: "Pro Annually",
    price: "$499.99",
    period: "/yr",
    color: "#0F2A4A",
    borderColor: "#0F2A4A",
    badge: "Save $99",
    features: [
      "Everything in Pro Monthly",
      "2 months free",
      "Best value",
      "Priority support",
      "Logo upload",
      "Custom dropdowns",
    ],
  },
];

export default function BillingPage() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.replace("/login");
        return;
      }
      setUid(u.uid);
      try {
        const res = await fetch("/api/settings", {
          headers: { "x-user-id": u.uid },
        });
        if (res.ok) {
          const data = await res.json();
          setUserPlan({
            plan: data.plan || "FREE",
            subscriptionStatus: data.subscriptionStatus || "active",
            email: u.email || "",
            fullName: data.fullName || u.displayName || "",
            lemonsqueezyCustomerId: data.lemonsqueezyCustomerId || null,
          });
        }
      } catch {
        setUserPlan({
          plan: "FREE",
          subscriptionStatus: "active",
          email: u.email || "",
          fullName: u.displayName || "",
          lemonsqueezyCustomerId: null,
        });
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const handleSubscribe = async (planId: string) => {
    if (!uid || !userPlan) return;
    if (planId === "FREE") return;
    setCheckoutLoading(planId);
    try {
      const res = await fetch("/api/lemonsqueezy/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: planId,
          email: userPlan.email,
          name: userPlan.fullName,
          userId: uid,
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert("Failed to create checkout. Please try again.");
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setCheckoutLoading("");
    }
  };

  const isCurrentPlan = (planId: string) => {
    if (!userPlan) return false;
    if (planId === "FREE" && userPlan.plan === "FREE") return true;
    if (
      planId === "PRO_MONTHLY" &&
      userPlan.plan === "PRO" &&
      userPlan.subscriptionStatus === "active"
    )
      return true;
    if (planId === "PRO_ANNUALLY" && userPlan.plan === "PRO_ANNUALLY")
      return true;
    return false;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return { bg: "#F0FDF4", color: "#16A34A" };
      case "cancelled":
        return { bg: "#FEF2F2", color: "#DC2626" };
      case "past_due":
        return { bg: "#FFFBEB", color: "#D97706" };
      case "pending":
        return { bg: "#EFF6FF", color: "#2563EB" };
      default:
        return { bg: "#F1F5F9", color: "#64748B" };
    }
  };

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F8FAFC",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "24px",
              fontWeight: 900,
              marginBottom: "8px",
              color: "#0F2A4A",
            }}
          >
            SEWER <span style={{ color: "#2D8C4E" }}>LABZ</span>
          </div>
          <div style={{ fontSize: "13px", color: "#94A3B8" }}>
            Loading billing...
          </div>
        </div>
      </div>
    );

  const statusStyle = getStatusColor(userPlan?.subscriptionStatus || "active");

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "900px",
        margin: "0 auto",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1
          style={{
            fontSize: "22px",
            fontWeight: 800,
            color: "#0F2A4A",
            margin: "0 0 4px",
          }}
        >
          Billing & Plans
        </h1>
        <p style={{ fontSize: "13px", color: "#94A3B8", margin: 0 }}>
          Manage your subscription and plan
        </p>
      </div>

      {/* Current Plan Card */}
      {userPlan && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #E2E8F0",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "28px",
          }}
        >
          <h2
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#0F2A4A",
              margin: "0 0 16px",
              textTransform: "uppercase",
            }}
          >
            Current Subscription
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#94A3B8",
                  textTransform: "uppercase",
                  marginBottom: "4px",
                }}
              >
                Plan
              </div>
              <div
                style={{ fontSize: "15px", fontWeight: 700, color: "#0F2A4A" }}
              >
                {userPlan.plan === "FREE"
                  ? "Free"
                  : userPlan.plan === "PRO"
                    ? "Pro Monthly"
                    : "Pro Annually"}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#94A3B8",
                  textTransform: "uppercase",
                  marginBottom: "4px",
                }}
              >
                Status
              </div>
              <span
                style={{
                  padding: "3px 10px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 700,
                  background: statusStyle.bg,
                  color: statusStyle.color,
                }}
              >
                {userPlan.subscriptionStatus?.toUpperCase() || "ACTIVE"}
              </span>
            </div>
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#94A3B8",
                  textTransform: "uppercase",
                  marginBottom: "4px",
                }}
              >
                Account
              </div>
              <div style={{ fontSize: "13px", color: "#374151" }}>
                {userPlan.email}
              </div>
            </div>
          </div>

          {/* Usage bar for free plan */}
          {userPlan.plan === "FREE" && (
            <div
              style={{
                marginTop: "16px",
                paddingTop: "16px",
                borderTop: "1px solid #F1F5F9",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "6px",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    color: "#64748B",
                    fontWeight: 600,
                  }}
                >
                  Monthly Reports
                </span>
                <span style={{ fontSize: "12px", color: "#64748B" }}>
                  Free plan — 5 max
                </span>
              </div>
              <div
                style={{
                  background: "#F1F5F9",
                  borderRadius: "20px",
                  height: "6px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    background: "#2D8C4E",
                    height: "100%",
                    width: "0%",
                    borderRadius: "20px",
                  }}
                />
              </div>
              <p
                style={{ fontSize: "11px", color: "#94A3B8", marginTop: "6px" }}
              >
                Upgrade to Pro for unlimited reports
              </p>
            </div>
          )}

          {/* Cancel subscription for pro users */}
          {userPlan.plan !== "FREE" &&
            userPlan.subscriptionStatus === "active" && (
              <div
                style={{
                  marginTop: "16px",
                  paddingTop: "16px",
                  borderTop: "1px solid #F1F5F9",
                }}
              >
                <p
                  style={{
                    fontSize: "12px",
                    color: "#94A3B8",
                    margin: "0 0 8px",
                  }}
                >
                  Your subscription renews automatically. Cancel anytime.
                </p>
                <button
                  onClick={() =>
                    window.open(
                      "https://app.lemonsqueezy.com/my-orders",
                      "_blank",
                    )
                  }
                  style={{
                    padding: "7px 14px",
                    borderRadius: "6px",
                    border: "1px solid #E2E8F0",
                    background: "#fff",
                    color: "#DC2626",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Manage / Cancel Subscription
                </button>
              </div>
            )}
        </div>
      )}

      {/* Plans */}
      <h2
        style={{
          fontSize: "16px",
          fontWeight: 700,
          color: "#0F2A4A",
          margin: "0 0 16px",
        }}
      >
        Available Plans
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        {plans.map((plan) => {
          const isCurrent = isCurrentPlan(plan.id);
          const isLoading = checkoutLoading === plan.id;
          return (
            <div
              key={plan.id}
              style={{
                background: "#fff",
                border: `2px solid ${isCurrent ? plan.borderColor : "#E2E8F0"}`,
                borderRadius: "12px",
                padding: "20px",
                position: "relative",
                transition: "border-color 0.2s",
              }}
            >
              {/* Badge */}
              {plan.badge && (
                <div
                  style={{
                    position: "absolute",
                    top: "-10px",
                    right: "12px",
                    background: plan.color,
                    color: "#fff",
                    fontSize: "10px",
                    fontWeight: 700,
                    padding: "2px 10px",
                    borderRadius: "20px",
                    textTransform: "uppercase",
                  }}
                >
                  {plan.badge}
                </div>
              )}

              {/* Current badge */}
              {isCurrent && (
                <div
                  style={{
                    position: "absolute",
                    top: "-10px",
                    left: "12px",
                    background: "#0F2A4A",
                    color: "#fff",
                    fontSize: "10px",
                    fontWeight: 700,
                    padding: "2px 10px",
                    borderRadius: "20px",
                    textTransform: "uppercase",
                  }}
                >
                  ✓ Current Plan
                </div>
              )}

              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#0F2A4A",
                  marginBottom: "4px",
                }}
              >
                {plan.name}
              </div>
              <div style={{ marginBottom: "16px" }}>
                <span
                  style={{
                    fontSize: "28px",
                    fontWeight: 900,
                    color: plan.color,
                  }}
                >
                  {plan.price}
                </span>
                <span style={{ fontSize: "12px", color: "#94A3B8" }}>
                  {plan.period}
                </span>
              </div>

              <div style={{ marginBottom: "20px" }}>
                {plan.features.map((f) => (
                  <div
                    key={f}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginBottom: "6px",
                    }}
                  >
                    <span
                      style={{
                        color: plan.color,
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      ✓
                    </span>
                    <span style={{ fontSize: "12px", color: "#374151" }}>
                      {f}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={isCurrent || plan.id === "FREE" || isLoading}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "none",
                  background: isCurrent
                    ? "#F1F5F9"
                    : plan.id === "FREE"
                      ? "#F1F5F9"
                      : isLoading
                        ? "#94A3B8"
                        : plan.color,
                  color: isCurrent || plan.id === "FREE" ? "#94A3B8" : "#fff",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor:
                    isCurrent || plan.id === "FREE" ? "default" : "pointer",
                }}
              >
                {isLoading
                  ? "Redirecting..."
                  : isCurrent
                    ? "Current Plan"
                    : plan.id === "FREE"
                      ? "Free Plan"
                      : `Upgrade to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #E2E8F0",
          borderRadius: "12px",
          padding: "20px",
        }}
      >
        <h2
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: "#0F2A4A",
            margin: "0 0 16px",
            textTransform: "uppercase",
          }}
        >
          Frequently Asked Questions
        </h2>
        {[
          {
            q: "Can I cancel anytime?",
            a: "Yes. Cancel anytime from your subscription management page. You keep access until the end of your billing period.",
          },
          {
            q: "What happens when I upgrade?",
            a: "You are redirected to secure checkout. Once payment is confirmed your plan upgrades instantly.",
          },
          {
            q: "Is my payment secure?",
            a: "Yes. All payments are processed by LemonSqueezy which handles tax compliance and secure payment processing.",
          },
          {
            q: "Do you offer refunds?",
            a: "All fees are non-refundable except where required by law. Please review our terms before subscribing.",
          },
        ].map(({ q, a }) => (
          <div
            key={q}
            style={{
              marginBottom: "16px",
              paddingBottom: "16px",
              borderBottom: "1px solid #F1F5F9",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#0F2A4A",
                marginBottom: "4px",
              }}
            >
              {q}
            </div>
            <div
              style={{ fontSize: "13px", color: "#64748B", lineHeight: "1.6" }}
            >
              {a}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
