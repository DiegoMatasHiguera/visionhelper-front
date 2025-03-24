<template>
    <Panel>
      <div class="fila">
        <div>
          <button class="botonPeque" @click="prevBandeja">
            &lt;
          </button> 
          Bandeja nº: {{ bandejaActual + 1 }} de {{ bandejas.length }}
          <button class="botonPeque" @click="nextBandeja">
            &gt;
          </button>
        </div>
        <div>Muestras a tomar: <span class="muestrasTomar"> {{ muestrasATomar }}</span></div>
      </div>
      <Muestreo 
        v-if="bandejas.length > 0"
        :numMuestrasInicio="currentBandeja.numMuestrasInicio"
        :rows="currentBandeja.rows"
        :circlesPerRow="currentBandeja.circlesPerRow"
        :circlesPerBandeja="currentBandeja.circlesPerBandeja"
        :muestreoCircles="currentBandeja.muestreoCircles"
        :alternado="alternado"
        :tresbolillo="tresbolillo"
        :currentMuestra="currentMuestra"
      />
    </Panel>
  </template>
  
  <script>
  import Panel from '@/components/Panel.vue';
  import Muestreo from '@/components/Muestreo.vue';
  
  /**
   * @component MuestreoBandejaPanel
   * @description Componente que muestra un panel de control para navegar entre bandejas de muestreo
   */
  export default {
    name: 'MuestreoBandejaPanel',
    components: {
      Panel,
      Muestreo
    },
    props: {
      bandejas: {
        type: Array,
        required: true
      },
      alternado: {
        type: Boolean,
        default: false
      },
      tresbolillo: {
        type: Boolean,
        default: false
      },
      currentMuestra: {
        type: Number,
        default: 0
      }
    },
    data() {
      return {
        bandejaActual: 0
      };
    },
    watch: {
      bandejas() {
        if (this.bandejaActual >= this.bandejas.length) {
          this.bandejaActual = 0;
        }
      }
    },
    computed: {
      currentBandeja() {
        if (this.bandejas.length === 0) {
          return {
            numMuestrasInicio: 0,
            rows: 0,
            circlesPerRow: 0,
            circlesPerBandeja: 0,
            muestreoCircles: []
          };
        }
        return this.bandejas[this.bandejaActual];
      },
      muestrasATomar() {
        let totalMuestras = 0;
        for (let i = 0; i < this.bandejas.length; i++) {
          totalMuestras += this.bandejas[i].muestreoCircles.length;
        }
        return totalMuestras;
      }
    },
    methods: {
      locateMuestra() {
        // Find which bandeja contains the current muestra
        for (let i = 0; i < this.bandejas.length; i++) {
          const bandeja = this.bandejas[i];
          // Check if this bandeja has the currentMuestra
          for (let j = 0; j < bandeja.muestreoCircles.length; j++) {
            const index = bandeja.muestreoCircles[j];
            const muestraNum = bandeja.numMuestrasInicio + j + 1;
            
            if (muestraNum === this.currentMuestra) {
              // This is the bandeja that contains our muestra
              this.bandejaActual = i;
              
              // Emit an event to highlight this muestra
              this.$emit('highlight-muestra', index);
              return;
            }
          }
        }
      },

      /**
       * @method nextBandeja
       * @description Avanza a la siguiente bandeja
       */
      nextBandeja() {
        if (this.bandejaActual < this.bandejas.length - 1) {
          this.bandejaActual++;
        } else {
          this.bandejaActual = 0;
        }
      },
      
      /**
       * @method prevBandeja
       * @description Retrocede a la bandeja anterior
       */
      prevBandeja() {
        if (this.bandejaActual >= 1) {
          this.bandejaActual--;
        } else {
          this.bandejaActual = this.bandejas.length - 1;
        }
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
  }
  
  .muestrasTomar {
    border-radius: 50%;
    padding: 5px;
    text-align: center;
    line-height: 25px;
    color: var(--color-oscuro);
    font-weight: var(--font-peso-bold);
    font-size: 16px;
    background-color: var(--color-resalte);
  }
  
  .botonPeque {
    background-color: var(--color-mas-oscuro);
    box-shadow: 0px 2px 2px 1px rgba(0, 0, 0, 0.5);
    margin: 5px;
  }
  
  .botonPeque:hover {
    box-shadow: var(--shadow-focus-pequeno);
  }
</style>