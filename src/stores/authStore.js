import { defineStore } from 'pinia';

export const useAuthStore = defineStore("auth",{
  state: () => ({
    accessToken: localStorage.getItem('access_token') || null,
    refreshToken: localStorage.getItem('refresh_token') || null,
    user_email: localStorage.getItem('user_email') || null,
    user_name: localStorage.getItem('user_name') || null,
    tipo: localStorage.getItem('tipo') || null,
  }),
  actions: {
    setInfo(accessToken, refreshToken, user_email, user_name, tipo) {
      this.accessToken = accessToken;      
      localStorage.setItem('access_token', accessToken);
      this.refreshToken = refreshToken;
      localStorage.setItem('refresh_token', refreshToken);
      this.user_email = user_email;
      localStorage.setItem('user_email', user_email);
      this.user_name = user_name;
      localStorage.setItem('user_name', user_name);
      this.tipo = tipo;
      localStorage.setItem('tipo', tipo);
    },
    setUserName(user_name) {
      this.user_name = user_name;
      localStorage.setItem('user_name', user_name);
    },
    setTipo(tipo) {
      this.tipo = tipo;
      localStorage.setItem('tipo', tipo);
    },
    updateAccessToken(accessToken) {
      this.accessToken = accessToken;      
      localStorage.setItem('access_token', accessToken);
    },
    clearInfo() {
      this.accessToken = null;      
      localStorage.removeItem('access_token');
      this.refreshToken = null;
      localStorage.removeItem('refresh_token');
      this.user_email = null;
      localStorage.removeItem('user_email');
      this.user_name = null;
      localStorage.removeItem('user_name');
      this.tipo = null;
      localStorage.removeItem('tipo');
    }
  }
});