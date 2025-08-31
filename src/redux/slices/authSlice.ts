import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../api/auth';
import { loginWithGoogle } from '../../api/auth';

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      // 토큰 저장
      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token);
      }
      // 사용자 정보 별도 조회
      const userResponse = await authAPI.me();
      return { user: userResponse.user, access_token: response.access_token };
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      return rejectWithValue(detail || '로그인에 실패했습니다.');
    }
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async (userData: { username: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      // 회원가입만 수행 (인증코드 자동 발송됨)
      await authAPI.signup(userData);
      // 회원가입 성공 시 사용자 데이터 반환 (인증 전 상태)
      return { success: true, userData };
    } catch (error: any) {
      // 백엔드 에러 메시지를 그대로 넘김
      const detail = error?.response?.data?.detail;
      return rejectWithValue(detail || '회원가입에 실패했습니다.');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await authAPI.logout();
  }
);

export const restoreUser = createAsyncThunk(
  'auth/restoreUser',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('access_token');
    if (!token) return rejectWithValue('No token');
    try {
      const response = await authAPI.me();
      return response;
    } catch (err) {
      localStorage.removeItem('access_token');
      return rejectWithValue('Failed to restore user');
    }
  }
);

export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (idToken: string, { rejectWithValue }) => {
    try {
      await loginWithGoogle(idToken); // just wait for login, ignore return
      // loginWithGoogle already stores access_token in localStorage
      // But we need to fetch user info (me) after login
      const response = await authAPI.me();
      return { user: response.user };
    } catch (error: any) {
      return rejectWithValue(error.message || '구글 로그인에 실패했습니다.');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        // access_token already stored in thunk
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || '로그인에 실패했습니다.';
      })
      // Signup
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state) => {
        state.loading = false;
        // 회원가입 성공했지만 아직 인증 전 상태
        state.isAuthenticated = false;
        state.user = null;
        state.error = null; // 에러 클리어
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || '회원가입에 실패했습니다.';
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        localStorage.removeItem('access_token');
      })
      .addCase(logout.rejected, (state) => {
        state.loading = false;
        // 로그아웃 실패 시에도 로컬 상태는 정리
        state.isAuthenticated = false;
        state.user = null;
        localStorage.removeItem('access_token');
      })
      // Restore User
      .addCase(restoreUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(restoreUser.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        localStorage.removeItem('access_token');
      })
      // Google Login
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        // access_token already stored
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || '구글 로그인에 실패했습니다.';
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer; 