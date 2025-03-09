<template>
  <div :class="formClass">
    <label :for="id">{{ label }}:</label>
    <input 
      type="range" 
      :id="id" 
      v-model="inputValue" 
      :class="sliderClass"
      :required="required"
      :disabled="disabled"
      :orientation="orientation"
      :min="min"
      :max="max"
      :step="step"
    >
    <div>{{ inputValue }}</div>
  </div>
  
</template>

<script>
/**
 * @component Slider
 * @description Un componente de formulario que permite arrastrar un knob a lo largo de una línea.
 * @prop {String} id - El ID del campo de entrada.
 * @prop {String} label - La etiqueta del campo de entrada.
 * @prop {String|Number} modelValue - El valor del campo de entrada.
 * @prop {Boolean} required - Si el campo de entrada es obligatorio.
 * @prop {Boolean} disabled - Si el campo de entrada está deshabilitado.
 * @prop {String} orientation - La orientación del slider: 'horizontal' o 'vertical'.
 * @prop {Number} min - El valor mínimo del slider.
 * @prop {Number} max - El valor máximo del slider.
 * @prop {Number} step - El incremento del slider.
 */
export default {
  props: {
    id: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    modelValue: {
      type: [String, Number],
      required: true
    },
    required: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    orientation: {
      type: String,
      default: 'horizontal',
      validator: (value) => ['horizontal', 'vertical'].includes(value)
    },
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 100
    },
    step: {
      type: Number,
      default: 1
    }
  },
  computed: {
    inputValue: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    },
    sliderClass() {
      return {
        'slider vertical': this.orientation === 'vertical',
        'slider': this.orientation === 'horizontal'
      };
    },
    formClass() {
      return {
        'form-group vertical': this.orientation === 'vertical',
        'form-group': this.orientation === 'horizontal'
      };
    }
  }
}
</script>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 7px;
  font-size: 18px;
}

.slider {
  -webkit-appearance: none;
  appearance: none;
  height: 12px;
  width: auto;
  border-radius: 5px;  
  background: var(--color-mas-oscuro);
  outline: none;  
  transition: 0.3s;

}

.slider.vertical {
  writing-mode: vertical-lr;
  direction: rtl;
  height: auto;
  width: 12px;
  vertical-align: bottom;
}

.slider:hover {  
  box-shadow: var(--shadow-focus-pequeno);
}

.slider::-webkit-slider-runnable-track {
  background: var(--color-mas-oscuro);;
  border-radius: 16px;
  
  box-shadow: 0 0 6px var(--color-mas-oscuro);
  /*  slider progress trick  */
  overflow: hidden;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-principal);
  border: 4px solid var(--color-mas-oscuro);
  cursor: pointer;
  /*  slider progress trick  */
  box-shadow: 0 100px 10px 100px var(--color-claro);
}
</style>