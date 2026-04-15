import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, Alert } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialAuthState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    setUser: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    }
  }
});

interface AlertState {
  alerts: Alert[];
  unreadCount: number;
  loading: boolean;
}

const initialAlertState: AlertState = {
  alerts: [],
  unreadCount: 0,
  loading: false
};

const alertSlice = createSlice({
  name: 'alerts',
  initialState: initialAlertState,
  reducers: {
    setAlerts: (state, action: PayloadAction<Alert[]>) => {
      state.alerts = action.payload;
    },
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    addAlert: (state, action: PayloadAction<Alert>) => {
      state.alerts.unshift(action.payload);
      state.unreadCount += 1;
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const alert = state.alerts.find(a => a._id === action.payload);
      if (alert && !alert.isRead) {
        alert.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    }
  }
});

export const { setUser, logout, setLoading } = authSlice.actions;
export const { setAlerts, setUnreadCount, addAlert, markAsRead } = alertSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    alerts: alertSlice.reducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
