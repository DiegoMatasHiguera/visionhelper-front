<template>
  <div class="form-group">
    <label :for="id">{{ label }}:</label>
    <select 
      :name="name" 
      :id="id" 
      v-model="selectorValue" 
      class="form-selector"
      :required="required"
      :disabled="disabled"
      :style="selectorStyle"
    >
      <slot></slot>
    </select>
  </div>
</template>

<script>
/**
 * @component Selector
 * @description Un selector de opciones en formulario.
 * @prop {String} id - El ID.
 * @prop {String} name - El nombre.
 * @prop {String} label - La etiqueta.
 * @prop {String} modelValue - El valor del selector.
 * @prop {Boolean} required - Si es obligatorio.
 * @prop {Boolean} disabled - Si está deshabilitado.
 */
export default {
  name: 'Selector',
  props: {
    id: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true
    },
    modelValue: {
      type: [String, Number],
      default: ''
    },
    required: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    width: {
      type: String
    },
  },
  computed: {
    selectorValue: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    },
    selectorStyle() {
      return {
        width: this.width
      };
    }
  }
}
</script>

<style scoped>
.form-group {
  width: 100%;
  display: flex;
  align-items: center;
  margin-top: 7px;
  margin-bottom: 7px;

  font-size: 18px;
}

label {
  flex: 0 0 auto;
  text-align: left;

  min-width: 200px;
  padding-right: 10px;
}

.form-selector {
  flex: 1 0 auto;
  height: 50px;
  padding: 12px;
  
  min-width: 50px;

  border: var(--color-mas-oscuro) 4px solid;
  border-radius: 8px;
  background-color: var(--color-principal);

  color: var(--color-mas-oscuro);

  transition: box-shadow 0.3s ease-in-out;
}

.form-selector:focus {
  box-shadow: var(--shadow-focus-pequeno);
}

.form-selector[disabled] {
  background-color: transparent;
  border-style: dashed;
  cursor: not-allowed;

  box-shadow: none;
}

.form-selector[disabled]:hover {
  box-shadow: none;
}
</style>