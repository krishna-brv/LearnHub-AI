import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isSidebarOpen: true,
  darkMode: false,
  activeCourseId: null,
  activeLessonId: null,
  unreadNotifications: 0
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.isSidebarOpen = action.payload;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    setActiveCourse: (state, action) => {
      state.activeCourseId = action.payload;
    },
    setUnreadNotifications: (state, action) => {
      state.unreadNotifications = action.payload;
    }
  }
});

export const { toggleSidebar, setSidebarOpen, toggleDarkMode, setActiveCourse, setUnreadNotifications } = uiSlice.actions;
export default uiSlice.reducer;
