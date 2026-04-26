import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/app/Lib/firebase-admin";

const ADMIN_EMAILS = ["your-email@gmail.com", "client-email@gmail.com"];

async function verifyAdmin(req: NextRequest) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) throw new Error("Unauthorized");
  const decoded = await adminAuth.verifyIdToken(token);
  if (!ADMIN_EMAILS.includes(decoded.email ?? "")) throw new Error("Forbidden");
  return decoded;
}

function getMonthKey(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthKey(key: string) {
  const [year, month] = key.split("-");
  return new Date(Number(year), Number(month) - 1).toLocaleString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

function getLast12Months() {
  const months: string[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    );
  }
  return months;
}

export async function GET(req: NextRequest) {
  try {
    await verifyAdmin(req);

    const [usersSnap, reportsSnap] = await Promise.all([
      adminDb.collection("users").get(),
      adminDb.collection("reports").get(),
    ]);

    const users = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as any);
    const reports = reportsSnap.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as any,
    );

    const totalUsers = users.length;
    const proUsers = users.filter((u) => u.plan && u.plan !== "free").length;
    const totalReports = reports.length;

    const now = new Date();
    const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const reportsThisMonth = reports.filter((r) => {
      const dateStr =
        r.createdAt?.toDate?.()?.toISOString() ?? r.createdAt ?? "";
      return getMonthKey(dateStr) === thisMonthKey;
    }).length;

    const signupsThisMonth = users.filter((u) => {
      const dateStr =
        u.createdAt?.toDate?.()?.toISOString() ?? u.createdAt ?? "";
      return getMonthKey(dateStr) === thisMonthKey;
    }).length;

    const last12 = getLast12Months();

    // Signups per month
    const signupMap: Record<string, number> = {};
    last12.forEach((k) => (signupMap[k] = 0));
    users.forEach((u) => {
      const dateStr =
        u.createdAt?.toDate?.()?.toISOString() ?? u.createdAt ?? "";
      const key = getMonthKey(dateStr);
      if (signupMap[key] !== undefined) signupMap[key]++;
    });

    // Reports per month
    const reportMap: Record<string, number> = {};
    last12.forEach((k) => (reportMap[k] = 0));
    reports.forEach((r) => {
      const dateStr =
        r.createdAt?.toDate?.()?.toISOString() ?? r.createdAt ?? "";
      const key = getMonthKey(dateStr);
      if (reportMap[key] !== undefined) reportMap[key]++;
    });

    const signupsPerMonth = last12.map((k) => ({
      month: formatMonthKey(k),
      count: signupMap[k],
    }));
    const reportsPerMonth = last12.map((k) => ({
      month: formatMonthKey(k),
      count: reportMap[k],
    }));

    return NextResponse.json({
      totalUsers,
      proUsers,
      totalReports,
      reportsThisMonth,
      signupsThisMonth,
      signupsPerMonth,
      reportsPerMonth,
    });
  } catch (err: any) {
    const status =
      err.message === "Unauthorized"
        ? 401
        : err.message === "Forbidden"
          ? 403
          : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
