<script>
import { computed, ref, nextTick } from "vue";
import { RouterLink, RouterView, useRoute } from 'vue-router'
import HeaderLogin from './components/HeaderLogin.vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

import StatusPopup from './components/StatusPopup.vue';

export default {
  components: { HeaderLogin, Header, Footer, StatusPopup },
  setup() {
    const route = useRoute();

    const currentHeader = computed(() =>
      route.path === "/login" ? "HeaderLogin" : "Header"
    );

    const showFooter = computed(() => route.path !== "/login");

    const isReady = ref(false);

    return { currentHeader, showFooter, isReady };
  },
  mounted() {
    // Hay que esperar a que el componente esté listo antes de mostrarlo
    nextTick(() => {      
      this.isReady = true;
    });  
  },
};
</script>

<template>
    <!-- Status Popup Component -->
  <StatusPopup ref="statusPopup" />
  <div class="container">
    <header>
      <component :is="currentHeader" />
    </header>

    <main id="main">
      <!-- Use v-if to wait until statusPopup is defined -->
      <RouterView v-if="isReady" :statusPopup="$refs.statusPopup" />
      <div v-else class="loading">Loading...</div>
    </main>

    <footer>
      <Footer v-if="showFooter" />
    </footer>
  </div>
</template>

<style scoped>

.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  
  background-color: transparent;
  overflow: hidden;
}

header {
  flex: 0 1 auto; /* This allows it to shrink and grow */
  
  background-color: var(--color-fondo); /* Match main background */
}

footer {
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
