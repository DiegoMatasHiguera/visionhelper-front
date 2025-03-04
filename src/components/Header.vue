<template>
  <div class="headerGeneral">
    <router-link to="/profile"><img class="logomain" alt="VisionHelper logo" src="@/assets/logo.svg"/></router-link>
    <img class="foto" alt="Avatar picture" src="@/assets/noavatar.png"/>
    <router-link to="/"><span class="titulo">VisionHelper</span></router-link>
    <div class="versiones">
      <span>Cliente v.: {{clienteVersion}} </span>
    </div>
    <div class="seccion">
      {{seccion}}
    </div>
  </div>
</template>

<script>
import { useAppInfoStore } from '@/stores/AppInfoStore'

export default {
  name: 'Header',
  // Se actualizan estos campos dinámicamente
  computed: {
    clienteVersion() {
      const AppInfoStore = useAppInfoStore();
      return AppInfoStore.clientVersion;
    },
    seccion() {
      const AppInfoStore = useAppInfoStore();
      return AppInfoStore.seccion;
    }
  },
};
</script>

<style scoped>
.headerGeneral {
  display: flex;
  align-items: center;
  background-color: var(--color-claro);
  filter: drop-shadow(4px 4px 12px rgba(0, 0, 0, 0.25));
  padding: 8px;
  border-radius: 0px 0px 8px 8px;
  position: relative;
}

.headerGeneral a:hover {
  background-color: transparent;
}

.logomain {
  color: var(--color-principal);
  filter: var(--color-filter-principal) var(--shadow-titulo);

  width: 100%; /* Make SVG responsive */
  height: 75px; /* Make SVG fill the header height */
  object-fit: contain; /* Maintain aspect ratio while fitting in the container */
  
  margin-right: 35px;
}

.foto {
  width: 40px;
  height: 40px;
  position: absolute;
  left: 48px;
  top: 28px;
  z-index: -1;

  border-radius: 50%; /* Creates a perfect circle */
  object-fit: cover; /* Ensures the image covers the area without distortion */
  overflow: hidden; /* Ensures content doesn't spill outside the border */
}

.titulo {
  font-family: var(--font-family-titulos);
  font-size: 32px;
  font-weight: var(--font-peso-semibold);
  color: var(--color-principal);

  filter: var(--shadow-titulo);
}

.seccion {
  font-family: var(--font-family-titulos);
  font-size: 32px;
  font-weight: var(--font-peso-semibold);
  color: var(--color-principal);
  text-align: right;

  margin-left: auto;
  padding-right: 20px;
  padding-left: 30px;
  padding-top: 5px;
  padding-bottom: 5px;

  position: relative;
  right: -15px; /* Negative value extends to the right outside parent */
  z-index: 1; /* Ensures it appears above other elements if needed */

  background-color: var(--color-fondo);
  border-radius: 8px 0px 0px 8px;
  
  box-shadow: var(--shadow-button-sobreblanco);
}

.versiones {
  position: absolute;
  left: 140px;
  top: 70px;

  font-family: var(--font-family-titulos);
  font-size: 14px;
  
  filter: var(--shadow-titulo);
}
</style>
