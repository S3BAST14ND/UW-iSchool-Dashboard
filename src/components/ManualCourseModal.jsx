import { useEffect, useMemo, useState } from "react";

function normalizeQuarter(q) {
    const s = String(q ?? "").trim().toUpperCase();
    if (!s) return "";
    if (s === "0000") return "0000";
    const m = s.match(/^(WI|SP|SU|AU|FA)\s?(\d{2})$/);
    if (!m) return s;
    return `${m[1]}${m[2]}`;
}

function normalizeSubject(s) {
    return String(s ?? "")
        .toUpperCase()
        .replace(/[^A-Z&\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function normalizeNumber(n) {
    return String(n ?? "")
        .toUpperCase()
        .replace(/[^0-9A-Z]/g, "")
        .trim();
}

function parseMaybeNumber(v) {
    if (v == null) return null;
    const s = String(v).trim();
    if (!s) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
}

function normalizeGrade(g) {
    const s = String(g ?? "").trim();
    if (!s) return null;
    const up = s.toUpperCase();
    if (/^(?:4\.0{1,2}|[0-3]\.\d{1,2})$/.test(up)) return Number(up);
    return up;
}

const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.32)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 9999,
};

const modalStyle = {
    width: "min(860px, 92vw)",
    maxHeight: "86vh",
    overflow: "auto",
    background: "white",
    borderRadius: 16,
    boxShadow: "0 18px 60px rgba(0,0,0,0.28)",
    border: "1px solid rgba(0,0,0,0.12)",
};

const inputStyle = {
    width: "100%",
    padding: 10,
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.18)",
    outline: "none",
};

// Lets users repair parser misses by entering normalized course rows manually.
export default function ManualCourseModal({
    open,
    onClose,
    onDone,
    quarterOptions: quarterOptionsProp,
    initialRows,
}) {
    const emptyRow = () => ({
        subject: "",
        number: "",
        className: "",
        credits: "",
        grade: "",
        quarter: "",
    });

    const [rows, setRows] = useState([emptyRow()]);
    const [touched, setTouched] = useState(false);

    const quarterOptions = useMemo(
        () =>
            quarterOptionsProp?.length
                ? quarterOptionsProp
                : ["WI26", "SP26", "SU26", "AU26", "FA26", "WI25", "SP25", "SU25", "AU25", "FA25", "0000"],
        [quarterOptionsProp]
    );

    useEffect(() => {
        if (!open) return;

        const emptyRow = () => ({
            subject: "",
            number: "",
            className: "",
            credits: "",
            grade: "",
            quarter: "",
        });
        setRows(
            Array.isArray(initialRows) && initialRows.length
                ? initialRows
                : [emptyRow()]
        );

        setTouched(false);

        const onKey = (e) => {
            if (e.key === "Escape") onClose?.();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose, initialRows]);

    if (!open) return null;

    const rowErrors = (r) => {
        const errs = [];
        const subj = normalizeSubject(r.subject);
        const num = normalizeNumber(r.number);
        const name = String(r.className ?? "").trim();
        const q = normalizeQuarter(r.quarter);
        const credits = parseMaybeNumber(r.credits);
        const grade = normalizeGrade(r.grade);

        if (!subj) errs.push("Subject required");
        if (!num) errs.push("Number required");
        if (!name) errs.push("Title required");
        if (!q) errs.push("Quarter required (use 0000 for transfer)");
        if (credits == null) errs.push("Credits required");
        if (grade == null) errs.push("Grade required (use IP/CR/etc)");

        if (credits != null && (credits < 0 || credits > 30)) errs.push("Credits look wrong");
        return errs;
    };

    const allErrors = rows.map(rowErrors);
    const hasAnyErrors = allErrors.some((e) => e.length > 0);

    const updateRow = (idx, patch) => {
        setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
    };

    const addAnother = () => setRows((prev) => [...prev, emptyRow()]);
    const removeRow = (idx) => setRows((prev) => prev.filter((_, i) => i !== idx));

    const handleDone = () => {
        setTouched(true);
        if (hasAnyErrors) return;

        const normalized = rows.map((r) => {
            const subject = normalizeSubject(r.subject);
            const number = normalizeNumber(r.number);
            return {
                classCode: `${subject} ${number}`.trim(),
                className: String(r.className ?? "").trim(),
                credits: parseMaybeNumber(r.credits),
                grade: normalizeGrade(r.grade),
                quarter: normalizeQuarter(r.quarter),
                _source: "manual",
            };
        });

        onDone?.(normalized);
    };

    return (
        <div style={overlayStyle} onMouseDown={onClose} role="dialog" aria-modal="true">
            <div style={modalStyle} onMouseDown={(e) => e.stopPropagation()}>
                <div style={{ padding: 16, borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                        <div>
                            <div style={{ fontSize: 18, fontWeight: 800 }}>Add courses manually</div>
                            <div style={{ marginTop: 4, fontSize: 13, opacity: 0.75 }}>
                                Add multiple courses with <b>+</b>. Use <b>0000</b> for transfer/unknown quarter.
                            </div>
                        </div>

                        <div style={{ display: "inline-flex", gap: 8 }}>
                            <button onClick={onClose} style={{ padding: "8px 10px" }}>
                                Cancel
                            </button>
                            <button onClick={handleDone} style={{ padding: "8px 12px", fontWeight: 700 }}>
                                Done
                            </button>
                        </div>
                    </div>
                </div>
                <div style={{ padding: 16 }}>
                    {rows.map((r, idx) => {
                        const errs = allErrors[idx];
                        const showErr = touched && errs.length > 0;

                        return (
                            <div
                                key={idx}
                                style={{
                                    border: "1px solid rgba(0,0,0,0.1)",
                                    borderRadius: 12,
                                    padding: 12,
                                    marginBottom: 12,
                                    background: showErr ? "rgba(255,149,0,0.06)" : "transparent",
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ fontWeight: 800, opacity: 0.85 }}>Course {idx + 1}</div>
                                    {rows.length > 1 && (
                                        <button onClick={() => removeRow(idx)} style={{ padding: "6px 10px" }}>
                                            Remove
                                        </button>
                                    )}
                                </div>

                                <div
                                    style={{
                                        marginTop: 10,
                                        display: "grid",
                                        gridTemplateColumns: "110px 110px 1fr 110px 110px 120px",
                                        gap: 10,
                                        alignItems: "end",
                                    }}
                                >
                                    <div>
                                        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 4 }}>Subject</div>
                                        <input
                                            value={r.subject}
                                            onChange={(e) => updateRow(idx, { subject: e.target.value })}
                                            placeholder="INFO"
                                            style={inputStyle}
                                        />
                                    </div>

                                    <div>
                                        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 4 }}>Number</div>
                                        <input
                                            value={r.number}
                                            onChange={(e) => updateRow(idx, { number: e.target.value })}
                                            placeholder="340"
                                            style={inputStyle}
                                        />
                                    </div>

                                    <div>
                                        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 4 }}>Title</div>
                                        <input
                                            value={r.className}
                                            onChange={(e) => updateRow(idx, { className: e.target.value })}
                                            placeholder="CLIENT-SIDE DEV"
                                            style={inputStyle}
                                        />
                                    </div>

                                    <div>
                                        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 4 }}>Credits</div>
                                        <input
                                            value={r.credits}
                                            onChange={(e) => updateRow(idx, { credits: e.target.value })}
                                            placeholder="5"
                                            style={inputStyle}
                                        />
                                    </div>

                                    <div>
                                        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 4 }}>Grade</div>
                                        <input
                                            value={r.grade}
                                            onChange={(e) => updateRow(idx, { grade: e.target.value })}
                                            placeholder="3.8 / IP / CR"
                                            style={inputStyle}
                                        />
                                    </div>

                                    <div>
                                        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 4 }}>Quarter</div>
                                        <input
                                            list="quarter-options"
                                            value={r.quarter}
                                            onChange={(e) => updateRow(idx, { quarter: e.target.value })}
                                            placeholder="WI26"
                                            style={inputStyle}
                                        />
                                        <datalist id="quarter-options">
                                            {quarterOptions.map((q) => (
                                                <option key={q} value={q} />
                                            ))}
                                        </datalist>
                                    </div>
                                </div>

                                {showErr && (
                                    <div style={{ marginTop: 10, fontSize: 12, color: "rgba(140,82,0,1)" }}>
                                        <div style={{ fontWeight: 800, marginBottom: 4 }}>Missing / invalid:</div>
                                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                                            {errs.map((e, i) => (
                                                <li key={i}>{e}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                        <button onClick={addAnother} style={{ padding: "8px 10px", fontWeight: 800 }}>
                            + Add another
                        </button>

                        {touched && hasAnyErrors && (
                            <div style={{ fontSize: 12, color: "rgba(140,82,0,1)" }}>
                                Fix the highlighted fields before clicking Done.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
