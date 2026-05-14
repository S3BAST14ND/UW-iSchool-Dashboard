import { useMemo } from "react";

export default function SaveCoursesModal({ open, onClose, onConfirm, coursesToSave, saving, error }) {
    const totals = useMemo(() => {
        const asNum = (v) => (typeof v === "number" && Number.isFinite(v) ? v : Number(v));
        const credits = coursesToSave
            .map((c) => asNum(c.credits))
            .filter((n) => Number.isFinite(n) && n > 0)
            .reduce((a, b) => a + b, 0);
        return { credits };
    }, [coursesToSave]);

    if (!open) return null;

    function quarterSortKey(q) {
        if (!q) return 0;
        const m = String(q).toUpperCase().match(/^(WI|SP|SU|AU|FA)(\d{2})$/);
        if (!m) return 0;
        const termOrder = { WI: 1, SP: 2, SU: 3, AU: 4, FA: 4 };
        const year = 2000 + Number(m[2]);
        return year * 10 + (termOrder[m[1]] ?? 0);
    }

    return (
        <div
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
                zIndex: 9999,
            }}
        >
            <div
                style={{
                    width: "min(900px, 96vw)",
                    maxHeight: "80vh",
                    overflow: "hidden",
                    borderRadius: 14,
                    background: "white",
                    border: "1px solid rgba(0,0,0,0.12)",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
                }}
            >
                <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                    <div style={{ fontWeight: 900, fontSize: 16 }}>Save classes</div>
                    <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8 }}>
                        You’re about to save <b>{coursesToSave.length}</b> classes{" "}
                        {totals.credits ? (
                            <>
                                (≈ <b>{totals.credits}</b> credits)
                            </>
                        ) : null}
                        .
                    </div>
                </div>

                <div style={{ padding: 16, overflow: "auto", maxHeight: "55vh" }}>
                    {coursesToSave.length === 0 ? (
                        <div style={{ opacity: 0.75 }}>No classes selected to save.</div>
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ textAlign: "left", borderBottom: "2px solid #eee" }}>
                                    <th style={{ padding: "8px 10px" }}>Class</th>
                                    <th style={{ padding: "8px 10px" }}>Code</th>
                                    <th style={{ padding: "8px 10px" }}>Credits</th>
                                    <th style={{ padding: "8px 10px" }}>Grade</th>
                                    <th style={{ padding: "8px 10px" }}>Quarter</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...coursesToSave]
                                    .sort((a, b) => quarterSortKey(a.quarter) - quarterSortKey(b.quarter))
                                    .map((c) => (<tr key={c.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                                        <td style={{ padding: "8px 10px" }}>{c.className}</td>
                                        <td style={{ padding: "8px 10px", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}>
                                            {c.classCode}
                                        </td>
                                        <td style={{ padding: "8px 10px" }}>{c.credits ?? ""}</td>
                                        <td style={{ padding: "8px 10px" }}>{c.grade ?? ""}</td>
                                        <td style={{ padding: "8px 10px" }}>{c.quarter ?? ""}</td>
                                    </tr>
                                    ))}
                            </tbody>
                        </table>
                    )}

                    {error ? (
                        <div style={{ marginTop: 12, color: "rgba(180,0,0,0.9)", fontSize: 13 }}>
                            {String(error)}
                        </div>
                    ) : null}
                </div>

                <div
                    style={{
                        padding: 16,
                        borderTop: "1px solid rgba(0,0,0,0.08)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                    }}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        style={{
                            padding: "10px 12px",
                            borderRadius: 10,
                            border: "1px solid rgba(0,0,0,0.18)",
                            background: "white",
                            fontWeight: 800,
                            cursor: saving ? "not-allowed" : "pointer",
                            opacity: saving ? 0.65 : 1,
                        }}
                    >
                        Continue editing
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={saving || coursesToSave.length === 0}
                        style={{
                            padding: "10px 14px",
                            borderRadius: 10,
                            border: "1px solid rgba(0, 120, 255, 0.45)",
                            background: "rgba(0, 120, 255, 0.12)",
                            fontWeight: 900,
                            cursor: saving || coursesToSave.length === 0 ? "not-allowed" : "pointer",
                            opacity: saving || coursesToSave.length === 0 ? 0.6 : 1,
                        }}
                    >
                        {saving ? "Saving..." : "Confirm & save"}
                    </button>
                </div>
            </div>
        </div>
    );
}