import { HistoryItem, DailyUsage, LanguageOption } from "../types";

const MAX_DAILY_FREE_GENERATIONS = 10;
const STORAGE_KEY_USAGE = "ai_social_assistant_daily_usage";
const STORAGE_KEY_HISTORY = "ai_social_assistant_history";
const STORAGE_KEY_LANGUAGE = "postly_selected_app_language";

export function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split("T")[0]; // YYYY-MM-DD
}

export function getDailyUsage(): DailyUsage {
  const todayStr = getTodayDateString();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USAGE);
    if (raw) {
      const parsed: DailyUsage = JSON.parse(raw);
      if (parsed.date === todayStr) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading daily usage:", e);
  }
  // Reset for today
  const newUsage: DailyUsage = { date: todayStr, count: 0 };
  localStorage.setItem(STORAGE_KEY_USAGE, JSON.stringify(newUsage));
  return newUsage;
}

export function incrementDailyUsage(): DailyUsage {
  const current = getDailyUsage();
  const updated: DailyUsage = {
    date: current.date,
    count: current.count + 1,
  };
  try {
    localStorage.setItem(STORAGE_KEY_USAGE, JSON.stringify(updated));
  } catch (e) {
    console.error("Error updating daily usage:", e);
  }
  return updated;
}

export function isDailyLimitReached(): boolean {
  const usage = getDailyUsage();
  return usage.count >= MAX_DAILY_FREE_GENERATIONS;
}

export function getRemainingGenerations(): number {
  const usage = getDailyUsage();
  return Math.max(0, MAX_DAILY_FREE_GENERATIONS - usage.count);
}

export function getHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Error reading history:", e);
  }
  return [];
}

export function saveToHistory(item: Omit<HistoryItem, "id" | "date">): HistoryItem {
  const history = getHistory();
  const newItem: HistoryItem = {
    ...item,
    id: "hist_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
    date: new Date().toISOString(),
  };

  // Keep latest 50 items
  const updated = [newItem, ...history].slice(0, 50);
  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
  } catch (e) {
    console.error("Error saving history item:", e);
  }
  return newItem;
}

export function deleteHistoryItem(id: string): HistoryItem[] {
  const history = getHistory();
  const updated = history.filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
  } catch (e) {
    console.error("Error deleting history item:", e);
  }
  return updated;
}

export function clearAllHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_HISTORY);
  } catch (e) {
    console.error("Error clearing history:", e);
  }
}

export function getSavedLanguage(): LanguageOption {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LANGUAGE);
    if (raw === "english" || raw === "arabic" || raw === "urdu") {
      return raw as LanguageOption;
    }
  } catch (e) {
    console.error("Error reading saved language:", e);
  }
  return "urdu";
}

export function saveLanguage(lang: LanguageOption): void {
  try {
    localStorage.setItem(STORAGE_KEY_LANGUAGE, lang);
  } catch (e) {
    console.error("Error saving language:", e);
  }
}
