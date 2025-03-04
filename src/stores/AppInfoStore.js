import { defineStore } from 'pinia';

export const useAppInfoStore = defineStore("AppInfo",{
  state: () => ({
    environment: import.meta.env.VITE_API_URL,
    clientVersion: import.meta.env.VITE_CLIENT_VERSION,
    seccion: 'Sección',
  }),
});