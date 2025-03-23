<template>
  <div class="box">
      <div class="paneles">
        <div class="columna">
          <Panel class="testinfo">
            <div class="fila">
              <div class="fila-label">· Unidades revisadas:</div>
              <div>{{ unidades_revisadas }}</div>
            </div>
            <div class="fila">
              <div class="fila-label">· Unidades aceptadas:</div>
              <div>{{ unidades_aceptadas }}</div>
            </div>
            <div class="fila">
              <div class="fila-label">· Unidades rechazadas:</div>
              <div>{{ unidades_rechazadas }}</div>
            </div>
            <div class="fila">
              <div class="fila-label">· Tiempo medio/unidad:</div>
              <div>{{ tiempo_medio_ud }}</div>
            </div>
            <div class="fila">
              <div class="fila-label">· Tiempo medio/unidad:</div>
              <div>{{ tiempo_total_texto }}</div>
            </div>
          </Panel>
          <div class="fila">
            <Button @click="ud_previa" texto="⬅️ Unidad previa" :disabled="unidad_numero <= 1"/>
            <Button @click="ud_siguiente" texto="Unidad siguiente ➡️" :disabled="unidad_numero == unidades_revisadas"/> 
          </div>
          <div class="fila">
            <Button @click="sonido_toggle" :texto="sonido ? '🔇 Desactivar sonido' : '🔊 Activar sonido'"/>
            <Button @click="pausa" :texto="pausa ? '▶️ Reanudar' : '⏸️ Pausa'"/> 
          </div>
          <Button @click="atras" texto="Atrás"/>
        </div>
        <div class="columna">
          <Panel>
          <div class="unidad-titulo">Unidad {{ unidad_numero }} de {{ unidades.length }}</div>
          <div class="fila">Estado: <Titulo :texto="estado_actual"/></div>
          <div class="fila">
            <div>Tiempo ({{ estado_actual }}): {{ tiempo_estado }} s.</div>
            <div>Tiempo (unidad): {{ tiempo_unidad }} s.</div>
          </div>
          </Panel>
          <div class="fila">
            <ButtonBig @click="aceptada" texto="Aceptada" :imagen="'/src/assets/aceptado.svg'"/>
            <ButtonBig @click="rechazada" texto="Rechazada" :imagen="'/src/assets/rechazado.svg'"/>
          </div>
          <Panel>
            <TextArea v-model="observaciones_unidad" label="Observaciones de la unidad" placeholder="N/A"/>
          </Panel>
        </div>        
      </div>      
  </div>
</template>

<script>
/**
 * @component TestView
 * @description La página donde el usuario realiza el test en si.
 */
import protectedRoute from '@/helpers/protectedRoute';
import { useAppInfoStore } from '@/stores/AppInfoStore';
import { useAuthStore } from '@/stores/authStore';
import { useTestsStore } from '@/stores/testStore';
import Button from '@/components/Button.vue';
import ButtonBig from '@/components/ButtonBig.vue';
import Panel from '@/components/Panel.vue';
import Titulo from '@/components/Titulo.vue';
import TextArea from '@/components/TextArea.vue';

export default {
  name: 'TestView',
  components: {
    Button,
    ButtonBig,
    Panel,
    Titulo,
    TextArea,
  },
  props: {
    statusPopup: Object,
  },
  data() {
    return {
      AppInfoStore: '',
      authStore: '',
      testStore: '',
      // Datos del producto
      acondicionamiento: '',
      pretratamiento: '',
      agitacion: '',
      polarizador: false,
      lupa: 0,
      tiempo_min_obs: 0,
      lux_min: 0,
      lux_max: 0,
      observaciones: '',
      // Datos del test
      unidades: [],
      unidades_revisadas: 0,
      unidades_aceptadas: 0,
      unidades_rechazadas: 0,
      tiempo_estado: 0,
      tiempo_unidad: 0,
      tiempo_total: 0,
      unidad_numero: 0,
      estado_actual: "Agitando",
      sonido: true,
      pausa: true,
      observaciones_unidad: ""
    };
  },
  computed: {
    tiempo_medio_ud() {
      if (this.unidades_revisadas === 0) return "N/A";

      var tiempo_medio = this.tiempo_total / this.unidades_revisadas;
      var minutos = Math.floor(tiempo_medio / 60);
      var segundos = Math.floor(tiempo_medio % 60);

      return `${minutos}min. ${segundos}s.`;
    },
    tiempo_total_texto() {
      var minutos = Math.floor(this.tiempo_total / 60);
      var segundos = Math.floor(this.tiempo_total % 60);

      return `${minutos}min. ${segundos}s.`;
    }
  },  
  //Called when the component is created
  async mounted() {    
    this.authStore = useAuthStore();
    this.AppInfoStore = useAppInfoStore();
    this.AppInfoStore.seccion = "Test";    
    this.AppInfoStore.generarTitle();
    this.testStore = useTestsStore();

    if (protectedRoute.accessProtectedRoute() != null) { 
      if (await this.getTestInfo()) {
        this.AppInfoStore.producto = this.testStore.producto_seleccionado.nombre;
        this.AppInfoStore.lote = this.testStore.lote_seleccionado.id;
        this.AppInfoStore.muestreo = this.testStore.muestreo_seleccionado.nombre;
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
      const idPopupLoading = this.statusPopup.showLoading('Conectando', 'Recuperando información de test...');
           
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

        return true;
      } catch (error) {
        this.statusPopup.removePopup(idPopupLoading);
        protectedRoute.handleError(error, this.statusPopup);         

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
      this.$router.push(`/resumenPrevio /${idTest}`);
    },
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
  
  width: 100%;
}

.columna {
  display: flex;
  flex-direction: column;
  align-items: center;
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

.instrucciones {
  font-size: 12px;
  font-weight: var(--font-peso-medium);
  margin: 10px 0;
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
