export type LanguageOption = "urdu" | "english" | "arabic" | "roman_urdu";

export interface Citation {
  bookTitle: string;
  chapter?: string;
  pageNumber?: number;
  snippet: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  citations?: Citation[];
  hasBookContext?: boolean;
  isAI?: boolean;
  isLoading?: boolean;
  intent?: string;
  data?: any;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  bookFilter?: string | null;
}

export interface BookRecord {
  id: string;
  title: string;
  author?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  chunkCount: number;
  status: "indexed" | "processing" | "error";
  description?: string;
}

export interface DailyUsage {
  count: number;
  lastResetDate?: string;
  date?: string;
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  plan?: string;
  createdAt?: string;
  dailyUsage: DailyUsage;
}

// Supporting / Legacy types for complete build compatibility
export type FeatureType =
  | "create_everything"
  | "image_caption"
  | "reel_script"
  | "hashtags"
  | "whatsapp_status"
  | "social_post"
  | "daily_ideas"
  | "logo_design"
  | "islamic_qa";

export type StyleOption =
  | "simple"
  | "stylish"
  | "emotional"
  | "motivational"
  | "islamic"
  | "funny"
  | "professional"
  | "attitude";

export type ScreenTab = "home" | "create" | "ideas" | "history" | "profile";
export type SocialPostMode = "visual_post" | "caption_only" | "multi_platform" | "text_only";

export interface GeneratePayload {
  featureType: FeatureType;
  topic?: string;
  imageBase64?: string | null;
  language?: LanguageOption;
  style?: StyleOption;
  category?: string;
  platform?: string;
  selectedPlatforms?: string[];
  socialPostMode?: SocialPostMode;
  nonce?: string;
}

export type GenerationData = any;
export type HistoryItem = any;
export type ConnectedSocialAccounts = any;
export type LogoDesignResult = any;
export type LogoBadgeShape = any;
export type LogoThemeStyle = any;
export type LogoVariationConcept = any;
export type LogoPlatformPreset = any;
export type SocialPostResult = any;
export type ChatIntent = string;
export type ChatHistoryEntry = any;
export type IslamicQAResult = any;
export type ReelScriptResult = any;
export type WhatsappStatusResult = any;
export type HashtagsResult = any;
export type DailyIdeasResult = any;
export type CreateEverythingResult = any;
export type UserRecord = UserAccount;
export type StoredLocalUser = UserAccount;
