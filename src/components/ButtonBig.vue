<template>
    <button class="button-big">
        <img :src="imagen" alt="Perfil" class="button-icon" />
        {{ texto }}
    </button>
</template>

<script>
/**
 * @component ButtonBig
 * @description Un componente que muestra un botón gordo, con una imagen y texto.
 * @prop {String} imagen - La URL de la imagen que se mostrará en el botón.
 * @prop {String} texto - El texto que se mostrará en el botón.
 */
export default {
    name: 'ButtonBig',
    props: {
        imagen: String,
        texto: String
    }
};
</script>

<style scoped>
.button-icon {
  filter: var(--color-filter-principal);
  width: 120px;

  margin-bottom: 25px;
}

.button-big {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  width: 200px;
  height: 225px;

  margin: 20px;
  
  font-weight: var(--font-peso-bold);
  font-size: 28px;
}
</style>
