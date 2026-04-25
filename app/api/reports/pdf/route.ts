import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { report, defects } = body;

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${report.title || "Inspection Report"}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; color: #000; background: #fff; font-size: 13px; }

  .page {
    padding: 40px 50px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .page-content { flex: 1; }
  .page-break { page-break-after: always; }

  .cover {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    padding: 20px 40px 30px;
    page-break-after: always;
  }

  .cover-top { text-align: center; padding-top: 16px; margin-bottom: 12px; }
  .cover-logo { font-size: 44px; font-weight: 900; letter-spacing: -1px; margin-bottom: 4px; }
  .cover-logo span { color: #2D8C4E; }
  .cover-tagline { font-size: 15px; color: #2D8C4E; font-weight: 700; margin-bottom: 2px; }
  .cover-subtitle { font-size: 13px; color: #555; }

  .cover-photo-wrap {
    flex: 1;
    width: 100%;
    max-width: 700px;
    margin: 16px auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cover-photo-1 {
    width: 100%;
    max-width: 580px;
    height: 370px;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid #ddd;
    display: block;
    margin: 0 auto;
  }

  .cover-bottom {
    width: 100%;
    max-width: 700px;
    margin: 0 auto;
    text-align: center;
  }

  .cover-address { font-size: 17px; font-weight: 700; margin-bottom: 4px; }
  .cover-date { font-size: 13px; color: #555; margin-bottom: 14px; }
  .cover-disclaimer {
    font-size: 10px; color: #555; line-height: 1.7;
    border-top: 1px solid #ddd; padding-top: 12px; text-align: center;
  }

  .report-header {
    display: flex; justify-content: space-between; align-items: center;
    border-bottom: 1px solid #000; padding-bottom: 6px; margin-bottom: 16px;
    font-size: 11px; color: #555;
  }

  .report-footer {
    margin-top: auto;
    padding-top: 12px;
    border-top: 1px solid #ddd;
    font-size: 10px; color: #888; text-align: center; line-height: 1.6;
  }

  .section-title {
    font-size: 17px; font-weight: 900; text-decoration: underline;
    text-align: center; margin: 18px 0 12px; text-transform: uppercase;
  }

  .section-subtitle {
    font-size: 13px; font-weight: 700; margin-bottom: 10px;
    text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px;
  }

  .toc-item { padding: 6px 0; font-size: 13px; border-bottom: 1px dotted #ddd; }

  .disclosure-text { font-size: 13px; line-height: 1.8; margin-bottom: 14px; font-weight: 700; }

  .info-row { display: flex; margin-bottom: 7px; }
  .info-label { font-weight: 700; font-size: 12px; min-width: 160px; text-transform: uppercase; }
  .info-value { font-size: 13px; color: #222; flex: 1; }

  .client-wrap { display: flex; gap: 20px; margin-bottom: 20px; }
  .client-photos { display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; }
  .client-photo { width: 150px; height: 110px; object-fit: cover; border: 1px solid #ddd; border-radius: 4px; }

  .system-row { margin-bottom: 10px; }
  .system-label { font-weight: 700; font-size: 11px; text-transform: uppercase; margin-bottom: 3px; color: #555; }
  .system-value { font-size: 13px; color: #222; padding: 7px 10px; background: #f9f9f9; border-radius: 4px; border: 1px solid #eee; }

  .piping-box {
    background: #f9f9f9; border: 1px solid #ddd; border-radius: 4px;
    padding: 12px 14px; margin-bottom: 14px;
    font-size: 13px; line-height: 1.8; font-weight: 700;
  }

  .defect-item { margin-bottom: 24px; page-break-inside: avoid; }
  .defect-desc { font-size: 13px; line-height: 1.7; margin-bottom: 10px; }

  .defect-photos { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 10px; }
  .defect-photo { width: 100%; height: 230px; object-fit: cover; border: 1px solid #ddd; border-radius: 4px; display: block; }

  .correction-row { display: flex; margin-bottom: 8px; border-bottom: 1px dotted #ddd; padding-bottom: 8px; }
  .correction-label { font-weight: 700; font-size: 12px; min-width: 180px; text-transform: uppercase; color: #555; }
  .correction-value { font-size: 13px; color: #222; }

  .end-statement { font-size: 13px; line-height: 1.8; margin-bottom: 10px; padding: 10px; background: #f9f9f9; border-radius: 4px; border-left: 3px solid #2D8C4E; }

  .material-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  .material-table th { background: #f0f0f0; font-size: 12px; font-weight: 700; padding: 8px 12px; text-align: left; border: 1px solid #ddd; }
  .material-table td { font-size: 12px; padding: 6px 12px; border: 1px solid #ddd; }
  .material-table tr:nth-child(even) td { background: #fafafa; }

  @media print {
    .page-break { page-break-after: always; }
    .cover { page-break-after: always; }
    .defect-item { page-break-inside: avoid; }
  }
</style>
</head>
<body>

<!-- COVER PAGE -->
<div class="cover">
  <div class="cover-top">
    <div class="cover-logo">SEWER <span>LABZ</span></div>
    <div class="cover-tagline">Don't Let Your Drain Be A Pain!</div>
    <div class="cover-subtitle">Professional Sewer Inspection Report</div>
  </div>

  <div class="cover-photo-wrap">
    ${
      report.propertyPhotos && report.propertyPhotos.length === 1
        ? `
      <img src="${report.propertyPhotos[0]}" class="cover-photo-1" alt="Property" />
    `
        : report.propertyPhotos && report.propertyPhotos.length === 2
          ? `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;width:100%;max-width:680px;">
        ${report.propertyPhotos.map((p: string) => `<img src="${p}" style="width:100%;height:260px;object-fit:cover;border-radius:6px;border:1px solid #ddd;display:block;" alt="Property" />`).join("")}
      </div>
    `
          : report.propertyPhotos && report.propertyPhotos.length >= 3
            ? `
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;width:100%;max-width:700px;">
        ${report.propertyPhotos.map((p: string) => `<img src="${p}" style="width:100%;height:210px;object-fit:cover;border-radius:6px;border:1px solid #ddd;display:block;" alt="Property" />`).join("")}
      </div>
    `
            : `
      <div style="width:100%;max-width:580px;height:370px;background:#f0f0f0;border-radius:6px;border:1px solid #ddd;display:flex;align-items:center;justify-content:center;font-size:14px;color:#999;margin:0 auto;">Property Photo</div>
    `
    }
  </div>

  <div class="cover-bottom">
    <div class="cover-address">${report.location || "Property Address"}</div>
    <div class="cover-date">${report.inspectedAt || ""} ${report.inspectionTime ? "| " + report.inspectionTime : ""}</div>
    <div class="cover-disclaimer">
      This report was prepared for the client listed above in accordance with our inspection agreement and is subject to the terms and conditions agreed upon therein.
      A verbal consultation is part of this report. If you were not present during the inspection, call our office for a full discussion of the entire report.
      This report is for the sole use of the named client only; it is not to be used by any other party for any reason.<br><br>
      <strong>This report is not to be used for the purposes of substitute disclosure.</strong>
    </div>
  </div>
</div>

<!-- TABLE OF CONTENTS -->
<div class="page page-break">
  <div class="page-content">
    <div class="report-header">
      <span>${report.inspectedAt || ""}</span>
      <span>Inspection Report Exclusively For: ${report.fileNumber || report.clientName || ""}</span>
    </div>
    <div class="section-title">Table of Contents</div>
    ${[
      "Cover Page",
      "Table of Contents",
      "Sewer Inspection Disclosure",
      "Scope of the Sewer Inspection",
      "Point of Reference",
      "Client & Site Information",
      "Sewer System Information",
      "Sewer Pipe Conditions",
      "End of Report",
      "Statement of Service",
      "Understanding Sewer Material & Defects",
    ]
      .map(
        (item) => `
      <div class="toc-item">${item}</div>
    `,
      )
      .join("")}
  </div>
  <div class="report-footer">
    This report was prepared for the client listed above in accordance with our inspection agreement.<br>
    <strong>This report is not to be used for the purposes of substitute disclosure.</strong>
  </div>
</div>

<!-- DISCLOSURE + SCOPE -->
<div class="page page-break">
  <div class="page-content">
    <div class="report-header">
      <span>${report.inspectedAt || ""}</span>
      <span>Inspection Report Exclusively For: ${report.fileNumber || report.clientName || ""}</span>
    </div>
    <div class="section-title">Sewer Line Inspection Disclosure</div>
    <p class="disclosure-text">This report is intended to be used only as a general guide in order to provide our clients with current condition of the home's and/or building's main sewer line. The report expresses the opinion of the inspector, based upon visual impressions of the conditions that existed at the time of the inspection only.</p>
    <p class="disclosure-text">The inspection report should not be construed as a compliance inspection of any governmental or non-governmental codes or regulations. The report is not intended to be a warranty or guarantee of the present or future adequacy or performance of the sewer line.</p>
    <p class="disclosure-text">All repairs should be done by a competent licensed Plumber and any work requiring building permits should be obtained by the authority having jurisdiction (Local Building Department).</p>
    <p class="disclosure-text">It is the client's sole responsibility to <u>read this report in its entirety</u>, not rely upon any verbal comments and to research any and all jurisdictional permits required by the local authorities regarding the property inspected.</p>

    <div class="section-title">Scope of the Sewer Inspection</div>
    <p class="disclosure-text">A sewer inspection scan was requested of the main drain line from the structure to the city, private sewer connection, 150 feet or camera limitations (whichever comes first). The sewer line is to be accessed through a cleanout, roof vent (single story only) or other access point(s) to be determined best by the inspector.</p>

    <div class="section-title">Point of Reference</div>
    <p style="text-align:center;font-weight:700;margin-bottom:8px;">[NOTE]</p>
    <p class="disclosure-text">Statements made within this inspection report pertaining to left, right, front or rear were referenced by standing in front of and facing the structure from the street. Additionally, analogue clockface references may be utilized to pinpoint conditions found within the pipe; in this case the 12 o'clock position will be the topmost center of the pipe, the 6 o'clock position will be the bottom most center of the pipe and so on.</p>
  </div>
  <div class="report-footer">
    This report was prepared for the client listed above in accordance with our inspection agreement.<br>
    <strong>This report is not to be used for the purposes of substitute disclosure.</strong>
  </div>
</div>

<!-- CLIENT & SITE INFO -->
<div class="page page-break">
  <div class="page-content">
    <div class="report-header">
      <span>${report.inspectedAt || ""}</span>
      <span>Inspection Report Exclusively For: ${report.fileNumber || report.clientName || ""}</span>
    </div>
    <div class="section-subtitle">Client & Site Information</div>

    <div class="client-wrap">
      <div style="flex:1;">
        <div style="font-weight:700;font-size:13px;text-decoration:underline;margin-bottom:10px;">FILE/DATE/TIME</div>
        ${[
          ["File #", report.fileNumber],
          ["Client Name", report.clientName],
          ["Location", report.location],
          ["Date", report.inspectedAt],
          ["Time", report.inspectionTime],
          ["People Present", report.peoplePresent],
          ["Buyer's Agent", report.buyersAgent],
          ["Building Occupied", report.buildingOccupied],
          ["Weather/Soil", report.weather],
        ]
          .filter(([, v]) => v)
          .map(
            ([label, value]) => `
          <div class="info-row">
            <span class="info-label">${label}</span>
            <span class="info-value">${value}</span>
          </div>
        `,
          )
          .join("")}
      </div>
      ${
        report.propertyPhotos && report.propertyPhotos.length > 0
          ? `
      <div class="client-photos">
        ${report.propertyPhotos
          .slice(0, 2)
          .map(
            (p: string) =>
              `<img src="${p}" class="client-photo" alt="Property" />`,
          )
          .join("")}
      </div>
      `
          : ""
      }
    </div>

    <div class="section-subtitle" style="margin-top:16px;">Sewer System Information</div>

    ${
      report.cameraDirection1 || report.cameraDirection2
        ? `
    <div class="piping-box">
      <strong>PIPING</strong><br>
      The camera went in the following direction(s):<br>
      ${report.cameraDirection1 ? `1st Direction: ${report.cameraDirection1}` : ""}
      ${report.cameraDirection2 ? `<br>2nd Direction: ${report.cameraDirection2}` : ""}
      ${report.pipingNotes ? `<br>${report.pipingNotes}` : ""}
    </div>
    `
        : ""
    }

    ${
      report.cleanoutLocation
        ? `
    <div class="system-row">
      <div class="system-label">Location of Camera Entry</div>
      <div class="system-value">${report.cleanoutLocation}</div>
    </div>`
        : ""
    }

    ${
      report.pipeMaterials && report.pipeMaterials.length > 0
        ? `
    <div class="system-row">
      <div class="system-label">Sewer Pipe Materials</div>
      <div class="system-value">${report.pipeMaterials.join(", ")}</div>
    </div>`
        : ""
    }

    ${
      report.videoLinks && report.videoLinks.length > 0
        ? `
    <div class="system-row">
      <div class="system-label">Sewer Video Link(s)</div>
      <div class="system-value">
        ${report.videoLinks
          .map(
            (link: string, i: number) => `
          <div style="margin-bottom:4px;">
            Link ${i + 1}: <a href="${link}" style="color:#0066cc;">${link}</a>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>`
        : ""
    }
  </div>
  <div class="report-footer">
    This report was prepared for the client listed above in accordance with our inspection agreement.<br>
    <strong>This report is not to be used for the purposes of substitute disclosure.</strong>
  </div>
</div>

<!-- PIPE CONDITIONS -->
<div class="page page-break">
  <div class="page-content">
    <div class="report-header">
      <span>${report.inspectedAt || ""}</span>
      <span>Inspection Report Exclusively For: ${report.fileNumber || report.clientName || ""}</span>
    </div>
    <div class="section-subtitle">Sewer Piping Conditions</div>

    ${defects.length === 0 ? '<p style="color:#999;font-size:13px;margin-top:12px;">No conditions recorded.</p>' : ""}

    ${defects
      .map(
        (d: any, i: number) => `
    <div class="defect-item">
      <p class="defect-desc">
        <strong>-@ ${d.videoTimeH || "--"}:${d.videoTimeM || "--"} / ${d.footageStart || "0"} ft approx. in video the following condition was observed.</strong>
        ${
          d.conditionType !== "Select Condition Type"
            ? `<strong> ${d.conditionType}${
                d.severity === "Major"
                  ? "; Major defect."
                  : d.severity === "Moderate"
                    ? "; moderate."
                    : d.severity === "Minor"
                      ? "; minor."
                      : d.severity === "Suggested Maintenance"
                        ? "; suggested maintenance."
                        : "."
              }</strong>`
            : ""
        }
        ${d.narrative ? ` ${d.narrative}` : ""}
      </p>
      ${
        d.images && d.images.length > 0
          ? `
      <div class="defect-photos">
        ${d.images
          .map(
            (img: any) => `
          <div>
            <img src="${img.url}" class="defect-photo" alt="Inspection photo" />
          </div>
        `,
          )
          .join("")}
      </div>
      `
          : ""
      }
    </div>
    `,
      )
      .join("")}
  </div>
  <div class="report-footer">
    This report was prepared for the client listed above in accordance with our inspection agreement.<br>
    <strong>This report is not to be used for the purposes of substitute disclosure.</strong>
  </div>
</div>

<!-- END OF REPORT -->
<div class="page page-break">
  <div class="page-content">
    <div class="report-header">
      <span>${report.inspectedAt || ""}</span>
      <span>Inspection Report Exclusively For: ${report.fileNumber || report.clientName || ""}</span>
    </div>

    <div style="font-size:15px;font-weight:700;border-bottom:1px solid #000;padding-bottom:4px;margin-bottom:12px;">
      End of Section — Comments
    </div>

    ${report.notes ? `<p style="font-size:13px;line-height:1.8;margin-bottom:16px;">${report.notes}</p>` : ""}

    ${
      report.corrections &&
      Object.entries(report.corrections).some(([, v]) => v && v !== "N/A")
        ? `
    <div style="font-size:15px;font-weight:700;border-bottom:1px solid #000;padding-bottom:4px;margin-bottom:12px;margin-top:20px;">
      Corrective Action Recommendations
    </div>
    ${Object.entries(report.corrections)
      .filter(([, v]) => v && v !== "N/A")
      .map(
        ([label, value]) => `
      <div class="correction-row">
        <span class="correction-label">${label}</span>
        <span class="correction-value">${value}</span>
      </div>
    `,
      )
      .join("")}
    `
        : ""
    }

    ${report.correctionNotes ? `<p style="font-size:13px;line-height:1.8;margin-top:12px;">${report.correctionNotes}</p>` : ""}

    <div style="font-size:15px;font-weight:700;border-bottom:1px solid #000;padding-bottom:4px;margin-bottom:12px;margin-top:24px;">
      End of Report — Recommendations
    </div>

    ${
      report.endOfReport &&
      Object.values(report.endOfReport).some((v) => v && v !== "Select...")
        ? `
      ${Object.entries(report.endOfReport)
        .filter(([, v]) => v && v !== "Select...")
        .map(
          ([, value]) => `
        <div class="end-statement">${value}</div>
      `,
        )
        .join("")}
    `
        : `
      <div class="end-statement">Given the condition(s) above we recommend full evaluations and/or corrections with written findings and costs to cure by a competent licensed plumbing contractor before the end/close of the inspection contingency period.</div>
      <div class="end-statement">Recommend sewer inspections after repairs are made to ensure efficacy of work and to inspect any areas of the sewer lateral not visible due to defect(s).</div>
    `
    }
  </div>
  <div class="report-footer">
    This report was prepared for the client listed above in accordance with our inspection agreement.<br>
    <strong>This report is not to be used for the purposes of substitute disclosure.</strong>
  </div>
</div>

<!-- STATEMENT OF SERVICE -->
<div class="page page-break">
  <div class="page-content">
    <div class="report-header">
      <span>${report.inspectedAt || ""}</span>
      <span>Inspection Report Exclusively For: ${report.fileNumber || report.clientName || ""}</span>
    </div>
    <div class="section-title">Statement of Service</div>
    <p style="font-size:13px;line-height:1.8;margin-bottom:14px;">Sewer Labz was retained for a survey of the listed structure's main sewer line in an effort to identify any areas of suspect blockages, deficiencies or damage and to document the areas for further review and or action by associated trades professional. Further investigations into these areas or destructive testing may reveal additional conditions that were not readily visible at the time of inspection.</p>
    <p style="font-size:13px;line-height:1.8;margin-bottom:14px;">This report is based on information obtained at the site at the given date and time of the inspection. Findings are documented with videos and visual photographs of the impacted areas. The sewer survey is limited to maximum allowance of approximately 150 feet, arrival at blockage, non-passable debris, or arrival at city sewer.</p>
    <p style="font-size:13px;line-height:1.8;margin-bottom:14px;">This report is for the exclusive use of our client and is not intended for any other purpose. We can make no representations regarding conditions that may be present but concealed or inaccessible during the survey.</p>
    <p style="font-size:13px;line-height:1.8;margin-bottom:14px;">We recommend all areas showing anomalies should be evaluated further to find out the cause and be repaired. Our recommendations are not intended as criticisms of the structure, but rather as professional opinions regarding conditions that we observed at the time of our inspection.</p>
    <p style="font-size:13px;line-height:1.8;">Our reports are designed to be clear, concise and useful. Please review this report carefully. If there is anything you would like us to explain, please feel free to call us as we would be happy to answer any questions.</p>
  </div>
  <div class="report-footer">
    This report was prepared for the client listed above in accordance with our inspection agreement.<br>
    <strong>This report is not to be used for the purposes of substitute disclosure.</strong>
  </div>
</div>

<!-- MATERIAL TABLE -->
<div class="page">
  <div class="page-content">
    <div class="report-header">
      <span>${report.inspectedAt || ""}</span>
      <span>Inspection Report Exclusively For: ${report.fileNumber || report.clientName || ""}</span>
    </div>
    <div class="section-title">Understanding Sewer Material & Defects</div>
    <div style="text-align:center;font-weight:700;text-decoration:underline;margin-bottom:10px;">Sewer Line Material</div>
    <table class="material-table">
      <thead>
        <tr><th>Type</th><th>Life Expectancy</th></tr>
      </thead>
      <tbody>
        ${[
          ["Standard Dimensional Ratio (SDR)", "50-500 years"],
          ["Polyvinyl Chloride (PVC)", "50-500 years"],
          ["Acrylonitrile Butadiene Styrene (ABS)", "50-500 years"],
          ['Vitrified Clay Pipe and/or "Terracotta"', "75-100 years"],
          ["Cast Iron", "75-100 years"],
          ["Concrete", "50-75 years"],
          ["Transite/Asbestos Cement", "40-60 years"],
          ['Bituminous Fiber and/or "Orangeburg"', "30-50 years"],
          ["Cured in Place Pipe (CIPP)", "40+ years"],
          ["High Density Polyethylene (HDPE)", "50-500 years"],
          ['Thin walled PVC and/or "Genova"', "40-70 years"],
          ["Galvanized Steel", "40-70 years"],
          ["Lead", "100+ years"],
          ["Copper", "50+ years"],
          ["Stainless Steel", "50+ years"],
        ]
          .map(
            ([type, life]) =>
              `<tr><td>${type}</td><td><strong>${life}</strong></td></tr>`,
          )
          .join("")}
      </tbody>
    </table>
    <p style="font-size:11px;color:#555;margin-top:14px;line-height:1.7;">
      <strong>*NOTE*</strong> Life expectancy is for material alone and under ideal circumstances. Construction practices,
      soil erosion/settling, and root intrusion can drastically reduce expected timelines.
    </p>
  </div>
  <div class="report-footer">
    Generated by Sewer Labz | ${report.location || ""} | ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}<br>
    <strong>This report is not to be used for the purposes of substitute disclosure.</strong>
  </div>
</div>

</body>
</html>`;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 },
    );
  }
}
