import { defineStore } from 'pinia';

export const useAuthStore = defineStore("auth",{
  state: () => ({
    accessToken: null,
    refreshToken: localStorage.getItem('refresh_token') || null,
  }),
  actions: {
    setTokens(accessToken, refreshToken) {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      localStorage.setItem('refresh_token', refreshToken);
    },
    clearTokens() {
      this.accessToken = null;
      this.refreshToken = null;
      localStorage.removeItem('refresh_token');
    }
  }
});