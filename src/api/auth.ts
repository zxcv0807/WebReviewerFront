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