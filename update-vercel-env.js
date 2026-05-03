const fs = require("fs");
const path = require("path");
const https = require("https");

// Read the Firebase admin credentials from JSON
const firebaseJson = JSON.parse(
  fs.readFileSync(
    "C:\\Users\\Abdul\\Downloads\\sewer-labzz-firebase-adminsdk-fbsvc-b846038bb4.json",
    "utf8",
  ),
);

// Environment variables to set
const envVars = {
  FIREBASE_ADMIN_PROJECT_ID: "sewer-labzz",
  FIREBASE_ADMIN_CLIENT_EMAIL:
    "firebase-adminsdk-fbsvc@sewer-labzz.iam.gserviceaccount.com",
  FIREBASE_ADMIN_PRIVATE_KEY: firebaseJson.private_key,
  NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyClq3VtY0swdRpL0e3K6fhh3G8GZHx2zkI",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "sewer-labzz.firebaseapp.com",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "sewer-labzz",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "sewer-labzz.firebasestorage.app",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "940581645541",
  NEXT_PUBLIC_FIREBASE_APP_ID: "1:940581645541:web:bdb454e2d0fe0a9d69b80c",
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: "G-TKZTNWD9KM",
  NEXT_PUBLIC_APP_URL: "https://sewer-labzz.vercel.app",
  LEMONSQUEEZY_API_KEY:
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NGQ1OWNlZi1kYmI4LTRlYTUtYjE3OC1kMjU0MGZjZDY5MTkiLCJqdGkiOiJmM2IyZDhlYmU1NmUzODcyNGY2OWQzZjE1YTU0ZmE4OGU0YmFjYjVjNjAxYzMyNTE0ZmI3NjRjNzQ0N2I5OTVlNDEzYzkzZTQ3NTQxMGZiZiIsImlhdCI6MTc3NjgzMTEwMi42NDMyOCwibmJmIjoxNzc2ODMxMTAyLjY0MzI4MywiZXhwIjoxNzkyNTQwODAwLjA0ODk2LCJzdWIiOiI2OTIwOTkwIiwic2NvcGVzIjpbXX0.eGqMJwg_cr-GW7mhnFdB4sBvMMKejezX6QBqn7HhqBcJrLAEVbezp_zEeKPB-ypuoqJ-L4q2GkkfoRznXhPIoWYuM9xdRCGPyp9GT6GKdjZg9llWhpqLpryEuV4-X9XOU2F4mDFhAsL7y6fbGR-SFnbGMmlijrJQQ-lkOBSsrnjkI1YIx6oIFAGYh35yAKR3BDFcFt-lCaqZGQnr_OBGK-1_3JP_KUzI_cQMNla4BFN_gfvoChnE16M3ZcBuoeWHpl1DnfxgC_VsLZ1l3jUXpdtuo5ZpeBopyJwMuEr32q9evsrQtw3rwkzMuDPyBrbEGaCHueSqXZuvBvYbFXytaGabVjGJeidwbwLPkPCca6hmke6IAkQTfP-9hfroUg-W4dZB9tVKxQBgD9ElMd9WXAfsI4foWJfgcEmjbv0tqM1RxIackqaEq3wB_Fus_Fz0Nn3QwQrDfxLUhr42unqE764sOzb7tI3DgcXybQswQkmZCHfOpXDWnwiaZr-AWPGFAsvBsqfwreXiXiWQOYI9BKI26Vk4pta7doTIlbq8mRjNB-hkHHt22mERSye6cM02SXvXC5nvgFNJSb-sxNd0CodOiEAWHuQVntuXHtsXfnFF_X_P8zBA43HgM23zFq4wdqP8AzyvpJ1qKDKlU_XZjoLeRdm88ErDyNof4vN4SVQ",
  LEMONSQUEEZY_STORE_ID: "348351",
  LEMONSQUEEZY_WEBHOOK_SECRET: "SewerLabz2026!",
  LEMONSQUEEZY_VARIANT_MONTHLY: "994138",
  LEMONSQUEEZY_VARIANT_ANNUALLY: "994139",
};

console.log("Environment Variables to Set:");
console.log("=============================");
Object.entries(envVars).forEach(([key, value]) => {
  const displayValue = key.includes("PRIVATE_KEY")
    ? `${value.substring(0, 50)}...`
    : key.includes("API_KEY")
      ? `${value.substring(0, 30)}...`
      : value;
  console.log(`✓ ${key} = ${displayValue}`);
});

console.log("\n📝 Instructions:");
console.log(
  "1. Go to: https://vercel.com/dashboard/projects/sewer-labzz/settings/environment-variables",
);
console.log("2. Add each environment variable from the list above");
console.log(
  "3. For FIREBASE_ADMIN_PRIVATE_KEY, paste the full key (1704 chars)",
);
console.log("4. Save and redeploy the project");
console.log("\n💾 To use Vercel CLI instead:");
console.log("Run: vercel env add FIREBASE_ADMIN_PRIVATE_KEY");
console.log(
  "Then paste the content of FIREBASE_ADMIN_PRIVATE_KEY.txt when prompted",
);

// Save env vars to a file for reference
const envContent = Object.entries(envVars)
  .map(([key, value]) => `${key}=${value}`)
  .join("\n");

fs.writeFileSync(".env.vercel", envContent);
console.log("\n✅ Environment variables saved to .env.vercel for reference");
