import { UserAccount } from "../types";

export const ADMIN_EMAILS = [
  "hafizabrar1234567@gmail.com",
];

export function checkIsAdmin(user?: UserAccount | null): boolean {
  // 1. Direct email check from currentUser object
  if (user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase().trim())) {
    return true;
  }

  // 2. Plan or role check
  if ((user as any)?.role === "admin" || user?.plan === "admin") {
    return true;
  }

  // 3. Client-side localStorage admin unlock check
  if (typeof window !== "undefined") {
    if (localStorage.getItem("admin_session_unlocked") === "true") {
      return true;
    }

    try {
      const stored = localStorage.getItem("auth_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.email && ADMIN_EMAILS.includes(parsed.email.toLowerCase().trim())) {
          return true;
        }
      }
    } catch {}
  }

  return false;
}
