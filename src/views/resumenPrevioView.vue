<template>
  <div class="box">
      <div class="paneles">
        <Panel class="resumen">
          <div class="fila">
            <div>Acondicionamiento:</div>
            <div>{{ acondicionamiento }}</div>
          </div>
          <div class="fila">
            <div>Pretratamiento:</div>
            <div>{{ pretratamiento }}</div>
          </div>
          <div class="fila">
            <div>Agitación:</div>
            <div v-if="agitacion.includes('http://') || agitacion.includes('https://')"><a :href="agitacion" target="_blank">Ver instrucciones</a></div>
            <div v-else>{{ agitacion }}</div>
          </div>
          <div class="fila">
            <div>Polarizador:</div>
            <div>{{ polarizador ? 'Sí' : 'No' }}</div>
          </div>
          <div class="fila">
            <div>Lupa:</div>
            <div>{{ lupa }}x</div>
          </div>
          <div class="fila">
            <div>Tiempo mínimo de observación/campo:</div>
            <div>{{ tiempo_min_obs }} segundos</div>
          </div>
          <div>
            <div>Observaciones:</div>
            <div>{{ !observaciones?.trim() ? "N/A" : observaciones }}</div>
          </div>
        </Panel>
        <Panel class="limitado">
          <Titulo texto="Posición de observación"/>
          <div>
            <div class="fila">
              <div class="campo">Fondo negro:
                <div class="bombillas">                  
                  <img class="bombilla-relieve negra" src="@/assets/bombilla_relieve.svg"/>
                  <img class="bombilla-relleno" src="@/assets/bombilla_relleno.svg"/>
                </div>
                <div class="fila">                  
                  <div class="luxes">{{ lux_fondo_negro }}</div>
                  <button class="botonPeque" v-if="luxometro_posicion == 'negro'">Fijar</button>
                </div>
              </div>
            </div>
          </div>
          <div class="fila">
            <div>Lux objetivo:</div>
            <div>{{ lux_min }} - {{ lux_max }} lux</div>
          </div>
          <div class="instrucciones">
            Colocar el dispositivo en cada fondo, de tal manera que alcance la intensidad de luz objetivo. 
            <br>
            Visualizar los viales en esas posiciones. Si no es posible, avisar al responsable del equipo.
          </div>
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

export default {
  name: 'MuestreoView',
  components: {
    Button,
    Panel,
    Titulo,
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
      luxometro_disponible: false,
      luxometro_posicion: 'negro',
      lux_fondo_negro: 0,
      lux_fondo_blanco: 0,
    };
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
    this.luxometro_disponible = this.comprobarLuxometro();
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

        // Introducimos los datos
        this.acondicionamiento = this.testStore.producto_seleccionado.acondicionamiento;
        this.pretratamiento = this.testStore.producto_seleccionado.pretratamiento;
        this.agitacion = this.testStore.producto_seleccionado.agitacion;
        this.polarizador = this.testStore.producto_seleccionado.polarizador;
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
          return true;          
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
  justify-content: flex-start;

  width: 100%;
}

.paneles {
  display: flex;
  justify-content: space-evenly;
  min-width: 500px; 

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
}

.campo {
  display: flex;
  flex-direction: column;
}

.bombillas {
  position: relative;
}

.fila {
  width: 100%;  
  display: flex;
  justify-content: space-between;
  align-items: center;
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
