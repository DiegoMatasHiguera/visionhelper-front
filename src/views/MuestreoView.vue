<template>
  <div class="box">
      <div class="paneles">
        <div v-if="this.testStore.muestreo_info_adicional == null" class="panel">
          <Titulo :texto="tituloText" />
          <FormInput v-model="num_bandejas" label="Nº bandejas" type="number" @input="recalcular"/>
          <FormInput v-model="num_filas" label="Nº filas/bandeja" type="number" @input="recalcular"/>
          <FormInput v-model="num_uds_fila" label="Nº unidades/fila" type="number" @input="recalcular"/>
          <FormInput v-model="num_uds_total" label="Nº unidades totales" type="number"/>
          <div class="fila">            
            <Toggle id="tresbolillo" v-model="tresbolillo" label="Tresbolillo"/>
            <Toggle id="alternado" v-model="alternado" label="Alternado" :disabled="alternado_disabled"/>
          </div>
        </div>
        <div v-else class="panel">
          <Button texto="Generar nuevo muestreo" @click="resetMuestreo"/>
        </div>
        <Panel class="muestreo">
          <div class="fila">
            <div><button class="botonPeque" @click="prevBandeja">
              <</button> Bandeja nº: {{ bandeja_actual+1 }} de {{ bandejas.length }}
              <button class="botonPeque" @click="nextBandeja">></button>
            </div>
            <div>Muestras a tomar: <span class="muestrasTomar"> {{ muestras_a_tomar }}</span></div>
          </div>
          <Muestreo 
            v-if="bandejas.length > 0"
            :numMuestrasInicio="bandejas[bandeja_actual].numMuestrasInicio"
            :rows="bandejas[bandeja_actual].rows"
            :circlesPerRow="bandejas[bandeja_actual].circlesPerRow"
            :circlesPerBandeja="bandejas[bandeja_actual].circlesPerBandeja"
            :muestreoCircles="bandejas[bandeja_actual].muestreoCircles"
            :alternado="alternado"
            :tresbolillo="tresbolillo"
          />
        </Panel>
      </div>
      <div class="botones">
        <Button @click="atras" 
          texto="Atrás" 
        />
        <Button @click="continuar" 
          texto="Continuar"
        />
      </div>      
  </div>
</template>

<script>
/**
 * @component MuestreoView
 * @description La página donde el usuario puede ver el plan de muestreo.
 */
import protectedRoute from '@/helpers/protectedRoute';
import { useAppInfoStore } from '@/stores/AppInfoStore';
import { useAuthStore } from '@/stores/authStore';
import { useTestsStore } from '@/stores/testStore';
import Button from '@/components/Button.vue';
import Panel from '@/components/Panel.vue';
import Titulo from '@/components/Titulo.vue';
import FormInput from '@/components/FormInput.vue';
import Toggle from '@/components/Toggle.vue';
import Muestreo from '@/components/Muestreo.vue';

export default {
  name: 'MuestreoView',
  components: {
    Button,
    Panel,
    Titulo,
    FormInput,
    Toggle,
    Muestreo,
  },
  props: {
    statusPopup: Object,
  },
  data() {
    return {
      AppInfoStore: '',
      authStore: '',
      testStore: '',
      tituloText: '',
      bandeja_actual: 0,
      bandejas: [],
      num_bandejas: 1,
      num_filas: 0,
      num_uds_fila: 9,
      num_uds_total: 0,
      muestras_a_tomar: 0,
      udsMuestreo: [],
      alternado: false,
      alternado_disabled: true,
      tresbolillo: false,
    };
  },
  watch: {
    // Disable alternado if tresbolillo is enabled
    tresbolillo() {
      if (!this.tresbolillo) {
        this.alternado = false;
        this.alternado_disabled = true;
      } else {
        this.alternado_disabled = false;
      }
    },
    
    // Re-generate bandejas when num_uds_total changes
    num_uds_total() {
      if (this.num_uds_total < 1) {
        this.num_uds_total = 1;
      } else if (this.num_uds_total > this.num_filas*this.num_uds_fila*this.num_bandejas) {
        this.num_bandejas = Math.ceil(this.num_uds_total / this.num_uds_fila / this.num_filas / this.num_bandejas);
      } else if (this.num_uds_total < this.num_filas*this.num_uds_fila*(this.num_bandejas-1)) {
        this.num_bandejas = Math.ceil(this.num_uds_total / this.num_uds_fila / this.num_filas / this.num_bandejas);
      }
      this.generatePlanMuestreo();
      this.generateBandejas();
    },
  },
  //Called when the component is created
  async mounted() {    
    this.authStore = useAuthStore();
    this.AppInfoStore = useAppInfoStore();
    this.AppInfoStore.seccion = "Muestreo";
    this.testStore = useTestsStore();

    if (protectedRoute.accessProtectedRoute() != null) { 
      if (await this.getTestInfo()) {
        this.AppInfoStore.producto = this.testStore.producto_seleccionado.nombre;
        this.AppInfoStore.lote = this.testStore.lote_seleccionado.id;
        this.AppInfoStore.muestreo = this.testStore.muestreo_seleccionado.nombre;            
        this.AppInfoStore.generarTitle();
        
        this.tituloText = "Tipo muestreo: "+this.testStore.muestreo_seleccionado.nombre;

        this.generatePlanMuestreo();
        this.generateBandejas();
      }
    }
  },
  methods: {
    /**
     * @method recalcular
     * @description Recalcula el número de unidades totales.
    */
    recalcular() {
      if (this.num_bandejas < 1) {
        this.num_bandejas = 1;
      }
      if (this.num_filas < 1) {
        this.num_filas = 1;
      }
      if (this.num_uds_fila < 1) {
        this.num_uds_fila = 1;
      }
      if (this.alternado) {
        this.num_uds_total = this.num_filas * this.num_uds_fila * this.num_bandejas - Math.floor(this.num_filas/2);
      } else {
        this.num_uds_total = this.num_filas * this.num_uds_fila * this.num_bandejas;
      }
    },

    /**
     * @method getTestInfo
     * @description Recupera toda la información del test seleccionado.
    */
    async getTestInfo() {
      // Show loading popup
      const idPopupLoading = this.statusPopup.showLoading('Conectando', 'Recuperando información de tests nuevos...');
           
      const urlSolicitud = this.AppInfoStore.environment+"/tests/"+this.$route.params.testId;
      const jsonEnvio = {
        tipo_usuario: this.authStore.tipo,
        user_email: this.authStore.user_email,
      };

      try {
        const response = await protectedRoute.accessProtectedRoute().post(urlSolicitud, jsonEnvio);

        // Ocultar mensaje de carga
        this.statusPopup.removePopup(idPopupLoading);
        
        // Cargar la información del test
        this.testStore.producto_seleccionado = response.data.producto[0];
        this.testStore.muestreo_seleccionado = response.data.tipo_muestreo[0];
        this.testStore.lote_seleccionado = response.data.lote[0];
        this.testStore.test_seleccionado = response.data.test[0];

        // Introducimos los datos básicos
        this.num_uds_total = this.testStore.lote_seleccionado.tamano;
        this.num_filas = Math.ceil(this.num_uds_total / this.num_uds_fila);
        return true;
      } catch (error) {
        this.statusPopup.removePopup(idPopupLoading);
        protectedRoute.handleError(error, this.statusPopup);         

        return false;
      }               
    },

    /**
     * @method generatePlanMuestreo
     * @description Genera un plan de muestreo, dependiendo del tipo de muestreo seleccionado (azar, sistemático, homogéneo).
    */
    generatePlanMuestreo() {
      if (this.testStore.muestreo_seleccionado.cada != 0) {
        this.muestras_a_tomar = this.testStore.muestreo_seleccionado.cantidad 
          * this.testStore.muestreo_seleccionado.cada;
        if (this.muestras_a_tomar > this.num_uds_total) {
          this.muestras_a_tomar = this.num_uds_total;
        }
      } else {
        this.muestras_a_tomar = Math.ceil(this.testStore.muestreo_seleccionado.cantidad/100 * this.num_uds_total);
      }

      var indicesMuestreo = [];      
      var muestrasRestantes = this.muestras_a_tomar;

      if (this.testStore.muestreo_seleccionado.tipo == "azar") {
        if (this.testStore.muestreo_seleccionado.cada > 0) {
          var pasoActual = 0;
          while (muestrasRestantes > 0) {
            // Al azar entre un rango              
            var indice = Math.floor(Math.random() * ((pasoActual+this.testStore.muestreo_seleccionado.cada) - pasoActual)) + pasoActual;
            if (!indicesMuestreo.includes(indice)) {
              indicesMuestreo.push(indice);
              muestrasRestantes--;
              pasoActual += this.testStore.muestreo_seleccionado.cada;
            }
          }
        } else {
          while (muestrasRestantes > 0) {
            var indice = Math.floor(Math.random() * this.num_uds_total);
            if (!indicesMuestreo.includes(indice)) {
                indicesMuestreo.push(indice);
                muestrasRestantes--;
            }
          }
        }        
      } else if (this.testStore.muestreo_seleccionado.tipo == "sistemático") {
        var puntoInicio = Math.floor(Math.random() * (this.num_uds_total-this.muestras_a_tomar));
        var pasoActual = 0;
        while (muestrasRestantes > 0) {
          var indice = puntoInicio+pasoActual;                   
          if (indice >= this.num_uds_total) {
            puntoInicio = indice - this.num_uds_total+1;
            pasoActual = 0;
            indice = puntoInicio;
          }            
          indicesMuestreo.push(indice);

          muestrasRestantes--;
          if (this.testStore.muestreo_seleccionado.cada > 0) {          
            pasoActual += this.testStore.muestreo_seleccionado.cada;
          } else {
            pasoActual++;
          }
        }
      } else if (this.testStore.muestreo_seleccionado.tipo == "homogéneo") {
        var paso = Math.floor(this.num_uds_total / this.muestras_a_tomar);
        var centrador = Math.floor(paso/2);
        for (let i = 0; i < this.muestras_a_tomar; i++) {
          indicesMuestreo.push(i*paso + centrador);
        }
      }

      this.udsMuestreo = indicesMuestreo;
    },

     /**
     * @method generateBandejas
     * @description Genera información para cada bandeja.
     */
     generateBandejas() {
      if (this.testStore.muestreo_info_adicional != null) {        
        this.bandejas = this.testStore.muestreo_info_adicional.bandejas;
        this.alternado = this.testStore.muestreo_info_adicional.alternado;
        this.tresbolillo = this.testStore.muestreo_info_adicional.tresbolillo;

        this.num_bandejas = this.bandejas.length;        
        this.muestras_a_tomar = 0;
        for (let i = 0; i < this.bandejas.length; i++) {
          this.muestras_a_tomar += this.bandejas[i].muestreoCircles.length;
        }
      } else {
        this.bandejas = [];
        var numMuestrasInicio = 0;
        var circlesAcumulados = 0;

        for (let i = 0; i < this.num_bandejas; i++) {
          var circlesPerBandeja = 0;
          const muestreoCircles = [];
          if (i == this.num_bandejas-1) {
            circlesPerBandeja = this.num_uds_total - circlesAcumulados;
          } else {
            if (this.alternado) {
              circlesPerBandeja = this.num_filas * this.num_uds_fila - Math.floor(this.num_filas/2);
            } else {
              circlesPerBandeja = this.num_filas * this.num_uds_fila;
            }
          }
          circlesAcumulados += circlesPerBandeja;
          
          // Metemos los índices de las muestras a tomar
          var numMuestras = 0;
          for (let j = 0; j < this.udsMuestreo.length; j++) {
            if (this.udsMuestreo[j] >= i*circlesPerBandeja && this.udsMuestreo[j] < (i+1)*circlesPerBandeja) {
              muestreoCircles.push(this.udsMuestreo[j] - i*circlesPerBandeja);
              numMuestras++;
            }
          }

          var rowsFinal = this.num_filas;
          if (this.alternado) {
            const rowsCompletas = Math.floor(circlesPerBandeja/this.num_uds_fila);
            const udsSkipped = Math.floor(rowsCompletas / 2);
            rowsFinal += Math.floor((circlesPerBandeja%this.num_uds_fila + udsSkipped)/this.num_uds_fila);
          }
          
          this.bandejas.push({
            numMuestrasInicio: numMuestrasInicio,
            rows: rowsFinal,
            circlesPerRow: this.num_uds_fila,
            circlesPerBandeja: circlesPerBandeja,
            muestreoCircles: muestreoCircles
          });

          numMuestrasInicio += numMuestras;
        }
      }      
      
      // Reset current bandeja if out of bounds
      if (this.bandeja_actual >= this.num_bandejas) {
        this.bandeja_actual = 0;
      }
    },

    /**
     * @method nextBandeja
     * @description Go to next bandeja
     */
     nextBandeja() {
      if (this.bandeja_actual < this.num_bandejas-1) {
        this.bandeja_actual++;
      } else {
        this.bandeja_actual = 0;
      }
    },
    
    /**
     * @method prevBandeja
     * @description Go to previous bandeja
     */
    prevBandeja() {
      if (this.bandeja_actual >= 1) {
        this.bandeja_actual--;
      } else {
        this.bandeja_actual = this.num_bandejas-1;
      }
    },

    /**
     * @method guardarMuestreo
     * @description Guarda el muestreo generado.
     */
    async guardarMuestreo() {
      this.testStore.muestreo_info_adicional = {
        bandejas: this.bandejas,
        alternado: this.alternado,
        tresbolillo: this.tresbolillo,
      };

      // Show loading popup
      const idPopupLoading = this.statusPopup.showLoading('Guardando', 'Guardando el muestreo generado...');
           
      const urlSolicitud = this.AppInfoStore.environment+"/tests/registerMuestreo/"+this.$route.params.testId;
      const jsonEnvio = this.testStore.muestreo_info_adicional;

      try {
        const response = await protectedRoute.accessProtectedRoute().post(urlSolicitud, jsonEnvio);

        // Ocultar mensaje de carga
        this.statusPopup.removePopup(idPopupLoading);
        
        return true;
      } catch (error) {
        this.statusPopup.removePopup(idPopupLoading);
        protectedRoute.handleError(error, this.statusPopup);         

        return false;
      }
    },

    /**
     * @method resetMuestreo
     * @description Resetea el muestreo generado.
     */
    resetMuestreo() {
      this.testStore.clearInfoMuestreo();
    },

    /**
     * @method atras
     * @description Vuelve a la página anterior.
    */
    atras() {      
      this.$router.push('/lotes');
    },

    /**
     * @method continuar
     * @description Continúa a la página de resumen previo.
    */
    async continuar() {
      await this.guardarMuestreo();
      this.$router.push(`/resumenPrevio/${this.testStore.test_seleccionado.id}`);
    }
  }
};
</script>

<style scoped>
.box {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  width: 100%;
}

.paneles {
  display: flex;
  justify-content: space-evenly;
  min-width: 500px; 

  width: 100%;
}

.panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  max-width: 600px;
  min-width: 400px;

  width: 100%;
  margin: 20px;

  font-size: 20px;
  font-weight: var(--font-peso-semibold);
}

.muestreo {
  font-size: 16px;
  font-weight: var(--font-peso-medium);
  
  min-width: 450px; 
}

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

.botones {
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 750px) {
  .paneles {
    flex-direction: column;
    align-items: center;
  }
}
</style>
