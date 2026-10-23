import { API_BASE_URL } from './config';
import {
  User,
  RepairDetails,
  RepairStatus,
} from '../types';

export class ApiError extends Error {
  constructor(public message: string, public status: number, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error('Staff features require VITE_API_BASE_URL to point to the deployed backend API.');
  }

  const token = localStorage.getItem('phone_tech_token');
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const contentType = response.headers.get('content-type');
  let data: any = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = data?.error || `Request failed with status ${response.status}`;
    throw new ApiError(errorMsg, response.status, data);
  }

  return data as T;
}

export const api = {
  auth: {
    login: (credentials: { emailOrPhone: string; password: string }) =>
      request<{ user: User; token: string; expiresAt: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),

    logout: () =>
      request<{ success: boolean }>('/auth/logout', {
        method: 'POST',
      }),

    me: () => request<{ user: User }>('/auth/me'),
  },

  repairs: {
    list: (params?: { status?: string; brand?: string; search?: string; page?: number; limit?: number }) => {
      const q = new URLSearchParams();
      if (params?.status) q.set('status', params.status);
      if (params?.brand) q.set('brand', params.brand);
      if (params?.search) q.set('search', params.search);
      if (params?.page) q.set('page', params.page.toString());
      if (params?.limit) q.set('limit', params.limit.toString());
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request<{ items: any[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(
        `/repairs${queryStr}`
      );
    },

    get: (id: string) => request<RepairDetails>(`/repairs/${id}`),

    updateStatus: (id: string, toStatus: RepairStatus, notes?: string) =>
      request<{ repairId: string; fromStatus: string; toStatus: RepairStatus; updatedAt: string }>(
        `/repairs/${id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ toStatus, notes }),
        }
      ),
  },

  diagnostics: {
    save: (repairId: string, diagnosisData: any) =>
      request<{ diagnosisId: string; repairId: string; decision: string; targetStatus: string }>(
        `/repairs/${repairId}/diagnosis`,
        {
          method: 'POST',
          body: JSON.stringify(diagnosisData),
        }
      ),

    get: (repairId: string) =>
      request<{ diagnosis: any }>(`/repairs/${repairId}/diagnosis`),
  },

  quotes: {
    create: (repairId: string, quoteData: any) =>
      request<{
        quoteId: string;
        quotationNumber: string;
        version: number;
        totalPriceDzd: number;
        status: string;
      }>(`/repairs/${repairId}/quotes`, {
        method: 'POST',
        body: JSON.stringify(quoteData),
      }),

    approve: (quoteId: string) =>
      request<{ success: boolean; quoteId: string; decision: string; repairStatus: string }>(
        `/quotes/${quoteId}/approve`,
        {
          method: 'POST',
        }
      ),

    reject: (quoteId: string, rejectionReason?: string) =>
      request<{ success: boolean; quoteId: string; decision: string; repairStatus: string }>(
        `/quotes/${quoteId}/reject`,
        {
          method: 'POST',
          body: JSON.stringify({ rejectionReason }),
        }
      ),
  },

  uploads: {
    upload: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return request<{
        fileKey: string;
        fileName: string;
        fileSize: number;
        contentType: string;
      }>('/uploads', {
        method: 'POST',
        body: formData,
      });
    },

    getUrl: (fileKey: string) => `${API_BASE_URL}/uploads/${fileKey}`,
  },

  technician: {
    getDashboard: () =>
      request<{
        metrics: {
          total: number;
          new: number;
          underDiagnosis: number;
          repairable: number;
          unrepairable: number;
          waitingParts: number;
          quotePending: number;
          quoteAccepted: number;
          inRepair: number;
          completed: number;
          readyPickup: number;
          delivered: number;
        };
        urgentQueue: any[];
      }>('/technician/dashboard'),
  },

  admin: {
    getDashboard: () =>
      request<{
        totalRevenueDzd: number;
        brandBreakdown: Array<{ brand: string; count: number }>;
        statusBreakdown: Array<{ current_status: string; count: number }>;
        staff: any[];
        recentAuditLogs: any[];
      }>('/admin/dashboard'),
  },
};
