import { UserAccount, DailyUsage } from "../types";

const LOCAL_USERS_KEY = "postly_local_users_db";
const LOCAL_CURRENT_USER_KEY = "postly_current_user_account";

export function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

interface StoredLocalUser extends UserAccount {
  password?: string;
}

function getStoredUsers(): StoredLocalUser[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredLocalUser[]) {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error("Error saving local users:", e);
  }
}

export function saveLocalSession(token: string, user: UserAccount) {
  try {
    localStorage.setItem("postly_auth_token", token);
    localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error("Error saving local session:", e);
  }
}

export function getLocalUserFromSession(): UserAccount | null {
  try {
    const raw = localStorage.getItem(LOCAL_CURRENT_USER_KEY);
    if (!raw) return null;
    const user: UserAccount = JSON.parse(raw);
    const todayStr = getTodayDateString();
    if (user.dailyUsage.date !== todayStr) {
      user.dailyUsage = { date: todayStr, count: 0 };
      localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(user));
    }
    return user;
  } catch {
    return null;
  }
}

export function clearLocalSession() {
  localStorage.removeItem("postly_auth_token");
  localStorage.removeItem(LOCAL_CURRENT_USER_KEY);
}

export function localGoogleLogin(emailInput: string, nameInput?: string): { token: string; user: UserAccount } {
  const cleanEmail = (emailInput || "").trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    throw new Error("براہ کرم اپنا درست جی میل (Gmail) ایڈریس درج کریں۔");
  }

  // Derive dynamic formatted name if name not provided (e.g. "ali.khan@gmail.com" -> "Ali Khan")
  let derivedName = cleanEmail.split("@")[0] || "Google User";
  derivedName = derivedName.replace(/[._-]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

  const name = nameInput?.trim() || derivedName;
  
  const users = getStoredUsers();
  let user = users.find((u) => u.email.toLowerCase() === cleanEmail);
  const todayStr = getTodayDateString();

  if (!user) {
    user = {
      id: "usr_local_g_" + Date.now(),
      email: cleanEmail,
      name,
      createdAt: new Date().toISOString(),
      plan: "FREE",
      dailyUsage: { date: todayStr, count: 0 },
    };
    users.push(user);
    saveStoredUsers(users);
  } else {
    // If user exists, update name if user provided a new name
    if (nameInput?.trim() && user.name !== nameInput.trim()) {
      user.name = nameInput.trim();
    }
    if (user.dailyUsage.date !== todayStr) {
      user.dailyUsage = { date: todayStr, count: 0 };
    }
    saveStoredUsers(users);
  }

  const token = "tok_local_" + Date.now();
  saveLocalSession(token, user);
  return { token, user };
}

export function localRegister(email: string, password: string, name?: string): { token: string; user: UserAccount } {
  const cleanEmail = email.trim().toLowerCase();
  const users = getStoredUsers();

  if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    throw new Error("اس ای میل پر اکاؤنٹ پہلے سے موجود ہے۔ لاگ ان کریں۔");
  }

  const todayStr = getTodayDateString();
  const newUser: StoredLocalUser = {
    id: "usr_local_" + Date.now(),
    email: cleanEmail,
    name: name?.trim() || cleanEmail.split("@")[0] || "Islamic ChatGPT User",
    createdAt: new Date().toISOString(),
    plan: "FREE",
    dailyUsage: { date: todayStr, count: 0 },
    password,
  };

  users.push(newUser);
  saveStoredUsers(users);

  const token = "tok_local_" + Date.now();
  const { password: _, ...publicUser } = newUser;
  saveLocalSession(token, publicUser);
  return { token, user: publicUser };
}

export function localLogin(email: string, password: string): { token: string; user: UserAccount } {
  const cleanEmail = email.trim().toLowerCase();
  const users = getStoredUsers();
  const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user || user.password !== password) {
    throw new Error("ای میل یا پاس ورڈ غلط ہے۔");
  }

  const todayStr = getTodayDateString();
  if (user.dailyUsage.date !== todayStr) {
    user.dailyUsage = { date: todayStr, count: 0 };
    saveStoredUsers(users);
  }

  const token = "tok_local_" + Date.now();
  const { password: _, ...publicUser } = user;
  saveLocalSession(token, publicUser);
  return { token, user: publicUser };
}

export function localIncrementUsage(): DailyUsage {
  const user = getLocalUserFromSession();
  const todayStr = getTodayDateString();

  if (!user) {
    return { date: todayStr, count: 1 };
  }

  if (user.dailyUsage.date !== todayStr) {
    user.dailyUsage = { date: todayStr, count: 0 };
  }

  user.dailyUsage.count += 1;
  saveLocalSession(localStorage.getItem("postly_auth_token") || "tok_local", user);
  return user.dailyUsage;
}
