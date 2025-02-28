<template>
  <div class="headerLogin">
    <img class="logo" alt="VisionHelper logo" src="@/assets/logologin2.png"/>
  </div>
</template>

<style scoped>
.headerLogin {
  text-align: center;
  background-color: #8AC8D2;
  filter: drop-shadow(4px 4px 12px rgba(0, 0, 0, 0.25));
  padding: 20px;
}
.logo {
  max-height: 20vh;
  min-height: 100px;
  width: 100%; /* Make SVG responsive */
  height: 100%; /* Make SVG fill the header height */
  object-fit: contain; /* Maintain aspect ratio while fitting in the container */
}
</style>
