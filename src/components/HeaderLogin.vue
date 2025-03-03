<template>
  <div class="headerLogin">
    <img class="logo" alt="VisionHelper logo" src="@/assets/logologin2.png"/>
  </div>
</template>

<style scoped>
.headerLogin {
  text-align: center;
  background-color: var(--color-claro);
  filter: drop-shadow(4px 4px 12px rgba(0, 0, 0, 0.25));
  padding: 20px;
}
.logo {
  max-height: 25vh;
  min-height: 150px;
  width: 100%;
  height: 100%;
  object-fit: contain; /* Maintain aspect ratio while fitting in the container */
}
</style>
