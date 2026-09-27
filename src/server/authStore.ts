import fs from "fs";
import path from "path";
import crypto from "crypto";
import { UserAccount, DailyUsage } from "../types";
import {
  connectToDatabase,
  isDatabaseConnected,
  dbSaveUser,
  dbGetAllUsers,
  dbSaveToken,
  dbDeleteToken,
  dbGetUserIdByToken,
  dbFindUserByEmail,
  dbFindUserById,
} from "./db/database";

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
    // Read-only filesystem on serverless
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
    // Ignore on serverless
  }

  try {
    if (fs.existsSync(TOKENS_FILE)) {
      const data = fs.readFileSync(TOKENS_FILE, "utf-8");
      const mapObj: Record<string, string> = JSON.parse(data);
      tokensStore.clear();
      Object.entries(mapObj).forEach(([k, v]) => tokensStore.set(k, v));
    }
  } catch (e) {
    // Ignore on serverless
  }
}

function saveToFiles() {
  try {
    const userList = Array.from(usersStore.values());
    fs.writeFileSync(USERS_FILE, JSON.stringify(userList, null, 2), "utf-8");

    const tokensObj = Object.fromEntries(tokensStore.entries());
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokensObj, null, 2), "utf-8");
  } catch (e) {
    // Ignore read-only errors on serverless
  }
}

// Initial load from local files
loadFromFiles();

// Sync from database if available
export async function syncFromDatabase() {
  if (!isDatabaseConnected()) {
    try {
      await connectToDatabase();
    } catch (_) {}
  }
  if (!isDatabaseConnected()) return;
  try {
    const dbUsers = await dbGetAllUsers();
    for (const u of dbUsers) {
      if (u.id) {
        usersStore.set(u.id, u as UserRecord);
      }
    }
  } catch (err) {
    console.warn("Error syncing users from DB:", err);
  }
}

// Auto-connect to database on startup
connectToDatabase()
  .then((res) => {
    if (res.success) {
      syncFromDatabase();
    }
  })
  .catch((err) => {
    console.warn("Database connection check on startup:", err?.message || err);
  });

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

export async function registerUser(email: string, password: string, name?: string): Promise<{ token: string; user: UserAccount }> {
  const cleanEmail = email.trim().toLowerCase();

  let existing = findUserByEmail(cleanEmail);
  if (!existing) {
    if (!isDatabaseConnected()) {
      try { await connectToDatabase(); } catch (_) {}
    }
    if (isDatabaseConnected()) {
      const dbU = await dbFindUserByEmail(cleanEmail);
      if (dbU) {
        existing = dbU as UserRecord;
        usersStore.set(existing.id, existing);
      }
    }
  }

  if (existing) {
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

  // Persist to MongoDB with await so serverless does not freeze before writing
  if (!isDatabaseConnected()) {
    try { await connectToDatabase(); } catch (_) {}
  }
  if (isDatabaseConnected()) {
    try {
      await dbSaveUser(userRecord);
      await dbSaveToken(token, userId);
    } catch (dbErr) {
      console.error("registerUser db save error:", dbErr);
    }
  }

  const { passwordHash: _, passwordSalt: __, resetCode: ___, resetCodeExpires: ____, ...publicUser } = userRecord;
  return { token, user: publicUser };
}

export async function loginUser(email: string, password: string): Promise<{ token: string; user: UserAccount }> {
  const cleanEmail = email.trim().toLowerCase();
  let user = findUserByEmail(cleanEmail);

  if (!user) {
    if (!isDatabaseConnected()) {
      try { await connectToDatabase(); } catch (_) {}
    }
    if (isDatabaseConnected()) {
      const dbU = await dbFindUserByEmail(cleanEmail);
      if (dbU) {
        user = dbU as UserRecord;
        usersStore.set(user.id, user);
      }
    }
  }

  if (!user) {
    throw new Error("ای میل یا پاس ورڈ غلط ہے۔");
  }

  const hash = hashPassword(password, user.passwordSalt);
  if (hash !== user.passwordHash) {
    throw new Error("ای میل یا پاس ورڈ غلط ہے۔");
  }

  // Ensure daily usage is fresh for today
  const todayStr = getTodayDateString();
  if (!user.dailyUsage || user.dailyUsage.date !== todayStr) {
    user.dailyUsage = { date: todayStr, count: 0 };
  }

  const token = "tok_" + crypto.randomBytes(24).toString("hex");
  tokensStore.set(token, user.id);

  saveToFiles();

  // Persist to MongoDB with await
  if (!isDatabaseConnected()) {
    try { await connectToDatabase(); } catch (_) {}
  }
  if (isDatabaseConnected()) {
    try {
      await dbSaveUser(user);
      await dbSaveToken(token, user.id);
    } catch (dbErr) {
      console.error("loginUser db save error:", dbErr);
    }
  }

  const { passwordHash: _, passwordSalt: __, resetCode: ___, resetCodeExpires: ____, ...publicUser } = user;
  return { token, user: publicUser };
}

export async function getUserByToken(token: string): Promise<UserAccount | null> {
  if (!token) return null;

  let userId = tokensStore.get(token);
  if (!userId) {
    if (!isDatabaseConnected()) {
      try { await connectToDatabase(); } catch (_) {}
    }
    if (isDatabaseConnected()) {
      userId = (await dbGetUserIdByToken(token)) || undefined;
      if (userId) {
        tokensStore.set(token, userId);
      }
    }
  }

  if (!userId) return null;

  let user = usersStore.get(userId);
  if (!user) {
    if (!isDatabaseConnected()) {
      try { await connectToDatabase(); } catch (_) {}
    }
    if (isDatabaseConnected()) {
      const dbU = await dbFindUserById(userId);
      if (dbU) {
        user = dbU as UserRecord;
        usersStore.set(userId, user);
      }
    }
  }

  if (!user) return null;

  // Auto-reset daily limit if calendar day changed
  const todayStr = getTodayDateString();
  if (!user.dailyUsage || user.dailyUsage.date !== todayStr) {
    user.dailyUsage = { date: todayStr, count: 0 };
    saveToFiles();
    if (isDatabaseConnected()) {
      await dbSaveUser(user);
    }
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
  if (!user.dailyUsage || user.dailyUsage.date !== todayStr) {
    user.dailyUsage = { date: todayStr, count: 0 };
  }

  user.dailyUsage.count += 1;
  saveToFiles();
  dbSaveUser(user);

  return user.dailyUsage;
}

export function logoutUser(token: string): boolean {
  if (tokensStore.has(token)) {
    tokensStore.delete(token);
    saveToFiles();
    dbDeleteToken(token);
    return true;
  }
  return false;
}

export async function requestForgotPassword(email: string): Promise<{ success: boolean; resetCode: string }> {
  const cleanEmail = email.trim().toLowerCase();
  let user = findUserByEmail(cleanEmail);
  if (!user && isDatabaseConnected()) {
    const dbU = await dbFindUserByEmail(cleanEmail);
    if (dbU) {
      user = dbU as UserRecord;
      usersStore.set(user.id, user);
    }
  }

  if (!user) {
    throw new Error("اس ای میل سے کوئی اکاؤنٹ رجسٹرڈ نہیں ہے۔");
  }

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetCode = resetCode;
  user.resetCodeExpires = Date.now() + 15 * 60 * 1000; // 15 mins
  saveToFiles();
  if (isDatabaseConnected()) {
    await dbSaveUser(user);
  }

  return { success: true, resetCode };
}

export async function resetPasswordWithCode(email: string, code: string, newPassword: string): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();
  let user = findUserByEmail(cleanEmail);
  if (!user && isDatabaseConnected()) {
    const dbU = await dbFindUserByEmail(cleanEmail);
    if (dbU) {
      user = dbU as UserRecord;
      usersStore.set(user.id, user);
    }
  }

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
  if (isDatabaseConnected()) {
    await dbSaveUser(user);
  }
  return true;
}

export async function loginOrRegisterGoogle(email: string, name?: string): Promise<{ token: string; user: UserAccount }> {
  const cleanEmail = email.trim().toLowerCase();
  let user = findUserByEmail(cleanEmail);

  if (!user) {
    if (!isDatabaseConnected()) {
      try { await connectToDatabase(); } catch (_) {}
    }
    if (isDatabaseConnected()) {
      const dbU = await dbFindUserByEmail(cleanEmail);
      if (dbU) {
        user = dbU as UserRecord;
        usersStore.set(user.id, user);
      }
    }
  }

  const todayStr = getTodayDateString();

  if (!user) {
    const salt = crypto.randomBytes(16).toString("hex");
    const dummyPasswordHash = hashPassword(crypto.randomBytes(16).toString("hex"), salt);
    const userId = "usr_g_" + Date.now() + "_" + crypto.randomBytes(4).toString("hex");

    user = {
      id: userId,
      email: cleanEmail,
      name: name || cleanEmail.split("@")[0] || "Google User",
      createdAt: new Date().toISOString(),
      plan: "FREE",
      dailyUsage: { date: todayStr, count: 0 },
      passwordHash: dummyPasswordHash,
      passwordSalt: salt,
    };

    usersStore.set(userId, user);
  } else {
    if (user.dailyUsage && user.dailyUsage.date !== todayStr) {
      user.dailyUsage = { date: todayStr, count: 0 };
    }
  }

  const token = "tok_" + crypto.randomBytes(24).toString("hex");
  tokensStore.set(token, user.id);
  saveToFiles();

  if (!isDatabaseConnected()) {
    try { await connectToDatabase(); } catch (_) {}
  }
  if (isDatabaseConnected()) {
    await dbSaveUser(user);
    await dbSaveToken(token, user.id);
  }

  const { passwordHash: _, passwordSalt: __, resetCode: ___, resetCodeExpires: ____, ...publicUser } = user;
  return { token, user: publicUser };
}

export async function getAllUsers(): Promise<UserAccount[]> {
  loadFromFiles();
  if (!isDatabaseConnected()) {
    try {
      await connectToDatabase();
    } catch (_) {}
  }
  if (isDatabaseConnected()) {
    try {
      const dbUsers = await dbGetAllUsers();
      for (const u of dbUsers) {
        if (u.id) {
          usersStore.set(u.id, u as UserRecord);
        }
      }
    } catch (e) {
      console.warn("getAllUsers db sync error:", e);
    }
  }
  return Array.from(usersStore.values()).map((u) => {
    const { passwordHash: _, passwordSalt: __, resetCode: ___, resetCodeExpires: ____, ...publicUser } = u;
    return publicUser;
  });
}

export async function syncExternalUser(user: Partial<UserAccount>): Promise<UserAccount> {
  loadFromFiles();
  const cleanEmail = (user.email || "").trim().toLowerCase();
  if (!cleanEmail) {
    throw new Error("Email is required");
  }

  let existing = findUserByEmail(cleanEmail);
  if (!existing) {
    if (!isDatabaseConnected()) {
      try { await connectToDatabase(); } catch (_) {}
    }
    if (isDatabaseConnected()) {
      const dbU = await dbFindUserByEmail(cleanEmail);
      if (dbU) {
        existing = dbU as UserRecord;
        usersStore.set(existing.id, existing);
      }
    }
  }

  const todayStr = getTodayDateString();

  if (existing) {
    if (user.name && user.name.trim() && existing.name !== user.name.trim()) {
      existing.name = user.name.trim();
    }
    saveToFiles();
    if (!isDatabaseConnected()) {
      try { await connectToDatabase(); } catch (_) {}
    }
    if (isDatabaseConnected()) {
      await dbSaveUser(existing);
    }
    const { passwordHash: _, passwordSalt: __, resetCode: ___, resetCodeExpires: ____, ...publicUser } = existing;
    return publicUser;
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const dummyPasswordHash = hashPassword(crypto.randomBytes(16).toString("hex"), salt);
  const userId = user.id || "usr_sync_" + Date.now() + "_" + crypto.randomBytes(4).toString("hex");

  const newUser: UserRecord = {
    id: userId,
    email: cleanEmail,
    name: user.name || cleanEmail.split("@")[0] || "Islamic ChatGPT User",
    createdAt: user.createdAt || new Date().toISOString(),
    plan: user.plan || "FREE",
    dailyUsage: user.dailyUsage || { date: todayStr, count: 0 },
    passwordHash: dummyPasswordHash,
    passwordSalt: salt,
  };

  usersStore.set(userId, newUser);
  saveToFiles();

  if (!isDatabaseConnected()) {
    try { await connectToDatabase(); } catch (_) {}
  }
  if (isDatabaseConnected()) {
    await dbSaveUser(newUser);
  }

  const { passwordHash: _, passwordSalt: __, resetCode: ___, resetCodeExpires: ____, ...publicUser } = newUser;
  return publicUser;
}
