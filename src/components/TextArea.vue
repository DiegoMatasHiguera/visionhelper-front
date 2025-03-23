<template>
    <div class="textarea">
        <label :for="id">{{ label }}:</label>
        <textarea
            :id="id"
            :rows="rows"
            :placeholder="placeholder"
            v-model="inputValue"
            :readonly="readonly"/>
    </div>
</template>

<script>
import { readonly } from 'vue';

/**
 * @component TextArea
 * @description Un componente que muestra un campo de texto de formulario estilizado.
 */
 export default {
    name: 'TextArea',
    props: {
        id: {
            type: String,
            required: true
        },
        label: {
            type: String,
            default: 'Texto'
        },
        rows: {
            type: Number,
            default: 4
        },
        placeholder: {
            type: String,
            default: ''
        },
        modelValue: {
            type: String,
            default: ''
        },
        readonly: {
            type: String,
            default: "false"
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
    }
};
</script>

<style scoped>
label {
    font-weight: var(--font-peso-semibold);
}

.textarea {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;

    width: 100%;
    margin: 10px;
}

.textarea textarea {    
    font-family: inherit;
    color: inherit;

    padding: 10px;
    box-sizing: border-box;
    width: 100%;        
    resize: none;

    border-radius: 8px;
    background-color: var(--color-mas-oscuro);
    border: none;

    box-shadow: var(--shadow-button-sobreblanco);
}

.textarea textarea:focus {
    box-shadow: var(--shadow-focus-pequeno);
}

.textarea textarea[readonly]:focus {
    box-shadow: none;
}

.textarea textarea::placeholder {
    color: var(--color-gris);
}
</style>
