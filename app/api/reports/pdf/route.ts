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

    const footer = `
      <div class="rf">
        This report was prepared for the client listed above in accordance with our inspection agreement.<br>
        <strong>This report is not to be used for the purposes of substitute disclosure.</strong>
      </div>`;

    const header = (d: string, r: string) => `
      <div class="rh">
        <span>${d}</span>
        <span>Inspection Report Exclusively For: ${r}</span>
      </div>`;

    const videoLinksHtml =
      report.videoLinks
        ?.filter((l: string) => l?.trim())
        .map(
          (link: string, i: number) => `
        <div class="info-row">
          <span class="info-label">Video Link ${i + 1}</span>
          <span class="info-value"><a href="${link}" style="color:#0066cc;">${link}</a></span>
        </div>`,
        )
        .join("") || "";

    const correctiveRows = report.corrections
      ? Object.entries(report.corrections)
          .filter(([, v]) => v && v !== "N/A")
          .map(
            ([label, value]) => `
            <div class="info-row">
              <span class="info-label">${label}</span>
              <span class="info-value">${value}</span>
            </div>`,
          )
          .join("")
      : "";

    const defectsHtml =
      !defects || defects.length === 0
        ? '<p style="color:#999;font-size:13px;padding:20px 0;">No pipe conditions recorded.</p>'
        : defects
            .map((d: any, i: number) => {
              const time =
                d.videoTimeH && d.videoTimeM
                  ? `${d.videoTimeH}:${d.videoTimeM}`
                  : "--:--";
              const sevColor =
                d.severity === "Major"
                  ? "#DC2626"
                  : d.severity === "Moderate"
                    ? "#EA580C"
                    : d.severity === "Minor"
                      ? "#D97706"
                      : d.severity === "Suggested Maintenance"
                        ? "#2563EB"
                        : "#16A34A";
              const sevLabel =
                d.severity && d.severity !== "No Defect"
                  ? `; <span style="font-weight:700;color:${sevColor};">${d.severity}</span>`
                  : "";
              const photosHtml =
                d.images?.length > 0
                  ? `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:10px;">
                ${d.images.map((img: any) => `<img src="${img.url}" style="width:100%;height:200px;object-fit:cover;object-position:center;border:1px solid #ddd;border-radius:4px;display:block;" />`).join("")}
               </div>`
                  : "";
              return `
            <div style="margin-bottom:28px;page-break-inside:avoid;">
              <p style="font-size:13px;line-height:1.7;margin-bottom:8px;">
                <strong>#${i + 1} @ ${time}${d.footageStart ? ` / ${d.footageStart} ft` : ""} — ${d.conditionType !== "Select Condition Type" ? d.conditionType : "Observation"}${sevLabel}.</strong>
                ${d.narrative ? ` ${d.narrative}` : ""}
              </p>
              ${photosHtml}
            </div>`;
            })
            .join("");

    const defectTable = `
      <div style="margin-top:20px;">
        <div style="text-align:center;font-weight:700;text-decoration:underline;margin-bottom:12px;font-size:14px;">Common Sewer Defect Reference</div>
        <table style="width:100%;border-collapse:collapse;font-size:11px;">
          <thead>
            <tr style="background:#0F2A4A;color:#fff;">
              <th style="padding:8px;text-align:left;border:1px solid #ccc;">Defect Type</th>
              <th style="padding:8px;text-align:left;border:1px solid #ccc;">Description</th>
              <th style="padding:8px;text-align:center;border:1px solid #ccc;">Typical Severity</th>
            </tr>
          </thead>
          <tbody>
            ${[
              [
                "Root Intrusion",
                "Tree/plant roots entering pipe through joints or cracks",
                "Moderate",
                "#EA580C",
              ],
              [
                "Offset Joint",
                "Pipe sections misaligned at joints, causing partial blockage",
                "Major",
                "#DC2626",
              ],
              [
                "Circumferential Crack",
                "Crack running around full circumference of pipe",
                "Major",
                "#DC2626",
              ],
              [
                "Longitudinal Crack",
                "Crack running along the length of the pipe",
                "Moderate",
                "#EA580C",
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
                "Minor",
                "#D97706",
              ],
              [
                "Deteriorated Pipe",
                "Pipe material degrading, pitting, or corroding internally",
                "Major",
                "#DC2626",
              ],
              [
                "Belly/Positive Grade",
                "Section of pipe sagging causing pooling and blockage",
                "Moderate",
                "#EA580C",
              ],
              [
                "Scale Buildup",
                "Mineral deposits reducing pipe diameter and flow",
                "Minor",
                "#D97706",
              ],
              [
                "Infiltration",
                "Groundwater entering pipe through cracks or joints",
                "Moderate",
                "#EA580C",
              ],
              [
                "Exfiltration",
                "Sewage leaking out of pipe into surrounding soil",
                "Major",
                "#DC2626",
              ],
              [
                "Collapse",
                "Pipe has partially or fully caved in",
                "Major",
                "#DC2626",
              ],
              [
                "Grease Deposit",
                "Accumulated grease narrowing pipe flow capacity",
                "Minor",
                "#D97706",
              ],
              [
                "Broken Pipe",
                "Pipe has fractured with missing or displaced pieces",
                "Major",
                "#DC2626",
              ],
            ]
              .map(
                ([type, desc, sev, col], i) => `
              <tr style="background:${i % 2 === 0 ? "#fff" : "#f9f9f9"};">
                <td style="padding:7px 8px;border:1px solid #ddd;font-weight:600;">${type}</td>
                <td style="padding:7px 8px;border:1px solid #ddd;">${desc}</td>
                <td style="padding:7px 8px;border:1px solid #ddd;text-align:center;color:${col};font-weight:700;">${sev}</td>
              </tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Sewer Inspection Report</title>
<style>
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  html, body { width:100%; background:#fff; font-family:Arial,sans-serif; font-size:13px; color:#000; }

  @page { size: letter; margin: 0.45in 0.5in; }
  @page :first { margin-top: 0; }

  .page { padding:36px 48px; position:relative; min-height:100vh; page-break-after:always; }
  .page:last-child { page-break-after:auto; }

  .cover { display:flex; flex-direction:column; align-items:center; text-align:center; min-height:100vh; padding:28px 48px 140px; position:relative; page-break-after:always; }
  .cover-logo { font-size:54px; font-weight:900; letter-spacing:-2px; color:#0F2A4A; margin-bottom:4px; line-height:1; }
  .cover-logo span { color:#2D8C4E; }
  .cover-tagline { font-size:15px; color:#2D8C4E; font-weight:700; margin-bottom:3px; }
  .cover-subtitle { font-size:13px; color:#555; margin-bottom:18px; }
  .cover-photo-wrap { width:100%; max-width:680px; margin:0 auto; display:flex; justify-content:center; align-items:center; }
  .cover-photo { width:100%; max-width:680px; height:420px; object-fit:cover; object-position:center center; display:block; border-radius:4px; border:1px solid #ddd; }
  .cover-no-photo { width:100%; max-width:680px; height:420px; background:#f0f0f0; display:flex; align-items:center; justify-content:center; font-size:14px; color:#999; border-radius:4px; border:1px solid #ddd; }
  .cover-bottom { position:absolute; bottom:0; left:48px; right:48px; border-top:1px solid #ccc; padding:12px 0 18px; font-size:10.5px; color:#444; line-height:1.75; text-align:center; }

  .rh { display:flex; justify-content:space-between; border-bottom:1.5px solid #000; padding-bottom:7px; margin-bottom:18px; font-size:11px; color:#555; }
  .rf { position:absolute; bottom:18px; left:48px; right:48px; border-top:1px solid #ddd; padding-top:7px; font-size:10px; color:#888; text-align:center; line-height:1.6; }

  .sec-title { font-size:16px; font-weight:900; text-transform:uppercase; text-decoration:underline; text-align:center; margin:18px 0 14px; }
  .sec-sub { font-size:13px; font-weight:700; text-transform:uppercase; border-bottom:1.5px solid #000; padding-bottom:4px; margin-bottom:14px; }

  .toc-row { padding:7px 0; font-size:14px; border-bottom:1px dotted #ccc; display:flex; align-items:center; }
  .toc-dots { flex:1; border-bottom:1px dotted #ccc; margin:0 8px; height:1px; }

  .info-row { display:flex; margin-bottom:8px; align-items:flex-start; }
  .info-label { font-weight:700; font-size:11.5px; min-width:160px; text-transform:uppercase; padding-top:1px; }
  .info-value { font-size:13px; color:#111; flex:1; }

  .sys-label { font-weight:700; font-size:11.5px; text-transform:uppercase; margin-bottom:4px; }
  .sys-value { font-size:13px; color:#111; padding:8px 10px; background:#f9f9f9; border:1px solid #eee; border-radius:3px; margin-bottom:14px; line-height:1.6; }

  .disc { font-size:13px; line-height:1.85; margin-bottom:14px; font-weight:600; }

  .mat-table { width:100%; border-collapse:collapse; margin-top:10px; }
  .mat-table th { background:#0F2A4A; color:#fff; font-size:12px; padding:8px 10px; text-align:left; border:1px solid #ccc; }
  .mat-table td { font-size:12px; padding:7px 10px; border:1px solid #ddd; }
  .mat-table tr:nth-child(even) td { background:#f9f9f9; }

  @media print {
    @page { size: letter; margin: 0.45in 0.5in; }
    body { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .page { page-break-after:always; }
    .page:last-child { page-break-after:auto; }
    .cover { page-break-after:always; }
  }
</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <div class="cover-logo">SEWER <span>LABZ</span></div>
  <div class="cover-tagline">${report.companyTagline || "Don't Let Your Drain Be A Pain!"}</div>
  <div class="cover-subtitle">Professional Sewer Inspection Report</div>
  <div class="cover-photo-wrap">
    ${
      photos.length > 0
        ? `<img src="${photos[0]}" class="cover-photo" alt="Property Photo" />`
        : `<div class="cover-no-photo">📸 Property Photo</div>`
    }
  </div>
  <div class="cover-bottom">
    This report was prepared for the client listed above in accordance with our inspection agreement and is subject to the terms and conditions agreed upon therein.
    A verbal consultation is part of this report. If you were not present during the inspection, call our office for a full discussion of the entire report.
    This report is for the sole use of the named client only; it is not to be used by any other party for any reason.<br><br>
    <strong>THIS REPORT IS NOT TO BE USED FOR THE PURPOSES OF SUBSTITUTE DISCLOSURE.</strong>
  </div>
</div>

<!-- TOC -->
<div class="page">
  ${header(date, ref)}
  <div class="sec-title">Table of Contents</div>
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
    "Common Sewer Defect Reference",
  ]
    .map(
      (item) =>
        `<div class="toc-row"><span>${item}</span><span class="toc-dots"></span></div>`,
    )
    .join("")}
  ${footer}
</div>

<!-- DISCLOSURE + SCOPE + POINT OF REFERENCE -->
<div class="page">
  ${header(date, ref)}
  <div class="sec-title">Sewer Line Inspection Disclosure</div>
  <p class="disc">This report is intended to be used only as a general guide in order to provide our clients with current condition of the home's and/or building's main sewer line. The report expresses the opinion of the inspector, based upon visual impressions of the conditions that existed at the time of the inspection only.</p>
  <p class="disc">The inspection report should not be construed as a compliance inspection of any governmental or non-governmental codes or regulations. The report is not intended to be a warranty or guarantee of the present or future adequacy or performance of the sewer line.</p>
  <p class="disc">All repairs should be done by a competent licensed Plumber and any work requiring building permits should be obtained by the authority having jurisdiction (Local Building Department).</p>
  <p class="disc">It is the client's sole responsibility to <u>read this report in its entirety</u>, not rely upon any verbal comments and to research any and all jurisdictional permits required by the local authorities regarding the property inspected.</p>
  <div class="sec-title">Scope of the Sewer Inspection</div>
  <p class="disc">A sewer inspection scan was requested of the main drain line from the structure to the city, private sewer connection, 150 feet or camera limitations (whichever comes first). The sewer line is to be accessed through a cleanout, roof vent (single story only) or other access point(s) to be determined best by the inspector. The camera inspection does not inspect all of the drain lines running under and or within the structure. The following is a summative report of the findings.</p>
  <div class="sec-title">Point of Reference</div>
  <p class="disc" style="text-align:center;">[NOTE]</p>
  <p class="disc">Statements made within this inspection report pertaining to left, right, front or rear were referenced by standing in front of and facing the structure from the street. Additionally, analogue clockface references may be utilized to pinpoint conditions found within the pipe; in this case the 12 o'clock position will be the topmost center of the pipe, the 6 o'clock position will be the bottom most center of the pipe and so on.</p>
  ${footer}
</div>

<!-- CLIENT & SITE INFO -->
<div class="page">
  ${header(date, ref)}
  <div class="sec-sub">Client &amp; Site Information</div>
  <div style="display:flex;gap:24px;align-items:flex-start;">
    <div style="flex:1;">
      <div style="font-weight:700;font-size:12px;text-decoration:underline;text-transform:uppercase;margin-bottom:10px;">File / Date / Time</div>
      ${[
        ["File #", report.fileNumber],
        ["Client Name", report.clientName],
        ["Location", report.location],
        ["Date", date],
        ["Time", report.inspectionTime],
        [
          "People Present",
          Array.isArray(report.peoplePresent)
            ? report.peoplePresent.join(", ")
            : report.peoplePresent,
        ],
        ["Buyer's Agent", report.buyersAgent],
        ["Inspector", report.inspector],
        ["Building Occupied", report.buildingOccupied],
        ["Weather / Soil", report.weather],
      ]
        .filter(([, v]) => v)
        .map(
          ([l, v]) =>
            `<div class="info-row"><span class="info-label">${l}</span><span class="info-value">${v}</span></div>`,
        )
        .join("")}
    </div>
    ${
      photos.length > 0
        ? `<div style="flex-shrink:0;width:200px;text-align:center;">
           <img src="${photos[0]}" style="width:200px;height:150px;object-fit:cover;object-position:center center;border:1px solid #ddd;border-radius:3px;display:block;" alt="Property" />
         </div>`
        : ""
    }
  </div>
  ${
    photos.length > 1
      ? `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:14px;">
         ${photos
           .slice(1)
           .map(
             (p) =>
               `<img src="${p}" style="width:100%;height:150px;object-fit:cover;object-position:center center;border:1px solid #ddd;border-radius:3px;" />`,
           )
           .join("")}
       </div>`
      : ""
  }
  ${footer}
</div>

<!-- SEWER SYSTEM INFO -->
<div class="page">
  ${header(date, ref)}
  <div class="sec-sub">Sewer System Information</div>
  ${report.cleanoutLocation ? `<div class="sys-label">Location of Camera Entry / Cleanout</div><div class="sys-value">${report.cleanoutLocation}</div>` : ""}
  ${report.pipeMaterials?.length > 0 ? `<div class="sys-label">Sewer Pipe Material(s) Found</div><div class="sys-value">${Array.isArray(report.pipeMaterials) ? report.pipeMaterials.join(", ") : report.pipeMaterials}</div>` : ""}
  ${
    report.cameraDirection1 || report.cameraDirection2
      ? `<div class="sys-label">Piping Section — Camera Direction(s)</div>
       <div class="sys-value">
         ${report.cameraDirection1 ? `<div style="margin-bottom:5px;"><strong>1st Direction:</strong> ${report.cameraDirection1}</div>` : ""}
         ${report.cameraDirection2 ? `<div><strong>2nd Direction:</strong> ${report.cameraDirection2}</div>` : ""}
       </div>`
      : ""
  }
  ${report.pipingNotes ? `<div class="sys-label">Additional Piping Notes</div><div class="sys-value">${report.pipingNotes}</div>` : ""}
  ${videoLinksHtml ? `<div class="sys-label">Sewer Video Link(s)</div><div class="sys-value">${videoLinksHtml}</div>` : ""}
  ${footer}
</div>

<!-- PIPE CONDITIONS -->
<div class="page">
  ${header(date, ref)}
  <div class="sec-sub">Sewer Piping Conditions</div>
  ${defectsHtml}
  ${footer}
</div>

<!-- GENERAL NOTES -->
${
  report.generalNotes
    ? `<div class="page">
       ${header(date, ref)}
       <div class="sec-sub">General Notes / Comments</div>
       <p style="font-size:13px;line-height:1.85;white-space:pre-wrap;">${report.generalNotes}</p>
       ${footer}
     </div>`
    : ""
}

<!-- CORRECTIVE ACTIONS -->
<div class="page">
  ${header(date, ref)}
  <div class="sec-sub">Corrective Action Recommendations</div>
  ${correctiveRows || '<p style="color:#999;font-size:13px;">No corrective actions selected.</p>'}
  ${report.correctionNotes ? `<div style="margin-top:14px;"><div class="sys-label">Additional Notes</div><div class="sys-value" style="white-space:pre-wrap;">${report.correctionNotes}</div></div>` : ""}
  <div style="margin-top:20px;padding:14px;background:#F8FAFC;border-radius:5px;border:1px solid #eee;">
    <p style="font-size:13px;line-height:1.8;margin-bottom:8px;">Given the condition(s) above we recommend full evaluations and/or corrections with written findings and costs to cure by a competent licensed plumbing contractor before the end/close of the inspection contingency period.</p>
    <p style="font-size:13px;line-height:1.8;">Recommend sewer inspections after repairs are made to ensure efficacy of work and to inspect any areas of the sewer lateral not visible due to defect(s).</p>
  </div>
  ${footer}
</div>

<!-- STATEMENT OF SERVICE -->
<div class="page">
  ${header(date, ref)}
  <div class="sec-sub">Statement of Service</div>
  <p class="disc">${report.statementOfService || "Sewer Labz is a professional sewer inspection company. Our inspectors are trained and experienced in the assessment of residential and commercial sewer systems. All inspections are performed in accordance with industry standards using professional-grade CCTV camera equipment."}</p>
  <p class="disc">This inspection report represents a visual assessment only. Our findings are limited to conditions observable by camera at the time of inspection. Sewer Labz does not perform destructive testing and cannot be held responsible for conditions that are not visible or accessible during the camera inspection.</p>
  <p class="disc">All recommendations contained within this report should be evaluated by a licensed plumbing contractor prior to any real estate transaction close date. Sewer Labz is available for follow-up consultations upon request.</p>
  ${footer}
</div>

<!-- MATERIAL LIFE EXPECTANCY -->
<div class="page">
  ${header(date, ref)}
  <div class="sec-title">Understanding Sewer Material &amp; Defects</div>
  <div style="text-align:center;font-weight:700;text-decoration:underline;margin-bottom:12px;">Sewer Line Material Life Expectancy</div>
  <table class="mat-table">
    <thead><tr><th>Material Type</th><th>Life Expectancy</th></tr></thead>
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
          ([type, life]) =>
            `<tr><td>${type}</td><td><strong>${life}</strong></td></tr>`,
        )
        .join("")}
    </tbody>
  </table>
  <p style="font-size:11px;color:#555;margin-top:14px;line-height:1.7;">
    <strong>*NOTE*</strong> Life expectancy is for material alone and under ideal circumstances as intended by the manufacturer. Construction and repair practices can have detrimental effects on how long a sewer line can perform as expected.
  </p>
  ${footer}
</div>

<!-- COMMON SEWER DEFECT REFERENCE -->
<div class="page">
  ${header(date, ref)}
  ${defectTable}
  <div style="margin-top:28px;border-top:1px solid #ddd;padding-top:10px;text-align:center;font-size:10px;color:#888;">
    Generated by Sewer Labz &nbsp;|&nbsp; ${report.location || ""} &nbsp;|&nbsp;
    ${new Date().toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" })}<br>
    <strong>This report is not to be used for the purposes of substitute disclosure.</strong>
  </div>
</div>

<script>
  document.title = "";
  if (window.opener) {
    setTimeout(function() { window.print(); }, 1200);
  }
</script>

</body>
</html>`;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error: any) {
    console.error("[PDF Error]", error);
    return NextResponse.json(
      { error: "Failed to generate report", detail: error?.message },
      { status: 500 },
    );
  }
}
