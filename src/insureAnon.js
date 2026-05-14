import { getCurrentUser, signInUw, signUpUw } from "./utils/localStore";

export async function ensureAnon() {
  const currentUser = getCurrentUser();
  if (currentUser) return currentUser;

  try {
    return await signUpUw("demo@uw.edu", "demo");
  } catch {
    return signInUw("demo@uw.edu", "demo");
  }
}
