import { defineStore } from 'pinia';

export const useAuthStore = defineStore("auth",{
  state: () => ({
    accessToken: localStorage.getItem('access_token') || null,
    refreshToken: localStorage.getItem('refresh_token') || null,
    user_email: null,
    tipo: null
  }),
  actions: {
    setTokens(accessToken, refreshToken) {
      this.accessToken = accessToken;      
      localStorage.setItem('access_token', accessToken);
      this.refreshToken = refreshToken;
      localStorage.setItem('refresh_token', refreshToken);
    },    
    setAccessToken(accessToken) {
        this.accessToken = accessToken;        
        localStorage.setItem('access_token', accessToken);
    },
    clearTokens() {
      this.accessToken = null;      
      localStorage.removeItem('access_token');
      this.refreshToken = null;
      localStorage.removeItem('refresh_token');
    }
  }
});