import { create } from 'zustand';

export const useUserStore = create((set) => ({
  user:  null,
  token: localStorage.getItem('token') || null,

  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
  },

  setUser: (user) => set({ user }),
}));
