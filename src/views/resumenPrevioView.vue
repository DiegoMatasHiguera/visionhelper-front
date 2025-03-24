<template>
  <div class="box">
      <div class="paneles">
        <TestResumenPanel class="resumen"
          :acondicionamiento="acondicionamiento"
          :pretratamiento="pretratamiento"
          :agitacion="agitacion"
          :polarizador="polarizador"
          :lupa="lupa"
          :tiempo_min_obs="tiempo_min_obs"
          :observaciones="observaciones"
        />
        <Panel class="limitado">
          <Titulo texto="Posición de observación"/>
            <div class="fila">
              <div class="campo">Fondo negro:
                <div class="bombillas">                  
                  <img class="bombilla-relieve-negra" src="@/assets/bombilla_relieve.svg"/>
                  <img class="bombilla-relleno" src="@/assets/bombilla_relleno.svg" 
                    :class="negroClass" 
                    :style="{ opacity: negroOpacity }"/>
                </div>
                <div class="fila">                  
                  <div class="luxes">{{ lux_fondo_negro }}</div>
                  <button class="botonPeque" v-if="luxometro_posicion == 'negro' && luxometro_disponible">Fijar</button>
                </div>
              </div>
              <div class="campo">Fondo blanco:
                <div class="bombillas">                  
                  <img class="bombilla-relieve-blanca" src="@/assets/bombilla_relieve.svg"/>
                  <img class="bombilla-relleno" src="@/assets/bombilla_relleno.svg"
                    :class="blancoClass" 
                    :style="{ opacity: blancoOpacity }" 
                    />
                </div>
                <div class="fila">                  
                  <div class="luxes">{{ lux_fondo_blanco }}</div>
                  <button class="botonPeque" v-if="luxometro_posicion == 'blanco' && luxometro_disponible">Fijar</button>
                </div>
              </div>
            </div>
            <div><span class="fila-label">Lux objetivo: </span>{{ lux_min }} - {{ lux_max }} lux</div>
          <div class="instrucciones">
            <span v-if="luxometro_disponible">
              Colocar el dispositivo en cada fondo, de tal manera que alcance la intensidad de luz objetivo. 
              <br>
              Visualizar los viales en esas posiciones. Si no es posible, avisar al responsable del equipo.
            </span>
            <span v-else>
              No se ha detectado un luxómetro en el dispositivo. 
              <br>
              Por favor, comprobar que la calibración del visor de partículas esté en vigor.
            </span>
            </div>
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
 * @component resumenPrevioView
 * @description La página donde el usuario puede ver el resto de información del test.
 */
import protectedRoute from '@/helpers/protectedRoute';
import { useAppInfoStore } from '@/stores/AppInfoStore';
import { useAuthStore } from '@/stores/authStore';
import { useTestsStore } from '@/stores/testStore';
import Button from '@/components/Button.vue';
import Panel from '@/components/Panel.vue';
import Titulo from '@/components/Titulo.vue';
import TextArea from '@/components/TextArea.vue';
import TestResumenPanel from '@/components/TestResumenPanel.vue';

export default {
  name: 'MuestreoView',
  components: {
    Button,
    Panel,
    Titulo,
    TextArea,
    TestResumenPanel
  },
  props: {
    statusPopup: Object,
  },
  data() {
    return {
      AppInfoStore: '',
      authStore: '',
      testStore: '',
      acondicionamiento: '',
      pretratamiento: '',
      agitacion: '',
      polarizador: false,
      lupa: 0,
      tiempo_min_obs: 0,
      lux_min: 0,
      lux_max: 0,
      observaciones: '',
      luxometro_disponible: true,
      luxometro_posicion: 'negro',
      lux_fondo_negro: 0,
      lux_fondo_blanco: 0,
    };
  },
  computed: {
    /**
     * @computed negroOpacity
     * @description Calcula la opacidad para el fondo negro basado en la relación entre el valor actual y el mínimo
     */
    negroOpacity() {
      if (this.lux_min === 0) return 0;
      const ratio = this.lux_fondo_negro / this.lux_min;
      return Math.min(ratio, 1);
    },
    
    /**
     * @computed blancoOpacity
     * @description Calcula la opacidad para el fondo blanco basado en la relación entre el valor actual y el mínimo
     */
    blancoOpacity() {
      if (this.lux_min === 0) return 0;
      const ratio = this.lux_fondo_blanco / this.lux_min;
      return Math.min(ratio, 1);
    },
    
    /**
     * @computed negroClass
     * @description Determina la clase para el fondo negro según el valor de luz
     */
    negroClass() {
      if (this.lux_fondo_negro > this.lux_max) {
        return 'excedido';
      } else if (this.lux_fondo_negro >= this.lux_min && this.lux_fondo_negro <= this.lux_max) {
        return 'correcto';
      }
      return 'inferior';
    },
    
    /**
     * @computed blancoClass
     * @description Determina la clase para el fondo blanco según el valor de luz
     */
    blancoClass() {
      if (this.lux_fondo_blanco > this.lux_max) {
        return 'excedido';
      } else if (this.lux_fondo_blanco >= this.lux_min && this.lux_fondo_blanco <= this.lux_max) {
        return 'correcto';
      }      
      return 'inferior';
    }
  },  
  //Called when the component is created
  async mounted() {    
    this.authStore = useAuthStore();
    this.AppInfoStore = useAppInfoStore();
    this.AppInfoStore.seccion = "Resumen previo";    
    this.AppInfoStore.generarTitle();
    this.testStore = useTestsStore();

    if (protectedRoute.accessProtectedRoute() != null) { 
      if (await this.getTestInfo()) {
        this.AppInfoStore.producto = this.testStore.producto_seleccionado.nombre;
        this.AppInfoStore.lote = this.testStore.lote_seleccionado.id;
        this.AppInfoStore.muestreo = this.testStore.muestreo_seleccionado.nombre;
      }
    }

    // Comprobar si el luxómetro está disponible
    this.luxometro_disponible = await this.comprobarLuxometro();
  },
  methods: {
    /**
     * @method getTestInfo
     * @description Recupera toda la información del test seleccionado.
    */
    async getTestInfo() {
      // Show loading popup
      const idPopupLoading = this.statusPopup.showLoading('Conectando', 'Recuperando información del test...');
           
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

        // Introducimos los datos
        this.acondicionamiento = this.testStore.producto_seleccionado.acondicionamiento;
        this.pretratamiento = this.testStore.producto_seleccionado.pretratamiento;
        this.agitacion = this.testStore.producto_seleccionado.agitacion;
        this.polarizador = this.testStore.producto_seleccionado.polarizador === 1 ? true : false;
        this.lupa = this.testStore.producto_seleccionado.lupa;
        this.tiempo_min_obs = this.testStore.producto_seleccionado.tiempo_min_obs;
        this.lux_min = this.testStore.producto_seleccionado.lux_min;
        this.lux_max = this.testStore.producto_seleccionado.lux_max;
        this.observaciones = this.testStore.producto_seleccionado.observaciones;
        return true;
      } catch (error) {
        this.statusPopup.removePopup(idPopupLoading);
        protectedRoute.handleError(error, this.statusPopup);         

        return false;
      }               
    },

    /**
     * @method comprobarLuxometro
     * @description Comprueba si el luxómetro está disponible.
    */
    async comprobarLuxometro() {
      try {
        // Check if the API is supported
        if ('AmbientLightSensor' in window) {
          // Request permission if needed
          if (navigator.permissions) {
            const result = await navigator.permissions.query({ name: "ambient-light-sensor" });
            if (result.state === "denied") {
              console.log("Permission to use ambient-light sensor is denied.");
              return false;
            }
          }

          // Create sensor instance
          const luxometro = new AmbientLightSensor();
          
          // Add event listeners
          luxometro.addEventListener("error", (event) => {
            // Handle runtime errors
            if (event.error.name === "NotAllowedError") {
              console.log("Permission to use sensor was denied");
              return false;
            } else if (event.error.name === "NotReadableError") {
              console.log("Cannot connect to the sensor");
              return false;
            }
          });
          
          // Add reading event listener to access illuminance values
          luxometro.addEventListener("reading", () => {
            // Access the illuminance value in lux
            console.log(`Current illuminance: ${this.currentLuxValue} lux`);
            if (this.luxometro_disponible && this.luxometro_posicion == "negro") {
              this.lux_fondo_negro = luxometro.illuminance;
            }
            if (this.luxometro_disponible && this.luxometro_posicion == "blanco") {
              this.lux_fondo_blanco = luxometro.illuminance;
            }
          });
          
          // Start the sensor
          await luxometro.start();          
        } else {
          console.log("Ambient Light Sensor API is not supported on this device.");
          return false;
        }
      } catch (error) {
        console.error("Error setting up ambient light sensor:", error);
        return false;
      }
    },

    /**
     * @method atras
     * @description Vuelve a la página anterior.
    */
    atras() {
      const idTest = this.testStore.test_seleccionado.id;      
      this.testStore.clearInfo();
      this.AppInfoStore.clearInfoTest();
      this.$router.push(`/muestreo/${idTest}`);
    },

    /**
     * @method continuar
     * @description Continúa a la página del test.
    */
    continuar() {
      this.$router.push(`/test/${this.testStore.test_seleccionado.id}`);
    }
  }
};
</script>

<style scoped>
.box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;

  width: 100%;
}

.paneles {
  display: flex;
  justify-content: space-evenly;
  min-width: 500px;
  max-width: 1200px; 
  
  width: 100%;
}

.resumen {
  font-size: 16px;
  font-weight: var(--font-peso-medium);
  
  min-width: 450px; 
}

.limitado {
  min-width: 350px;
  max-width: 350px;
  
  justify-content: space-between;
}

.fila {
  width: 100%;  
  display: flex;
  justify-content: space-between;
  align-items: center;

  margin: 5px 0;
}

.fila-label {
  font-weight: var(--font-peso-semibold);
}

.campo {
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 0 10px;
  border-radius: 8px;

  background-color: var(--color-fondo);
}

.bombillas {
  margin-top: -5px;
  margin-bottom: -5px;
  position: relative;
}

.bombilla-relieve {
  position: absolute;
  top: 0;
  left: 0;
}

.bombilla-relieve-blanca {
  filter: invert(1);
}

.bombilla-relleno {
  position: absolute;
  top: 0;
  left: 0;
}

.bombilla-relleno.excedido {
  filter: var(--color-filter-error);
}

.bombilla-relleno.correcto {
  filter: var(--color-filter-correcto);
}

.instrucciones {
  font-size: 12px;
  font-weight: var(--font-peso-medium);
  margin: 10px 0;
}

.botonPeque {
  background-color: var(--color-mas-oscuro);
  box-shadow: 0px 2px 2px 1px rgba(0, 0, 0, 0.5);

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
