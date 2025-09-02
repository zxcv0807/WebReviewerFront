import axiosInstance from './axiosInstance';

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    username: string;
    email: string;
    name: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface UserUpdateRequest {
  username?: string;
  current_password: string;
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  new_password: string;
}

export interface MessageSendRequest {
  receiver_username: string;
  subject: string;
  content: string;
}

export interface Message {
  id: number;
  sender_username: string | null;
  receiver_username: string | null;
  subject: string;
  content: string;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

export interface MessageListResponse {
  messages: Message[];
  page: number;
  limit: number;
  total: number;
}

export interface UserMemoRequest {
  target_username: string;
  memo: string;
}

export interface UserMemo {
  id: number | null;
  target_username: string;
  memo: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface UserMemoListItem {
  id: number;
  target_username: string;
  memo: string;
  created_at: string;
  updated_at: string;
}

export interface UserMemoListResponse {
  memos: UserMemoListItem[];
  total: number;
}

export interface EmailVerificationStatusResponse {
  email_verified: boolean;
}

export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/auth/login', data);
    return response.data;
  },

  signup: async (data: SignupRequest): Promise<void> => {
    try {
      await axiosInstance.post('/auth/signup', data);
    } catch (error: any) {
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
  },

  refresh: async (): Promise<{ access_token: string }> => {
    const response = await axiosInstance.post('/auth/refresh');
    return response.data;
  },
  me: async (): Promise<{ user: import('../redux/slices/authSlice').User }> => {
    const response = await axiosInstance.get('/auth/me');
    
    // If the API returns user data directly (not wrapped in 'user' property)
    if (response.data && response.data.id && !response.data.user) {
      return { user: response.data };
    }
    
    return response.data;
  },

  updateMe: async (data: UserUpdateRequest): Promise<{ user: import('../redux/slices/authSlice').User }> => {
    const response = await axiosInstance.put('/auth/me', data);
    
    if (response.data && response.data.id && !response.data.user) {
      return { user: response.data };
    }
    
    return response.data;
  },

  deleteMe: async (): Promise<void> => {
    await axiosInstance.delete('/auth/me');
  },

  getEmailVerificationStatus: async (): Promise<EmailVerificationStatusResponse> => {
    const response = await axiosInstance.get('/auth/email-verification-status');
    return response.data;
  },

  sendVerificationEmail: async (data: { email: string; password: string }): Promise<void> => {
    await axiosInstance.post('/auth/send-verification-email', data);
  },

  resendVerificationCode: async (): Promise<void> => {
    await axiosInstance.post('/auth/send-verification-email');
  },

  verifyEmailCode: async (code: string): Promise<void> => {
    await axiosInstance.post('/auth/verify-email-code', { code });
  },

  verifySignup: async (data: { email: string; code: string }): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/auth/verify-signup', data);
    return response.data;
  },

  changePassword: async (data: PasswordChangeRequest): Promise<void> => {
    await axiosInstance.put('/auth/password', data);
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    await axiosInstance.post('/auth/forgot-password', data);
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await axiosInstance.post('/auth/reset-password', data);
  },

  // 쪽지 관련 API
  sendMessage: async (data: MessageSendRequest): Promise<void> => {
    await axiosInstance.post('/messages/send', data);
  },

  getInboxMessages: async (page: number = 1, limit: number = 10): Promise<MessageListResponse> => {
    const response = await axiosInstance.get(`/messages/inbox?page=${page}&limit=${limit}`);
    return response.data;
  },

  getSentMessages: async (page: number = 1, limit: number = 10): Promise<MessageListResponse> => {
    const response = await axiosInstance.get(`/messages/sent?page=${page}&limit=${limit}`);
    return response.data;
  },

  markMessageAsRead: async (messageId: number): Promise<void> => {
    await axiosInstance.put(`/messages/${messageId}/read`);
  },

  deleteMessage: async (messageId: number): Promise<void> => {
    await axiosInstance.delete(`/messages/${messageId}`);
  },

  // 사용자 메모 관련 API
  saveUserMemo: async (data: UserMemoRequest): Promise<void> => {
    await axiosInstance.post('/messages/memo', data);
  },

  getUserMemo: async (targetUsername: string): Promise<UserMemo> => {
    const response = await axiosInstance.get(`/messages/memo/${targetUsername}`);
    return response.data;
  },

  deleteUserMemo: async (targetUsername: string): Promise<void> => {
    await axiosInstance.delete(`/messages/memo/${targetUsername}`);
  },

  getAllUserMemos: async (): Promise<UserMemoListResponse> => {
    const response = await axiosInstance.get('/messages/memos');
    return response.data;
  },
};

export const loginWithGoogle = async (idToken: string): Promise<void> => {
  try {
    const backendURL = import.meta.env.VITE_API_BASE_URL || 'https://backend-patient-river-6568.fly.dev';
    const response = await fetch(`${backendURL}/login/google`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ id_token: idToken }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('Google login API error:', error);
      throw new Error(error?.detail || 'Google 로그인에 실패했습니다.');
    }
    
    // access_token은 response body, refresh_token은 쿠키로 전달됨
    const data = await response.json();
    
    // access_token을 localStorage에 저장 (기존 방식과 통일)
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
    }
    return data;
  } catch (error) {
    console.error('Google login error:', error);
    throw error;
  }
}; 