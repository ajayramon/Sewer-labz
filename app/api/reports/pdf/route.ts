import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { report, defects } = body

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; color: #000; background: #fff; font-size: 13px; }
  .page { padding: 40px 50px; }
  .page-break { page-break-after: always; }
  .cover { text-align: center; padding: 60px 40px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 95vh; }
  .cover-logo { font-size: 48px; font-weight: 900; letter-spacing: -1px; margin-bottom: 8px; }
  .cover-logo span { color: #2D8C4E; }
  .cover-tagline { font-size: 16px; color: #2D8C4E; font-weight: 700; margin-bottom: 4px; }

  /* Property photos — 3 across */
  .cover-photos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; width: 100%; max-width: 680px; margin: 24px auto; }
  .cover-photo { width: 100%; height: 200px; object-fit: cover; border-radius: 6px; border: 1px solid #ddd; display: block; }
  .cover-photo-single { width: 100%; max-width: 500px; height: 300px; object-fit: cover; border-radius: 6px; border: 1px solid #ddd; margin: 24px auto; display: block; }
  .cover-photo-two { width: 100%; height: 240px; object-fit: cover; border-radius: 6px; border: 1px solid #ddd; display: block; }
  .cover-photos-two { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; width: 100%; max-width: 680px; margin: 24px auto; }

  .cover-disclaimer { font-size: 11px; color: #555; line-height: 1.7; max-width: 680px; border-top: 1px solid #ddd; padding-top: 16px; margin-top: 24px; }
  .report-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #000; padding-bottom: 8px; margin-bottom: 20px; font-size: 11px; color: #555; }
  .report-footer { border-top: 1px solid #ddd; padding-top: 8px; margin-top: 32px; font-size: 10px; color: #888; text-align: center; line-height: 1.6; }
  .section-title { font-size: 18px; font-weight: 900; text-decoration: underline; text-align: center; margin: 24px 0 16px; text-transform: uppercase; }
  .section-subtitle { font-size: 14px; font-weight: 700; margin-bottom: 12px; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px; }
  .toc-item { padding: 6px 0; font-size: 14px; border-bottom: 1px dotted #ddd; }
  .disclosure-text { font-size: 13px; line-height: 1.8; margin-bottom: 16px; font-weight: 700; }
  .info-row { display: flex; margin-bottom: 8px; }
  .info-label { font-weight: 700; font-size: 12px; min-width: 160px; text-transform: uppercase; }
  .info-value { font-size: 13px; color: #222; }

  /* Client info photo on right */
  .client-info-wrap { display: flex; gap: 20px; margin-bottom: 20px; }
  .client-info-photos { display: flex; flex-direction: column; gap: 8px; }
  .client-info-photo { width: 160px; height: 120px; object-fit: cover; border: 1px solid #ddd; border-radius: 4px; }

  .system-row { margin-bottom: 12px; }
  .system-label { font-weight: 700; font-size: 12px; text-transform: uppercase; margin-bottom: 4px; }
  .system-value { font-size: 13px; color: #222; padding: 8px; background: #f9f9f9; border-radius: 4px; border: 1px solid #eee; }

  /* Defect photos — 2 columns, good size */
  .defect-item { margin-bottom: 28px; page-break-inside: avoid; }
  .defect-desc { font-size: 13px; line-height: 1.7; margin-bottom: 12px; }
  .defect-photos { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 10px; }
  .defect-photo-wrap { position: relative; }
  .defect-photo { width: 100%; height: 220px; object-fit: cover; border: 1px solid #ddd; border-radius: 4px; display: block; }
  .photo-timestamp { font-size: 10px; background: rgba(0,0,0,0.75); color: #fff; padding: 2px 6px; border-radius: 2px; margin-top: 4px; display: inline-block; }

  .end-title { font-size: 15px; font-weight: 700; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 12px; margin-top: 20px; }
  .end-comment { font-size: 13px; line-height: 1.8; margin-bottom: 8px; }
  .material-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  .material-table th { background: #f0f0f0; font-size: 12px; font-weight: 700; padding: 8px 12px; text-align: left; border: 1px solid #ddd; }
  .material-table td { font-size: 12px; padding: 7px 12px; border: 1px solid #ddd; }
  .material-table tr:nth-child(even) td { background: #fafafa; }

  @media print {
    .page-break { page-break-after: always; }
    .defect-item { page-break-inside: avoid; }
    .defect-photo { height: 220px; }
  }
</style>
</head>
<body>

<!-- COVER PAGE -->
<div class="cover page-break">
  <div class="cover-logo">SEWER <span>LABZ</span></div>
  <div class="cover-tagline">Don&apos;t Let Your Drain Be A Pain!</div>
  <div style="font-size: 14px; color: #444; margin-bottom: 16px;">Professional Sewer Inspection Report</div>

  ${report.propertyPhotos && report.propertyPhotos.length === 1 ? `
    <img src="${report.propertyPhotos[0]}" class="cover-photo-single" alt="Property" />
  ` : report.propertyPhotos && report.propertyPhotos.length === 2 ? `
    <div class="cover-photos-two">
      ${report.propertyPhotos.map((p: string) => `<img src="${p}" class="cover-photo-two" alt="Property" />`).join('')}
    </div>
  ` : report.propertyPhotos && report.propertyPhotos.length >= 3 ? `
    <div class="cover-photos">
      ${report.propertyPhotos.map((p: string) => `<img src="${p}" class="cover-photo" alt="Property" />`).join('')}
    </div>
  ` : `
    <div style="width:100%;max-width:500px;height:300px;background:#f0f0f0;border-radius:6px;margin:24px auto;display:flex;align-items:center;justify-content:center;font-size:14px;color:#999;border:1px solid #ddd;">Property Photo</div>
  `}

  <div style="font-size: 18px; font-weight: 700; margin-bottom: 4px;">${report.location || 'Property Address'}</div>
  <div style="font-size: 14px; color: #555; margin-bottom: 16px;">${report.inspectedAt || ''}</div>

  <div class="cover-disclaimer">
    This report was prepared for the client listed above in accordance with our inspection agreement and is subject to the terms and conditions agreed upon therein.
    A verbal consultation is part of this report. If you were not present during the inspection, call our office for a full discussion of the entire report.
    This report is for the sole use of the named client only; it is not to be used by any other party for any reason.<br><br>
    <strong>This report is not to be used for the purposes of substitute disclosure.</strong>
  </div>
</div>

<!-- TABLE OF CONTENTS -->
<div class="page page-break">
  <div class="report-header">
    <span>${report.inspectedAt || ''}</span>
    <span>Inspection Report Exclusively For: ${report.fileNumber || report.clientName || ''}</span>
  </div>
  <div class="section-title">Table of Contents</div>
  ${['Cover Page', 'Table of Contents', 'Sewer Inspection Disclosure', 'Scope of the Sewer Inspection', 'Point of Reference', 'Client & Site Information', 'Sewer System Information', 'Sewer Pipe Conditions', 'End of Report', 'Statement of Service', 'Understanding Sewer Material & Defects'].map(item => `
    <div class="toc-item">${item}</div>
  `).join('')}
  <div class="report-footer">
    This report was prepared for the client listed above in accordance with our inspection agreement.<br>
    <strong>This report is not to be used for the purposes of substitute disclosure.</strong>
  </div>
</div>

<!-- DISCLOSURE + SCOPE -->
<div class="page page-break">
  <div class="report-header">
    <span>${report.inspectedAt || ''}</span>
    <span>Inspection Report Exclusively For: ${report.fileNumber || report.clientName || ''}</span>
  </div>
  <div class="section-title">Sewer Line Inspection Disclosure</div>
  <p class="disclosure-text">This report is intended to be used only as a general guide in order to provide our clients with current condition of the home&apos;s and/or building&apos;s main sewer line. The report expresses the opinion of the inspector, based upon visual impressions of the conditions that existed at the time of the inspection only.</p>
  <p class="disclosure-text">The inspection report should not be construed as a compliance inspection of any governmental or non-governmental codes or regulations. The report is not intended to be a warranty or guarantee of the present or future adequacy or performance of the sewer line.</p>
  <p class="disclosure-text">All repairs should be done by a competent licensed Plumber and any work requiring building permits should be obtained by the authority having jurisdiction (Local Building Department).</p>
  <p class="disclosure-text">It is the client&apos;s sole responsibility to <u>read this report in its entirety</u>, not rely upon any verbal comments and to research any and all jurisdictional permits required by the local authorities regarding the property inspected.</p>

  <div class="section-title">Scope of the Sewer Inspection</div>
  <p class="disclosure-text">A sewer inspection scan was requested of the main drain line from the structure to the city, private sewer connection, 150 feet or camera limitations (whichever comes first). The sewer line is to be accessed through a cleanout, roof vent (single story only) or other access point(s) to be determined best by the inspector.</p>

  <div class="section-title">Point of Reference</div>
  <p style="text-align:center; font-weight:700; margin-bottom:8px;">[NOTE]</p>
  <p class="disclosure-text">Statements made within this inspection report pertaining to left, right, front or rear were referenced by standing in front of and facing the structure from the street. Additionally, analogue clockface references may be utilized to pinpoint conditions found within the pipe; in this case the 12 o&apos;clock position will be the topmost center of the pipe, the 6 o&apos;clock position will be the bottom most center of the pipe and so on.</p>
  <div class="report-footer">
    This report was prepared for the client listed above in accordance with our inspection agreement.<br>
    <strong>This report is not to be used for the purposes of substitute disclosure.</strong>
  </div>
</div>

<!-- CLIENT & SITE INFO -->
<div class="page page-break">
  <div class="report-header">
    <span>${report.inspectedAt || ''}</span>
    <span>Inspection Report Exclusively For: ${report.fileNumber || report.clientName || ''}</span>
  </div>
  <div class="section-subtitle">Client & Site Information</div>

  <div class="client-info-wrap">
    <div style="flex: 1;">
      <div style="font-weight: 700; font-size: 13px; text-decoration: underline; margin-bottom: 12px;">FILE/DATE/TIME</div>
      ${[
        ['File #', report.fileNumber],
        ['Client Name', report.clientName],
        ['Location', report.location],
        ['Date', report.inspectedAt],
        ['Time', report.inspectionTime],
        ['People Present', report.peoplePresent],
        ["Buyer's Agent", report.buyersAgent],
        ['Building Occupied', report.buildingOccupied],
        ['Weather/Soil', report.weather],
      ].filter(([, v]) => v).map(([label, value]) => `
        <div class="info-row">
          <span class="info-label">${label}</span>
          <span class="info-value">${value}</span>
        </div>
      `).join('')}
    </div>
    ${report.propertyPhotos && report.propertyPhotos.length > 0 ? `
    <div class="client-info-photos">
      ${report.propertyPhotos.slice(0, 2).map((p: string) => `<img src="${p}" class="client-info-photo" alt="Property" />`).join('')}
    </div>
    ` : ''}
  </div>

  <div class="section-subtitle" style="margin-top: 20px;">Sewer System Information</div>
  ${report.cleanoutLocation ? `<div class="system-row"><div class="system-label">Location of Camera Entry</div><div class="system-value">${report.cleanoutLocation}</div></div>` : ''}
  ${report.pipeMaterials && report.pipeMaterials.length > 0 ? `<div class="system-row"><div class="system-label">Sewer Pipe Materials</div><div class="system-value">${report.pipeMaterials.join(', ')}</div></div>` : ''}
  ${report.videoLink ? `<div class="system-row"><div class="system-label">Sewer Video Link</div><div class="system-value"><a href="${report.videoLink}" style="color:#0066cc;">${report.videoLink}</a></div></div>` : ''}

  <div class="report-footer">
    This report was prepared for the client listed above in accordance with our inspection agreement.<br>
    <strong>This report is not to be used for the purposes of substitute disclosure.</strong>
  </div>
</div>

<!-- PIPE CONDITIONS -->
<div class="page page-break">
  <div class="report-header">
    <span>${report.inspectedAt || ''}</span>
    <span>Inspection Report Exclusively For: ${report.fileNumber || report.clientName || ''}</span>
  </div>
  <div class="section-subtitle">Sewer Piping Conditions</div>

  ${defects.length === 0 ? '<p style="color:#999;font-size:13px;">No conditions recorded.</p>' : ''}

  ${defects.map((d: any, i: number) => `
  <div class="defect-item">
    <p class="defect-desc">
      <strong>-@ ${d.videoTime || '--:--'} / ${d.footage || '0'} ft approx. in video the following condition was observed.</strong>
      ${d.conditionType !== 'Select Condition Type' ? `<strong> ${d.conditionType}${d.severity === 'Major' ? '; Major defect.' : d.severity === 'Moderate' ? '; moderate.' : d.severity === 'Minor' ? '; minor.' : '.'}</strong>` : ''}
      ${d.narrative ? ` ${d.narrative}` : ''}
    </p>
    ${d.images && d.images.length > 0 ? `
    <div class="defect-photos">
      ${d.images.map((img: any, imgIdx: number) => `
      <div class="defect-photo-wrap">
        <img src="${img.url}" class="defect-photo" alt="Condition photo ${imgIdx + 1}" />
        <span class="photo-timestamp">${d.videoTime ? `${d.videoTime} / ${d.footage} ft` : `Photo ${imgIdx + 1}`}</span>
      </div>
      `).join('')}
    </div>
    ` : ''}
  </div>
  `).join('')}

  <div class="report-footer">
    This report was prepared for the client listed above in accordance with our inspection agreement.<br>
    <strong>This report is not to be used for the purposes of substitute disclosure.</strong>
  </div>
</div>

<!-- END OF REPORT -->
<div class="page page-break">
  <div class="report-header">
    <span>${report.inspectedAt || ''}</span>
    <span>Inspection Report Exclusively For: ${report.fileNumber || report.clientName || ''}</span>
  </div>
  <div class="end-title">End of Section — Comments</div>
  ${report.notes ? `<p class="end-comment">${report.notes}</p>` : ''}
  <div class="end-title">End of Report — Comments</div>
  <p class="end-comment">Given the condition(s) above we recommend full evaluations and/or corrections with written findings and costs to cure by a competent licensed plumbing contractor before the end/close of the inspection contingency period.</p>
  <p class="end-comment">Recommend sewer inspections after repairs are made to ensure efficacy of work and to inspect any areas of the sewer lateral not visible due to defect(s).</p>
  <div class="report-footer">
    This report was prepared for the client listed above in accordance with our inspection agreement.<br>
    <strong>This report is not to be used for the purposes of substitute disclosure.</strong>
  </div>
</div>

<!-- MATERIAL TABLE -->
<div class="page">
  <div class="report-header">
    <span>${report.inspectedAt || ''}</span>
    <span>Inspection Report Exclusively For: ${report.fileNumber || report.clientName || ''}</span>
  </div>
  <div class="section-title">Understanding Sewer Material & Defects</div>
  <div style="text-align:center;font-weight:700;text-decoration:underline;margin-bottom:12px;">Sewer Line Material</div>
  <table class="material-table">
    <thead><tr><th>Type</th><th>Life Expectancy</th></tr></thead>
    <tbody>
      ${[
        ['Standard Dimensional Ratio (SDR)', '50-500 years'],
        ['Polyvinyl Chloride (PVC)', '50-500 years'],
        ['Acrylonitrile Butadiene Styrene (ABS)', '50-500 years'],
        ['Vitrified Clay Pipe and/or "Terracotta"', '75-100 years'],
        ['Cast Iron', '75-100 years'],
        ['Concrete', '50-75 years'],
        ['Transite/Asbestos Cement', '40-60 years'],
        ['Bituminous Fiber and/or "Orangeburg"', '30-50 years'],
        ['Cured in Place Pipe (CIPP)', '40+ years'],
        ['High Density Polyethylene (HDPE)', '50-500 years'],
        ['Thin walled PVC and/or "Genova"', '40-70 years'],
        ['Galvanized Steel', '40-70 years'],
        ['Lead', '100+ years'],
        ['Copper', '50+ years'],
        ['Stainless Steel', '50+ years'],
      ].map(([type, life]) => `<tr><td>${type}</td><td><strong>${life}</strong></td></tr>`).join('')}
    </tbody>
  </table>
  <p style="font-size:11px;color:#555;margin-top:16px;line-height:1.7;">
    <strong>*NOTE*</strong> Life expectancy is for material alone and under ideal circumstances as intended from the manufacturer.
    Construction and repair practices, soil erosion/settling, and root intrusion can drastically reduce expected timelines.
  </p>
  <div class="report-footer">
    Generated by Sewer Labz | ${report.location || ''} | ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}<br>
    <strong>This report is not to be used for the purposes of substitute disclosure.</strong>
  </div>
</div>

</body>
</html>`

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}