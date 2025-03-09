<template>
  <div class="form-group">
    <label class="label" :for="id" :class="{ 'disabled': disabled }">{{ label }}:</label>
    <div class="toggle-switch">
      <input
        type="checkbox"
        :id="id"
        :value="true"
        :checked="modelValue"
        v-model="internalValue"
        :disabled="disabled"
        class="toggle-input"
      />
      <label :for="id" class="toggle-label" :class="{ 'disabled': disabled }"></label>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Toggle',
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
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  computed: {
    internalValue: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
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

.label {
  flex: 1 1 auto;
  text-align: left;
  padding-right: 10px;
}

.label.disabled {
  color: #999;
  cursor: not-allowed;
}

.toggle-switch {
  position: relative;
  display: inline-block;
}

.toggle-input {
  height: 0;
  width: 0;
  visibility: hidden;
  position: absolute;
}

.toggle-label {
  cursor: pointer;
  width: 60px;
  height: 30px;
  background: var(--color-mas-oscuro);
  display: block;
  border-radius: 30px;
  position: relative;
  transition: 0.3s;

  box-shadow: 0 0 6px var(--color-mas-oscuro);
}

.toggle-label:hover {
  box-shadow: var(--shadow-focus-pequeno);
}

.toggle-label:after {
  content: '';
  position: absolute;
  top: 5px;
  left: 5px;
  width: 20px;
  height: 20px;
  background: var(--color-principal);
  border-radius: 50%;
  transition: 0.3s;
}

.toggle-input:checked + .toggle-label:hover {
  box-shadow: var(--shadow-focus-pequeno);
}

.toggle-input:checked + .toggle-label {
  background: var(--color-claro);
  
  box-shadow: 0 0 6px var(--color-claro);
}

.toggle-input:checked + .toggle-label:after {
  left: calc(100% - 4px);
  transform: translateX(-100%);
  background: var(--color-mas-oscuro);  
}

.toggle-input:disabled + .toggle-label {
  background: var(--color-gris);
  cursor: not-allowed;
}

.toggle-input:disabled + .toggle-label:after {
  background: var(--color-gris);
}
</style>