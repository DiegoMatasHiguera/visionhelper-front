<template>
    <div :class="classTitulo">
        {{ texto }}
    </div>
</template>

<script>
/**
 * @component Titulo
 * @description Un componente que muestra un título centrado.
 * @prop {String} texto - El texto que se mostrará en el título.
 * @prop {String} classTitulo - La clase CSS que se aplicará al título ("titulo-oscuro" | "titulo-claro").
 */
export default {
    name: 'Titulo',
    props: {
        texto: String,
        classTitulo: {
            type: String,
            default: 'titulo-oscuro'
        }
    }
};
</script>

<style scoped>
.titulo-claro, .titulo-oscuro {
  text-align: center;
  border-radius: 8px;

  font-weight: var(--font-peso-bold);
  font-size: 18px;

  padding: 15px;
  margin: 10px;
}

.titulo-claro {
    color: var(--color-mas-oscuro);
    background-color: var(--color-principal);	
}

.titulo-oscuro {
  background-color: var(--color-mas-oscuro);
}

.titulo-resalte {
  color: var(--color-resalte);
}
</style>
