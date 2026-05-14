import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export async function extractPdfText(file) {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;

  const pages = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const tc = await page.getTextContent();
    pages.push(tc.items.map((it) => it.str).join(" "));
  }
  let text = pages.join("\n");
  return text;
}

// Turns the UW audit PDF text dump into course records the dashboard can score.
export function parseCoursesFromDegreeAuditText(fullText) {
  const raw = String(fullText || "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n+/g, "\n")
    .trim();

  const stripJunk = (s) =>
    String(s || "")
      .replace(/https?:\/\/\S+/gi, " ")
      .replace(/\bAudit Your Degree\s*-\s*MyPlan\b/gi, " ")
      .replace(/\b\d{1,2}\/\d{1,2}\/\d{2},\s*\d{1,2}:\d{2}\s*(AM|PM)\b/gi, " ")
      .replace(/\b\d{1,2}\s*\/\s*\d{1,2}\b/g, " ")
      .replace(/\bFEDERAL LAW PROHIBITS TRANSMITTAL TO A THIRD PARTY\b/gi, " ")
      .replace(/\bEND OF ANALYSIS\b/gi, " ")
      .replace(/[ \t]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  const QTR_RE = /\b(?:(WI|SP|SU|AU|FA)\s?(\d{2})|(0000))\s+Qtr\b/gi;
  const SUBJ = "[A-Z&]{1,5}(?:\\s+[A-Z&]{1,5})?";
  const NUM = "(?:\\d{3}|\\d{1,3}[A-Z]{1,2})";

  const COURSE_ANCHOR_RE = new RegExp(
    String.raw`\b(?<subj>${SUBJ})\s+(?<num>${NUM})\s+Course\s+Name\b`,
    "g"
  );
  const CREDITS_RE = /\b(?<credits>\d{1,2}(?:\.\d+)?)\s+Cred(?:its?|i)?\b/i;
  const GRADE_RE = /\b(?<grade>4\.0|[0-3]\.\d{1,2}|IP|CR|RD|AP|S|NS|NC|W|I|X)\s+Grad(?:e)?\b/i;
  function findQuarterBefore(idx) {
    const LOOKBACK = 600;
    const start = Math.max(0, idx - LOOKBACK);
    const chunk = raw.slice(start, idx);

    let last = null;
    let m;
    while ((m = QTR_RE.exec(chunk)) !== null) {
      const q = m[3] ? "0000" : `${m[1].toUpperCase()}${m[2]}`;
      last = q;
    }
    return last;
  }

  const out = [];
  const seen = new Set();

  const anchors = [];
  for (const m of raw.matchAll(COURSE_ANCHOR_RE)) {
    anchors.push({
      index: m.index,
      subject: m.groups.subj.replace(/\s+/g, " ").trim().toUpperCase(),
      number: m.groups.num.toUpperCase(),
    });
  }

  for (let i = 0; i < anchors.length; i++) {
    const a = anchors[i];
    const nextIndex = i + 1 < anchors.length ? anchors[i + 1].index : raw.length;
    const LOOKAHEAD = 900;
    const end = Math.min(raw.length, Math.min(nextIndex, a.index + LOOKAHEAD));
    const block = raw.slice(a.index, end);

    const classCode = `${a.subject} ${a.number}`;
    const quarter = findQuarterBefore(a.index);
    let title = block.replace(/^.*?\bCourse\s+Name\b/i, "").trim();
    const cutPoints = [];
    const ci = title.search(/\b\d{1,2}(?:\.\d+)?\s+Cred(?:its?|i)?\b/i);
    if (ci >= 0) cutPoints.push(ci);
    const gi = title.search(/\bGrad(?:e)?\b/i);
    if (gi >= 0) cutPoints.push(gi);
    const ni = title.search(new RegExp(String.raw`\b${SUBJ}\s+${NUM}\s+Course\s+Name\b`));
    if (ni >= 0) cutPoints.push(ni);

    if (cutPoints.length) title = title.slice(0, Math.min(...cutPoints)).trim();
    title = stripJunk(title) || null;

    const cMatch = block.match(CREDITS_RE);
    const credits = cMatch ? Number(cMatch.groups.credits) : null;

    const gMatch = block.match(GRADE_RE);
    const gRaw = gMatch ? gMatch.groups.grade.toUpperCase() : null;
    const grade = gRaw && /^\d/.test(gRaw) ? Number(gRaw) : gRaw;
    const key = `${classCode}|${quarter ?? ""}|${credits ?? ""}|${grade ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);

    out.push({ classCode, className: title, quarter, credits, grade });
  }

  return out;
}
