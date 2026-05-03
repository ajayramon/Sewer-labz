# PowerShell script to help set Vercel environment variables

Write-Host "🔧 Vercel Environment Variable Setup for sewer-labzz" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# Read the private key
$privateKey = Get-Content "FIREBASE_ADMIN_PRIVATE_KEY.txt" -Raw

# Define all environment variables
$envVars = @{
    "FIREBASE_ADMIN_PROJECT_ID" = "sewer-labzz"
    "FIREBASE_ADMIN_CLIENT_EMAIL" = "firebase-adminsdk-fbsvc@sewer-labzz.iam.gserviceaccount.com"
    "FIREBASE_ADMIN_PRIVATE_KEY" = $privateKey
    "NEXT_PUBLIC_FIREBASE_API_KEY" = "AIzaSyClq3VtY0swdRpL0e3K6fhh3G8GZHx2zkI"
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" = "sewer-labzz.firebaseapp.com"
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID" = "sewer-labzz"
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" = "sewer-labzz.firebasestorage.app"
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" = "940581645541"
    "NEXT_PUBLIC_FIREBASE_APP_ID" = "1:940581645541:web:bdb454e2d0fe0a9d69b80c"
    "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID" = "G-TKZTNWD9KM"
    "NEXT_PUBLIC_APP_URL" = "https://sewer-labzz.vercel.app"
    "LEMONSQUEEZY_API_KEY" = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NGQ1OWNlZi1kYmI4LTRlYTUtYjE3OC1kMjU0MGZjZDY5MTkiLCJqdGkiOiJmM2IyZDhlYmU1NmUzODcyNGY2OWQzZjE1YTU0ZmE4OGU0YmFjYjVjNjAxYzMyNTE0ZmI3NjRjNzQ0N2I5OTVlNDEzYzkzZTQ3NTQxMGZiZiIsImlhdCI6MTc3NjgzMTEwMi42NDMyOCwibmJmIjoxNzc2ODMxMTAyLjY0MzI4MywiZXhwIjoxNzkyNTQwODAwLjA0ODk2LCJzdWIiOiI2OTIwOTkwIiwic2NvcGVzIjpbXX0.eGqMJwg_cr-GW7mhnFdB4sBvMMKejezX6QBqn7HhqBcJrLAEVbezp_zEeKPB-ypuoqJ-L4q2GkkfoRznXhPIoWYuM9xdRCGPyp9GT6GKdjZg9llWhpqLpryEuV4-X9XOU2F4mDFhAsL7y6fbGR-SFnbGMmlijrJQQ-lkOBSsrnjkI1YIx6oIFAGYh35yAKR3BDFcFt-lCaqZGQnr_OBGK-1_3JP_KUzI_cQMNla4BFN_gfvoChnE16M3ZcBuoeWHpl1DnfxgC_VsLZ1l3jUXpdtuo5ZpeBopyJwMuEr32q9evsrQtw3rwkzMuDPyBrbEGaCHueSqXZuvBvYbFXytaGabVjGJeidwbwLPkPCca6hmke6IAkQTfP-9hfroUg-W4dZB9tVKxQBgD9ElMd9WXAfsI4foWJfgcEmjbv0tqM1RxIackqaEq3wB_Fus_Fz0Nn3QwQrDfxLUhr42unqE764sOzb7tI3DgcXybQswQkmZCHfOpXDWnwiaZr-AWPGFAsvBsqfwreXiXiWQOYI9BKI26Vk4pta7doTIlbq8mRjNB-hkHHt22mERSye6cM02SXvXC5nvgFNJSb-sxNd0CodOiEAWHuQVntuXHtsXfnFF_X_P8zBA43HgM23zFq4wdqP8AzyvpJ1qKDKlU_XZjoLeRdm88ErDyNof4vN4SVQ"
    "LEMONSQUEEZY_STORE_ID" = "348351"
    "LEMONSQUEEZY_WEBHOOK_SECRET" = "SewerLabz2026!"
    "LEMONSQUEEZY_VARIANT_MONTHLY" = "994138"
    "LEMONSQUEEZY_VARIANT_ANNUALLY" = "994139"
}

Write-Host "📋 Environment Variables to Add:" -ForegroundColor Yellow
Write-Host ""
$count = 1
foreach ($key in $envVars.Keys) {
    $value = $envVars[$key]
    $displayValue = if ($key -match "PRIVATE_KEY|API_KEY") {
        "$($value.Substring(0, 30))..."
    } else {
        $value
    }
    Write-Host "  [$count] $key = $displayValue" -ForegroundColor Gray
    $count++
}

Write-Host ""
Write-Host "🌐 Opening Vercel Dashboard..." -ForegroundColor Cyan
Write-Host "URL: https://vercel.com/dashboard/projects/sewer-labzz/settings/environment-variables" -ForegroundColor Blue
Write-Host ""

# Open the Vercel dashboard
Start-Process "https://vercel.com/dashboard/projects/sewer-labzz/settings/environment-variables"

Write-Host "⏳ Waiting 3 seconds before continuing..." -ForegroundColor Gray
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "📝 Steps to Add Environment Variables:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. In the Vercel dashboard that just opened:"
Write-Host "     - Click 'Add New Variable'"
Write-Host "     - Paste the variable name"
Write-Host "     - Paste the value"
Write-Host "     - Select environments: Production, Preview, Development"
Write-Host "     - Click 'Save'"
Write-Host ""
Write-Host "  2. First, DELETE the old truncated FIREBASE_ADMIN_PRIVATE_KEY if it exists"
Write-Host ""
Write-Host "  3. For FIREBASE_ADMIN_PRIVATE_KEY specifically:" -ForegroundColor Yellow
Write-Host "     - The value is in: FIREBASE_ADMIN_PRIVATE_KEY.txt" -ForegroundColor Gray
Write-Host '     - Paste the ENTIRE content - 1704 chars' -ForegroundColor Gray
Write-Host ""
Write-Host '  4. After adding all variables, click the Redeploy button' -ForegroundColor Yellow
Write-Host ""

Write-Host "✅ All environment variables have been prepared!" -ForegroundColor Green
Write-Host ""
Write-Host "📌 Reference files created:" -ForegroundColor Cyan
Write-Host "  • FIREBASE_ADMIN_PRIVATE_KEY.txt (1704 chars)" -ForegroundColor Gray
Write-Host "  • .env.vercel (all variables in KEY=VALUE format)" -ForegroundColor Gray
