import { defineStore } from 'pinia';
import authService from '../services/authService';

const storedUser = localStorage.getItem('tescom_user');

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('tescom_token') || null,
    user: storedUser ? JSON.parse(storedUser) : null,
    initialized: false,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token && state.user),
    role: (state) => state.user?.role || null,
    fullName: (state) => (state.user ? `${state.user.prenom} ${state.user.nom}` : ''),
    isAdmin: (state) => state.user?.role === 'admin',
    isEmploye: (state) => state.user?.role === 'employe',
    isStaff: (state) => ['admin', 'employe'].includes(state.user?.role),
    isTechnicien: (state) => state.user?.role === 'technicien',
    isClient: (state) => state.user?.role === 'client',
  },

  actions: {
    setSession(token, user) {
      this.token = token;
      this.user = user;
      localStorage.setItem('tescom_token', token);
      localStorage.setItem('tescom_user', JSON.stringify(user));
    },

    clearSession() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('tescom_token');
      localStorage.removeItem('tescom_user');
    },

    async login(credentials) {
      const response = await authService.login(credentials);
      this.setSession(response.data.token, response.data.user);
      this.initialized = true;
      return response;
    },

    async register(payload) {
      const response = await authService.register(payload);
      this.setSession(response.data.token, response.data.user);
      this.initialized = true;
      return response;
    },

    async fetchMe() {
      if (!this.token) {
        this.initialized = true;
        return null;
      }
      try {
        const response = await authService.getMe();
        this.user = response.data;
        localStorage.setItem('tescom_user', JSON.stringify(response.data));
        return response.data;
      } catch (err) {
        this.clearSession();
        return null;
      } finally {
        this.initialized = true;
      }
    },

    async updateProfile(payload) {
      const response = await authService.updateMe(payload);
      this.user = response.data;
      localStorage.setItem('tescom_user', JSON.stringify(response.data));
      return response;
    },

    logout() {
      this.clearSession();
    },
  },
});
