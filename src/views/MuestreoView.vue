<template>
  <div class="box">
      <div class="paneles">
        <div class="panel">
          <Titulo :texto="tituloText" />
          <FormInput v-model="num_bandejas" label="Nº bandejas" type="number"/>
          <FormInput v-model="num_filas" label="Nº filas/bandeja" type="number"/>
          <FormInput v-model="num_uds_fila" label="Nº unidades/fila" type="number"/>
          <FormInput v-model="num_uds_total" label="Nº unidades totales" type="number"/>
          <div class="fila">            
            <Toggle title="Pendiente implementar..." id="tresbolillo" v-model="tresbolillo" label="Tresbolillo" disabled/>
            <Toggle title="Pendiente implementar..." id="alternado" v-model="alternado" label="Alternado" :disabled="!tresbolillo"/>
          </div>
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
          texto="Continuar" disabled
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
      tresbolillo: false,
    };
  },
  watch: {
    // Re-generate bandejas when input parameters change
    num_bandejas() {
      if (this.num_bandejas < 1) {
        this.num_bandejas = 1;
      } else {        
        this.num_uds_total = this.num_filas*this.num_uds_fila*this.num_bandejas;
        this.generatePlanMuestreo();
        this.generateBandejas();
      }
    },
    num_filas() {
      if (this.num_filas < 1) {
        this.num_filas = 1;
      } else {
        this.num_uds_total = this.num_filas*this.num_uds_fila*this.num_bandejas;
        this.generatePlanMuestreo();
        this.generateBandejas();
      }
    },
    num_uds_fila() {
      if (this.num_uds_fila < 1) {
        this.num_uds_fila = 1;
      } else {
        this.num_uds_total = this.num_filas*this.num_uds_fila*this.num_bandejas;
        this.generatePlanMuestreo();
        this.generateBandejas();
      }
    },
    num_uds_total() {
      if (this.num_uds_total < 1) {
        this.num_uds_total = 1;
      } else if (this.num_uds_total > this.num_filas*this.num_uds_fila*this.num_bandejas) {
        this.num_filas = Math.ceil(this.num_uds_total / this.num_uds_fila);
      } else {
        this.generatePlanMuestreo();
        this.generateBandejas();
      }
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

        this.tituloText = "Tipo muestreo: "+this.testStore.muestreo_seleccionado.nombre;

        this.generatePlanMuestreo();
        this.generateBandejas();
      }
    }
  },
  methods: {
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
        this.muestras_a_tomar = this.testStore.muestreo_seleccionado.cantidad/100 * this.num_uds_total;
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
        const puntoInicio = Math.floor(Math.random() * (this.num_uds_total-this.muestras_a_tomar));
        var pasoActual = 0;
        while (muestrasRestantes > 0) {       
            var indice = puntoInicio+pasoActual;            
            indicesMuestreo.push(indice);

            muestrasRestantes--;
            if (this.testStore.muestreo_seleccionado.cada > 0) {          
              pasoActual += this.testStore.muestreo_seleccionado.cada;
            } else {
              pasoActual++;
            }

            if (pasoActual >= this.num_uds_total) {
              puntoInicio = pasoActual - this.num_uds_total;
              pasoActual = 0;
            }
        }
      } else if (this.testStore.muestreo_seleccionado.tipo == "homogéneo") {
        var paso = Math.floor(this.num_uds_total / this.muestras_a_tomar);
        for (let i = 0; i < this.muestras_a_tomar; i++) {
          indicesMuestreo.push(i*paso);
        }
      }

      this.udsMuestreo = indicesMuestreo;
    },

     /**
     * @method generateBandejas
     * @description Genera información para cada bandeja.
     */
     generateBandejas() {
      this.bandejas = [];
      
      for (let i = 0; i < this.num_bandejas; i++) {
        var circlesPerBandeja = 0;
        const muestreoCircles = [];
        if (i == this.num_bandejas-1) {
          circlesPerBandeja = this.num_uds_total - (this.num_filas * this.num_uds_fila * (this.num_bandejas-1));
        } else {
          circlesPerBandeja = this.num_filas * this.num_uds_fila;
        }
        
        // Metemos los índices de las muestras a tomar
        for (let j = 0; j < this.udsMuestreo.length; j++) {
          if (this.udsMuestreo[j] >= i*circlesPerBandeja && this.udsMuestreo[j] < (i+1)*circlesPerBandeja) {
            muestreoCircles.push(this.udsMuestreo[j] - i*circlesPerBandeja);
          }
        }
        
        this.bandejas.push({
          rows: this.num_filas,
          circlesPerRow: this.num_uds_fila,
          circlesPerBandeja: circlesPerBandeja,
          muestreoCircles: muestreoCircles
        });
      }
      
      // Reset current bandeja if out of bounds
      if (this.bandeja_actual > this.num_bandejas) {
        this.bandeja_actual = 1;
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
    continuar() {
      this.$router.push(`/resumenPrevio/${test.id}`);
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
  
  min-width: 400px; 
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
