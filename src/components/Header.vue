<template>
  <div class="headerGeneral">
    <router-link to="/"><img class="logomain" alt="VisionHelper logo" src="@/assets/logo.svg"/></router-link>
    <span class="titulo">VisionHelper</span>
    <div class="versiones">
      <span>Cliente: {{clienteVersion}} </span>
    </div>
  </div>
</template>

<script>
import { useAppInfoStore } from '@/stores/AppInfoStore'

export default {
  name: 'Header',
  data() {
    return {
      clienteVersion: "0.0.0",
    };
  },
  // Called when the component is created
  created() {
    const AppInfoStore = useAppInfoStore();
    this.clienteVersion = AppInfoStore.clientVersion;
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
  height: 100px; /* Make SVG fill the header height */
  object-fit: contain; /* Maintain aspect ratio while fitting in the container */
  
  margin-right: 35px;
}

.titulo {
  font-family: var(--font-family-titulos);
  font-size: 36px;
  font-weight: var(--font-peso-semibold);
  color: var(--color-principal);

  filter: var(--shadow-titulo);
}

.versiones {
  position: absolute;
  left: 165px;
  top: 90px;

  font-family: var(--font-family-titulos);
  font-size: 16px;
  
  filter: var(--shadow-titulo);
}
</style>
