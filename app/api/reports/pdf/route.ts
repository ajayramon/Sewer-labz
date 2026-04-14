import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { report, defects } = body;

    const ref = report.fileNumber || report.clientName || "";
    const date = report.inspectedAt || "";
    const photos: string[] =
      report.propertyPhotos ||
      (report.propertyPhoto ? [report.propertyPhoto] : []);

    // ── Header repeated on each page ────────────────────────────
    const pageHeader = (left: string, right: string) => `
      <div style="display:flex;justify-content:space-between;align-items:center;
        border-bottom:1px solid #000;padding-bottom:8px;margin-bottom:20px;font-size:11px;color:#555;">
        <span>${left}</span>
        <span>${right}</span>
      </div>`;

    // ── Footer repeated on each page ────────────────────────────
    const pageFooter = `
      <div style="position:absolute;bottom:30px;left:50px;right:50px;
        border-top:1px solid #ddd;padding-top:8px;font-size:10px;color:#888;text-align:center;line-height:1.6;">
        This report was prepared for the client listed above in accordance with our inspection agreement.<br>
        <strong>This report is not to be used for the purposes of substitute disclosure.</strong>
      </div>`;

    // ── Corrective actions ───────────────────────────────────────
    const correctiveRows = report.corrections
      ? Object.entries(report.corrections)
          .filter(([, v]) => v && v !== "N/A")
          .map(
            ([label, value]) => `
            <div style="display:flex;margin-bottom:8px;">
              <span style="font-weight:700;font-size:12px;min-width:180px;text-transform:uppercase;">${label}</span>
              <span style="font-size:13px;color:#222;">${value}</span>
            </div>`,
          )
          .join("")
      : "";

    // ── Video links ──────────────────────────────────────────────
    const videoLinksHtml =
      report.videoLinks && report.videoLinks.length > 0
        ? report.videoLinks
            .map(
              (link: string, i: number) => `
          <div style="display:flex;margin-bottom:8px;">
            <span style="font-weight:700;font-size:12px;min-width:100px;text-transform:uppercase;">Link ${i + 1}</span>
            <span style="font-size:13px;"><a href="${link}" style="color:#0066cc;">${link}</a></span>
          </div>`,
            )
            .join("")
        : "";

    // ── Defects HTML ─────────────────────────────────────────────
    const defectsHtml =
      !defects || defects.length === 0
        ? '<p style="color:#999;font-size:13px;font-style:italic;">No conditions recorded.</p>'
        : defects
            .map((d: any, i: number) => {
              const time =
                d.videoTimeH && d.videoTimeM
                  ? `${d.videoTimeH}:${d.videoTimeM}`
                  : "--:--";
              const severityColor =
                d.severity === "Major"
                  ? "#DC2626"
                  : d.severity === "Moderate"
                    ? "#EA580C"
                    : d.severity === "Minor"
                      ? "#D97706"
                      : d.severity === "Suggested Maintenance"
                        ? "#2563EB"
                        : "#16A34A";
              const severityLabel =
                d.severity && d.severity !== "No Defect"
                  ? `; <span style="font-weight:700;color:${severityColor};">${d.severity}</span>`
                  : "";
              const photosHtml =
                d.images && d.images.length > 0
                  ? `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:10px;">
                ${d.images
                  .map(
                    (img: any) => `
                  <img src="${img.url}" style="width:100%;height:200px;object-fit:cover;object-position:center;border:1px solid #ddd;border-radius:4px;display:block;" />`,
                  )
                  .join("")}
               </div>`
                  : "";
              return `
            <div style="margin-bottom:24px;page-break-inside:avoid;">
              <p style="font-size:13px;line-height:1.7;margin-bottom:8px;">
                <strong>#${i + 1} @ ${time}${d.footageStart ? ` / ${d.footageStart} ft` : ""} — 
                ${d.conditionType !== "Select Condition Type" ? d.conditionType : "Observation"}${severityLabel}.</strong>
                ${d.narrative ? ` ${d.narrative}` : ""}
              </p>
              ${photosHtml}
            </div>`;
            })
            .join("");

    // ── Defect reference table ───────────────────────────────────
    const defectTable = `
      <table style="width:100%;border-collapse:collapse;font-size:11px;margin-top:12px;">
        <thead>
          <tr style="background:#0F2A4A;color:#fff;">
            <th style="padding:8px 10px;text-align:left;border:1px solid #ddd;">Defect Type</th>
            <th style="padding:8px 10px;text-align:left;border:1px solid #ddd;">Description</th>
            <th style="padding:8px 10px;text-align:left;border:1px solid #ddd;">Severity</th>
          </tr>
        </thead>
        <tbody>
          ${[
            [
              "Root Intrusion",
              "Tree/plant roots entering pipe through joints or cracks",
              "Minor–Major",
              "#D97706",
            ],
            [
              "Offset Joint",
              "Pipe sections misaligned, causing partial or full blockage",
              "Moderate–Major",
              "#EA580C",
            ],
            [
              "Circumferential Crack",
              "Crack around full circumference — structural concern",
              "Moderate–Major",
              "#EA580C",
            ],
            [
              "Longitudinal Crack",
              "Crack running along length of pipe",
              "Minor–Major",
              "#D97706",
            ],
            [
              "Erosion At Joint",
              "Material worn away at pipe joints, weakening structure",
              "Moderate",
              "#EA580C",
            ],
            [
              "Debris Within Pipe",
              "Grease, sediment, or foreign objects blocking flow",
              "Minor–Major",
              "#D97706",
            ],
            [
              "Belly/Positive Grade",
              "Pipe section sagging, pooling water and causing blockage",
              "Moderate–Major",
              "#EA580C",
            ],
            [
              "Infiltration",
              "Groundwater entering pipe through cracks or joints",
              "Moderate",
              "#EA580C",
            ],
            [
              "Deteriorated Pipe",
              "Pipe material degrading, corroding, or pitting",
              "Moderate–Major",
              "#EA580C",
            ],
            [
              "Collapse",
              "Pipe has partially or fully caved in — immediate repair required",
              "Major",
              "#DC2626",
            ],
          ]
            .map(
              ([type, desc, sev, col], i) => `
            <tr style="background:${i % 2 === 0 ? "#fff" : "#f9f9f9"};">
              <td style="padding:7px 10px;border:1px solid #ddd;font-weight:600;">${type}</td>
              <td style="padding:7px 10px;border:1px solid #ddd;">${desc}</td>
              <td style="padding:7px 10px;border:1px solid #ddd;font-weight:700;color:${col};">${sev}</td>
            </tr>`,
            )
            .join("")}
        </tbody>
      </table>`;

    // ── Material table ───────────────────────────────────────────
    const materialTable = `
      <table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:12px;">
        <thead>
          <tr style="background:#0F2A4A;color:#fff;">
            <th style="padding:8px 12px;text-align:left;border:1px solid #ddd;">Material Type</th>
            <th style="padding:8px 12px;text-align:left;border:1px solid #ddd;">Life Expectancy</th>
          </tr>
        </thead>
        <tbody>
          ${[
            ["Standard Dimensional Ratio (SDR)", "50–500 years"],
            ["Polyvinyl Chloride (PVC)", "50–500 years"],
            ["Acrylonitrile Butadiene Styrene (ABS)", "50–500 years"],
            ["Vitrified Clay / Terracotta", "75–100 years"],
            ["Cast Iron", "75–100 years"],
            ["Concrete", "50–75 years"],
            ["Transite / Asbestos Cement", "40–60 years"],
            ["Bituminous Fiber / Orangeburg", "30–50 years"],
            ["Cured in Place Pipe (CIPP)", "40+ years"],
            ["High Density Polyethylene (HDPE)", "50–500 years"],
            ["Thin-walled PVC / Genova", "40–70 years"],
            ["Galvanized Steel", "40–70 years"],
            ["Lead", "100+ years"],
            ["Copper", "50+ years"],
            ["Stainless Steel", "50+ years"],
          ]
            .map(
              ([type, life], i) => `
            <tr style="background:${i % 2 === 0 ? "#fff" : "#f9f9f9"};">
              <td style="padding:7px 12px;border:1px solid #ddd;">${type}</td>
              <td style="padding:7px 12px;border:1px solid #ddd;font-weight:700;">${life}</td>
            </tr>`,
            )
            .join("")}
        </tbody>
      </table>`;

    // ────────────────────────────────────────────────────────────
    // FIX: about:blank — use <script> to trigger print AFTER load
    // and set document.title to suppress browser header/footer text
    // ────────────────────────────────────────────────────────────
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${report.location || "Sewer Inspection Report"}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:Arial,sans-serif; color:#000; background:#fff; font-size:13px; }

  /* ── FIX: suppress about:blank in print header/footer ── */
  @page {
    size: letter;
    margin: 0.6in 0.6in 0.7in 0.6in;
    /* Cannot fully remove browser header — but setting title helps */
  }

  .page { padding:30px 40px; position:relative; min-height:100vh; page-break-after:always; }
  .page:last-child { page-break-after:auto; }

  /* ── COVER — clean, no duplicate address ── */
  .cover {
    display:flex; flex-direction:column; align-items:center;
    text-align:center; padding:20px 40px 100px; min-height:100vh;
    position:relative; page-break-after:always;
  }
  .cover-logo { font-size:56px; font-weight:900; letter-spacing:-2px; margin-bottom:4px; color:#0F2A4A; }
  .cover-logo span { color:#2D8C4E; }
  .cover-tagline { font-size:15px; color:#2D8C4E; font-weight:700; margin-bottom:2px; }
  .cover-subtitle { font-size:13px; color:#666; margin-bottom:20px; }

  /* ── FIX: Cover photo — full width, properly centered ── */
  .cover-photo-wrap {
    width:100%; max-width:640px; margin:0 auto 0;
  }
  .cover-photo {
    width:100%; height:400px;
    object-fit:cover; object-position:center center;
    display:block; border-radius:4px;
  }
  .cover-photo-placeholder {
    width:100%; height:400px; background:#eee;
    display:flex; align-items:center; justify-content:center;
    font-size:14px; color:#999; border-radius:4px;
  }

  /* ── FIX: Cover bottom — disclaimer only, NO address repeated ── */
  .cover-bottom {
    position:absolute; bottom:20px; left:40px; right:40px;
    border-top:1px solid #ccc; padding-top:12px;
    font-size:10px; color:#555; line-height:1.7; text-align:center;
  }

  .bold-upper { font-weight:700; text-transform:uppercase; font-size:10px; }

  @media print {
    .page { page-break-after:always; }
    .page:last-child { page-break-after:auto; }
    .no-break { page-break-inside:avoid; }
  }
</style>
</head>
<body>

<!-- ═══════════════════════════════════════
     PAGE 1: COVER
     FIX: Logo top, photo centered full width,
     ONLY disclaimer at bottom — no address repeat
═══════════════════════════════════════ -->
<div class="cover">

  <!-- Company branding at top -->
  <div class="cover-logo">SEWER <span>LABZ</span></div>
  <div class="cover-tagline">${report.companyTagline || "Don't Let Your Drain Be A Pain!"}</div>
  <div class="cover-subtitle">Professional Sewer Inspection Report</div>

  <!-- Cover photo — full width, centered -->
  <div class="cover-photo-wrap">
    ${
      photos.length > 0
        ? `<img src="${photos[0]}" class="cover-photo" alt="Property" />`
        : `<div class="cover-photo-placeholder">Property Photo</div>`
    }
  </div>

  <!-- FIX: Bottom of cover — disclaimer ONLY, address shown ONCE -->
  <div class="cover-bottom">
    <div style="font-size:13px;font-weight:700;margin-bottom:4px;">${report.location || ""}</div>
    <div style="font-size:12px;color:#666;margin-bottom:10px;">${date}</div>
    This report was prepared for the client listed above in accordance with our inspection agreement and is
    subject to the terms and conditions agreed upon therein. A verbal consultation is part of this report.
    If you were not present during the inspection, call our office for a full discussion of the entire report.
    This report is for the sole use of the named client only; it is not to be used by any other party for any reason.<br><br>
    <span class="bold-upper">THIS REPORT IS NOT TO BE USED FOR THE PURPOSES OF SUBSTITUTE DISCLOSURE.</span>
  </div>
</div>

<!-- ═══════════════════════════════════════
     PAGE 2: TABLE OF CONTENTS
═══════════════════════════════════════ -->
<div class="page">
  ${pageHeader(date, `Inspection Report Exclusively For: ${ref}`)}
  <div style="font-size:18px;font-weight:900;text-decoration:underline;text-align:center;margin:0 0 16px;text-transform:uppercase;">Table of Contents</div>
  ${[
    "Cover Page",
    "Table of Contents",
    "Sewer Inspection Disclosure",
    "Scope of the Sewer Inspection",
    "Point of Reference",
    "Client & Site Information",
    "Sewer System Information",
    "Sewer Pipe Conditions",
    "General Notes",
    "Corrective Action Recommendations",
    "End of Report",
    "Statement of Service",
    "Understanding Sewer Material & Defects",
    "Common Sewer Defects Reference",
  ]
    .map(
      (item) =>
        `<div style="padding:6px 0;font-size:14px;border-bottom:1px dotted #ddd;">${item}</div>`,
    )
    .join("")}
  ${pageFooter}
</div>

<!-- ═══════════════════════════════════════
     PAGE 3: DISCLOSURE + SCOPE + REFERENCE
═══════════════════════════════════════ -->
<div class="page">
  ${pageHeader(date, `Inspection Report Exclusively For: ${ref}`)}

  <div style="font-size:17px;font-weight:900;text-decoration:underline;text-align:center;margin:0 0 14px;text-transform:uppercase;">Sewer Line Inspection Disclosure</div>
  ${[
    "This report is intended to be used only as a general guide in order to provide our clients with current condition of the home's and/or building's main sewer line. The report expresses the opinion of the inspector, based upon visual impressions of the conditions that existed at the time of the inspection only.",
    "The inspection report should not be construed as a compliance inspection of any governmental or non-governmental codes or regulations. The report is not intended to be a warranty or guarantee of the present or future adequacy or performance of the sewer line.",
    "All repairs should be done by a competent licensed Plumber and any work requiring building permits should be obtained by the authority having jurisdiction (Local Building Department).",
    "It is the client's sole responsibility to read this report in its entirety, not rely upon any verbal comments and to research any and all jurisdictional permits required by the local authorities regarding the property inspected.",
  ]
    .map(
      (p) =>
        `<p style="font-size:13px;line-height:1.8;margin-bottom:12px;font-weight:700;">${p}</p>`,
    )
    .join("")}

  <div style="font-size:17px;font-weight:900;text-decoration:underline;text-align:center;margin:20px 0 14px;text-transform:uppercase;">Scope of the Sewer Inspection</div>
  <p style="font-size:13px;line-height:1.8;margin-bottom:12px;font-weight:700;">A sewer inspection scan was requested of the main drain line from the structure to the city, private sewer connection, 150 feet or camera limitations (whichever comes first). The sewer line is to be accessed through a cleanout, roof vent (single story only) or other access point(s) to be determined best by the inspector. The camera inspection does not inspect all of the drain lines running under and or within the structure. The following is a summative report of the findings.</p>

  <div style="font-size:17px;font-weight:900;text-decoration:underline;text-align:center;margin:20px 0 14px;text-transform:uppercase;">Point of Reference</div>
  <p style="font-size:13px;line-height:1.8;font-weight:700;text-align:center;margin-bottom:8px;">[NOTE]</p>
  <p style="font-size:13px;line-height:1.8;font-weight:700;">Statements made within this inspection report pertaining to left, right, front or rear were referenced by standing in front of and facing the structure from the street. Additionally, analogue clockface references may be utilized to pinpoint conditions found within the pipe; in this case the 12 o'clock position will be the topmost center of the pipe, the 6 o'clock position will be the bottom most center of the pipe and so on.</p>
  ${pageFooter}
</div>

<!-- ═══════════════════════════════════════
     PAGE 4: CLIENT & SITE INFO
═══════════════════════════════════════ -->
<div class="page">
  ${pageHeader(date, `Inspection Report Exclusively For: ${ref}`)}
  <div style="font-size:14px;font-weight:700;text-transform:uppercase;border-bottom:1px solid #000;padding-bottom:4px;margin-bottom:16px;">Client & Site Information</div>

  <div style="display:flex;gap:20px;margin-bottom:16px;">
    <div style="flex:1;">
      <div style="font-weight:700;font-size:13px;text-decoration:underline;margin-bottom:10px;">FILE / DATE / TIME</div>
      ${[
        ["File #", report.fileNumber],
        ["Client Name", report.clientName],
        ["Location", report.location],
        ["Date", date],
        ["Time", report.inspectionTime],
        ["Inspector", report.inspector],
        [
          "People Present",
          Array.isArray(report.peoplePresent)
            ? report.peoplePresent.join(", ")
            : report.peoplePresent,
        ],
        ["Buyer's Agent", report.buyersAgent],
        ["Building Occupied", report.buildingOccupied],
        ["Weather / Soil", report.weather],
      ]
        .filter(([, v]) => v)
        .map(
          ([label, value]) => `
        <div style="display:flex;margin-bottom:7px;">
          <span style="font-weight:700;font-size:12px;min-width:150px;text-transform:uppercase;">${label}</span>
          <span style="font-size:13px;color:#222;">${value}</span>
        </div>`,
        )
        .join("")}
    </div>
    ${
      photos.length > 0
        ? `
    <div style="flex-shrink:0;">
      <img src="${photos[0]}" style="width:180px;height:135px;object-fit:cover;object-position:center;border:1px solid #ddd;border-radius:4px;display:block;" />
    </div>`
        : ""
    }
  </div>

  ${
    photos.length > 1
      ? `
  <div style="display:grid;grid-template-columns:repeat(${Math.min(photos.length - 1, 3)},1fr);gap:10px;margin-bottom:16px;">
    ${photos
      .slice(1)
      .map(
        (p) =>
          `<img src="${p}" style="width:100%;height:140px;object-fit:cover;object-position:center;border:1px solid #ddd;border-radius:4px;display:block;" />`,
      )
      .join("")}
  </div>`
      : ""
  }

  ${pageFooter}
</div>

<!-- ═══════════════════════════════════════
     PAGE 5: SEWER SYSTEM INFO
═══════════════════════════════════════ -->
<div class="page">
  ${pageHeader(date, `Inspection Report Exclusively For: ${ref}`)}
  <div style="font-size:14px;font-weight:700;text-transform:uppercase;border-bottom:1px solid #000;padding-bottom:4px;margin-bottom:16px;">Sewer System Information</div>

  ${
    report.cleanoutLocation
      ? `
  <div style="margin-bottom:14px;">
    <div style="font-weight:700;font-size:12px;text-transform:uppercase;margin-bottom:4px;">Location of Camera Entry / Cleanout</div>
    <div style="font-size:13px;color:#222;padding:8px;background:#f9f9f9;border-radius:4px;border:1px solid #eee;">${report.cleanoutLocation}</div>
  </div>`
      : ""
  }

  ${
    report.pipeMaterials && report.pipeMaterials.length > 0
      ? `
  <div style="margin-bottom:14px;">
    <div style="font-weight:700;font-size:12px;text-transform:uppercase;margin-bottom:4px;">Sewer Pipe Material(s) Found</div>
    <div style="font-size:13px;color:#222;padding:8px;background:#f9f9f9;border-radius:4px;border:1px solid #eee;">${Array.isArray(report.pipeMaterials) ? report.pipeMaterials.join(", ") : report.pipeMaterials}</div>
  </div>`
      : ""
  }

  ${
    report.cameraDirection1 || report.cameraDirection2
      ? `
  <div style="margin-bottom:14px;">
    <div style="font-weight:700;font-size:12px;text-transform:uppercase;margin-bottom:4px;">Piping Section — Camera Direction(s)</div>
    <div style="font-size:13px;color:#222;padding:8px;background:#f9f9f9;border-radius:4px;border:1px solid #eee;">
      ${report.cameraDirection1 ? `<div style="margin-bottom:6px;"><strong>1st Direction:</strong> ${report.cameraDirection1}</div>` : ""}
      ${report.cameraDirection2 ? `<div><strong>2nd Direction:</strong> ${report.cameraDirection2}</div>` : ""}
    </div>
  </div>`
      : ""
  }

  ${
    report.pipingNotes
      ? `
  <div style="margin-bottom:14px;">
    <div style="font-weight:700;font-size:12px;text-transform:uppercase;margin-bottom:4px;">Additional Piping Notes</div>
    <div style="font-size:13px;color:#222;padding:8px;background:#f9f9f9;border-radius:4px;border:1px solid #eee;">${report.pipingNotes}</div>
  </div>`
      : ""
  }

  ${
    videoLinksHtml
      ? `
  <div style="margin-bottom:14px;">
    <div style="font-weight:700;font-size:12px;text-transform:uppercase;margin-bottom:4px;">Sewer Video Link(s)</div>
    <div style="padding:8px;background:#f9f9f9;border-radius:4px;border:1px solid #eee;">${videoLinksHtml}</div>
  </div>`
      : ""
  }

  ${pageFooter}
</div>

<!-- ═══════════════════════════════════════
     PAGE 6: PIPE CONDITIONS
═══════════════════════════════════════ -->
<div class="page">
  ${pageHeader(date, `Inspection Report Exclusively For: ${ref}`)}
  <div style="font-size:14px;font-weight:700;text-transform:uppercase;border-bottom:1px solid #000;padding-bottom:4px;margin-bottom:16px;">Sewer Piping Conditions</div>
  ${defectsHtml}
  ${pageFooter}
</div>

<!-- ═══════════════════════════════════════
     PAGE 7: GENERAL NOTES (if exists)
═══════════════════════════════════════ -->
${
  report.generalNotes
    ? `
<div class="page">
  ${pageHeader(date, `Inspection Report Exclusively For: ${ref}`)}
  <div style="font-size:14px;font-weight:700;text-transform:uppercase;border-bottom:1px solid #000;padding-bottom:4px;margin-bottom:16px;">General Notes / Comments</div>
  <p style="font-size:13px;line-height:1.8;white-space:pre-wrap;">${report.generalNotes}</p>
  ${pageFooter}
</div>`
    : ""
}

<!-- ═══════════════════════════════════════
     PAGE 8: CORRECTIVE ACTION RECOMMENDATIONS
═══════════════════════════════════════ -->
<div class="page">
  ${pageHeader(date, `Inspection Report Exclusively For: ${ref}`)}
  <div style="font-size:14px;font-weight:700;text-transform:uppercase;border-bottom:1px solid #000;padding-bottom:4px;margin-bottom:16px;">Corrective Action Recommendations</div>

  ${correctiveRows || '<p style="color:#999;font-size:13px;font-style:italic;">No corrective actions selected.</p>'}

  ${
    report.correctionNotes
      ? `
  <div style="margin-top:16px;">
    <div style="font-weight:700;font-size:12px;text-transform:uppercase;margin-bottom:4px;">Additional Notes</div>
    <div style="font-size:13px;color:#222;padding:8px;background:#f9f9f9;border-radius:4px;border:1px solid #eee;white-space:pre-wrap;">${report.correctionNotes}</div>
  </div>`
      : ""
  }

  <div style="margin-top:24px;padding:14px;background:#F8FAFC;border-radius:6px;border:1px solid #ddd;">
    <p style="font-size:13px;line-height:1.8;margin-bottom:8px;">Given the condition(s) above we recommend full evaluations and/or corrections with written findings and costs to cure by a competent licensed plumbing contractor before the end/close of the inspection contingency period.</p>
    <p style="font-size:13px;line-height:1.8;">Recommend sewer inspections after repairs are made to ensure efficacy of work and to inspect any areas of the sewer lateral not visible due to defect(s).</p>
  </div>
  ${pageFooter}
</div>

<!-- ═══════════════════════════════════════
     PAGE 9: STATEMENT OF SERVICE
═══════════════════════════════════════ -->
<div class="page">
  ${pageHeader(date, `Inspection Report Exclusively For: ${ref}`)}
  <div style="font-size:14px;font-weight:700;text-transform:uppercase;border-bottom:1px solid #000;padding-bottom:4px;margin-bottom:16px;">Statement of Service</div>
  <p style="font-size:13px;line-height:1.8;margin-bottom:14px;font-weight:700;">${report.statementOfService || "Sewer Labz is a professional sewer inspection company. Our inspectors are trained and experienced in the assessment of residential and commercial sewer systems. All inspections are performed in accordance with industry standards using professional-grade CCTV camera equipment."}</p>
  <p style="font-size:13px;line-height:1.8;margin-bottom:14px;font-weight:700;">This inspection report represents a visual assessment only. Our findings are limited to conditions observable by camera at the time of inspection. Sewer Labz does not perform destructive testing and cannot be held responsible for conditions that are not visible or accessible during the camera inspection.</p>
  <p style="font-size:13px;line-height:1.8;font-weight:700;">All recommendations contained within this report should be evaluated by a licensed plumbing contractor prior to any real estate transaction close date. Sewer Labz is available for follow-up consultations upon request.</p>
  ${pageFooter}
</div>

<!-- ═══════════════════════════════════════
     PAGE 10: MATERIAL LIFE EXPECTANCY
═══════════════════════════════════════ -->
<div class="page">
  ${pageHeader(date, `Inspection Report Exclusively For: ${ref}`)}
  <div style="font-size:17px;font-weight:900;text-decoration:underline;text-align:center;margin:0 0 12px;text-transform:uppercase;">Understanding Sewer Material &amp; Defects</div>
  <div style="text-align:center;font-weight:700;text-decoration:underline;margin-bottom:10px;font-size:14px;">Sewer Line Material Life Expectancy</div>
  ${materialTable}
  <p style="font-size:11px;color:#555;margin-top:14px;line-height:1.7;">
    <strong>*NOTE*</strong> Life expectancy is for material alone and under ideal circumstances as intended by the manufacturer. Construction and repair practices can have detrimental effects on how long a sewer line can perform as expected. Additionally, soil erosion/settling and other environmental influences such as root intrusion can drastically reduce the expected timelines outlined above.
  </p>
  ${pageFooter}
</div>

<!-- ═══════════════════════════════════════
     PAGE 11: COMMON SEWER DEFECT GRAPHIC
═══════════════════════════════════════ -->
<div class="page" style="page-break-after:auto;">
  ${pageHeader(date, `Inspection Report Exclusively For: ${ref}`)}
  <div style="font-size:17px;font-weight:900;text-decoration:underline;text-align:center;margin:0 0 12px;text-transform:uppercase;">Common Sewer Defects Reference</div>
  ${defectTable}
  <div style="margin-top:24px;border-top:1px solid #ddd;padding-top:10px;text-align:center;font-size:10px;color:#888;">
    Generated by Sewer Labz &nbsp;|&nbsp; ${report.location || ""} &nbsp;|&nbsp;
    ${new Date().toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" })}<br>
    <strong>This report is not to be used for the purposes of substitute disclosure.</strong>
  </div>
</div>

</body>
</html>`;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    console.error("PDF error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 },
    );
  }
}
