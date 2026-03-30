import { TelegramService } from "./telegram";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://api.your-domain.com";

export class ApiClient {
  private static getHeaders() {
    const initData = TelegramService.getInitDataRaw();
    return {
      "Content-Type": "application/json",
      "X-Init-Data": initData,
      Authorization: `Bearer ${initData}`,
    };
  }

  static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = this.getHeaders();

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error(`API Error: ${error.message}`);
      throw error;
    }
  }

  // Drafts
  static getDrafts(status?: string, limit?: number, offset?: number) {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (limit) params.append("limit", String(limit));
    if (offset) params.append("offset", String(offset));
    return this.request(`/api/drafts?${params.toString()}`);
  }

  static getDraft(id: string) {
    return this.request(`/api/drafts/${id}`);
  }

  static createDraft(data: {
    sourceType?: string;
    sourceRef?: string;
    draftText: string;
    tone?: string;
  }) {
    return this.request("/api/drafts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static updateDraft(id: string, data: Partial<any>) {
    return this.request(`/api/drafts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  static approveDraft(id: string) {
    return this.request(`/api/drafts/${id}/approve`, {
      method: "POST",
    });
  }

  static rejectDraft(id: string) {
    return this.request(`/api/drafts/${id}/reject`, {
      method: "POST",
    });
  }

  static deleteDraft(id: string) {
    return this.request(`/api/drafts/${id}`, {
      method: "DELETE",
    });
  }

  // Publishing
  static publishDraft(draftId: string, replyToId?: string) {
    return this.request(`/api/publish/${draftId}`, {
      method: "POST",
      body: JSON.stringify({ replyToId }),
    });
  }

  static getPublishStats() {
    return this.request("/api/publish/stats/today");
  }

  // Analytics
  static getAnalyticsToday() {
    return this.request("/api/analytics/today");
  }

  static getAnalyticsSnapshot() {
    return this.request("/api/analytics/snapshot");
  }

  static getAnalyticsHistory(days: number = 30) {
    return this.request(`/api/analytics/history?days=${days}`);
  }

  static syncAnalytics() {
    return this.request("/api/analytics/sync", {
      method: "POST",
    });
  }

  // X Auth
  static startXAuth() {
    return this.request("/api/x-auth/start");
  }

  static xAuthCallback(code: string, state: string) {
    return this.request("/api/x-auth/callback", {
      method: "POST",
      body: JSON.stringify({ code, state }),
    });
  }

  static getXAuthStatus() {
    return this.request("/api/x-auth/status");
  }

  static disconnectXAuth() {
    return this.request("/api/x-auth/disconnect", {
      method: "DELETE",
    });
  }
}

export type { ApiResponse, PaginatedResponse } from "@telegram-x-assistant/shared/types/index.js";
