<template>
    <button class="button-big">
        <img :src="imagen" :alt="texto" class="button-icon" />
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
        texto: String,
        tipo_notificacion: String,
        texto_notificacion: String
    },
    data() {
        return {
            notificacion: "notificacion " + this.tipo_notificacion
        };
    }
};
</script>

<style scoped>
.button-icon {
  filter: var(--color-filter-principal);
  height: 100px;

  margin: 25px;
}

.button-big {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  width: 180px;
  height: 225px;

  margin-left: 20px;
  margin-right: 20px;
  margin-top: 20px;
  margin-bottom: 20px;
  
  font-weight: var(--font-peso-bold);
  font-size: 28px;

  position: relative;
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
</style>
