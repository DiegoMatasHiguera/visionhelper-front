<template>
    <button class="button-big" :class="{selected: selected}">
        <img :src="imagen" :alt="texto" class="button-icon" :class="imagen_color_interna"/>
        {{ texto }}
        <div v-if="texto_notificacion != ''" :class="notificacion">{{texto_notificacion}}</div>
    </button>
</template>

<script>
/**
 * @component ButtonBig
 * @description Un componente que muestra un botón gordo, con una imagen y texto.
 * @prop {String} imagen - La URL de la imagen que se mostrará en el botón.
 * @prop {String} texto - El texto que se mostrará en el botón.
 * @prop {String} tipo_notificacion - El tipo de notificación que se mostrará en el botón ("amarilla" | "roja").
 * @prop {String} texto_notificacion - El texto de la burbuja de notificaciones.
 */
export default {
    name: 'ButtonBig',
    props: {
        imagen: String,
        imagen_color: {
            type: String,
            default: '',
            validator: value => ['','rojo', 'verde'].includes(value),
        },
        texto: String,
        tipo_notificacion: String,
        texto_notificacion: String,
        selected: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            notificacion: "notificacion " + this.tipo_notificacion,
            imagen_color_interna: this.imagen_color
        };
    }
};
</script>

<style scoped>
.button-icon {
  filter: var(--color-filter-principal);
  height: 100px;

  margin: 20px;
}

.button-icon.rojo {
  filter: var(--color-filter-error);
}

.button-icon.verde {
  filter: var(--color-filter-correcto);
}

.button-big {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  min-width: 125px;

  margin-left: 20px;
  margin-right: 20px;
  margin-top: 10px;
  margin-bottom: 10px;

  padding: 15px;
  
  font-weight: var(--font-peso-bold);
  font-size: 28px;

  position: relative;
}

.button-big.selected {
  background-color: var(--color-seleccion);
}

.notificacion {
  border-radius: 50%;
  width: 50px;
  height: 50px;
  position: absolute;
  top: -25px;
  right: -25px;
  z-index: 1;

  text-align: center;
  line-height: 50px;
}

.notificacion.amarilla {
  color: var(--color-oscuro);
  background-color: var(--color-resalte);
}

.notificacion.roja {
  color: var(--color-principal);
  background-color: var(--color-error);
}

@media (max-width: 750px) {
  .button-big {
    font-size: 20px;
  }

  .button-icon {
    height: 50px;
    margin: 10px;
  }

  .notificacion {
    width: 30px;
    height: 30px;
    top: -15px;
    right: -15px;
    line-height: 30px;
  }
}
</style>
