import { createSlice } from '@reduxjs/toolkit';

const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
const storedToken = localStorage.getItem('accessToken') || null;

const initialState = {
  user: storedUser,
  accessToken: storedToken,
  isAuthenticated: !!storedToken,
  loading: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', accessToken);
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
    }
  }
});

export const { setCredentials, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
