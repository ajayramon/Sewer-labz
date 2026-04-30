import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const adminApp = getApps().length
  ? getApp()
  : initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID=sewer-labzz        
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@sewer-labzz.iam.gserviceaccount.com
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDF31jzO3/VXG2oerNiyBD8ZqzkjyQLBpW3+ETeReHpbmx1X8Kjix2E4xpUnbtKhAkOueAg6ccMFQbjcHLk80TPgS+uGJ0OaPX7lJgyAT2rPcnhAO832ViJ/n5focwuxMcw1h/n/sbM6WjWDVq3qe1AY7YQb6NGQ4z1/fBBiXFquR+AGvUO3yLI9IESxwLfhjqc1LDs/ljPHjxVIW73tDOwAiFsA4XsLW8IDswNTVCiaql0YaGS5JZHAH2Oo381LUn4oxBxg1Jmmemo+Sdl2Q8qhcebcJvSmAsYaqVWeV9p7aCB3YDzDd+FvyuTo+89oWA3DEr5i2vDOnze6RBZusdfAgMBAAECggEAED68eketwJIUjKr6NEdxoY86bY9U6bTSMObonIkHOZdvvxksDSo8M69Dd6P1fvIlHjjjbkBTL6pARQbz39kbEqAsDnKF3mt+mneCIUTZz8fEXb0qZp7o9ndW37oUXdiY8+j4eJ8BqkwVZ9Fz27VPPaSSC3pm4LtmBMIi6faDQbwpJBxFszJxYypirdZNX2xyo5WI6eUaw/x8guHcaUmW2m+amkDYBmPcxYklyIA4spvKXO2YduEwkhbliZMejnHISJO3aOtDe4otz2YzlfbC1KZiZ/ZZdC+k6uYo0u/ZzwL6ycH93TWHzjP/mkhJwTWCOrtlFGNGDoXqFPvS4loiRQKBgQDlLJK9yvD68D6+M99udhxZ585Kh/C7y1aJ5bZDCGWYiaNUTLF/BGMd1Mohbd2U3jx0BTukLvia8SGYY3EtrH5/UolKynBpz7XFC/9eZMWN18oFtYUDY+gMRMzp0rIQ0nGuGtvHfWgbsIjUENF/22x7pVI+PMpvZy69S1WJQGdEEwKBgQDdCMoM/h/xe2r/c8fn4PcEvzLc5OXOQUOkGKn8a30hwBO4K6VfXiw6P4YSn7jCFCNQfxDMYojgaoWJDoXKPUcCrhgPUpa1KmciwP4dl5mwN3vtXnlQa2ZclFUFVE9ZHQBkpw8QizS3TvP6YpegGtladYe4S2dBBqqWKeIutlAhBQKBgAgxcsGUSs893ZBhPGCvmk3girCBcarVFy/w5XY6C5/Lc+pkn4fh+UUswVk2m1BiLZkcQsiY4UxwyHmxPG+clh0pLz1cRW6S/XWg+y09vw5WI6PWnH3FiZs+rnDBlpohW+0Uirz0D8/FnO6v9z1x88vr2ifddoNLFhGwastwYQC/AoGAfGCLwc/mDa6TQPfXz4VpusQUTPSI1A0pkNdIIAAkQ6+f6Qy2W/nUDVrdiPFTt/I5BPzbaQcxWobWaY9AfdMJeFqas1SX9Y3Mx2OuGtzJ4Lz4AVQeE8C7svDM/ti4Zb7KD9lpwrdyjIvjAkwkYjV5hUuJeY0EpzSnHSSoX/y7DjkCgYAlPCtQ5yOxGTHIBcSstTyfrRrI0vvlN78qZu3Jftc0Oit5pshX+EgCCeL8De2J9vNmTWAOT0oIiwJiWkH7WTJDK0xMvF802mx2IF76WHOIPOE25UF1SkD0mrPy7nhgSQqYOEH9SiScHj8Hnd3T1sG7hpdvioDReOYYATKT3+LpYA==\n-----END PRIVATE KEY-----\n"
          /\\n/g,
          "\n",
        ),
      }),
    });

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
export function getAdminDb() {
  return adminDb;
}