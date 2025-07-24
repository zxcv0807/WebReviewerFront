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

export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/auth/login', data);
    return response.data;
  },

  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    try {
      const response = await axiosInstance.post('/auth/signup', data);
      return response.data;
    } catch (error: any) {
      // 백엔드 에러를 그대로 throw
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