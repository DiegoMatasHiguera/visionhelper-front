<template>
  <div class="form-group">
    <label :for="id">{{ label }}:</label>
    <input 
      type="file" 
      :id="id" 
      ref="files" 
      class="form-file"
      :accept="accept"
      :multiple="multiple"
      :required="required"
      :disabled="disabled"
      @change="handleFileChange"
    >
    <!-- Custom styled button -->
    <button 
      type="button" 
      class="botonPeque" 
      @click="triggerFileInput"
    >
      Seleccionar archivo{{ multiple ? 's' : '' }}
    </button>
    <!-- Display selected filenames -->
    <div class="file-names">
      {{ selectedFileNames }}
    </div>
  </div>
</template>

<script>
/**
 * @component FormFile
 * @description Un componente que permite cargar uno o varios archivos.
 * @prop {String} id - El ID del campo de entrada.
 * @prop {String} label - La etiqueta del campo de entrada.
 * @prop {String} accept - El tipo de archivo que se acepta.
 * @prop {Boolean} multiple - Si se permite cargar varios archivos.
 * @prop {Boolean} required - Si el campo de entrada es obligatorio.
 * @prop {Boolean} disabled - Si el campo de entrada está deshabilitado.
 */
export default {
  name: 'FormFile',
  props: {
    id: {
      type: String,
      required: false,
    },
    label: {
      type: String,
      required: true
    },
    accept: {
      type: String,
      default: '*.*'
    },
    multiple: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectedFileNames: 'No hay archivos seleccionados'
    };
  },
  methods: {
    /**
     * Trigger the hidden file input when custom button is clicked
     */
     triggerFileInput() {
      this.$refs.files.click();
    },
    /**
     * Maneja el evento de cambio de archivos y emite los datos codificados
     */
    handleFileChange() {
      const files = this.$refs.files.files;
      if (!files || files.length === 0) {
        this.$emit('file-change', []);
        return;
      }

      // Update the displayed filenames
      if (files.length === 1) {
        this.selectedFileNames = files[0].name;
      } else {
        this.selectedFileNames = `${files.length} archivos seleccionados`;
      }
      
      const promises = [];
      
      for (let i = 0; i < files.length; i++) {
        const promise = this.readFileAsDataURL(files[i]);
        promises.push(promise);
      }
      
      Promise.all(promises).then(encodedFiles => {
        this.$emit('file-change', encodedFiles);
      });
    },
    
    /**
     * Lee un archivo como una cadena de caracteres codificada en base64.
     * @param {File} file - El archivo a leer
     * @returns {Promise} - Una promesa que resuelve a la cadena codificada
     */
    readFileAsDataURL(file) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          resolve(e.target.result);
        };
        
        reader.readAsDataURL(file);
      });
    },
    
    /**
     * Lee los archivos seleccionados como una cadena de caracteres codificada en base64.
     * @returns {Promise<Array>} - Una promesa que resuelve a un array con las cadenas codificadas.
     */
    readFiles() {
      const files = this.$refs.files.files;
      if (!files || files.length === 0) {
        return Promise.resolve([]);
      }
      
      const promises = [];
      
      for (let i = 0; i < files.length; i++) {
        const promise = this.readFileAsDataURL(files[i]);
        promises.push(promise);
      }
      
      return Promise.all(promises);
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

  flex-wrap: wrap;

  font-size: 18px;
}

label {
  flex: 0 0 auto;
  text-align: left;

  min-width: 200px;
  padding-right: 10px;
}

.form-file {
  display: none;
}

.botonPeque {
  font-size: 14px;
  background-color: var(--color-mas-oscuro);
  box-shadow: 0px 2px 2px 1px rgba(0, 0, 0, 0.5);
  padding: 5px;
  margin: 5px;
}

.botonPeque:hover {
  box-shadow: var(--shadow-focus-pequeno);
}

.file-names {
  font-size: 14px;
}

</style>