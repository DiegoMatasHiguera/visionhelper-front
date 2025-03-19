<template>
    <div class="panel">
      <div class="grid" :style="gridStyle">
        <div 
          v-for="index in circlesPerBandeja" 
          :key="index"
          class="borde"
        >
            <div class="circle" 
            :class="{ 'muestreo': isMuestreoCircle(index-1) }"></div>
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
      }
    },
    computed: {
      gridStyle() {
        return {
          '--circles-per-row': this.circlesPerRow,
          'grid-template-rows': `repeat(${this.rows}, 1fr)`,
          'aspect-ratio': `${this.circlesPerRow} / ${this.rows}`
        };
      }
    },
    methods: {
      isMuestreoCircle(index) {
        return this.muestreoCircles.includes(index);
      }
    }
  };
  </script>
  
  <style scoped>
  .panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: start;
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
    gap: 10px;
    width: 100%;
    max-width: 500px;
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
  }
  </style>
