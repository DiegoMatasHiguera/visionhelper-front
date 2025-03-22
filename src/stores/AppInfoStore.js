import { defineStore } from 'pinia';

export const useAppInfoStore = defineStore("AppInfo",{
  state: () => ({
    environment: import.meta.env.VITE_API_URL,
    clientVersion: import.meta.env.VITE_CLIENT_VERSION,
    seccion: 'Sección',
    producto: '',
    lote: '',
    muestreo: '',
    pageTitle: '',
  }),
  actions: {
    clearInfoTest() {
      this.producto = '';
      this.lote = '';
      this.muestreo = '';
    },
    generarTitle() {
      this.pageTitle = 'VisionHelper > ' + this.seccion;
      if (this.producto !== '') {
        this.pageTitle += ' (' + this.producto + ' | ' + this.lote + ' | ' + this.muestreo + ')'
      }
    }
  }
});