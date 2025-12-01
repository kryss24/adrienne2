import { User, Request, Notification, RequestFormData, DashboardStats, Class } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
};

// Auth API
export const authApi = {
  login: async (matricule: string, password: string): Promise<{ user: User; token: string }> => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ matricule, password }),
    });
  },

  register: async (data: {
    matricule: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    email?: string;
    classId?: string;
  }): Promise<{ user: User; token: string }> => {
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  resetPassword: async (email: string): Promise<{ message: string }> => {
    return apiCall('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  getCurrentUser: async (): Promise<User> => {
    return apiCall('/auth/me');
  },
};

// Requests API
export const requestsApi = {
  getMyRequests: async (): Promise<Request[]> => {
    return apiCall('/requests/my-requests');
  },

  getRequestsByClass: async (classId: string): Promise<Request[]> => {
    return apiCall(`/requests/class/${classId}`);
  },

  getAllRequests: async (): Promise<Request[]> => {
    return apiCall('/requests');
  },

  getRequestById: async (id: string): Promise<Request> => {
    return apiCall(`/requests/${id}`);
  },

  createRequest: async (data: RequestFormData): Promise<Request> => {
    const formData = new FormData();
    formData.append('subject', data.subject);
    formData.append('type', data.type);
    formData.append('description', data.description);
    
    data.attachments.forEach((file) => {
      formData.append('attachments', file);
    });

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/requests`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || 'Request creation failed');
    }

    return response.json();
  },

  updateRequestStatus: async (
    id: string,
    status: string,
    rejectionReason?: string
  ): Promise<Request> => {
    return apiCall(`/requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, rejectionReason }),
    });
  },

  deleteRequest: async (id: string): Promise<void> => {
    return apiCall(`/requests/${id}`, {
      method: 'DELETE',
    });
  },
};

// Stats API
export const statsApi = {
  getMyStats: async (): Promise<DashboardStats> => {
    return apiCall('/stats/my-stats');
  },

  getClassStats: async (classId: string): Promise<DashboardStats> => {
    return apiCall(`/stats/class/${classId}`);
  },

  getGlobalStats: async (): Promise<DashboardStats> => {
    return apiCall('/stats/global');
  },
};

// Notifications API
export const notificationsApi = {
  getMyNotifications: async (): Promise<Notification[]> => {
    return apiCall('/notifications');
  },

  markAsRead: async (id: string): Promise<void> => {
    return apiCall(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  markAllAsRead: async (): Promise<void> => {
    return apiCall('/notifications/mark-all-read', {
      method: 'PATCH',
    });
  },
};

// Classes API
export const classesApi = {
  getAllClasses: async (): Promise<Class[]> => {
    return apiCall('/classes');
  },

  getClassById: async (id: string): Promise<Class> => {
    return apiCall(`/classes/${id}`);
  },

  createClass: async (data: { name: string; adminId: string }): Promise<Class> => {
    return apiCall('/classes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateClass: async (id: string, data: Partial<Class>): Promise<Class> => {
    return apiCall(`/classes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteClass: async (id: string): Promise<void> => {
    return apiCall(`/classes/${id}`, {
      method: 'DELETE',
    });
  },
};

// Users API (for superadmin)
export const usersApi = {
  getAllUsers: async (): Promise<User[]> => {
    return apiCall('/users');
  },

  getUserById: async (id: string): Promise<User> => {
    return apiCall(`/users/${id}`);
  },

  updateUser: async (id: string, data: Partial<User>): Promise<User> => {
    return apiCall(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteUser: async (id: string): Promise<void> => {
    return apiCall(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};
