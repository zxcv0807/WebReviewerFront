import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../api/auth';

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
  async (credentials: { email: string; password: string }) => {
    const response = await authAPI.login(credentials);
    return response;
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async (userData: { username: string; email: string; password: string }) => {
    const response = await authAPI.signup(userData);
    return response;
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
        localStorage.setItem('access_token', action.payload.access_token);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '로그인에 실패했습니다.';
      })
      // Signup
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        localStorage.setItem('access_token', action.payload.access_token);
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '회원가입에 실패했습니다.';
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
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer; 