import { defineStore } from 'pinia';

export const useTestsStore = defineStore("Tests", {
  state: () => ({
    producto_seleccionado: null,    
    muestreo_seleccionado: null,
    lote_seleccionado: null,
    test_seleccionado: null,
    muestreo_info_adicional: null,
  }),
  actions: {
    clearInfo() {
      this.producto_seleccionado = null;
      this.muestreo_seleccionado = null;
      this.lote_seleccionado = null;
      this.test_seleccionado = null;
    },
    clearInfoMuestreo() {
      this.muestreo_info_adicional = null;
    }
  }
});