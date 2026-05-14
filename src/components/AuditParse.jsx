import { useEffect, useMemo, useState } from "react";
import { extractPdfText, parseCoursesFromDegreeAuditText } from "../utils/degreeAuditParser.js";
import ManualCourseModal from "./ManualCourseModal.jsx";
import SaveCoursesModal from "./SaveCoursesModal.jsx";
import { buildCoursesToSave, saveCoursesForCurrentUser } from "../utils/courseSave.js";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getCurrentUser,
  hasCurrentUserCourses,
  onLocalAuthStateChanged,
} from "../utils/localStore.js";

function quarterSortKey(q) {
  if (!q) return 0;
  const m = q.toUpperCase().match(/^(WI|SP|SU|AU|FA)(\d{2})$/);
  if (!m) return 0;

  const termOrder = { WI: 1, SP: 2, SU: 3, AU: 4, FA: 4 };
  const year = 2000 + Number(m[2]);
  return year * 10 + (termOrder[m[1]] ?? 0);
}

function makeId(c) {
  return `${c.classCode}|${c.quarter ?? ""}`;
}

function includesText(hay, needle) {
  return String(hay ?? "").toLowerCase().includes(String(needle ?? "").toLowerCase());
}

const th = {
  textAlign: "left",
  padding: "10px 12px",
  borderBottom: "2px solid #ddd",
  whiteSpace: "nowrap",
  fontSize: 13,
  letterSpacing: 0.2,
  background: "white",
};

const td = {
  padding: "10px 12px",
  borderBottom: "1px solid #eee",
  verticalAlign: "top",
  fontSize: 14,
};

const tdMono = {
  ...td,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  whiteSpace: "nowrap",
};

const tdRight = {
  ...td,
  textAlign: "right",
  whiteSpace: "nowrap",
};

const numCell = {
  display: "inline-flex",
  gap: 5,
  alignItems: "baseline",
  justifyContent: "flex-start",
  width: "100%",
};

const numValue = {
  display: "inline-block",
  width: 10,
  textAlign: "right",
  fontVariantNumeric: "tabular-nums",
};

const numValueWide = {
  ...numValue,
  width: 10,
};

const quarterValue = {
  display: "inline-block",
  width: 50,
  fontVariantNumeric: "tabular-nums",
};

function getParseIssues(c) {
  const issues = [];

  if (!c.classCode) issues.push("Missing class code");
  if (!c.className) issues.push("Missing title");
  if (!c.quarter) issues.push("Missing quarter");
  if (c.credits == null) issues.push("Missing credits");
  if (c.grade == null) issues.push("Missing grade");

  const t = String(c.className ?? "").toUpperCase();
  const suspiciousPhrases = [
    "AUDIT YOUR DEGREE",
    "MYPLAN",
    "HTTP",
    "HTTPS",
    "PAGE",
    "END OF ANALYSIS",
    "FEDERAL LAW PROHIBITS",
    "DATE PREPARED",
    "PREPARED FOR",
  ];

  if (t && suspiciousPhrases.some((p) => t.includes(p))) {
    issues.push("Title contains footer/header junk");
  }

  if (t && t.length > 60) issues.push("Title unusually long (possible bad cut)");

  const creditsNum = Number(c.credits);
  if (c.credits != null && (!Number.isFinite(creditsNum) || creditsNum < 0 || creditsNum > 30)) {
    issues.push("Credits look invalid");
  }

  const g = String(c.grade ?? "").toUpperCase();
  const okGrade =
    g === "" ||
    g === "IP" ||
    g === "CR" ||
    g === "RD" ||
    g === "AP" ||
    g === "S" ||
    g === "NS" ||
    g === "NC" ||
    g === "W" ||
    g === "I" ||
    g === "X" ||
    /^\d(\.\d{1,2})?$/.test(g);

  if (c.grade != null && !okGrade) issues.push("Grade token looks invalid");

  const q = String(c.quarter ?? "").toUpperCase();
  if (c.quarter != null && q !== "0000" && q !== "" && !/^(WI|SP|SU|AU|FA)\d{2}$/.test(q)) {
    issues.push("Quarter token looks invalid");
  }

  return issues;
}

function AppleCheck({ checked, onToggle, disabled, title }) {
  const size = 16;

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onToggle}
      aria-pressed={checked}
      title={title}
      style={{
        width: size,
        height: size,
        borderRadius: 4,
        border: checked ? "1px solid rgba(0, 120, 255, 0.75)" : "1px solid rgba(0,0,0,0.22)",
        background: checked ? "rgba(0, 120, 255, 0.14)" : "rgba(0,0,0,0.02)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        userSelect: "none",
        padding: 0,
        lineHeight: 1,
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 900,
          color: checked ? "rgb(0, 95, 215)" : "transparent",
          transform: "translateY(-0.5px)",
        }}
      >
        ✓
      </span>
    </button>
  );
}

function QuarterGroups({
  rows,
  selectedIds,
  setSelectedIds,
  fieldDefault,
  fieldOverrides,
  setFieldOverrides,
  onReAdd,
}) {
  const groups = useMemo(() => {
    const m = new Map();

    for (const r of rows) {
      const q = r.quarter ?? "Unknown quarter";
      if (!m.has(q)) m.set(q, []);
      m.get(q).push(r);
    }

    return Array.from(m.entries()).sort((a, b) => quarterSortKey(a[0]) - quarterSortKey(b[0]));
  }, [rows]);

  return (
    <div style={{ marginTop: 18 }}>
      {groups.map(([q, items]) => (
        <QuarterTable
          key={q}
          quarter={q}
          items={items}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          fieldDefault={fieldDefault}
          fieldOverrides={fieldOverrides}
          setFieldOverrides={setFieldOverrides}
          onReAdd={onReAdd}
        />
      ))}
    </div>
  );
}

function QuarterTable({
  quarter,
  items,
  selectedIds,
  setSelectedIds,
  fieldDefault,
  fieldOverrides,
  setFieldOverrides,
  onReAdd,
}) {
  const sortByCode = (a, b) => (a.classCode || "").localeCompare(b.classCode || "");
  const sorted = [...items].sort(sortByCode);

  const ALL_FIELDS = ["credits", "grade", "quarter"];

  const isFieldOn = (id, field) => {
    if (!selectedIds.has(id)) return false;

    const ov = fieldOverrides[id]?.[field];

    if (ov === true) return true;
    if (ov === false) return false;

    return !!fieldDefault[field];
  };

  const toggleClass = (id) => {
    const isSelected = selectedIds.has(id);

    if (isSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });

      setFieldOverrides((prev) => {
        const next = { ...prev };
        const cur = next[id] ? { ...next[id] } : {};

        for (const f of ALL_FIELDS) cur[f] = false;

        next[id] = cur;
        return next;
      });

      return;
    }

    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    setFieldOverrides((prev) => {
      const next = { ...prev };
      const cur = next[id] ? { ...next[id] } : {};

      for (const f of ALL_FIELDS) delete cur[f];

      next[id] = cur;
      return next;
    });
  };

  const toggleFieldForRow = (id, field) => {
    const selected = selectedIds.has(id);

    if (!selected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });

      setFieldOverrides((prev) => {
        const next = { ...prev };
        const cur = next[id] ? { ...next[id] } : {};

        for (const f of ALL_FIELDS) cur[f] = false;

        cur[field] = true;
        next[id] = cur;

        return next;
      });

      return;
    }

    const currentlyOn = isFieldOn(id, field);

    setFieldOverrides((prev) => {
      const next = { ...prev };
      const cur = next[id] ? { ...next[id] } : {};
      cur[field] = !currentlyOn;
      next[id] = cur;
      return next;
    });
  };

  const renderRow = (c, i) => {
    const id = makeId(c);
    const selected = selectedIds.has(id);

    const allowCredits = isFieldOn(id, "credits");
    const allowGrade = isFieldOn(id, "grade");
    const allowQuarter = isFieldOn(id, "quarter");

    const issues = getParseIssues(c);
    const hasIssues = issues.length > 0;

    const rowBg = selected
      ? hasIssues
        ? "rgba(255, 149, 0, 0.06)"
        : "transparent"
      : "rgba(0,0,0,0.04)";

    return (
      <tr
        key={`${id}-${i}`}
        title={hasIssues ? issues.join("\n") : undefined}
        style={{
          background: rowBg,
          opacity: selected ? 1 : 0.72,
          boxShadow: hasIssues ? "inset 3px 0 0 rgba(255,149,0,0.55)" : "none",
        }}
      >
        <td
          style={{
            ...td,
            position: "sticky",
            left: 0,
            zIndex: 2,
            background: selected ? (hasIssues ? "rgba(255,149,0,0.06)" : "white") : "rgba(245,245,245,1)",
          }}
        >
          <AppleCheck
            checked={selected}
            onToggle={() => toggleClass(id)}
            title={selected ? "Selected (click to deselect entire class)" : "Deselected (click to select class)"}
          />
        </td>

        <td style={{ ...td, maxWidth: 520 }}>
          <div
            title={c.className ?? ""}
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {c.className ?? ""}
          </div>

          <div style={{ marginTop: 4, fontSize: 12, opacity: 0.75 }}>
            <span style={{ fontFamily: tdMono.fontFamily }}>{c.classCode}</span>
          </div>

          {hasIssues && (
            <div style={{ marginTop: 6, display: "inline-flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "rgba(140,82,0,1)" }} title={issues.join("\n")}>
                ⚠ Parse issue
              </span>

              <button
                type="button"
                onClick={() => onReAdd?.(c)}
                style={{
                  padding: "4px 8px",
                  borderRadius: 999,
                  border: "1px solid rgba(0,0,0,0.18)",
                  background: "white",
                  fontSize: 12,
                  cursor: "pointer",
                }}
                title="Deselect this row and re-add it manually"
              >
                Re-add
              </button>
            </div>
          )}
        </td>

        <td style={tdRight}>
          <div style={numCell}>
            <AppleCheck
              checked={allowCredits}
              onToggle={() => toggleFieldForRow(id, "credits")}
              title={allowCredits ? "Saving credits (click to stop saving for this class)" : "Not saving credits (click to save)"}
            />
            <span style={numValueWide}>{c.credits ?? ""}</span>
          </div>
        </td>

        <td style={tdRight}>
          <div style={numCell}>
            <AppleCheck
              checked={allowGrade}
              onToggle={() => toggleFieldForRow(id, "grade")}
              title={allowGrade ? "Saving grade (click to stop saving for this class)" : "Not saving grade (click to save)"}
            />
            <span style={numValue}>{c.grade ?? ""}</span>
          </div>
        </td>

        <td style={td}>
          <div style={{ display: "inline-flex", gap: 5, alignItems: "center" }}>
            <AppleCheck
              checked={allowQuarter}
              onToggle={() => toggleFieldForRow(id, "quarter")}
              title={allowQuarter ? "Saving quarter (click to stop saving for this class)" : "Not saving quarter (click to save)"}
            />
            <span style={quarterValue}>{c.quarter ?? ""}</span>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{quarter}</div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: 70 }} />
            <col style={{ width: "auto" }} />
            <col style={{ width: 130 }} />
            <col style={{ width: 130 }} />
            <col style={{ width: 140 }} />
          </colgroup>

          <thead style={{ position: "sticky", top: 0, zIndex: 4 }}>
            <tr>
              <th style={{ ...th, position: "sticky", left: 0, zIndex: 5, width: 70, minWidth: 70, maxWidth: 70 }}>
                Select
              </th>
              <th style={th}>Class</th>
              <th style={th}>Credits</th>
              <th style={th}>Grade</th>
              <th style={th}>Quarter</th>
            </tr>
          </thead>

          <tbody>{sorted.map((c, i) => renderRow(c, i))}</tbody>
        </table>
      </div>
    </div>
  );
}

// Coordinates audit upload, parser review, and local course saving.
export default function AuditParse() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const isReuploadMode = searchParams.get("mode") === "reupload";

  const [checkingExistingAudit, setCheckingExistingAudit] = useState(true);

  const [courses, setCourses] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [search, setSearch] = useState("");
  const [manualOpen, setManualOpen] = useState(false);
  const [manualInitialRows, setManualInitialRows] = useState(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const [fieldDefault, setFieldDefault] = useState({
    credits: true,
    grade: true,
    quarter: true,
  });

  const [fieldOverrides, setFieldOverrides] = useState({});

  function handleSkipAudit() {
    localStorage.setItem("dismissCoursesPrompt", "1");
    navigate("/dashboard", { replace: true });
  }

  useEffect(() => {
    const unsubscribe = onLocalAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/");
        return;
      }

      try {
        if (
          !isReuploadMode &&
          localStorage.getItem("dismissCoursesPrompt") === "1"
        ) {
          navigate("/dashboard", { replace: true });
          return;
        }
        const hasCourses = await hasCurrentUserCourses();

        if (!isReuploadMode && hasCourses) {
          navigate("/dashboard", { replace: true });
          return;
        }

        setCheckingExistingAudit(false);
      } catch (e) {
        console.error("Failed to check audit status:", e);
        setCheckingExistingAudit(false);
      }
    });

    return () => unsubscribe();
  }, [navigate, isReuploadMode]);

  useEffect(() => {
    const s = new Set(courses.map(makeId));
    setSelectedIds(s);
    setFieldOverrides({});
  }, [courses]);

  const allCourseIds = useMemo(() => courses.map(makeId), [courses]);

  const filteredCourses = useMemo(() => {
    if (!search.trim()) return courses;

    return courses.filter((c) => {
      return (
        includesText(c.classCode, search) ||
        includesText(c.className, search) ||
        includesText(c.quarter, search) ||
        includesText(c.credits, search) ||
        includesText(c.grade, search)
      );
    });
  }, [courses, search]);

  const issueSummary = useMemo(() => {
    const all = courses.map((c) => getParseIssues(c)).filter((arr) => arr.length > 0);
    const counts = new Map();

    for (const arr of all) {
      for (const msg of arr) counts.set(msg, (counts.get(msg) ?? 0) + 1);
    }

    const top = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return { totalWithIssues: all.length, top };
  }, [courses]);

  const coursesToSave = useMemo(() => {
    return buildCoursesToSave({ courses, selectedIds, fieldDefault, fieldOverrides });
  }, [courses, selectedIds, fieldDefault, fieldOverrides]);

  const creditTotals = useMemo(() => {
    const selected = courses.filter((c) => selectedIds.has(makeId(c)));

    const asNum = (v) => (typeof v === "number" && Number.isFinite(v) ? v : Number(v));
    const isValidCredits = (c) => c.credits != null && Number.isFinite(asNum(c.credits));
    const creditsVal = (c) => asNum(c.credits);

    const countsTowardTotal = (c) => {
      if (!isValidCredits(c)) return false;
      if (creditsVal(c) <= 0) return false;
      if (String(c.grade ?? "").toUpperCase() === "RD") return false;
      return true;
    };

    const earned = selected
      .filter((c) => countsTowardTotal(c))
      .filter((c) => String(c.grade ?? "").toUpperCase() !== "IP")
      .reduce((sum, c) => sum + creditsVal(c), 0);

    const includingIP = selected
      .filter((c) => countsTowardTotal(c))
      .reduce((sum, c) => sum + creditsVal(c), 0);

    return { earned, includingIP };
  }, [courses, selectedIds]);

  const selectAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const c of filteredCourses) next.add(makeId(c));
      return next;
    });
  };

  const toggleFieldDefault = (field) => {
    setFieldDefault((prev) => {
      const nextVal = !prev[field];

      setFieldOverrides((ovPrev) => {
        const ovNext = { ...ovPrev };

        for (const id of allCourseIds) {
          if (!ovNext[id]) continue;
          const cur = { ...ovNext[id] };
          delete cur[field];
          ovNext[id] = cur;
        }

        return ovNext;
      });

      return { ...prev, [field]: nextVal };
    });
  };

  const openReAddModalForCourse = (c) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(makeId(c));
      return next;
    });

    const [subj, num] = String(c.classCode ?? "").split(/\s+/);

    setManualInitialRows([
      {
        subject: subj ?? "",
        number: num ?? "",
        className: c.className ?? "",
        credits: c.credits ?? "",
        grade: c.grade ?? "",
        quarter: c.quarter ?? "",
      },
    ]);

    setManualOpen(true);
  };

  const fileInputId = "audit-upload-input";

  if (checkingExistingAudit) {
    return <div style={{ padding: 24 }}>Checking audit status…</div>;
  }

  return (
    <div style={{ padding: 16, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ marginBottom: 6 }}>Upload your degree audit</h1>
        <p style={{ marginTop: 0, opacity: 0.75 }}>
          Upload your audit to personalize your roadmap with course-based skill insights.
          You can also skip this for now and upload it later.
        </p>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <input
          id={fileInputId}
          type="file"
          accept="application/pdf"
          style={{ display: "none" }}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const text = await extractPdfText(file);
            const parsed = parseCoursesFromDegreeAuditText(text);
            setCourses(parsed);

            e.target.value = "";
          }}
        />

        <label
          htmlFor={fileInputId}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.18)",
            background: "#4b2e83",
            color: "#f1eef5",
            fontWeight: 800,
            cursor: "pointer",
            userSelect: "none",
            boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
          }}
        >
          <span>Upload audit</span>
        </label>

        <button
          type="button"
          onClick={handleSkipAudit}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.18)",
            background: "white",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Skip for now
        </button>

        <input
          placeholder="Search: INFO, 4.0, WI25, DATA..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 10, minWidth: 360 }}
        />

        <button onClick={selectAllVisible}>Select all</button>

        <span style={{ opacity: 0.8 }} title={issueSummary.top.map(([k, v]) => `${k}: ${v}`).join("\n")}>
          Selected: {selectedIds.size} / {courses.length} • Visible: {filteredCourses.length}
          {" • "}
          Credits Found: {creditTotals.earned}
          {" • "}
          Credits Found (incl. IP/Planned): {creditTotals.includingIP}
          {" • "}
          Parse issues: {issueSummary.totalWithIssues}
          <br />
          <br />
          {`Parsing PDFs can result in errors. Please double check your total credits earned, 
             and re-add any mis-parsed classes. Some classes may be entirely missed, in this case
             add manually at the bottom.`}
        </span>
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontWeight: 700 }}>Select fields:</span>

        <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
          <AppleCheck checked={fieldDefault.credits} onToggle={() => toggleFieldDefault("credits")} />
          <span>Credits</span>
        </span>

        <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
          <AppleCheck checked={fieldDefault.grade} onToggle={() => toggleFieldDefault("grade")} />
          <span>Grade</span>
        </span>

        <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
          <AppleCheck checked={fieldDefault.quarter} onToggle={() => toggleFieldDefault("quarter")} />
          <span>Quarter</span>
        </span>
      </div>

      <QuarterGroups
        rows={filteredCourses}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        fieldDefault={fieldDefault}
        fieldOverrides={fieldOverrides}
        setFieldOverrides={setFieldOverrides}
        onReAdd={openReAddModalForCourse}
      />

      <div
        style={{
          position: "sticky",
          bottom: 0,
          marginTop: 16,
          paddingTop: 12,
          paddingBottom: 12,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(8px)",
          borderTop: "1px solid rgba(0,0,0,0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <button
          type="button"
          onClick={() => {
            setManualInitialRows(null);
            setManualOpen(true);
          }}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.18)",
            background: "white",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          + Add manually
        </button>

        <button
          type="button"
          onClick={() => {
            setSaveError(null);
            setSaveOpen(true);
          }}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid rgba(0, 120, 255, 0.45)",
            background: "rgba(0, 120, 255, 0.12)",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Save
        </button>
      </div>

      <ManualCourseModal
        open={manualOpen}
        initialRows={manualInitialRows}
        onClose={() => {
          setManualOpen(false);
          setManualInitialRows(null);
        }}
        onDone={(newCourses) => {
          setCourses((prev) => {
            const prevKeys = new Set(prev.map((c) => `${c.classCode}|${c.quarter ?? ""}`));
            const filtered = newCourses.filter((c) => !prevKeys.has(`${c.classCode}|${c.quarter ?? ""}`));
            return [...prev, ...filtered];
          });

          setManualOpen(false);
          setManualInitialRows(null);
        }}
      />

      <SaveCoursesModal
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        coursesToSave={coursesToSave}
        saving={saving}
        error={saveError}
        onConfirm={async () => {
          try {
            setSaving(true);
            setSaveError(null);

            if (!getCurrentUser()) throw new Error("Not signed in.");

            const res = await saveCoursesForCurrentUser(coursesToSave);
            console.log("Saved:", res);

            setSaveOpen(false);
            localStorage.removeItem("dismissCoursesPrompt");
            navigate("/dashboard", { replace: true });
          } catch (e) {
            setSaveError(e?.message ?? String(e));
          } finally {
            setSaving(false);
          }
        }}
      />
    </div>
  );
}
