<template>
    <div class="panel">
        <slot></slot>
    </div>
</template>

<script>
/**
 * @component Panel
 * @description Un componente que muestra un panel con contenido centrado.
 */
export default {
    name: 'Panel'
};
</script>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: 100%;
  padding: 20px;
  margin: 20px;

  border-radius: 8px;  
  box-shadow: var(--shadow-button-sobreblanco);
  background-color: var(--color-oscuro);
}
</style>
