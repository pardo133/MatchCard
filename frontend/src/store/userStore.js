import { create } from 'zustand';

const stored = localStorage.getItem('mc_user');

export const useUserStore = create((set) => ({
  user:  stored ? JSON.parse(stored) : null,
  token: localStorage.getItem('mc_token') || null,

  setAuth: (token, user) => {
    localStorage.setItem('mc_token', token);
    localStorage.setItem('mc_user',  JSON.stringify(user));
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem('mc_token');
    localStorage.removeItem('mc_user');
    set({ token: null, user: null });
  },

  setUser: (user) => {
    localStorage.setItem('mc_user', JSON.stringify(user));
    set({ user });
  },
}));
