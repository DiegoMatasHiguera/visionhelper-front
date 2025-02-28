<script>
import { computed } from "vue";
import { RouterLink, RouterView, useRoute } from 'vue-router'
import HeaderLogin from './components/HeaderLogin.vue'
import Header from './components/Header.vue'

export default {
  components: { HeaderLogin, Header },
  setup() {
    const route = useRoute();

    const currentHeader = computed(() =>
      route.path === "/" ? "HeaderLogin" : "Header"
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
      <RouterView />
    </main>

    <footer>
    </footer>
  </div>
</template>

<style scoped>

.container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
}
header {
  flex: 0 1 auto; /* This allows it to shrink and grow */
  overflow: visible;
}

main {
  flex: 1 1 auto; /* This makes it take up the remaining space */
  overflow-y: auto; /* Allows scrolling if content overflows */
}
</style>
