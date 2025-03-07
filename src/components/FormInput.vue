<template>
  <div class="form-group">
    <label :for="id">{{ label }}:</label>
    <input 
      :type="type" 
      :id="id" 
      v-model="inputValue" 
      class="form-input"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :style="inputStyle"
    >
  </div>
</template>

<script>
/**
 * @component FormInput
 * @description Un componente que muestra un campo de entrada de formulario.
 * @prop {String} type - El tipo de campo de entrada ("text" | "email" | "password" | "number" | "tel" | "date").
 * @prop {String} id - El ID del campo de entrada.
 * @prop {String} label - La etiqueta del campo de entrada.
 * @prop {String} modelValue - El valor del campo de entrada.
 * @prop {String} placeholder - El texto por defecto del campo de entrada.
 * @prop {Boolean} required - Si el campo de entrada es obligatorio.
 * @prop {Boolean} disabled - Si el campo de entrada está deshabilitado.
 */
export default {
  name: 'FormInput',
  props: {
    type: {
      type: String,
      default: 'text',
      validator: value => ['text', 'email', 'password', 'number', 'tel', 'date'].includes(value),
      required: true
    },
    id: {
      type: String,
      required: false,
    },
    label: {
      type: String,
      required: true
    },
    modelValue: {
      type: [String, Number],
      default: ''
    },
    placeholder: {
      type: String,
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
    inputValue: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    },
    inputStyle() {
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
  margin: 7px;

  font-size: 18px;
}

label {
  flex: 0 0 auto;
  text-align: left;

  min-width: 200px;
  padding-right: 10px;
}

.form-input {
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

.form-input:focus {
  box-shadow: var(--shadow-focus-pequeno);
}

.form-input[disabled] {
  background-color: var(--color-fondo);
  border-width: 4px;
  border-style: dashed;
  cursor: not-allowed;

  box-shadow: none;
}

.form-input[disabled]:hover {
  box-shadow: none;
}

</style>