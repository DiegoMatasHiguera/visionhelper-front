<template>
    <button :class="type" :disabled="disabled" :title="tipo">
        <div>{{ texto }}</div>
        <img v-if="tipo=='Nuevo'" src="@/assets/nuevo.svg" alt="Nuevo" class="icono"/>
        <img v-if="tipo=='Muestrando'" src="@/assets/muestrando.svg" alt="Muestrando" class="icono"/>
        <img v-if="tipo=='Visualizando'" src="@/assets/visualizando.svg" alt="Visualizando" class="icono"/>
        <img v-if="tipo=='Bloqueado'" src="@/assets/rechazado.svg" alt="Bloqueado" class="icono"/>
        <div v-if="persona!=''" class="persona">{{ persona }}</div>
    </button>
</template>

<script>
/**
 * @component Element
 * @description Un componente tipo botón que permite ser seleccionado y tiene diferentes apariencias.
 * @prop {String} texto - El texto que se mostrará en el botón.
 */
export default {
    name: 'Element',
    props: {
        texto: String,
        tipo: {
            type: String,
            default: 'Disponible',
            validator: value => ['Disponible', 'Nuevo', 'Muestrando', 'Visualizando', 'Aceptado', 'Rechazado'].includes(value),
            required: false
        },
        persona: {
            type: String,
            default: ""
        },
        seleccionado: {
            type: Boolean,
            default: false
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        type() {
            if (this.seleccionado) {
                return "elemento Seleccionado";
            } else {
                return "elemento " + this.tipo;
            }
        }
    },
};
</script>

<style scoped>
.elemento {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    min-height: 50px;

    margin: 5px;
    padding: 10px;
    
    color: var(--color-mas-oscuro);
    font-weight: var(--font-peso-medium);
    font-size: 16px;

    border: 2px solid var(--color-oscuro);
    box-shadow: none;
}

.icono {
    height: 30px;
    margin-left: 10px;
}

.elemento:hover {
    box-shadow: var(--shadow-focus-pequeno);
}

.elemento.Disponible {
    background-color: var(--color-claro);
}

.elemento.Seleccionado {
    background-color: var(--color-seleccion);
}

.elemento.Nuevo {
    background: var(--color-nuevo-elemento);
}

.elemento.Muestrando, .elemento.Visualizando {
    background-color: var(--color-resalte);
}

.elemento.Aceptado {
    background-color: var(--color-correcto);
}

.elemento.Rechazado {
    background-color: var(--color-error);
}

.elemento[disabled] {
    background-color: var(--color-gris);
    border-style: dashed;
}

.elemento[disabled]:hover {
    box-shadow: none;
}

</style>
