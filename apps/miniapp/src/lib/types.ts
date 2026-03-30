// API Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Telegram Types  
export interface TelegramWebAppInitData {
  user?: {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
  };
  chat_instance?: string;
  chat_type?: string;
  auth_date: number;
  hash: string;
}

// Draft Types
export interface Draft {
  id: string;
  userId: string;
  content: string;
  attachments?: string[];
  status: "draft" | "pending_approval" | "approved" | "published";
  createdAt: string;
  updatedAt: string;
}

// Stats Types
export interface Stats {
  totalDrafts: number;
  publishedPosts: number;
  totalEngagement: number;
  thisMonth: {
    posts: number;
    engagement: number;
  };
}

// X Account Types
export interface XAccount {
  id: string;
  username: string;
  xUserId: string;
  accessToken: string;
  followers: number;
  isConnected: boolean;
}
