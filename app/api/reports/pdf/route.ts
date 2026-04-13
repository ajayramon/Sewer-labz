import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { report, defects } = body

    const footer = `
      <div class="report-footer">
        This report was prepared for the client listed above in accordance with our inspection agreement.<br>
        <strong>This report is not to be used for the purposes of substitute disclosure.</strong>
      </div>
    `

    const header = (date: string, ref: string) => `
      <div class="report-header">
        <span>${date}</span>
        <span>Inspection Report Exclusively For: ${ref}</span>
      </div>
    `

    const ref = report.fileNumber || report.clientName || ''
    const date = report.inspectedAt || ''

    // ── Corrective actions ──────────────────────────────────────
    const correctiveRows = report.corrections
      ? Object.entries(report.corrections)
          .filter(([, v]) => v && v !== 'N/A')
          .map(([label, value]) => `
            <div class="info-row">
              <span class="info-label">${label}</span>
              <span class="info-value">${value}</span>
            </div>`).join('')
      : ''

    // ── Video links ─────────────────────────────────────────────
    const videoLinksHtml = report.videoLinks && report.videoLinks.length > 0
      ? report.videoLinks.map((link: string, i: number) => `
          <div class="info-row">
            <span class="info-label">Video Link ${i + 1}</span>
            <span class="info-value"><a href="${link}" style="color:#0066cc;">${link}</a></span>
          </div>`).join('')
      : ''

    // ── Property photos ──────────────────────────────────────────
    const photos: string[] = report.propertyPhotos || (report.propertyPhoto ? [report.propertyPhoto] : [])

    // FIX: Only show first photo on cover, centered, full width
    const coverPhotoHtml = photos.length > 0
      ? `<img src="${photos[0]}" class="cover-photo" alt="Property" />`
      : `<div class="cover-photo-placeholder">Property Photo</div>`

    // ── Defects ──────────────────────────────────────────────────
    const defectsHtml = !defects || defects.length === 0
      ? '<p style="color:#999;font-size:13px;">No conditions recorded.</p>'
      : defects.map((d: any, i: number) => {
          const time = (d.videoTimeH && d.videoTimeM)
            ? `${d.videoTimeH}:${d.videoTimeM}`
            : d.videoTimeH || '--:--'

          const severityLabel = d.severity && d.severity !== 'No Defect'
            ? `; <span style="font-weight:700;color:${
                d.severity === 'Major' ? '#DC2626'
                : d.severity === 'Moderate' ? '#EA580C'
                : d.severity === 'Minor' ? '#D97706'
                : d.severity === 'Suggested Maintenance' ? '#2563EB'
                : '#16A34A'
              };">${d.severity}</span>`
            : ''

          const photosHtml = d.images && d.images.length > 0
            ? `<div class="defect-photos">
                ${d.images.map((img: any, idx: number) => `
                  <div class="defect-photo-wrap">
                    <img src="${img.url}" class="defect-photo" alt="Photo ${idx + 1}" />
                  </div>`).join('')}
               </div>`
            : ''

          return `
            <div class="defect-item">
              <p class="defect-desc">
                <strong>#${i + 1} @ ${time}${d.footageStart ? ` / ${d.footageStart} ft` : ''} —
                ${d.conditionType !== 'Select Condition Type' ? d.conditionType : 'Observation'}${severityLabel}.</strong>
                ${d.narrative ? ` ${d.narrative}` : ''}
              </p>
              ${photosHtml}
            </div>`
        }).join('')

    // ── Common Sewer Defect Graphic (SVG inline) ─────────────────
    const defectGraphicHtml = `
    <div style="margin-top:20px;">
      <div style="text-align:center;font-weight:700;text-decoration:underline;margin-bottom:12px;font-size:14px;">Common Sewer Defects</div>
      <table style="width:100%;border-collapse:collapse;font-size:11px;">
        <thead>
          <tr style="background:#0F2A4A;color:#fff;">
            <th style="padding:8px;text-align:left;border:1px solid #ddd;">Defect Type</th>
            <th style="padding:8px;text-align:left;border:1px solid #ddd;">Description</th>
            <th style="padding:8px;text-align:left;border:1px solid #ddd;">Severity</th>
          </tr>
        </thead>
        <tbody>
          ${[
            ['Root Intrusion',       'Tree/plant roots entering pipe through joints or cracks',           'Minor to Major'],
            ['Offset Joint',         'Pipe sections misaligned at joints causing partial/full blockage',  'Moderate to Major'],
            ['Circumferential Crack','Crack around full circumference of pipe, structural concern',        'Moderate to Major'],
            ['Longitudinal Crack',   'Crack running along length of pipe',                                'Minor to Major'],
            ['Erosion At Joint',     'Material worn away at pipe joints, weakening structure',            'Moderate'],
            ['Debris Within Pipe',   'Grease, sediment, or foreign objects blocking flow',                'Minor to Major'],
            ['Deteriorated Pipe',    'Pipe material degrading, pitting, or corroding',                    'Moderate to Major'],
            ['Belly/Positive Grade', 'Section of pipe sagging, causing pooling and blockage',             'Moderate to Major'],
            ['Infiltration',         'Groundwater entering pipe through cracks or joints',                'Moderate'],
            ['Collapse',             'Pipe has partially or fully caved in',                              'Major'],
          ].map(([type, desc, severity], i) => `
            <tr style="background:${i % 2 === 0 ? '#fff' : '#f9f9f9'};">
              <td style="padding:7px 8px;border:1px solid #ddd;font-weight:600;">${type}</td>
              <td style="padding:7px 8px;border:1px solid #ddd;">${desc}</td>
              <td style="padding:7px 8px;border:1px solid #ddd;color:${
                severity.includes('Major') ? '#DC2626' : severity.includes('Moderate') ? '#EA580C' : '#D97706'
              };font-weight:600;">${severity}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Sewer Inspection Report</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; color: #000; background: #fff; font-size: 13px; }
  .page { padding: 40px 50px; position: relative; min-height: 100vh; }

  /* ── Cover — FIX: no address/date box, photo full width ── */
  .cover {
    display: flex; flex-direction: column; align-items: center;
    padding: 30px 50px 120px;
    min-height: 100vh; position: relative;
  }
  .cover-logo { font-size: 52px; font-weight: 900; letter-spacing: -1px; margin-bottom: 4px; }
  .cover-logo span { color: #2D8C4E; }
  .cover-tagline { font-size: 16px; color: #2D8C4E; font-weight: 700; margin-bottom: 4px; }
  .cover-subtitle { font-size: 14px; color: #444; margin-bottom: 24px; }

  /* FIX: Cover photo full width, properly centered, more space */
  .cover-photo {
    width: 100%; max-width: 680px; height: 420px;
    object-fit: cover; object-position: center;
    border-radius: 4px; display: block; margin: 0 auto;
  }
  .cover-photo-placeholder {
    width: 100%; max-width: 680px; height: 420px;
    background: #f0f0f0; border-radius: 4px;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; color: #999; margin: 0 auto;
  }

  /* FIX: Disclaimer pinned to bottom — NO address/date box */
  .cover-disclaimer {
    position: absolute; bottom: 30px; left: 50px; right: 50px;
    font-size: 11px; color: #555; line-height: 1.7;
    border-top: 1px solid #ddd; padding-top: 12px; text-align: center;
  }

  .page-break { page-break-after: always; }

  /* FIX: No browser header/footer via CSS */
  @page { margin: 0.5in; }

  .report-header {
    display: flex; justify-content: space-between; align-items: center;
    border-bottom: 1px solid #000; padding-bottom: 8px; margin-bottom: 20px;
    font-size: 11px; color: #555;
  }
  .report-footer {
    position: absolute; bottom: 20px; left: 50px; right: 50px;
    border-top: 1px solid #ddd; padding-top: 8px;
    font-size: 10px; color: #888; text-align: center; line-height: 1.6;
  }

  .section-title {
    font-size: 17px; font-weight: 900; text-decoration: underline;
    text-align: center; margin: 20px 0 14px; text-transform: uppercase;
  }
  .section-subtitle {
    font-size: 14px; font-weight: 700; text-transform: uppercase;
    border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 12px;
  }

  .toc-item { padding: 6px 0; font-size: 14px; border-bottom: 1px dotted #ddd; }

  .info-row { display: flex; margin-bottom: 8px; }
  .info-label { font-weight: 700; font-size: 12px; min-width: 160px; text-transform: uppercase; }
  .info-value { font-size: 13px; color: #222; }

  .system-row { margin-bottom: 12px; }
  .system-label { font-weight: 700; font-size: 12px; text-transform: uppercase; margin-bottom: 4px; }
  .system-value { font-size: 13px; color: #222; padding: 8px; background: #f9f9f9; border-radius: 4px; border: 1px solid #eee; }

  .defect-item { margin-bottom: 24px; page-break-inside: avoid; }
  .defect-desc { font-size: 13px; line-height: 1.7; margin-bottom: 10px; }
  .defect-photos { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 8px; }
  .defect-photo {
    width: 100%; height: 200px;
    object-fit: cover; object-position: center;
    border: 1px solid #ddd; border-radius: 4px; display: block;
  }

  .end-comment { font-size: 13px; line-height: 1.8; margin-bottom: 8px; }
  .disclosure-text { font-size: 13px; line-height: 1.8; margin-bottom: 14px; font-weight: 700; }

  .material-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  .material-table th { background: #0F2A4A; color: #fff; font-size: 12px; font-weight: 700; padding: 8px 12px; text-align: left; border: 1px solid #ddd; }
  .material-table td { font-size: 12px; padding: 7px 12px; border: 1px solid #ddd; }
  .material-table tr:nth-child(even) td { background: #fafafa; }

  @media print {
    .page-break { page-break-after: always; }
    .defect-item { page-break-inside: avoid; }
  }
</style>
</head>
<body>

<!-- COVER PAGE — FIX: No address/date box below photo -->
<div class="cover page-break">
  <div class="cover-logo">SEWER <span>LABZ</span></div>
  <div class="cover-tagline">${report.companyTagline || "Don't Let Your Drain Be A Pain!"}</div>
  <div class="cover-subtitle">Professional Sewer Inspection Report</div>

  ${coverPhotoHtml}

  <!-- FIX: Disclaimer only at bottom — NO duplicate address/date box -->
  <div class="cover-disclaimer">
    This report was prepared for the client listed above in accordance with our inspection agreement and is subject to
    the terms and conditions agreed upon therein. A verbal consultation is part of this report. If you were not present
    during the inspection, call our office for a full discussion of the entire report.
    This report is for the sole use of the named client only; it is not to be used by any other party for any reason.<br><br>
    <strong>THIS REPORT IS NOT TO BE USED FOR THE PURPOSES OF SUBSTITUTE DISCLOSURE.</strong>
  </div>
</div>

<!-- TABLE OF CONTENTS -->
<div class="page page-break">
  ${header(date, ref)}
  <div class="section-title">Table of Contents</div>
  ${[
    'Cover Page', 'Table of Contents', 'Sewer Inspection Disclosure',
    'Scope of the Sewer Inspection', 'Point of Reference',
    'Client & Site Information', 'Sewer System Information',
    'Sewer Pipe Conditions', 'General Notes',
    'Corrective Action Recommendations', 'End of Report',
    'Statement of Service', 'Understanding Sewer Material & Defects',
    'Common Sewer Defects Reference',
  ].map(item => `<div class="toc-item">${item}</div>`).join('')}
  ${footer}
</div>

<!-- DISCLOSURE + SCOPE + POINT OF REFERENCE -->
<div class="page page-break">
  ${header(date, ref)}
  <div class="section-title">Sewer Line Inspection Disclosure</div>
  <p class="disclosure-text">This report is intended to be used only as a general guide in order to provide our clients with current condition of the home's and/or building's main sewer line. The report expresses the opinion of the inspector, based upon visual impressions of the conditions that existed at the time of the inspection only.</p>
  <p class="disclosure-text">The inspection report should not be construed as a compliance inspection of any governmental or non-governmental codes or regulations. The report is not intended to be a warranty or guarantee of the present or future adequacy or performance of the sewer line.</p>
  <p class="disclosure-text">All repairs should be done by a competent licensed Plumber and any work requiring building permits should be obtained by the authority having jurisdiction (Local Building Department).</p>
  <p class="disclosure-text">It is the client's sole responsibility to <u>read this report in its entirety</u>, not rely upon any verbal comments and to research any and all jurisdictional permits required by the local authorities regarding the property inspected.</p>

  <div class="section-title">Scope of the Sewer Inspection</div>
  <p class="disclosure-text">A sewer inspection scan was requested of the main drain line from the structure to the city, private sewer connection, 150 feet or camera limitations (whichever comes first). The sewer line is to be accessed through a cleanout, roof vent (single story only) or other access point(s) to be determined best by the inspector. The camera inspection does not inspect all of the drain lines running under and or within the structure. The following is a summative report of the findings.</p>

  <div class="section-title">Point of Reference</div>
  <p class="disclosure-text" style="text-align:center;font-weight:900;">[NOTE]</p>
  <p class="disclosure-text">Statements made within this inspection report pertaining to left, right, front or rear were referenced by standing in front of and facing the structure from the street. Additionally, analogue clockface references may be utilized to pinpoint conditions found within the pipe; in this case the 12 o'clock position will be the topmost center of the pipe, the 6 o'clock position will be the bottom most center of the pipe and so on.</p>
  ${footer}
</div>

<!-- CLIENT & SITE INFO -->
<div class="page page-break">
  ${header(date, ref)}
  <div class="section-subtitle">Client & Site Information</div>

  <div style="display:flex;gap:20px;margin-bottom:20px;">
    <div style="flex:1;">
      <div style="font-weight:700;font-size:13px;text-decoration:underline;margin-bottom:12px;">FILE / DATE / TIME</div>
      ${[
        ['File #',            report.fileNumber],
        ['Client Name',       report.clientName],
        ['Location',          report.location],
        ['Date',              date],
        ['Time',              report.inspectionTime],
        ['People Present',    Array.isArray(report.peoplePresent) ? report.peoplePresent.join(', ') : report.peoplePresent],
        ["Buyer's Agent",     report.buyersAgent],
        ['Building Occupied', report.buildingOccupied],
        ['Weather / Soil',    report.weather],
        ['Inspector',         report.inspector],
      ].filter(([, v]) => v).map(([label, value]) => `
        <div class="info-row">
          <span class="info-label">${label}</span>
          <span class="info-value">${value}</span>
        </div>`).join('')}
    </div>
    ${photos.length > 0 ? `
    <div style="flex-shrink:0;">
      <img src="${photos[0]}" style="width:180px;height:140px;object-fit:cover;object-position:center;border:1px solid #ddd;border-radius:4px;display:block;" alt="Property" />
    </div>` : ''}
  </div>

  ${photos.length > 1 ? `
  <div style="display:grid;grid-template-columns:repeat(${Math.min(photos.length - 1, 2)},1fr);gap:10px;margin-bottom:20px;">
    ${photos.slice(1).map(p => `
      <img src="${p}" style="width:100%;height:160px;object-fit:cover;object-position:center;border:1px solid #ddd;border-radius:4px;display:block;" alt="Property" />`).join('')}
  </div>` : ''}

  ${footer}
</div>

<!-- SEWER SYSTEM INFO -->
<div class="page page-break">
  ${header(date, ref)}
  <div class="section-subtitle">Sewer System Information</div>

  ${report.cleanoutLocation ? `
  <div class="system-row">
    <div class="system-label">Location of Camera Entry / Cleanout</div>
    <div class="system-value">${report.cleanoutLocation}</div>
  </div>` : ''}

  ${report.pipeMaterials && report.pipeMaterials.length > 0 ? `
  <div class="system-row">
    <div class="system-label">Sewer Pipe Material(s) Found</div>
    <div class="system-value">${Array.isArray(report.pipeMaterials) ? report.pipeMaterials.join(', ') : report.pipeMaterials}</div>
  </div>` : ''}

  ${report.cameraDirection1 || report.cameraDirection2 ? `
  <div class="system-row">
    <div class="system-label">Piping Section — Camera Direction(s)</div>
    <div class="system-value">
      ${report.cameraDirection1 ? `<div style="margin-bottom:6px;"><strong>1st Direction:</strong> ${report.cameraDirection1}</div>` : ''}
      ${report.cameraDirection2 ? `<div><strong>2nd Direction:</strong> ${report.cameraDirection2}</div>` : ''}
    </div>
  </div>` : ''}

  ${report.pipingNotes ? `
  <div class="system-row">
    <div class="system-label">Additional Piping Notes</div>
    <div class="system-value">${report.pipingNotes}</div>
  </div>` : ''}

  ${videoLinksHtml ? `
  <div class="system-row">
    <div class="system-label">Sewer Video Link(s)</div>
    <div class="system-value">${videoLinksHtml}</div>
  </div>` : ''}

  ${footer}
</div>

<!-- PIPE CONDITIONS -->
<div class="page page-break">
  ${header(date, ref)}
  <div class="section-subtitle">Sewer Piping Conditions</div>
  ${defectsHtml}
  ${footer}
</div>

<!-- GENERAL NOTES -->
${report.generalNotes ? `
<div class="page page-break">
  ${header(date, ref)}
  <div class="section-subtitle">General Notes / Comments</div>
  <p class="end-comment" style="white-space:pre-wrap;">${report.generalNotes}</p>
  ${footer}
</div>` : ''}

<!-- CORRECTIVE ACTION RECOMMENDATIONS -->
<div class="page page-break">
  ${header(date, ref)}
  <div class="section-subtitle">Corrective Action Recommendations</div>

  ${correctiveRows
    ? `<div style="margin-bottom:16px;">${correctiveRows}</div>`
    : '<p class="end-comment" style="color:#999;">No corrective actions selected.</p>'}

  ${report.correctionNotes ? `
  <div style="margin-top:16px;">
    <div class="system-label">Additional Notes</div>
    <div class="system-value" style="margin-top:4px;white-space:pre-wrap;">${report.correctionNotes}</div>
  </div>` : ''}

  <div style="margin-top:24px;padding:12px;background:#F8FAFC;border-radius:6px;border:1px solid #eee;">
    <p class="end-comment">Given the condition(s) above we recommend full evaluations and/or corrections with written findings and costs to cure by a competent licensed plumbing contractor before the end/close of the inspection contingency period.</p>
    <p class="end-comment">Recommend sewer inspections after repairs are made to ensure efficacy of work and to inspect any areas of the sewer lateral not visible due to defect(s).</p>
  </div>
  ${footer}
</div>

<!-- STATEMENT OF SERVICE -->
<div class="page page-break">
  ${header(date, ref)}
  <div class="section-subtitle">Statement of Service</div>
  <p class="disclosure-text">${report.statementOfService || 'Sewer Labz is a professional sewer inspection company. Our inspectors are trained and experienced in the assessment of residential and commercial sewer systems. All inspections are performed in accordance with industry standards using professional-grade CCTV camera equipment.'}</p>
  <p class="disclosure-text">This inspection report represents a visual assessment only. Our findings are limited to conditions observable by camera at the time of inspection. Sewer Labz does not perform destructive testing and cannot be held responsible for conditions that are not visible or accessible during the camera inspection.</p>
  <p class="disclosure-text">All recommendations contained within this report should be evaluated by a licensed plumbing contractor prior to any real estate transaction close date. Sewer Labz is available for follow-up consultations upon request.</p>
  ${footer}
</div>

<!-- SEWER MATERIAL LIFE EXPECTANCY -->
<div class="page page-break">
  ${header(date, ref)}
  <div class="section-title">Understanding Sewer Material &amp; Defects</div>
  <div style="text-align:center;font-weight:700;text-decoration:underline;margin-bottom:12px;">Sewer Line Material Life Expectancy</div>

  <table class="material-table">
    <thead><tr><th>Material Type</th><th>Life Expectancy</th></tr></thead>
    <tbody>
      ${[
        ['Standard Dimensional Ratio (SDR)',     '50–500 years'],
        ['Polyvinyl Chloride (PVC)',              '50–500 years'],
        ['Acrylonitrile Butadiene Styrene (ABS)','50–500 years'],
        ['Vitrified Clay / Terracotta',           '75–100 years'],
        ['Cast Iron',                             '75–100 years'],
        ['Concrete',                              '50–75 years'],
        ['Transite / Asbestos Cement',            '40–60 years'],
        ['Bituminous Fiber / Orangeburg',         '30–50 years'],
        ['Cured in Place Pipe (CIPP)',            '40+ years'],
        ['High Density Polyethylene (HDPE)',      '50–500 years'],
        ['Thin-walled PVC / Genova',              '40–70 years'],
        ['Galvanized Steel',                      '40–70 years'],
        ['Lead',                                  '100+ years'],
        ['Copper',                                '50+ years'],
        ['Stainless Steel',                       '50+ years'],
      ].map(([type, life]) => `<tr><td>${type}</td><td><strong>${life}</strong></td></tr>`).join('')}
    </tbody>
  </table>

  <p style="font-size:11px;color:#555;margin-top:16px;line-height:1.7;">
    <strong>*NOTE*</strong> Life expectancy is for material alone and under ideal circumstances as intended by the manufacturer.
    Construction and repair practices can have detrimental effects on how long a sewer line can perform as expected.
    Additionally, soil erosion/settling and other environmental influences such as root intrusion can drastically reduce the expected timelines outlined above.
  </p>
  ${footer}
</div>

<!-- COMMON SEWER DEFECT GRAPHIC -->
<div class="page">
  ${header(date, ref)}
  ${defectGraphicHtml}

  <div style="margin-top:32px;border-top:1px solid #ddd;padding-top:12px;text-align:center;font-size:10px;color:#888;">
    Generated by Sewer Labz &nbsp;|&nbsp; ${report.location || ''} &nbsp;|&nbsp;
    ${new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })}<br>
    <strong>This report is not to be used for the purposes of substitute disclosure.</strong>
  </div>
</div>

</body>
</html>`

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        // FIX: Prevent browser from showing "about:blank" in header/footer
        'X-Frame-Options': 'SAMEORIGIN',
      },
    })

  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
