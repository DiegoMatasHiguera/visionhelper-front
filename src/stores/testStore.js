import { defineStore } from 'pinia';

export const useTestsStore = defineStore("Tests", {
  state: () => ({
    producto_seleccionado: null,
    lote_seleccionado: null,
    test_seleccionado: null,
  }),
});