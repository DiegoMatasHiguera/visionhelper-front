<template>
    <div class="panel">
      <div class="grid" :class="{ 'tresbolillo': tresbolillo }" :style="gridStyle">
        <div 
          v-for="index in actualCirclesPerBandeja" 
          :key="index"
          class="borde"
        >
            <div v-if="(!alternado) || (alternado && !isLastofRow(index))" class="circle" 
            :class="{ 
                'muestreo': isMuestreoCircle(getAdjustedIndex(index-1)),
                'tresbolillo': tresbolillo && isOddRow(index),
                'highlighted': isMuestreoCircle(getAdjustedIndex(index-1)) && getMuestraNumber(getAdjustedIndex(index-1)) === currentMuestra}">
                <span v-if="isMuestreoCircle(getAdjustedIndex(index-1))">{{ getMuestraNumber(getAdjustedIndex(index-1)) }}</span>
              </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  /**
   * @component Muestreo
   * @description Un componente que muestra un esquema de muestreo.
   */
  export default {
    name: 'Muestreo',
    props: {
        numMuestrasInicio: {
            type: Number,
            required: true
        },  
        rows: {
            type: Number,
            required: true
        },
        circlesPerRow: {
            type: Number,
            required: true
        },
        circlesPerBandeja: {
            type: Number,
            required: true
        },
        muestreoCircles: {
            type: Array,
            default: () => []
        },
        tresbolillo: {
            type: Boolean,
            default: false
        },
        alternado: {
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
        muestraNumbers: {}
        };
    },
    watch: {
        muestreoCircles() {
            // Pre-calculate all sample numbers
            let currentNum = this.numMuestrasInicio;
            this.muestraNumbers = {};
            for (const index of this.muestreoCircles) {      
                this.muestraNumbers[index] = currentNum + 1;
                currentNum++;
            }
        }
    },
    computed: {
      gridStyle() {
        return {
          '--circles-per-row': this.circlesPerRow,
          'grid-template-rows': `repeat(${this.rows}, 1fr)`,
          'aspect-ratio': `${this.circlesPerRow} / ${this.rows}`
        };
      },
      actualCirclesPerBandeja() {
        if (this.alternado) {
            const rowsCompletas = Math.floor(this.circlesPerBandeja/this.circlesPerRow);
            return this.circlesPerBandeja + Math.floor(rowsCompletas / 2);
        } else {
            return this.circlesPerBandeja;
        }
      }
    },
    methods: {
        isMuestreoCircle(index) {
            return this.muestreoCircles.includes(index);
        },
        isOddRow(index) {
            const row = Math.ceil(index / this.circlesPerRow);
            return row % 2 === 0;
        },
        isLastofRow(index) {
            if (this.isOddRow(index)) {
                return index % this.circlesPerRow === 0;
            } else {
                return false;
            }
        },
        getAdjustedIndex(index) {
            // Calculate how many circles have been skipped before this position
            const row = Math.floor(index / this.circlesPerRow);
            const skippedCircles = this.alternado ? Math.floor(row / 2) : 0;
            return index - skippedCircles;
        },
        getMuestraNumber(index) {
            return this.muestraNumbers[index] || '';
        }
    }
  };
  </script>
  
  <style scoped>
    .panel {
        display: flex;
        flex-direction: column;
        overflow: scroll;
        
        width: 100%;
        height: 300px;
        max-height: 400px;
        padding: 20px;
        margin: 20px;
        
        border-radius: 8px;  
        box-shadow: var(--shadow-button-sobreblanco);
        background-color: var(--color-mas-oscuro);
    }
    
    .grid {
        display: grid;
        grid-template-columns: repeat(var(--circles-per-row), 1fr);
        gap: 2%;
        height: 100%;
        width: 100%;
        max-width: 500px;
    }

    .grid.tresbolillo {
        gap: 1%;
    }

    .borde {
        position: relative;
    }
    
    .circle {
        aspect-ratio: 1;
        border-radius: 50%;
        background-color: var(--color-principal);
    }
    
    .circle.muestreo {
        background-color: var(--color-resalte);
        color: var(--color-mas-oscuro);
        font-size: 100%;
        text-align: center;
        overflow: hidden;
    }

    .circle.highlighted {
        background-color: var(--color-correcto);
    }

    .circle.tresbolillo {
        transform: translateX(60%);
    }
</style>
