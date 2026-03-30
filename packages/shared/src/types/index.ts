// User types
export interface User {
  id: string;
  telegramUserId: number;
  telegramUsername: string;
  createdAt: Date;
}

// X Account types
export interface XAccount {
  id: string;
  userId: string;
  xUserId: string;
  xHandle: string;
  accessToken: string;
  refreshToken: string;
  connectedAt: Date;
}

// Draft types
export type DraftStatus = "pending" | "approved" | "rejected" | "posted";
export type DraftSourceType = "reply" | "post" | "suggestion";
export type Tone = "sharp" | "funny" | "informative" | "neutral";

export interface Draft {
  id: string;
  userId: string;
  sourceType: DraftSourceType;
  sourceRef?: string;
  draftText: string;
  tone?: Tone;
  status: DraftStatus;
  createdAt: Date;
  approvedAt?: Date;
  postedAt?: Date;
}

// Post types
export type PostKind = "reply" | "original";

export interface Post {
  id: string;
  userId: string;
  xPostId: string;
  text: string;
  kind: PostKind;
  createdAt: Date;
}

// Analytics types
export interface AnalyticsSnapshot {
  id: string;
  userId: string;
  date: Date;
  impressions: number;
  likes: number;
  replies: number;
  reposts: number;
  profileVisits: number;
  followersDelta: number;
}

// Watchlist types
export type WatchlistType = "keyword" | "hashtag" | "account";

export interface Watchlist {
  id: string;
  userId: string;
  type: WatchlistType;
  value: string;
  isActive: boolean;
}

// Activity log types
export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// Telegram Mini App init data
export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface TelegramWebAppInitData {
  user?: TelegramUser;
  auth_date: number;
  hash: string;
  [key: string]: any;
}

// X OAuth types
export interface XOAuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
