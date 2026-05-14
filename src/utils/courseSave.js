import { saveCoursesForCurrentUser as saveLocalCoursesForCurrentUser } from "./localStore";

// Applies the user's field selections before courses are written to the demo store.
export function buildCoursesToSave({ courses, selectedIds, fieldDefault, fieldOverrides }) {
  const ALL_FIELDS = ["credits", "grade", "quarter"];

  const isFieldOn = (id, field) => {
    if (!selectedIds.has(id)) return false;
    const ov = fieldOverrides[id]?.[field];
    if (ov === true) return true;
    if (ov === false) return false;
    return !!fieldDefault[field];
  };

  const makeId = (c) => `${c.classCode}|${c.quarter ?? ""}`;

  return courses
    .filter((c) => selectedIds.has(makeId(c)))
    .map((c) => {
      const id = makeId(c);

      const out = {
        id,
        classCode: c.classCode ?? "",
        className: c.className ?? "",
        source: "degree_audit",
      };
      for (const f of ALL_FIELDS) {
        if (isFieldOn(id, f)) out[f] = c[f] ?? "";
      }

      return out;
    });
}

export async function saveCoursesForCurrentUser(coursesToSave) {
  return saveLocalCoursesForCurrentUser(coursesToSave);
}
