<template>
    <Panel>
      <div class="fila">
        <div class="fila-label">· Acondicionamiento:</div>
        <div>{{ acondicionamiento }}</div>
      </div>
      <div class="fila">
        <div class="fila-label">· Pretratamiento:</div>
        <div>{{ pretratamiento }}</div>
      </div>
      <div class="fila">
        <div class="fila-label">· Agitación:</div>
        <div v-if="agitacion.includes('http://') || agitacion.includes('https://')"><a :href="agitacion" target="_blank">Ver instrucciones</a></div>
        <div v-else>{{ agitacion }}</div>
      </div>
      <div class="fila">
        <div class="fila-label">· Polarizador:</div>
        <div>{{ polarizador ? 'Sí' : 'No' }}</div>
      </div>
      <div class="fila">
        <div class="fila-label">· Lupa:</div>
        <div>{{ lupa }}x</div>
      </div>
      <div class="fila">
        <div class="fila-label">· Tiempo mínimo de observación/campo:</div>
        <div>{{ tiempo_min_obs }} segundos</div>
      </div>
      <TextArea id="observaciones" label="Observaciones" :modelValue="!observaciones?.trim() ? 'N/A' : observaciones" readonly/>
    </Panel>
  </template>
  
  <script>
  import Panel from '@/components/Panel.vue';
  import TextArea from '@/components/TextArea.vue';
  
  /**
   * @component TestResumenPanel
   * @description Componente que muestra el resumen de información de un test
   */
  export default {
    name: 'TestResumenPanel',
    components: {
      Panel,
      TextArea
    },
    props: {
      acondicionamiento: {
        type: String,
        default: ''
      },
      pretratamiento: {
        type: String,
        default: ''
      },
      agitacion: {
        type: String,
        default: ''
      },
      polarizador: {
        type: Boolean,
        default: false
      },
      lupa: {
        type: Number,
        default: 0
      },
      tiempo_min_obs: {
        type: Number,
        default: 0
      },
      observaciones: {
        type: String,
        default: ''
      }
    }
  };
  </script>
  
  <style scoped>  
  .fila {
    width: 100%;  
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 5px 0;
  }
  
  .fila-label {
    font-weight: var(--font-peso-semibold);
  }
  </style>