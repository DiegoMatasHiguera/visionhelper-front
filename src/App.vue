<script>
import { computed, ref, nextTick, watch } from "vue";
import { RouterLink, RouterView, useRoute } from 'vue-router'
import HeaderLogin from './components/HeaderLogin.vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

import StatusPopup from './components/StatusPopup.vue';
import { useAppInfoStore } from './stores/AppInfoStore';

export default {
  components: { HeaderLogin, Header, Footer, StatusPopup },
  setup() {
    const route = useRoute();

    const currentHeader = computed(() =>
      route.path === "/login" || route.path === "/register" ? "HeaderLogin" : "Header"
    );

    const showFooter = computed(() => (route.path !== "/login" && route.path !== "/register"));

    const isReady = ref(false);

    const appInfoStore = useAppInfoStore()
    
    watch(
      () => appInfoStore.pageTitle,
      (newTitle) => {
        document.title = newTitle
      }
    )

    return { currentHeader, showFooter, isReady, appInfoStore };
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
      <Footer v-if="showFooter" :statusPopup="$refs.statusPopup" />
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
  padding-top: 5px;
  padding-left: 15px;
  padding-right: 15px;

  display: flex;
  justify-content: center;
  background-color: var(--color-fondo);
}

/* Add media query for small heights */
@media (max-height: 500px) {
  .container {
    height: auto; /* Allow container to grow beyond viewport height */
    min-height: 100vh;
  }
  
  header, footer {
    position: sticky; /* Make them sticky instead of fixed */
  }
  
  header {
    top: 0; /* Stick to the top */
  }
  
  footer {
    bottom: 0; /* Stick to the bottom */
  }
}
</style>