import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    const {
      reportId = 'RPT-0001',
      clientName = '',
      location = '',
      date = '',
      timeHour = '',
      timeMinute = '',
      timePeriod = 'AM',
      fileNumber = '',
      peoplePresent = '',
      buyersAgent = '',
      buildingOccupied = '',
      weatherSoil = '',
      cameraEntry = '',
      pipeMaterials = [],
      videoLink = '',
      propertyPhoto = '',
      pipeConditions = [],
      endOfSectionComments = '',
      endOfReportComments = '',
      companyName = 'SEWER LABZ',
      companyLogo = '',
      companyTagline = "Don't Let Your Drain Be A Pain!",
      inspectorName = '',
    } = data

    const formattedTime = timeHour && timeMinute
      ? `${timeHour}:${timeMinute} ${timePeriod}`
      : ''

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 11px; color: #000; background: #fff; }

    /* PAGE BREAKS */
    .page { page-break-after: always; padding: 40px 50px; min-height: 100vh; position: relative; }
    .page:last-child { page-break-after: avoid; }

    /* HEADER */
    .page-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center;
      border-bottom: 1px solid #ccc; 
      padding-bottom: 8px; 
      margin-bottom: 20px; 
      font-size: 9px; 
      color: #666; 
    }

    /* FOOTER */
    .page-footer {
      position: absolute;
      bottom: 20px;
      left: 50px;
      right: 50px;
      text-align: center;
      font-size: 8px;
      color: #666;
      border-top: 1px solid #eee;
      padding-top: 8px;
    }

    /* COVER PAGE */
    .cover { text-align: center; padding: 60px 50px 40px; }
    .cover-logo { margin-bottom: 20px; }
    .cover-logo h1 { font-size: 42px; font-weight: 900; color: #0F2A4A; letter-spacing: 2px; }
    .cover-logo h1 span { color: #2D8C4A; }
    .cover-logo p { font-size: 13px; color: #555; margin-top: 4px; }
    .cover-tagline { font-size: 14px; color: #333; margin-bottom: 6px; }
    .cover-subtitle { font-size: 12px; color: #666; margin-bottom: 30px; }

    .cover-photo {
      width: 100%;
      max-width: 500px;
      height: 280px;
      object-fit: cover;
      object-position: center;
      border-radius: 4px;
      margin: 0 auto 24px;
      display: block;
      border: 1px solid #ddd;
    }
    .cover-photo-placeholder {
      width: 100%;
      max-width: 500px;
      height: 280px;
      background: #f0f0f0;
      border: 1px dashed #ccc;
      border-radius: 4px;
      margin: 0 auto 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
      font-size: 12px;
    }

    .cover-address {
      border: 2px solid #0F2A4A;
      border-radius: 6px;
      padding: 10px 24px;
      display: inline-block;
      margin-bottom: 6px;
    }
    .cover-address h2 { font-size: 16px; font-weight: bold; color: #0F2A4A; }
    .cover-date { font-size: 12px; color: #555; margin-bottom: 24px; }

    .cover-disclaimer {
      font-size: 9px;
      color: #555;
      max-width: 480px;
      margin: 0 auto 16px;
      line-height: 1.6;
    }
    .cover-disclaimer strong { font-weight: bold; }

    /* TABLE OF CONTENTS */
    .toc-title { 
      text-align: center; 
      font-size: 16px; 
      font-weight: 900; 
      text-decoration: underline;
      text-transform: uppercase;
      margin-bottom: 30px;
      letter-spacing: 2px;
    }
    .toc-item {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px dotted #ccc;
      padding: 8px 0;
      font-size: 12px;
    }

    /* SECTION TITLES */
    .section-title {
      font-size: 14px;
      font-weight: 900;
      text-decoration: underline;
      text-transform: uppercase;
      text-align: center;
      margin-bottom: 20px;
      letter-spacing: 1px;
    }
    .section-subtitle {
      font-size: 11px;
      font-weight: bold;
      text-decoration: underline;
      text-transform: uppercase;
      margin: 16px 0 8px;
    }

    /* CLIENT INFO TABLE */
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .info-table tr td { padding: 6px 8px; font-size: 11px; vertical-align: top; }
    .info-table tr td:first-child { font-weight: bold; width: 160px; }
    .info-table tr { border-bottom: 1px solid #eee; }

    /* PIPE CONDITIONS */
    .condition-block { margin-bottom: 28px; border-top: 2px solid #0F2A4A; padding-top: 12px; }
    .condition-header { 
      font-size: 11px; 
      font-weight: bold; 
      margin-bottom: 10px;
      line-height: 1.8;
    }
    .condition-timestamp {
      font-size: 13px;
      font-weight: bold;
      color: #0F2A4A;
    }
    .condition-photos { 
      display: flex; 
      gap: 12px; 
      margin: 12px 0; 
      flex-wrap: wrap;
    }
    .condition-photo {
      width: 220px;
      height: 160px;
      object-fit: cover;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    /* SEVERITY SYMBOL */
    .severity-symbol {
      display: inline-block;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      margin: 0 6px;
      vertical-align: middle;
    }
    .severity-major { background: #dc2626; }
    .severity-moderate { background: #f59e0b; }
    .severity-minor { background: #16a34a; }
    .severity-critical { background: #7c3aed; }

    /* PIPE MATERIALS */
    .materials-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }
    .material-tag {
      background: #0F2A4A;
      color: white;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 9px;
      font-weight: bold;
    }

    /* COMMENTS */
    .comments-box {
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 12px;
      min-height: 80px;
      font-size: 11px;
      line-height: 1.6;
      margin-top: 8px;
    }

    /* UNDERSTANDING TABLE */
    .understanding-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    .understanding-table th { 
      background: #0F2A4A; 
      color: white; 
      padding: 8px; 
      font-size: 10px;
      text-align: left;
    }
    .understanding-table td { 
      padding: 6px 8px; 
      font-size: 10px; 
      border-bottom: 1px solid #eee; 
    }
    .understanding-table tr:nth-child(even) td { background: #f9f9f9; }

    /* STATEMENT OF SERVICE */
    .sos-box {
      border: 2px solid #0F2A4A;
      border-radius: 6px;
      padding: 20px;
      margin-top: 16px;
    }
    .sos-title {
      font-size: 13px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .sos-text { font-size: 10px; line-height: 1.8; color: #333; }

    p { line-height: 1.6; margin-bottom: 10px; }
    strong { font-weight: bold; }
  </style>
</head>
<body>

<!-- ========== PAGE 1: COVER ========== -->
<div class="page cover">
  <div class="cover-logo">
    ${companyLogo
      ? `<img src="${companyLogo}" style="max-height:80px; margin-bottom:8px;" />`
      : `<h1>${companyName.includes('SEWER') 
          ? companyName.replace('SEWER', 'SEWER <span>').replace('LABZ', 'LABZ</span>')
          : companyName
        }</h1>`
    }
    <p class="cover-tagline">${companyTagline}</p>
    <p class="cover-subtitle">Professional Sewer Inspection Report</p>
  </div>

  ${propertyPhoto
    ? `<img src="${propertyPhoto}" class="cover-photo" alt="Property Photo" />`
    : `<div class="cover-photo-placeholder">Property Photo</div>`
  }

  <div class="cover-address">
    <h2>${location || 'Property Address'}</h2>
  </div>
  <div class="cover-date">${date || ''}</div>

  <div class="cover-disclaimer">
    This report was prepared for the client listed above in accordance with our inspection 
    agreement and is subject to the terms and conditions agreed upon therein. A verbal 
    consultation is part of this report. If you were not present during the inspection, 
    call our office for a full discussion of the entire report. This report is for the 
    sole use of the named client only; it is not to be used by any other party for any reason.
    <br/><br/>
    <strong>This report is not to be used for the purposes of substitute disclosure.</strong>
  </div>

  <div class="page-footer">
    Report ID: ${reportId} &nbsp;|&nbsp; Generated by Sewer Labz &nbsp;|&nbsp; This report is not to be used for the purposes of substitute disclosure.
  </div>
</div>

<!-- ========== PAGE 2: TABLE OF CONTENTS ========== -->
<div class="page">
  <div class="toc-title">Table of Contents</div>
  <div class="toc-item"><span>Cover Page</span><span>1</span></div>
  <div class="toc-item"><span>Table of Contents</span><span>2</span></div>
  <div class="toc-item"><span>Sewer Line Inspection Disclosure</span><span>3</span></div>
  <div class="toc-item"><span>Scope of the Sewer Inspection</span><span>3</span></div>
  <div class="toc-item"><span>Point of Reference</span><span>3</span></div>
  <div class="toc-item"><span>Client & Site Information</span><span>4</span></div>
  <div class="toc-item"><span>Sewer System Information</span><span>4</span></div>
  <div class="toc-item"><span>Sewer Pipe Conditions</span><span>5</span></div>
  <div class="toc-item"><span>End of Section Comments</span><span>6</span></div>
  <div class="toc-item"><span>End of Report Comments</span><span>6</span></div>
  <div class="toc-item"><span>Statement of Service</span><span>7</span></div>
  <div class="toc-item"><span>Understanding Sewer Material & Defects</span><span>8</span></div>
  <div class="page-footer">
    Report ID: ${reportId} &nbsp;|&nbsp; This report is not to be used for the purposes of substitute disclosure.
  </div>
</div>

<!-- ========== PAGE 3: DISCLOSURE + SCOPE + POINT OF REFERENCE ========== -->
<div class="page">
  <div class="page-header">
    <span>${date}</span>
    <span>Inspection Report Exclusively For: ${clientName}</span>
  </div>

  <div class="section-title">Sewer Line Inspection Disclosure</div>
  <p>This report is intended to be used only as a general guide in order to provide our clients with current condition of the home's and/or building's main sewer line. The report expresses the opinion of the inspector, based upon visual impressions of the conditions that existed at the time of the inspection only.</p>
  <p>The inspection report should not be construed as a compliance inspection of any governmental or non-governmental codes or regulations. The report is not intended to be a warranty or guarantee of the present or future adequacy or performance of the sewer line.</p>
  <p>All repairs should be done by a competent licensed Plumber and any work requiring building permits should be obtained by the authority having jurisdiction (Local Building Department).</p>
  <p>It is the client's sole responsibility to <strong><u>read this report in its entirety</u></strong>, not rely upon any verbal comments and to research any and all jurisdictional permits required by the local authorities regarding the property inspected.</p>

  <div class="section-title" style="margin-top:24px;">Scope of the Sewer Inspection</div>
  <p>A sewer inspection scan was requested of the main drain line from the structure to the city, private sewer connection, 150 feet or camera limitations (whichever comes first). The sewer line is to be accessed through a cleanout, roof vent (single story only) or other access point(s) to be determined best by the inspector. The camera inspection does not inspect all of the drain lines running under and or within the structure. The following is a summative report of the findings.</p>

  <div class="section-title" style="margin-top:24px;">Point of Reference</div>
  <p style="text-align:center;font-weight:bold;">[NOTE]</p>
  <p>Statements made within this inspection report pertaining to left, right, front or rear were referenced by standing in front of and facing the structure from the street. Additionally, analogue clockface references may be utilized to pinpoint conditions found within the pipe; in this case the 12 o'clock position will be the topmost center of the pipe, the 6 o'clock position will be the bottom most center of the pipe and so on.</p>

  <div class="page-footer">
    Report ID: ${reportId} &nbsp;|&nbsp; This report is not to be used for the purposes of substitute disclosure.
  </div>
</div>

<!-- ========== PAGE 4: CLIENT & SITE INFO ========== -->
<div class="page">
  <div class="page-header">
    <span>${date}</span>
    <span>Inspection Report Exclusively For: ${clientName}</span>
  </div>

  <div class="section-title">Client & Site Information</div>
  
  <div class="section-subtitle">File / Date / Time</div>
  <table class="info-table">
    <tr><td>File #</td><td>${fileNumber}</td></tr>
    <tr><td>Client Name</td><td>${clientName}</td></tr>
    <tr><td>Location</td><td>${location}</td></tr>
    <tr><td>Date</td><td>${date}</td></tr>
    <tr><td>Time</td><td>${formattedTime}</td></tr>
    <tr><td>People Present</td><td>${peoplePresent}</td></tr>
    <tr><td>Buyer's Agent</td><td>${buyersAgent}</td></tr>
    <tr><td>Building Occupied</td><td>${buildingOccupied}</td></tr>
    <tr><td>Weather / Soil</td><td>${weatherSoil}</td></tr>
  </table>

  <div class="section-title" style="margin-top:24px;">Sewer System Information</div>

  <div class="section-subtitle">Location of Camera Entry</div>
  <p>${cameraEntry}</p>

  <div class="section-subtitle">Sewer Pipe Materials</div>
  <div class="materials-grid">
    ${pipeMaterials.map((m: string) => `<span class="material-tag">${m}</span>`).join('')}
  </div>

  <div class="section-subtitle" style="margin-top:16px;">Sewer Video Link</div>
  <p>${videoLink ? `<a href="${videoLink}">${videoLink}</a>` : '-'}</p>

  <div class="page-footer">
    Report ID: ${reportId} &nbsp;|&nbsp; This report is not to be used for the purposes of substitute disclosure.
  </div>
</div>

<!-- ========== PAGE 5+: PIPE CONDITIONS ========== -->
<div class="page">
  <div class="page-header">
    <span>${date}</span>
    <span>Inspection Report Exclusively For: ${clientName}</span>
  </div>

  <div class="section-title">Sewer Piping Conditions</div>

  ${pipeConditions.length === 0
    ? '<p>No pipe conditions recorded.</p>'
    : pipeConditions.map((condition: any) => {
        const mins = String(condition.timestampMinutes || 0).padStart(2, '0')
        const secs = String(condition.timestampSeconds || 0).padStart(2, '0')
        const severityColor = 
          condition.severity === 'MAJOR' ? 'severity-major' :
          condition.severity === 'MODERATE' ? 'severity-moderate' :
          condition.severity === 'CRITICAL' ? 'severity-critical' :
          'severity-minor'
        
        const photos = condition.photos || []

        return `
          <div class="condition-block">
            <div class="condition-header">
              <span class="condition-timestamp">@ ${mins}:${secs}</span> / ${condition.footage || 0} ft approx. in the video the following condition was observed.
              <span class="severity-symbol ${severityColor}"></span>
              <strong>${condition.defectType || ''}</strong>${condition.severity ? `; ${condition.severity} defect.` : ''}
              ${condition.clockPosition ? `<br/>${condition.description || ''} at the ${condition.clockPosition} position.` : ''}
            </div>
            ${photos.length > 0 ? `
              <div class="condition-photos">
                ${photos.slice(0, 2).map((photo: string) => 
                  `<img src="${photo}" class="condition-photo" alt="Condition Photo"/>`
                ).join('')}
              </div>
            ` : ''}
          </div>
        `
      }).join('')
  }

  <div class="page-footer">
    Report ID: ${reportId} &nbsp;|&nbsp; This report is not to be used for the purposes of substitute disclosure.
  </div>
</div>

<!-- ========== END OF SECTION + END OF REPORT COMMENTS ========== -->
<div class="page">
  <div class="page-header">
    <span>${date}</span>
    <span>Inspection Report Exclusively For: ${clientName}</span>
  </div>

  <div class="section-title">End of Section</div>
  <div class="section-subtitle">Comments</div>
  <div class="comments-box">${endOfSectionComments || ''}</div>

  <div class="section-title" style="margin-top:32px;">End of Report</div>
  <div class="section-subtitle">Comments</div>
  <div class="comments-box">
    ${endOfReportComments || `
      - Given the condition(s) above we recommend full evaluations and/or corrections with written findings and costs to cure by a competent licensed plumbing contractor before the end/close of the inspection contingency period.<br/><br/>
      - Recommend sewer inspections after repairs are made to ensure efficacy of work and to inspect any areas of the sewer lateral not visible due to defect(s).
    `}
  </div>

  <div class="page-footer">
    Report ID: ${reportId} &nbsp;|&nbsp; This report is not to be used for the purposes of substitute disclosure.
  </div>
</div>

<!-- ========== STATEMENT OF SERVICE ========== -->
<div class="page">
  <div class="page-header">
    <span>${date}</span>
    <span>Inspection Report Exclusively For: ${clientName}</span>
  </div>

  <div class="section-title">Statement of Service</div>

  <div class="sos-box">
    <div class="sos-title">Sewer Labz — Statement of Service</div>
    <div class="sos-text">
      <p>This inspection was performed by a qualified sewer inspection professional using video camera equipment designed for the inspection of sewer lines and drain systems.</p>
      <p>The inspection was conducted from the point of access (cleanout, roof vent, or other access point) to the point of connection with the municipal sewer system, private septic system, or to the limit of the camera's reach, whichever came first.</p>
      <p>The inspector has made every effort to provide an accurate and complete assessment of the sewer line's condition at the time of the inspection. However, the inspection is limited to those areas accessible and visible by the camera and does not include areas obstructed by debris, scale buildup, water, or other blockages.</p>
      <p>This report reflects the professional opinion of the inspector based on the visual evidence gathered during the inspection. It is not a guarantee or warranty of the sewer system's future performance.</p>
      <p><strong>Inspector:</strong> ${inspectorName || '_______________________'}</p>
      <p><strong>Company:</strong> ${companyName}</p>
      <p><strong>Date of Inspection:</strong> ${date}</p>
      <p><strong>Report ID:</strong> ${reportId}</p>
    </div>
  </div>

  <div class="page-footer">
    Report ID: ${reportId} &nbsp;|&nbsp; This report is not to be used for the purposes of substitute disclosure.
  </div>
</div>

<!-- ========== UNDERSTANDING SEWER MATERIAL & DEFECTS ========== -->
<div class="page">
  <div class="page-header">
    <span>${date}</span>
    <span>Inspection Report Exclusively For: ${clientName}</span>
  </div>

  <div class="section-title">Understanding Sewer Material & Defects</div>
  <p style="text-align:center;font-weight:bold;margin-bottom:16px;">Sewer Line Material</p>

  <table class="understanding-table">
    <thead>
      <tr>
        <th>Type</th>
        <th>Life Expectancy</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>Standard Dimensional Ratio (SDR)</td><td>50–500 years</td></tr>
      <tr><td>Polyvinyl Chloride (PVC)</td><td>50–500 years</td></tr>
      <tr><td>Acrylonitrile Butadiene Styrene (ABS)</td><td>50–500 years</td></tr>
      <tr><td>Vitrified Clay Pipe and/or "Terracotta"</td><td>75–100 years</td></tr>
      <tr><td>Cast Iron</td><td>75–100 years</td></tr>
      <tr><td>Concrete</td><td>50–75 years</td></tr>
      <tr><td>Transite / Asbestos Cement</td><td>40–60 years</td></tr>
      <tr><td>Bituminous Fiber and/or "Orangeburg"</td><td>30–50 years</td></tr>
      <tr><td>Cured in Place Pipe (CIPP)</td><td>40+ years</td></tr>
      <tr><td>High Density Polyethylene (HDPE)</td><td>50–500 years</td></tr>
      <tr><td>Thin walled PVC and/or "Genova"</td><td>40–70 years</td></tr>
      <tr><td>Galvanized Steel</td><td>40–70 years</td></tr>
      <tr><td>Lead</td><td>100+ years</td></tr>
      <tr><td>Copper</td><td>50+ years</td></tr>
      <tr><td>Stainless Steel</td><td>50+ years</td></tr>
    </tbody>
  </table>

  <p style="font-size:8px;color:#666;margin-top:12px;">*NOTE* Life expectancy is for material alone and under ideal circumstances as intended from the manufacturer. Construction and repair practices can have detrimental effects on how long a sewer line can perform as expected. Additionally, soil erosion/settling and other environmental influences such as root intrusion can drastically reduce the expected timelines outlined above.</p>

  <div style="text-align:center;margin-top:24px;font-size:9px;color:#555;">
    Generated by ${companyName} &nbsp;|&nbsp; ${location} &nbsp;|&nbsp; ${date}
    <br/>This report is not to be used for the purposes of substitute disclosure.
  </div>

  <div class="page-footer">
    Report ID: ${reportId} &nbsp;|&nbsp; This report is not to be used for the purposes of substitute disclosure.
  </div>
</div>

</body>
</html>
    `

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    })

  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}