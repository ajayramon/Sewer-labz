import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const adminApp = getApps().length
  ? getApp()
  : initializeApp({
      credential: cert({
        FIREBASE_ADMIN_PROJECT_ID=sewer-labzz
        FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@sewer-labzz.iam.gserviceaccount.com
        FIREBASE_ADMIN_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDF31jzO3/VXG2o\nerNiyBD8ZqzkjyQLBpW3+ETeReHpbmx1X8Kjix2E4xpUnbtKhAkOueAg6ccMFQbj\ncHLk80TPgS+uGJ0OaPX7lJgyAT2rPcnhAO832ViJ/n5focwuxMcw1h/n/sbM6WjW\nDVq3qe1AY7YQb6NGQ4z1/fBBiXFquR+AGvUO3yLI9IESxwLfhjqc1LDs/ljPHjxV\nIW73tDOwAiFsA4XsLW8IDswNTVCiaql0YaGS5JZHAH2Oo381LUn4oxBxg1Jmmemo\n+Sdl2Q8qhcebcJvSmAsYaqVWeV9p7aCB3YDzDd+FvyuTo+89oWA3DEr5i2vDOnze\n6RBZusdfAgMBAAECggEAED68eketwJIUjKr6NEdxoY86bY9U6bTSMObonIkHOZdv\nvxksDSo8M69Dd6P1fvIlHjjjbkBTL6pARQbz39kbEqAsDnKF3mt+mneCIUTZz8fE\nXb0qZp7o9ndW37oUXdiY8+j4eJ8BqkwVZ9Fz27VPPaSSC3pm4LtmBMIi6faDQbwp\nJBxFszJxYypirdZNX2xyo5WI6eUaw/x8guHcaUmW2m+amkDYBmPcxYklyIA4spvK\nXO2YduEwkhbliZMejnHISJO3aOtDe4otz2YzlfbC1KZiZ/ZZdC+k6uYo0u/ZzwL6\nycH93TWHzjP/mkhJwTWCOrtlFGNGDoXqFPvS4loiRQKBgQDlLJK9yvD68D6+M99u\ndhxZ585Kh/C7y1aJ5bZDCGWYiaNUTLF/BGMd1Mohbd2U3jx0BTukLvia8SGYY3Et\nrH5/UolKynBpz7XFC/9eZMWN18oFtYUDY+gMRMzp0rIQ0nGuGtvHfWgbsIjUENF/\n22x7pVI+PMpvZy69S1WJQGdEEwKBgQDdCMoM/h/xe2r/c8fn4PcEvzLc5OXOQUOk\nGKn8a30hwBO4K6VfXiw6P4YSn7jCFCNQfxDMYojgaoWJDoXKPUcCrhgPUpa1Kmci\nwP4dl5mwN3vtXnlQa2ZclFUFVE9ZHQBkpw8QizS3TvP6YpegGtladYe4S2dBBqqW\nKeIutlAhBQKBgAgxcsGUSs893ZBhPGCvmk3girCBcarVFy/w5XY6C5/Lc+pkn4fh\n+UUswVk2m1BiLZkcQsiY4UxwyHmxPG+clh0pLz1cRW6S/XWg+y09vw5WI6PWnH3F\niZs+rnDBlpohW+0Uirz0D8/FnO6v9z1x88vr2ifddoNLFhGwastwYQC/AoGAfGCL\nwc/mDa6TQPfXz4VpusQUTPSI1A0pkNdIIAAkQ6+f6Qy2W/nUDVrdiPFTt/I5BPzb\naQcxWobWaY9AfdMJeFqas1SX9Y3Mx2OuGtzJ4Lz4AVQeE8C7svDM/ti4Zb7KD9lp\nwrdyjIvjAkwkYjV5hUuJeY0EpzSnHSSoX/y7DjkCgYAlPCtQ5yOxGTHIBcSstTyf\nrRrI0vvlN78qZu3Jftc0Oit5pshX+EgCCeL8De2J9vNmTWAOT0oIiwJiWkH7WTJD\nK0xMvF802mx2IF76WHOIPOE25UF1SkD0mrPy7nhgSQqYOEH9SiScHj8Hnd3T1sG7\nhpdvioDReOYYATKT3+LpYA==\n-----END PRIVATE KEY-----\n"
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
