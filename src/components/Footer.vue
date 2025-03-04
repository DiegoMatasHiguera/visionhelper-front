<template>
  <div class="footerGeneral">
    <div class="campo">(c) 2025 - Tomeitas Tecnologies S.L.</div>
    <div class="campo">Usuario: {{user_name}}</div>
    <div class="campo"><router-link to="/">Acerca de</router-link> - <router-link to="/">Política de Privacidad</router-link></div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/authStore'

export default {
  name: 'Footer',
  computed: {
    user_name() {
      const authStore = useAuthStore();
      return authStore.user_name;
    }
  },
};
</script>

<style scoped>
.footerGeneral {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--color-claro);
  filter: drop-shadow(4px 4px 12px rgba(0, 0, 0, 0.25));
  padding: 8px;
  border-radius: 8px 8px 0px 0px;
  position: relative;
}

.campo {
  font-family: var(--font-family-titulos);
  font-size: 14px;
  font-weight: var(--font-peso-semibold);
  color: var(--color-principal);

  filter: var(--shadow-titulo);
}
</style>
