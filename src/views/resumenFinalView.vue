<template>
  <div class="box">
      <div class="paneles">
        <div class="columna">
          <Panel class="testinfo">
            <div class="unidad-titulo">El lote está...</div>
            <div v-if="estado_test == 'Aceptado'"><img src="@/assets/aceptado.svg" alt="Aceptado" class="icon-aceptado"/></div>
            <div v-if="estado_test == 'Rechazado'"><img src="@/assets/rechazado.svg" alt="Rechazado" class="icon-rechazado"/></div>
            <Titulo :texto="estado_test" :classTitulo="estadoTestTitulo"/>
            <div class="info">{{ informacion }}</div>            
          </Panel>
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
              <div class="fila-label">· Tiempo total visualización:</div>
              <div>{{ tiempo_total_texto }}</div>
            </div>
          </Panel>        
        </div>
        <div class="columna" id="columna-unidad">
          <Panel class="testinfo">
          <div class="unidad-titulo">Unidad {{ unidad_numero }} de {{ cantidad_unidades }}</div>
          <div class="fila">
            <div class="fila-label">Estado: </div>
            <Titulo :texto="estado_actual" :classTitulo="estadoTitulo"/>
            <span v-if="estado_actual != 'Aceptada' && estado_actual != 'Revisando'">-</span>
            <Titulo :texto="campo_actual" 
              :classTitulo="campoTitulo"/>
          </div>
          <div v-if="revisado_por != ''" class="fila">
            <div class="fila-label">Revisado por: </div>
            {{ revisado_por }}
          </div>
          <div class="fila">
            <div><span class="fila-label">Tiempo (unidad): </span>{{ tiempo_unidad }} s.</div>
          </div>
          <Toggle class="toggle-txiki" id="mostrar_muestreo" v-model="mostrar_muestreo" label="Mostrar ubicación en muestreo" :disabled="this.testStore.muestreo_info_adicional == null" :title="this.testStore.muestreo_info_adicional == null ? 'No hay info de muestreo': ''"/>
          </Panel>
          <Panel>
            <TextArea id="observaciones_unidad" v-model="observaciones_unidad" label="Observaciones de la unidad" placeholder="N/A" disabled/>
          </Panel>
          <div class="fila">
            <Button @click="udPrevia" texto="⬅️ Unidad previa" :disabled="unidad_numero <= 1"/>
            <Button @click="udSiguiente" texto="Unidad siguiente ➡️" :disabled="unidad_numero >= unidades_revisadas"/> 
          </div>
        </div>
        <MuestreoBandejaPanel v-if="mostrar_muestreo" class="muestreo"
          :bandejas="bandejas"
          :alternado="alternado"
          :tresbolillo="tresbolillo"
          :currentMuestra="unidad_numero"
        />        
      </div>
      <div class="botones">                
        <Button @click="salir" texto="Salir"/>  
      </div>    
  </div>
</template>

<script>
/**
 * @component resumenFinalView
 * @description La página donde el usuario ve los resultados de un test.
 */
import protectedRoute from '@/helpers/protectedRoute';
import { useAppInfoStore } from '@/stores/AppInfoStore';
import { useAuthStore } from '@/stores/authStore';
import { useTestsStore } from '@/stores/testStore';
import Button from '@/components/Button.vue';
import Panel from '@/components/Panel.vue';
import Titulo from '@/components/Titulo.vue';
import Toggle from '@/components/Toggle.vue';
import TextArea from '@/components/TextArea.vue';
import TestResumenPanel from '@/components/TestResumenPanel.vue';
import MuestreoBandejaPanel from '@/components/MuestreoBandejaPanel.vue';

export default {
  name: 'TestView',
  components: {
    Button,
    Panel,
    Titulo,
    Toggle,
    TextArea,
    TestResumenPanel,
    MuestreoBandejaPanel
  },
  props: {
    statusPopup: Object,
  },
  data() {
    return {
      AppInfoStore: '',
      authStore: '',
      testStore: '',
      mostrar_muestreo: false,
      // Datos del test
      unidades: [],
      unidades_revisadas: 0,
      unidades_aceptadas: 0,
      unidades_rechazadas: 0,
      tiempo_unidad: 0,
      tiempo_total: 0,
      unidad_numero: 1,
      estado_actual: "Agitando",
      campo_actual: "Fondo Negro",
      revisado_por: "",
      observaciones_unidad: "",
      estado_test: "Cargando...",
      ult_usuario: ""
    };
  },
  computed: {
    tiempo_medio_ud() {
      if (this.unidades_revisadas === 0) return "0 min. 0 s.";

      var tiempo_medio = this.tiempo_total / this.unidades_revisadas;
      var minutos = Math.floor(tiempo_medio / 60);
      var segundos = Math.floor(tiempo_medio % 60);

      return `${minutos} min. ${segundos} s.`;
    },
    tiempo_total_texto() {
      var minutos = Math.floor(this.tiempo_total / 60);
      var segundos = Math.floor(this.tiempo_total % 60);

      return `${minutos} min. ${segundos} s.`;
    },
    cantidad_unidades() {
      if (this.testStore.muestreo_info_adicional != null) {
        var num_uds = 0;
        for (const bandeja of this.testStore.muestreo_info_adicional.bandejas) {
          num_uds += bandeja.circlesPerBandeja;
        }
        return num_uds;
      } else {
        return 0;
      }
    },
    estadoTestTitulo() {
      if (this.estado_test === "Nuevo" || this.estado_test === "Muestrando" || this.estado_test === "Visualizando" || this.estado_test === "Disponible") {
        return "titulo-resalte";
      } else if (this.estado_test === "Aceptado") {
        return "titulo-correcto";
      } else if (this.estado_test === "Rechazado") {
        return "titulo-error";
      } else if (this.estado_test === "Bloqueado") {
        return "titulo-disabled";
      }
    },
    estadoTitulo() {
      if (this.estado_actual === "Agitando") {
        return "titulo-resalte";
      } else if (this.estado_actual === "Aceptada") {
        return "titulo-correcto";
      } else if (this.estado_actual === "Rechazada") {
        return "titulo-error";
      } else if (this.estado_actual === "Pausado" || this.estado_actual === "Registrando...") {
        return "titulo-disabled";
      } else if (this.estado_actual === "Revisando") {
        return "titulo-hidden";
      }
    },
    campoTitulo() {
      if (this.estado_actual == "Aceptada") {
        return "titulo-hidden";
      } else {
        if (this.campo_actual === "Fondo Negro") {
          return "titulo-oscuro";
        } else if (this.campo_actual === "Fondo Blanco") {
          return "titulo-claro";
        }
      }      
    },
    informacion() {
      if (this.estado_test == "Aceptado") {
        return "El lote ha sido aprobado. ¡Qué bien!"
      } else if (this.estado_test == "Rechazado") {
        return "El lote ha sido rechazado. ¡Avisa a tu responsable!"
      } else {
        return "Último usuario que ha intervenido en test: "+this.ult_usuario
      }
    }
  },
  //Called when the component is created
  async mounted() {    
    this.authStore = useAuthStore();
    this.AppInfoStore = useAppInfoStore();
    this.AppInfoStore.seccion = "Resultados";    
    this.AppInfoStore.generarTitle();
    this.testStore = useTestsStore();

    if (protectedRoute.accessProtectedRoute() != null) { 
      if (await this.getTestInfo()) {
        this.AppInfoStore.producto = this.testStore.producto_seleccionado.nombre;
        this.AppInfoStore.lote = this.testStore.lote_seleccionado.id;
        this.AppInfoStore.muestreo = this.testStore.muestreo_seleccionado.nombre;

        this.estado_test = this.testStore.test_seleccionado.estado;
        this.ult_usuario = this.testStore.test_seleccionado.ult_usuario;
        
        await this.getUnidadesInfo();
        if (this.unidades.length > 0) {
          this.loadUnidad(this.unidades.length);
        } else {
          this.loadUnidad(1);
        }
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
        this.testStore.muestreo_info_adicional = response.data.test[0].estructura_muestreo 
          ? JSON.parse(response.data.test[0].estructura_muestreo) 
          : null;
        this.testStore.lote_seleccionado = response.data.lote[0];
        this.testStore.test_seleccionado = response.data.test[0];

        // Cargar la información del muestreo
        if (this.testStore.muestreo_info_adicional != null) {
          this.bandejas = this.testStore.muestreo_info_adicional.bandejas;
          this.alternado = this.testStore.muestreo_info_adicional.alternado;
          this.tresbolillo = this.testStore.muestreo_info_adicional.tresbolillo;
        } else {
          throw new Error("No se ha podido recuperar la información de muestreo.");
        }

        return true;
      } catch (error) {
        this.statusPopup.removePopup(idPopupLoading);
        protectedRoute.handleError(error, this.statusPopup);         

        return false;
      }               
    },

    async getUnidadesInfo() {
      // Show loading popup
      const idPopupLoading = this.statusPopup.showLoading('Conectando', 'Recuperando información de unidades del test...');
           
      const urlSolicitud = this.AppInfoStore.environment+"/unidades/"+this.$route.params.testId;

      try {
        const response = await protectedRoute.accessProtectedRoute().get(urlSolicitud);

        // Ocultar mensaje de carga
        this.statusPopup.removePopup(idPopupLoading);
        
        // Cargar la información del test
        this.unidades = response.data;
        this.unidades_revisadas = this.unidades.length;
        this.unidades_aceptadas = this.unidades.filter(unidad => !unidad.tiene_particula).length;
        this.unidades_rechazadas = this.unidades.filter(unidad => unidad.tiene_particula).length;
        for (const unidad of this.unidades) {
          this.tiempo_total += unidad.tiempo_invertido;
        }

        return true;
      } catch (error) {
        this.statusPopup.removePopup(idPopupLoading);
        protectedRoute.handleError(error, this.statusPopup);         

        return false;
      }               
    },

    /**
     * @method loadUnidad
     * @description Carga la información de la unidad seleccionada.
     * @param {Number} unidad_numero - El número de la unidad a cargar.
     */
    loadUnidad(unidad_numero) {
      const indice = unidad_numero-1;
      if (this.unidades[indice].tiene_particula) {
        this.estado_actual = "Rechazada";
      } else {
        this.estado_actual = "Aceptada";
      }
      this.campo_actual = this.unidades[indice].campo_vision;       
      this.tiempo_unidad = this.unidades[indice].tiempo_invertido;
      this.observaciones_unidad = this.unidades[indice].descripcion;
      this.revisado_por = this.unidades[indice].usuario_revision;
      this.unidad_numero = unidad_numero;      
      this.sonido_sonado = false;
    },

    udPrevia() {            
      this.loadUnidad(this.unidad_numero-1);
    },

    udSiguiente() {            
      this.loadUnidad(this.unidad_numero+1);
    },

    /**
     * @method salir
     * @description Vuelve a los lotes.
    */
    salir() {     
      this.testStore.clearInfo();
      this.AppInfoStore.clearInfoTest();
      this.$router.push(`/lotes`);
    },
  }
};
</script>

<style scoped>
.box {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;

  width: 100%;
}

.paneles {
  display: flex;
  justify-content: space-evenly;
  align-items: flex-start;
  min-width: 350px;
  
  width: 100%;
}

.testinfo {
  min-height: 250px;
  justify-content: space-between;
}

.columna {
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 100%;
  min-width: 350px;

  margin-left: 10px;
  margin-right: 10px;
}

.fila {
  width: 100%;  
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.fila-label {
  font-weight: var(--font-peso-semibold);
}

.unidad-titulo {
  font-size: 24px;
  font-weight: var(--font-peso-bold);
}

.instrucciones {
  font-size: 12px;
  font-weight: var(--font-peso-medium);
  margin: 10px 0;
}

Button {
  min-width: 225px;
}

.botones {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.toggle-txiki > * {
  font-weight: var(--font-peso-semibold);
  font-size: 14px;
}

.icon-aceptado {
  height: 80px;

  filter: var(--color-filter-correcto);
}

.icon-rechazado {
  height: 80px;

  filter: var(--color-filter-error);
}

@media (max-width: 750px) {
  .paneles {
    flex-direction: column;
    align-items: center;
  }

  .muestreo {
    order: 1;
  }
}
</style>
