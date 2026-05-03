#!/bin/bash
# Script to set Vercel environment variables for sewer-labzz project

# Read the Firebase admin private key
PRIVATE_KEY=$(cat FIREBASE_ADMIN_PRIVATE_KEY.txt)

# Array of environment variables to set
declare -a ENV_VARS=(
  "FIREBASE_ADMIN_PROJECT_ID=sewer-labzz"
  "FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@sewer-labzz.iam.gserviceaccount.com"
  "FIREBASE_ADMIN_PRIVATE_KEY=$PRIVATE_KEY"
  "NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyClq3VtY0swdRpL0e3K6fhh3G8GZHx2zkI"
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sewer-labzz.firebaseapp.com"
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID=sewer-labzz"
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sewer-labzz.firebasestorage.app"
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=940581645541"
  "NEXT_PUBLIC_FIREBASE_APP_ID=1:940581645541:web:bdb454e2d0fe0a9d69b80c"
  "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-TKZTNWD9KM"
  "NEXT_PUBLIC_APP_URL=https://sewer-labzz.vercel.app"
  "LEMONSQUEEZY_API_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NGQ1OWNlZi1kYmI4LTRlYTUtYjE3OC1kMjU0MGZjZDY5MTkiLCJqdGkiOiJmM2IyZDhlYmU1NmUzODcyNGY2OWQzZjE1YTU0ZmE4OGU0YmFjYjVjNjAxYzMyNTE0ZmI3NjRjNzQ0N2I5OTVlNDEzYzkzZTQ3NTQxMGZiZiIsImlhdCI6MTc3NjgzMTEwMi42NDMyOCwibmJmIjoxNzc2ODMxMTAyLjY0MzI4MywiZXhwIjoxNzkyNTQwODAwLjA0ODk2LCJzdWIiOiI2OTIwOTkwIiwic2NvcGVzIjpbXX0.eGqMJwg_cr-GW7mhnFdB4sBvMMKejezX6QBqn7HhqBcJrLAEVbezp_zEeKPB-ypuoqJ-L4q2GkkfoRznXhPIoWYuM9xdRCGPyp9GT6GKdjZg9llWhpqLpryEuV4-X9XOU2F4mDFhAsL7y6fbGR-SFnbGMmlijrJQQ-lkOBSsrnjkI1YIx6oIFAGYh35yAKR3BDFcFt-lCaqZGQnr_OBGK-1_3JP_KUzI_cQMNla4BFN_gfvoChnE16M3ZcBuoeWHpl1DnfxgC_VsLZ1l3jUXpdtuo5ZpeBopyJwMuEr32q9evsrQtw3rwkzMuDPyBrbEGaCHueSqXZuvBvYbFXytaGabVjGJeidwbwLPkPCca6hmke6IAkQTfP-9hfroUg-W4dZB9tVKxQBgD9ElMd9WXAfsI4foWJfgcEmjbv0tqM1RxIackqaEq3wB_Fus_Fz0Nn3QwQrDfxLUhr42unqE764sOzb7tI3DgcXybQswQkmZCHfOpXDWnwiaZr-AWPGFAsvBsqfwreXiXiWQOYI9BKI26Vk4pta7doTIlbq8mRjNB-hkHHt22mERSye6cM02SXvXC5nvgFNJSb-sxNd0CodOiEAWHuQVntuXHtsXfnFF_X_P8zBA43HgM23zFq4wdqP8AzyvpJ1qKDKlU_XZjoLeRdm88ErDyNof4vN4SVQ"
  "LEMONSQUEEZY_STORE_ID=348351"
  "LEMONSQUEEZY_WEBHOOK_SECRET=SewerLabz2026!"
  "LEMONSQUEEZY_VARIANT_MONTHLY=994138"
  "LEMONSQUEEZY_VARIANT_ANNUALLY=994139"
)

echo "🔧 Setting Vercel Environment Variables for sewer-labzz"
echo "=========================================================="
echo ""

# For each environment variable, set it
for i in "${!ENV_VARS[@]}"; do
  ENV_VAR="${ENV_VARS[$i]}"
  KEY=$(echo "$ENV_VAR" | cut -d'=' -f1)
  
  # Count completed
  COUNT=$((i + 1))
  TOTAL=${#ENV_VARS[@]}
  
  echo "[$COUNT/$TOTAL] Setting $KEY..."
  # vercel env add "$KEY" < would require interactive input
done

echo ""
echo "⚠️  NOTE: The Vercel CLI requires interactive input for each env var."
echo "📊 Alternative methods:"
echo ""
echo "Method 1 - Use Vercel Dashboard (EASIEST):"
echo "  1. Go to: https://vercel.com/dashboard/projects/sewer-labzz/settings/environment-variables"
echo "  2. Delete old truncated FIREBASE_ADMIN_PRIVATE_KEY if it exists"
echo "  3. Add new environment variables one by one"
echo "  4. For FIREBASE_ADMIN_PRIVATE_KEY, paste the full content from FIREBASE_ADMIN_PRIVATE_KEY.txt"
echo ""
echo "Method 2 - Use this PowerShell script:"
echo "  powershell -ExecutionPolicy Bypass -File set-vercel-env.ps1"
echo ""
