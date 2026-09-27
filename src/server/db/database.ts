import { MongoClient, Db, Collection } from "mongodb";
import fs from "fs";
import path from "path";
import dns from "dns";
import dotenv from "dotenv";
import { UserAccount } from "../../types";

dotenv.config();

export interface DBUserRecord extends UserAccount {
  passwordHash: string;
  passwordSalt: string;
  resetCode?: string;
  resetCodeExpires?: number;
  lastLoginAt?: string;
}

export interface DBTokenRecord {
  token: string;
  userId: string;
  createdAt: string;
}

export interface DatabaseStatus {
  connected: boolean;
  type: "mongodb" | "file";
  databaseName?: string;
  totalUsers: number;
  message: string;
}

let client: MongoClient | null = null;
let db: Db | null = null;
let usersCollection: Collection<DBUserRecord> | null = null;
let tokensCollection: Collection<DBTokenRecord> | null = null;
let isConnected = false;
let connectionError: string | null = null;

export function getDatabaseStatus(): DatabaseStatus {
  return {
    connected: isConnected,
    type: isConnected ? "mongodb" : "file",
    databaseName: db?.databaseName,
    totalUsers: 0,
    message: isConnected
      ? `🟢 کلاؤڈ ڈیٹا بیس (MongoDB Atlas) کامیابی سے منسلک ہے [${db?.databaseName || "islamic_chatgpt"}]`
      : connectionError
      ? `⚠️ ڈیٹا بیس سے رابطہ نہیں ہو سکا (${connectionError}) - مقامی فائل اسٹوریج فعال ہے`
      : "🟡 مقامی فائل اسٹوریج موڈ فعال ہے۔ آپ ایڈمن سیٹنگز میں کلاؤڈ ڈیٹا بیس (MongoDB) کا لنک درج کر سکتے ہیں۔",
  };
}

export function isDatabaseConnected(): boolean {
  return isConnected;
}

const DEFAULT_MONGODB_URI = "mongodb+srv://hafizabrar1234567_db_user:8i2GWE9QohuzYNAZ@cluster0.jbsr6hz.mongodb.net/islamic_chatgpt?retryWrites=true&w=majority&appName=Cluster0";

export async function connectToDatabase(customUri?: string): Promise<{ success: boolean; message: string }> {
  const uri = customUri || process.env.MONGODB_URI || process.env.DATABASE_URL || DEFAULT_MONGODB_URI;

  if (!uri || typeof uri !== "string" || !uri.trim()) {
    isConnected = false;
    connectionError = null;
    return {
      success: false,
      message: "کوئی MongoDB کنکشن اسٹرنگ موجود نہیں ہے۔ مقامی فائل اسٹوریج استعمال ہو رہا ہے۔",
    };
  }

  const cleanUri = uri.trim();

  // If already connected to the same URI, skip reconnecting
  if (!customUri && isConnected && client && db) {
    return {
      success: true,
      message: "MongoDB ڈیٹا بیس پہلے سے منسلک ہے۔",
    };
  }

  try {
    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    if (!isServerless && process.platform === "win32") {
      try {
        dns.setServers(["8.8.8.8", "1.1.1.1"]);
      } catch (_) {}
    }

    if (client) {
      try {
        await client.close();
      } catch (_) {}
      client = null;
      db = null;
      usersCollection = null;
      tokensCollection = null;
    }

    const newClient = new MongoClient(cleanUri, {
      connectTimeoutMS: 20000,
      serverSelectionTimeoutMS: 20000,
      tls: true,
      tlsAllowInvalidCertificates: process.platform === "win32" && !isServerless,
    });

    await newClient.connect();

    // Verify connection by pinging admin
    await newClient.db("admin").command({ ping: 1 });

    client = newClient;
    db = client.db("islamic_chatgpt");
    usersCollection = db.collection<DBUserRecord>("users");
    tokensCollection = db.collection<DBTokenRecord>("tokens");

    // Ensure unique indexes
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex({ id: 1 }, { unique: true });
    await tokensCollection.createIndex({ token: 1 }, { unique: true });

    isConnected = true;
    connectionError = null;

    console.log("✅ Successfully connected to MongoDB Atlas database:", db.databaseName);

    // Initial sync from local JSON files if DB is empty
    await syncLocalFilesToDatabase();

    return {
      success: true,
      message: "MongoDB ڈیٹا بیس کامیابی سے منسلک ہو گیا ہے اور تصدیق مکمل ہو چکی ہے۔",
    };
  } catch (err: any) {
    isConnected = false;
    connectionError = err?.message || String(err);
    console.warn("⚠️ Failed to connect to MongoDB:", connectionError);
    return {
      success: false,
      message: `ڈیٹا بیس کنکشن ناکام رہا: ${connectionError}`,
    };
  }
}

// Sync existing users from local users.json to MongoDB
async function syncLocalFilesToDatabase() {
  if (!usersCollection || !tokensCollection) return;

  try {
    const dataDir = path.join(process.cwd(), "data");
    const usersFile = path.join(dataDir, "users.json");
    const tokensFile = path.join(dataDir, "tokens.json");

    if (fs.existsSync(usersFile)) {
      const content = fs.readFileSync(usersFile, "utf-8");
      const list: DBUserRecord[] = JSON.parse(content);
      for (const u of list) {
        if (u.email) {
          await usersCollection.updateOne(
            { email: u.email.toLowerCase().trim() },
            { $set: u },
            { upsert: true }
          );
        }
      }
      console.log(`📦 Synced ${list.length} local users to MongoDB collection`);
    }

    if (fs.existsSync(tokensFile)) {
      const content = fs.readFileSync(tokensFile, "utf-8");
      const mapObj: Record<string, string> = JSON.parse(content);
      for (const [tok, uid] of Object.entries(mapObj)) {
        await tokensCollection.updateOne(
          { token: tok },
          { $set: { token: tok, userId: uid, createdAt: new Date().toISOString() } },
          { upsert: true }
        );
      }
    }
  } catch (err) {
    console.warn("Error during local to DB sync:", err);
  }
}

// ----------------------------------------------------
// DATABASE CRUD OPERATIONS (WITH ASYNC PERSISTENCE)
// ----------------------------------------------------

export async function dbFindUserByEmail(email: string): Promise<DBUserRecord | null> {
  if (!isConnected || !usersCollection) return null;
  try {
    return await usersCollection.findOne({ email: email.toLowerCase().trim() });
  } catch (e) {
    console.error("dbFindUserByEmail error:", e);
    return null;
  }
}

export async function dbFindUserById(id: string): Promise<DBUserRecord | null> {
  if (!isConnected || !usersCollection) return null;
  try {
    return await usersCollection.findOne({ id });
  } catch (e) {
    console.error("dbFindUserById error:", e);
    return null;
  }
}

export async function dbSaveUser(user: DBUserRecord): Promise<void> {
  if (!isConnected || !usersCollection) return;
  try {
    await usersCollection.updateOne(
      { email: user.email.toLowerCase().trim() },
      { $set: user },
      { upsert: true }
    );
  } catch (e) {
    console.error("dbSaveUser error:", e);
  }
}

export async function dbGetAllUsers(): Promise<DBUserRecord[]> {
  if (!isConnected || !usersCollection) return [];
  try {
    return await usersCollection.find({}).toArray();
  } catch (e) {
    console.error("dbGetAllUsers error:", e);
    return [];
  }
}

export async function dbSaveToken(token: string, userId: string): Promise<void> {
  if (!isConnected || !tokensCollection) return;
  try {
    await tokensCollection.updateOne(
      { token },
      { $set: { token, userId, createdAt: new Date().toISOString() } },
      { upsert: true }
    );
  } catch (e) {
    console.error("dbSaveToken error:", e);
  }
}

export async function dbGetUserIdByToken(token: string): Promise<string | null> {
  if (!isConnected || !tokensCollection) return null;
  try {
    const record = await tokensCollection.findOne({ token });
    return record?.userId || null;
  } catch (e) {
    console.error("dbGetUserIdByToken error:", e);
    return null;
  }
}

export async function dbDeleteToken(token: string): Promise<void> {
  if (!isConnected || !tokensCollection) return;
  try {
    await tokensCollection.deleteOne({ token });
  } catch (e) {
    console.error("dbDeleteToken error:", e);
  }
}
