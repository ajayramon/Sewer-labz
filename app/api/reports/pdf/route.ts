import { NextResponse } from "next/server"
import puppeteer from "puppeteer"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      clientName,
      location,
      inspectionDate,
      coverImage
    } = body

    // ✅ HTML TEMPLATE
    const html = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            margin: 0;
          }

          .page {
            position: relative;
            min-height: 100vh;
          }

          .logo {
            text-align: center;
            margin-bottom: 10px;
          }

          .logo h1 {
            font-size: 28px;
            margin: 0;
          }

          .logo span {
            color: #2D8C4A;
          }

          .tagline {
            text-align: center;
            font-size: 12px;
            color: gray;
            margin-bottom: 20px;
          }

          .cover-image {
            width: 100%;
            height: 400px;
            object-fit: cover;
            display: block;
            margin: 0 auto;
            border-radius: 10px;
          }

          .footer {
            position: absolute;
            bottom: 40px;
            left: 0;
            width: 100%;
            text-align: center;
            font-size: 12px;
            color: gray;
          }

          .section {
            margin-top: 40px;
          }

          .section h2 {
            border-bottom: 2px solid #eee;
            padding-bottom: 5px;
          }

        </style>
      </head>

      <body>

        <!-- COVER PAGE -->
        <div class="page">

          <div class="logo">
            <h1>SEWER <span>LABZ</span></h1>
          </div>

          <div class="tagline">
            Professional Sewer Inspection Reports
          </div>

          ${
            coverImage
              ? `<img src="${coverImage}" class="cover-image" />`
              : ""
          }

          <div class="footer">
            <p>${location || ""}</p>
            <p>${inspectionDate || ""}</p>
            <p><strong>SOFTWARE DISCLAIMER:</strong> SEWER LABZ IS A REPORTING TOOL ONLY AND DOES NOT CONSTITUTE PROFESSIONAL ADVICE.</p>
          </div>

        </div>

        <!-- SECOND PAGE -->
        <div class="section">
          <h2>Report Details</h2>
          <p><strong>Client:</strong> ${clientName || "-"}</p>
          <p><strong>Location:</strong> ${location || "-"}</p>
          <p><strong>Date:</strong> ${inspectionDate || "-"}</p>
        </div>

      </body>
    </html>
    `

    // ✅ LAUNCH BROWSER
    const browser = await puppeteer.launch({
      args: ["--no-sandbox"],
    })

    const page = await browser.newPage()

    // ✅ IMPORTANT FIX (NO about:blank)
    await page.setContent(html, {
      waitUntil: "networkidle0",
    })

    // ✅ GENERATE PDF
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: false, // 🔥 removes about:blank
      margin: {
        top: "20px",
        bottom: "20px",
        left: "20px",
        right: "20px",
      },
    })

    await browser.close()

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
      },
    })

  } catch (error: any) {
    console.error(error)

    return NextResponse.json(
      { error: error.message || "PDF generation failed" },
      { status: 500 }
    )
  }
}