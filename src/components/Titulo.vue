<template>
    <div :class="[classTitulo, { sombreado: sombreado }]">
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
        },
        sombreado: {
            type: Boolean,
            default: false
        }
    }
};
</script>

<style scoped>
* {
  text-align: center;
  border-radius: 8px;

  font-weight: var(--font-peso-bold);
  font-size: 18px;

  padding: 10px;
  margin: 5px;
}

.titulo-claro {
    color: var(--color-mas-oscuro);
    background-color: var(--color-principal);	
}

.titulo-oscuro {
  background-color: var(--color-mas-oscuro);
}

.titulo-resalte {       
    color: var(--color-mas-oscuro);
    background-color: var(--color-resalte);
}

.titulo-correcto {    
    color: var(--color-mas-oscuro);
    background-color: var(--color-correcto);
}

.titulo-error {       
    background-color: var(--color-error);
}

.titulo-disabled {
    background-color: transparent;
    border-style: dashed;
    border-width: 4px;
    border-color: var(--color-mas-oscuro);
    cursor: not-allowed;

    box-shadow: none;
}

.titulo-hidden {
    display: none;
}

*.sombreado {
    box-shadow: var(--shadow-focus-pequeno);
}
</style>
