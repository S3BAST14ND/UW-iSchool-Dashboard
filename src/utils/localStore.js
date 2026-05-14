const STORAGE_KEY = "info5DemoStore";
const listeners = new Set();

// Keeps the public demo self-contained by storing account and progress data in the browser.
function createEmptyStore() {
  return {
    currentUserId: null,
    users: {},
  };
}

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...createEmptyStore(), ...JSON.parse(raw) } : createEmptyStore();
  } catch {
    return createEmptyStore();
  }
}

function writeStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  notifyAuthListeners();
}

function makeUid(email) {
  return `demo-${email.replace(/[^a-z0-9]/gi, "-")}`;
}

function normalizeUwEmail(email) {
  const e = (email ?? "").trim().toLowerCase();
  if (!e.endsWith("@uw.edu")) throw new Error("Please use your @uw.edu email.");
  return e;
}

function publicUser(user) {
  if (!user) return null;

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || "",
  };
}

function getCurrentStoredUser(store = readStore()) {
  if (!store.currentUserId) return null;
  return store.users[store.currentUserId] || null;
}

function notifyAuthListeners() {
  const user = getCurrentUser();
  listeners.forEach((listener) => listener(user));
}

function requireCurrentUser(store = readStore()) {
  const user = getCurrentStoredUser(store);
  if (!user) throw new Error("Not signed in.");
  return user;
}

function nowIso() {
  return new Date().toISOString();
}

export function getCurrentUser() {
  return publicUser(getCurrentStoredUser());
}

export function onLocalAuthStateChanged(callback) {
  listeners.add(callback);
  callback(getCurrentUser());

  return () => {
    listeners.delete(callback);
  };
}

export async function signUpUw(email, password) {
  const normalizedEmail = normalizeUwEmail(email);
  if (!password) throw new Error("Please enter a password.");

  const store = readStore();
  const uid = makeUid(normalizedEmail);

  if (store.users[uid]) {
    throw new Error("A demo account already exists for this email. Sign in instead.");
  }

  const user = {
    uid,
    email: normalizedEmail,
    password,
    displayName: "",
    createdAt: nowIso(),
    lastLoginAt: nowIso(),
    quizAttempts: [],
    careerHistory: {},
    courses: {},
    progress: {
      roadmap: {
        completedSteps: [],
      },
    },
  };

  store.users[uid] = user;
  store.currentUserId = uid;
  writeStore(store);

  return publicUser(user);
}

export async function signInUw(email, password) {
  const normalizedEmail = normalizeUwEmail(email);
  const store = readStore();
  const uid = makeUid(normalizedEmail);
  const user = store.users[uid];

  if (!user || user.password !== password) {
    throw new Error("No local demo account matched that email and password.");
  }

  user.lastLoginAt = nowIso();
  store.currentUserId = uid;
  writeStore(store);

  return publicUser(user);
}

export async function logout() {
  const store = readStore();
  store.currentUserId = null;
  writeStore(store);
}

export async function updateCurrentUserProfile({ displayName }) {
  const store = readStore();
  const user = requireCurrentUser(store);
  user.displayName = displayName || "";
  writeStore(store);

  return publicUser(user);
}

export async function saveQuizAttempt({
  answersByQuestionId,
  rankedResults,
  quizScores,
  selectedCareerGoalId,
  selectionSource,
}) {
  const store = readStore();
  const user = requireCurrentUser(store);
  const createdAt = nowIso();

  user.quizAttempts.unshift({
    id: `quiz-${Date.now()}`,
    createdAt,
    answersByQuestionId,
    selectedCareerGoalId,
    selectionSource,
    quizScores,
    rankedResults,
  });

  user.careerHistory.latest = {
    careerId: selectedCareerGoalId,
    selectedAt: createdAt,
    selectionSource,
    quizScores,
  };

  writeStore(store);
}

export async function getLatestQuizAttempt() {
  const store = readStore();
  const user = requireCurrentUser(store);
  return user.quizAttempts?.[0] || null;
}

export async function saveCoursesForCurrentUser(coursesToSave) {
  const store = readStore();
  const user = requireCurrentUser(store);

  for (const course of coursesToSave) {
    user.courses[course.id] = {
      id: course.id,
      classCode: course.classCode,
      className: course.className,
      credits: course.credits ?? null,
      grade: course.grade ?? null,
      quarter: course.quarter ?? null,
      source: course.source ?? "degree_audit",
      createdAt: nowIso(),
    };
  }

  writeStore(store);

  return { uid: user.uid, count: coursesToSave.length };
}

export async function getCurrentUserCourses() {
  const store = readStore();
  const user = requireCurrentUser(store);
  return Object.values(user.courses || {});
}

export async function hasCurrentUserCourses() {
  const courses = await getCurrentUserCourses();
  return courses.length > 0;
}

export async function getRoadmapProgress() {
  const store = readStore();
  const user = requireCurrentUser(store);
  return user.progress?.roadmap?.completedSteps || [];
}

export async function saveRoadmapProgress(completedSteps) {
  const store = readStore();
  const user = requireCurrentUser(store);

  user.progress = {
    ...user.progress,
    roadmap: {
      completedSteps,
      updatedAt: nowIso(),
    },
  };

  writeStore(store);
}

export function resetLocalDemoStore() {
  localStorage.removeItem(STORAGE_KEY);
  notifyAuthListeners();
}
