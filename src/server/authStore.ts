import fs from "fs";
import path from "path";
import crypto from "crypto";
import { UserAccount, DailyUsage } from "../types";

export interface UserRecord extends UserAccount {
  passwordHash: string;
  passwordSalt: string;
  resetCode?: string;
  resetCodeExpires?: number;
}

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const TOKENS_FILE = path.join(DATA_DIR, "tokens.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error("Error creating data directory:", err);
  }
}

// In-memory cache + file sync
let usersStore: Map<string, UserRecord> = new Map(); // key: userId
let tokensStore: Map<string, string> = new Map(); // key: token, value: userId

function loadFromFiles() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, "utf-8");
      const list: UserRecord[] = JSON.parse(data);
      usersStore.clear();
      list.forEach((u) => usersStore.set(u.id, u));
    }
  } catch (e) {
    console.error("Error loading users file:", e);
  }

  try {
    if (fs.existsSync(TOKENS_FILE)) {
      const data = fs.readFileSync(TOKENS_FILE, "utf-8");
      const mapObj: Record<string, string> = JSON.parse(data);
      tokensStore.clear();
      Object.entries(mapObj).forEach(([k, v]) => tokensStore.set(k, v));
    }
  } catch (e) {
    console.error("Error loading tokens file:", e);
  }
}

function saveToFiles() {
  try {
    const userList = Array.from(usersStore.values());
    fs.writeFileSync(USERS_FILE, JSON.stringify(userList, null, 2), "utf-8");

    const tokensObj = Object.fromEntries(tokensStore.entries());
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokensObj, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving users/tokens to disk:", e);
  }
}

// Initial load
loadFromFiles();

export function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split("T")[0]; // YYYY-MM-DD
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

export function findUserByEmail(email: string): UserRecord | undefined {
  const cleanEmail = email.trim().toLowerCase();
  for (const user of usersStore.values()) {
    if (user.email.toLowerCase() === cleanEmail) {
      return user;
    }
  }
  return undefined;
}

export function registerUser(email: string, password: string, name?: string): { token: string; user: UserAccount } {
  const cleanEmail = email.trim().toLowerCase();
  if (findUserByEmail(cleanEmail)) {
    throw new Error("اس ای میل پر اکاؤنٹ پہلے سے موجود ہے۔ لاگ ان کریں۔");
  }

  if (password.length < 6) {
    throw new Error("پاس ورڈ کم از کم 6 حروف پر مشتمل ہونا چاہیے۔");
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPassword(password, salt);
  const userId = "usr_" + Date.now() + "_" + crypto.randomBytes(4).toString("hex");
  const todayStr = getTodayDateString();

  const userRecord: UserRecord = {
    id: userId,
    email: cleanEmail,
    name: name?.trim() || cleanEmail.split("@")[0] || "Islamic ChatGPT User",
    createdAt: new Date().toISOString(),
    plan: "FREE",
    dailyUsage: {
      date: todayStr,
      count: 0,
    },
    passwordHash,
    passwordSalt: salt,
  };

  usersStore.set(userId, userRecord);

  const token = "tok_" + crypto.randomBytes(24).toString("hex");
  tokensStore.set(token, userId);

  saveToFiles();

  const { passwordHash: _, passwordSalt: __, resetCode: ___, resetCodeExpires: ____, ...publicUser } = userRecord;
  return { token, user: publicUser };
}

export function loginUser(email: string, password: string): { token: string; user: UserAccount } {
  const user = findUserByEmail(email);
  if (!user) {
    throw new Error("ای میل یا پاس ورڈ غلط ہے۔");
  }

  const hash = hashPassword(password, user.passwordSalt);
  if (hash !== user.passwordHash) {
    throw new Error("ای میل یا پاس ورڈ غلط ہے۔");
  }

  // Ensure daily usage is fresh for today
  const todayStr = getTodayDateString();
  if (user.dailyUsage.date !== todayStr) {
    user.dailyUsage = { date: todayStr, count: 0 };
  }

  const token = "tok_" + crypto.randomBytes(24).toString("hex");
  tokensStore.set(token, user.id);

  saveToFiles();

  const { passwordHash: _, passwordSalt: __, resetCode: ___, resetCodeExpires: ____, ...publicUser } = user;
  return { token, user: publicUser };
}

export function getUserByToken(token: string): UserAccount | null {
  if (!token) return null;
  const userId = tokensStore.get(token);
  if (!userId) return null;

  const user = usersStore.get(userId);
  if (!user) return null;

  // Auto-reset daily limit if calendar day changed
  const todayStr = getTodayDateString();
  if (user.dailyUsage.date !== todayStr) {
    user.dailyUsage = { date: todayStr, count: 0 };
    saveToFiles();
  }

  const { passwordHash: _, passwordSalt: __, resetCode: ___, resetCodeExpires: ____, ...publicUser } = user;
  return publicUser;
}

export function incrementUserUsage(userId: string): DailyUsage {
  const user = usersStore.get(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const todayStr = getTodayDateString();
  if (user.dailyUsage.date !== todayStr) {
    user.dailyUsage = { date: todayStr, count: 0 };
  }

  user.dailyUsage.count += 1;
  saveToFiles();

  return user.dailyUsage;
}

export function logoutUser(token: string): boolean {
  if (tokensStore.has(token)) {
    tokensStore.delete(token);
    saveToFiles();
    return true;
  }
  return false;
}

export function requestForgotPassword(email: string): { success: boolean; resetCode: string } {
  const user = findUserByEmail(email);
  if (!user) {
    throw new Error("اس ای میل سے کوئی اکاؤنٹ رجسٹرڈ نہیں ہے۔");
  }

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetCode = resetCode;
  user.resetCodeExpires = Date.now() + 15 * 60 * 1000; // 15 mins
  saveToFiles();

  return { success: true, resetCode };
}

export function resetPasswordWithCode(email: string, code: string, newPassword: string): boolean {
  const user = findUserByEmail(email);
  if (!user) {
    throw new Error("اکاؤنٹ نہیں مل سکا۔");
  }

  if (!user.resetCode || user.resetCode !== code.trim()) {
    throw new Error("ری سیٹ کوڈ غلط ہے۔");
  }

  if (user.resetCodeExpires && Date.now() > user.resetCodeExpires) {
    throw new Error("ری سیٹ کوڈ کی مدت ختم ہو چکی ہے۔");
  }

  if (newPassword.length < 6) {
    throw new Error("نیا پاس ورڈ کم از کم 6 حروف کا ہونا چاہیے۔");
  }

  const newSalt = crypto.randomBytes(16).toString("hex");
  user.passwordHash = hashPassword(newPassword, newSalt);
  user.passwordSalt = newSalt;
  delete user.resetCode;
  delete user.resetCodeExpires;

  saveToFiles();
  return true;
}

export function loginOrRegisterGoogle(email: string, name?: string): { token: string; user: UserAccount } {
  let user = findUserByEmail(email);
  if (!user) {
    const salt = crypto.randomBytes(16).toString("hex");
    const dummyPasswordHash = hashPassword(crypto.randomBytes(16).toString("hex"), salt);
    const userId = "usr_g_" + Date.now() + "_" + crypto.randomBytes(4).toString("hex");
    const todayStr = getTodayDateString();

    user = {
      id: userId,
      email: email.trim().toLowerCase(),
      name: name || email.split("@")[0] || "Google User",
      createdAt: new Date().toISOString(),
      plan: "FREE",
      dailyUsage: { date: todayStr, count: 0 },
      passwordHash: dummyPasswordHash,
      passwordSalt: salt,
    };

    usersStore.set(userId, user);
  }

  const token = "tok_" + crypto.randomBytes(24).toString("hex");
  tokensStore.set(token, user.id);
  saveToFiles();

  const { passwordHash: _, passwordSalt: __, resetCode: ___, resetCodeExpires: ____, ...publicUser } = user;
  return { token, user: publicUser };
}
