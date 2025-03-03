<script>
import { computed } from "vue";
import { RouterLink, RouterView, useRoute } from 'vue-router'
import HeaderLogin from './components/HeaderLogin.vue'
import Header from './components/Header.vue'

import StatusPopup from './components/StatusPopup.vue';

export default {
  components: { HeaderLogin, Header, StatusPopup },
  setup() {
    const route = useRoute();

    const currentHeader = computed(() =>
      route.path === "/login" ? "HeaderLogin" : "Header"
    );

    return { currentHeader };
  }
};
</script>

<template>
  <div class="container">
    <header id="header">
      <component :is="currentHeader" />
    </header>

    <main id="main">
      <!-- Pasamos la referencia del popup a los hijos -->
      <RouterView :statusPopup="$refs.statusPopup" />
    </main>

    <footer>
    </footer>
  </div>
  
  <!-- Status Popup Component -->
  <StatusPopup ref="statusPopup" />
</template>

<style scoped>

.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  
  background-color: transparent;
}

header {
  flex: 0 1 auto; /* This allows it to shrink and grow */
  
  background-color: var(--color-fondo); /* Match main background */
}

main {
  flex: 1 1 auto; /* This makes it take up the remaining space */
  overflow-y: scroll;

  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--color-fondo);
}
</style>
