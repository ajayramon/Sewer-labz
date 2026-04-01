import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { report, defects } = body

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; color: #0F172A; background: #fff; }
    .page { padding: 40px; max-width: 800px; margin: 0 auto; }

    /* Header */
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 3px solid #0F2A4A; }
    .logo { font-size: 28px; font-weight: 900; letter-spacing: -0.5px; }
    .logo span { color: #2D8C4E; }
    .report-title { text-align: right; }
    .report-title h1 { font-size: 20px; font-weight: 700; color: #0F2A4A; }
    .report-title p { font-size: 13px; color: #64748B; margin-top: 4px; }

    /* Details grid */
    .details-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; background: #F8FAFC; padding: 20px; border-radius: 8px; border: 1px solid #E2E8F0; }
    .detail-item label { font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px; }
    .detail-item span { font-size: 14px; color: #0F172A; font-weight: 500; }

    /* Section title */
    .section-title { font-size: 16px; font-weight: 700; color: #0F2A4A; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #E2E8F0; }

    /* Defect card */
    .defect { margin-bottom: 24px; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; page-break-inside: avoid; }
    .defect-header { background: #0F2A4A; color: #fff; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; }
    .defect-header .code { font-size: 14px; font-weight: 700; }
    .defect-header .desc { font-size: 14px; flex: 1; margin: 0 16px; }
    .defect-header .severity { font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 20px; }
    .severity-Low { background: #DCFCE7; color: #16A34A; }
    .severity-Medium { background: #FEF3C7; color: #D97706; }
    .severity-High { background: #FFEDD5; color: #EA580C; }
    .severity-Critical { background: #FEE2E2; color: #DC2626; }
    .defect-body { padding: 16px; }
    .narrative-label { font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
    .narrative-text { font-size: 13px; color: #374151; line-height: 1.6; margin-bottom: 16px; }

    /* Images */
    .images-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 12px; }
    .image-item { position: relative; }
    .image-item img { width: 100%; height: 160px; object-fit: cover; border-radius: 6px; border: 1px solid #E2E8F0; }
    .image-num { position: absolute; top: 6px; left: 6px; background: rgba(0,0,0,0.7); color: #fff; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; }

    /* Footer */
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #E2E8F0; display: flex; justify-content: space-between; font-size: 11px; color: #94A3B8; }

    /* Summary box */
    .summary { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
    .summary-title { font-size: 13px; font-weight: 700; color: #0F2A4A; margin-bottom: 8px; }
    .summary-text { font-size: 13px; color: #374151; line-height: 1.6; }

    /* Disclaimer */
    .disclaimer { background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 8px; padding: 14px 16px; margin-top: 32px; }
    .disclaimer p { font-size: 11px; color: #92400E; line-height: 1.6; }
    .disclaimer strong { font-size: 12px; display: block; margin-bottom: 4px; }
  </style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div class="logo">SEWER <span>LABZ</span></div>
    <div class="report-title">
      <h1>${report.title || 'Inspection Report'}</h1>
      <p>Generated on ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
    </div>
  </div>

  <!-- Report details -->
  <div class="details-grid">
    <div class="detail-item">
      <label>Job Number</label>
      <span>${report.jobNumber || '—'}</span>
    </div>
    <div class="detail-item">
      <label>Client Name</label>
      <span>${report.clientName || '—'}</span>
    </div>
    <div class="detail-item">
      <label>Site Location</label>
      <span>${report.location || '—'}</span>
    </div>
    <div class="detail-item">
      <label>Inspector</label>
      <span>${report.inspector || '—'}</span>
    </div>
    <div class="detail-item">
      <label>Inspection Date</label>
      <span>${report.inspectedAt || '—'}</span>
    </div>
    <div class="detail-item">
      <label>Total Defects</label>
      <span>${defects.length}</span>
    </div>
  </div>

  ${report.notes ? `
  <div class="summary">
    <div class="summary-title">Summary / Notes</div>
    <div class="summary-text">${report.notes}</div>
  </div>
  ` : ''}

  <!-- Defects -->
  <div class="section-title">Defects Found (${defects.length})</div>

  ${defects.map((d: any, i: number) => `
  <div class="defect">
    <div class="defect-header">
      <span class="code">#${i + 1} ${d.code || 'N/A'}</span>
      <span class="desc">${d.description || 'No description'}</span>
      <span class="severity severity-${d.severity || 'Medium'}">${d.severity || 'Medium'}</span>
    </div>
    <div class="defect-body">
      ${d.narrative ? `
      <div class="narrative-label">Narrative</div>
      <div class="narrative-text">${d.narrative}</div>
      ` : ''}
      ${d.images && d.images.length > 0 ? `
      <div class="narrative-label">Images (${d.images.length})</div>
      <div class="images-grid">
        ${d.images.map((img: any, imgIndex: number) => `
        <div class="image-item">
          <img src="${img.url}" alt="Defect image ${imgIndex + 1}" />
          <span class="image-num">${imgIndex + 1}</span>
        </div>
        `).join('')}
      </div>
      ` : ''}
    </div>
  </div>
  `).join('')}

  <!-- Disclaimer -->
  <div class="disclaimer">
    <p><strong>⚠️ Software Disclaimer</strong>
    This report was generated using Sewer Labz software. It is provided as a reporting tool only and does not constitute professional engineering or legal advice. The user is solely responsible for the accuracy of all data entered and the validation of this report. Sewer Labz accepts no liability for any decisions made based on this report.</p>
  </div>

  <!-- Footer -->
  <div class="footer">
    <span>Generated by Sewer Labz — www.sewerlabz.com</span>
    <span>${report.title || 'Inspection Report'} — ${new Date().toLocaleDateString()}</span>
  </div>

</div>
</body>
</html>`

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}