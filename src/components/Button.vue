<template>
    <button class="button" :type="type">
        {{ texto }}
    </button>
</template>

<script>
/**
 * @component Button
 * @description Un componente que muestra un botón.
 * @prop {String} texto - El texto que se mostrará en el botón.
 */
export default {
    name: 'Button',
    props: {
        texto: String,
        type: {
            type: String,
            default: 'button',
            validator: value => ['button', 'submit', 'reset'].includes(value),
            required: false
        }
    }
};
</script>

<style scoped>
.button {
  text-align: center;
  
  width: 180px;
  height: auto;
  min-height: 50px;

  padding: 5px;
  margin: 10px;
  
  font-weight: var(--font-peso-bold);
  font-size: 20px;
}
</style>
