<template>
  <audio ref="timerSound" :src="timer_sonido_source" preload="auto"></audio>
  <audio ref="registradoSound" :src="registrado_sonido_source" preload="auto"></audio>
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
              <div class="fila-label">· Tiempo total visualización:</div>
              <div>{{ tiempo_total_texto }}</div>
            </div>
            <Toggle class="toggle-txiki" id="mostrar_producto" v-model="mostrar_producto" label="Mostrar información del producto"/>
          </Panel>
          <TestResumenPanel v-if="mostrar_producto" class="testinfo"
            :acondicionamiento="acondicionamiento"
            :pretratamiento="pretratamiento"
            :agitacion="agitacion"
            :polarizador="polarizador"
            :lupa="lupa"
            :tiempo_min_obs="tiempo_min_obs"
            :observaciones="observaciones"
          />
          <div class="fila">
            <Button @click="udPrevia" texto="⬅️ Unidad previa" :disabled="unidad_numero <= 1"/>
            <Button @click="udSiguiente" texto="Unidad siguiente ➡️" :disabled="unidad_numero >= unidades_revisadas"/> 
          </div>
          <div class="fila">
            <Button @click="sonidoToggle" :texto="sonido ? '🔇 Desactivar sonido' : '🔊 Activar sonido'"/>
            <Button @click="pausar" :texto="pausa ? '▶️ Reanudar' : '⏸️ Pausa'" :disabled="revisado_por!=''"/> 
          </div>
          <Button @click="atras" texto="Atrás"/>
        </div>
        <div class="columna">
          <Panel class="testinfo">
          <div class="unidad-titulo">Unidad {{ unidad_numero }} de {{ cantidad_unidades }}</div>
          <div class="fila">
            <div class="fila-label">Estado: </div>
            <Titulo :texto="pausa ? 'Pausado' : estado_actual" 
              :classTitulo="tipoTitulo"
              :sombreado="tiempo_estado>tiempo_min_obs"/>
          </div>
          <div v-if="revisado_por != ''" class="fila">
            <div class="fila-label">Revisado por: </div>
            {{ revisado_por }}
          </div>
          <div class="fila">
            <div><span class="fila-label">Tiempo ({{ estado_actual }}): </span>{{ tiempo_estado }} s.</div>
            <div><span class="fila-label">Tiempo (unidad): </span>{{ tiempo_unidad }} s.</div>
          </div>
          <Toggle class="toggle-txiki" id="mostrar_muestreo" v-model="mostrar_muestreo" label="Mostrar ubicación en muestreo" :disabled="this.testStore.muestreo_info_adicional == null" :title="this.testStore.muestreo_info_adicional == null ? 'No hay info de muestreo': ''"/>
          </Panel>
          <div class="fila">
            <ButtonBig @click="estado_actual == 'Fondo Negro' ? cambiarAFondoBlanco() : registrarUnidad(false)" texto="Aceptada" imagen_color="verde" :imagen="'/src/assets/aceptado.svg'" :disabled="checkIndisponibilidadBoton" :selected="this.estado_actual.startsWith('Aceptada')"/>
            <ButtonBig @click="registrarUnidad(true)" texto="Rechazada" imagen_color="rojo" :imagen="'/src/assets/rechazado.svg'" :disabled="checkIndisponibilidadBoton" :selected="this.estado_actual.startsWith('Rechazada')"/>
          </div>
          <Panel>
            <TextArea id="observaciones_unidad" v-model="observaciones_unidad" label="Observaciones de la unidad" placeholder="Describir el defecto detectado..."/>
          </Panel>
        </div>
        <MuestreoBandejaPanel v-if="mostrar_muestreo" class="muestreo"
          :bandejas="bandejas"
          :alternado="alternado"
          :tresbolillo="tresbolillo"
          :currentMuestra="unidad_numero"
        />        
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
import Toggle from '@/components/Toggle.vue';
import TestResumenPanel from '@/components/TestResumenPanel.vue';
import MuestreoBandejaPanel from '@/components/MuestreoBandejaPanel.vue';
import dingSoundFile from '@/assets/ding.mp3';
import registradoSoundFile from '@/assets/registrado.mp3';

export default {
  name: 'TestView',
  components: {
    Button,
    ButtonBig,
    Panel,
    Titulo,
    TextArea,
    Toggle,
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
      // Datos del producto
      acondicionamiento: '',
      pretratamiento: '',
      agitacion: '',
      polarizador: false,
      lupa: 0,
      tiempo_min_obs: 0,
      observaciones: '',
      mostrar_producto: false,
      mostrar_muestreo: false,
      // Datos del test
      unidades: [],
      unidades_revisadas: 0,
      unidades_aceptadas: 0,
      unidades_rechazadas: 0,
      timer: null,
      tiempo_estado: 0,
      tiempo_unidad: 0,
      tiempo_total: 0,
      unidad_numero: 1,
      estado_actual: "Agitando",
      revisado_por: "",
      sonido: true,
      timer_sonido_source: dingSoundFile,
      registrado_sonido_source: registradoSoundFile,
      sonido_sonado: false,
      pausa: true,
      observaciones_unidad: "",
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
    tipoTitulo() {
      if (this.pausa) {
        return "titulo-disabled";
      } else if (this.estado_actual === "Agitando") {
        return "titulo-resalte";
      } else if (this.estado_actual === "Fondo Negro") {
        return "titulo-oscuro";
      } else if (this.estado_actual === "Fondo Blanco") {
        return "titulo-claro";
      } else {
        return "titulo-disabled";
      }
    },
    checkIndisponibilidadBoton() {
      return !(this.estado_actual == 'Fondo Negro' ||
       this.estado_actual == 'Fondo Blanco' ||
       ((this.estado_actual.startsWith('Aceptada') || this.estado_actual.startsWith('Rechazada')) && this.revisado_por == ''))
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
        
        await this.getUnidadesInfo();
        if (this.unidades.length > 0) {
          this.loadUnidad(this.unidades.length);
        } else {
          this.loadUnidad(1);
        }
      }
    }
  },
  // Borrar el timer si se desmonta el componente
  beforeUnmount() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
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

        // Cargar la información del producto
        this.acondicionamiento = this.testStore.producto_seleccionado.acondicionamiento;
        this.pretratamiento = this.testStore.producto_seleccionado.pretratamiento;
        this.agitacion = this.testStore.producto_seleccionado.agitacion;
        this.polarizador = this.testStore.producto_seleccionado.polarizador === 1 ? true : false;
        this.lupa = this.testStore.producto_seleccionado.lupa;
        this.tiempo_min_obs = this.testStore.producto_seleccionado.tiempo_min_obs;
        this.observaciones = this.testStore.producto_seleccionado.observaciones;

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
     * @method pausar
     * @description Pausa o reanuda el temporizador.
     * @param {Boolean} reanudar - Indica si se debe reanudar el temporizador (opcional).
     */
    pausar(reanudar) {
      if (arguments.length == 0) {
        reanudar = !this.pausa;
      }
      if (reanudar) {
        if (this.estado_actual != "Agitando") {
          this.loadUnidad(this.unidad_numero+1);
        }
        this.pausa = false;
        this.sonido_sonado = false;
        this.startTimer();
      } else {
        this.pausa = true;
        this.tiempo_estado = 0;
        this.pauseTimer();
      }
    },

    cambiarAFondoBlanco() {
      this.estado_actual = "Fondo Blanco";
      this.tiempo_estado = 0;            
      this.sonido_sonado = false;
      this.playRegistradoSound();
    },

    /**
     * @method registrarUnidad
     * @description Registra la unidad.
     * @param {Object} rechazada - El resultado de la unidad (true si tiene partícula o false si es aceptada).
     */
    async registrarUnidad(rechazada) {      
      const urlSolicitud = "/unidades/register";

      const jsonEnvio = {
        id_test: this.testStore.test_seleccionado.id,
        id_en_muestreo: this.unidad_numero,
        usuario_revision: this.authStore.user_email,
        tiene_particula: rechazada,
        descripcion: this.observaciones_unidad,
        tiempo_invertido: this.tiempo_unidad,
        fecha_creacion: new Date().toISOString().split('T')[0],
      };

      if (this.estado_actual.startsWith('Rechazada')) {
        jsonEnvio.campo_vision = this.estado_actual.split(" | ")[1];
      }

      try {              
        this.estado_actual = "Registrando...";
        const response = await protectedRoute.accessProtectedRoute().post(urlSolicitud, jsonEnvio);

        this.playRegistradoSound();
        if (this.estado_actual.startsWith('Rechazada') || this.estado_actual.startsWith('Aceptada')) {
          if (rechazada) {
            this.unidades_rechazadas++;
          } else {
            this.unidades_aceptadas++;
          }

          if (this.estado_actual.startsWith('Rechazada')) {
            this.unidades_rechazadas--;
          } else if (this.estado_actual.startsWith('Aceptada')) {
            this.unidades_aceptadas--;
          }
        } else {
          this.unidades.push(jsonEnvio);
          this.unidades_revisadas++;
          if (rechazada) {
            this.unidades_rechazadas++;
          } else {
            this.unidades_aceptadas++;
          }
        }        
        this.loadUnidad(this.unidad_numero+1);        
      } catch (error) {
        protectedRoute.handleError(error, this.statusPopup);
      }
    },

    /**
     * @method sonidoToggle
     * @description Activa o desactiva el sonido de notificación.
     */
    sonidoToggle() {
      this.sonido = !this.sonido;
    },

    /**
     * @method playTimerSound
     * @description Reproduce un sonido de notificación de tiempo trascurrido.
     */
    playTimerSound() {
      const sound = this.$refs.timerSound;
      sound.currentTime = 0; // Reset audio to beginning
      sound.play().catch(e => console.error("Audio play error:", e));
    },

    /**
     * @method playRegistradoSound
     * @description Reproduce un sonido de notificación de registro de unidad.
     */
    playRegistradoSound() {
      const sound = this.$refs.registradoSound;
      sound.currentTime = 0; // Reset audio to beginning
      sound.play().catch(e => console.error("Audio play error:", e));
    },

    /**
     * @method startTimer
     * @description Inicia el temporizador.
     */
    startTimer() {
      this.timer = setInterval(() => {
        this.tiempo_estado++;
        if (this.tiempo_estado >= this.tiempo_min_obs) {
          if (this.sonido && !this.sonido_sonado) {
            this.playTimerSound();
            this.sonido_sonado = true;
            if (this.estado_actual === "Agitando") {
              this.tiempo_estado = 0;
              this.estado_actual = "Fondo Negro";
              this.sonido_sonado = false;
            }
          }
        }
        this.tiempo_unidad++;
        this.tiempo_total++;
      }, 1000);
    },

    /**
     * @pauseTimer
     * @description Pausa el temporizador.
     */
    pauseTimer() {
      clearInterval(this.timer);
      this.timer = null;
    },

    loadUnidad(unidad_numero) {
      const indice = unidad_numero-1;
      if (indice < this.unidades.length) {
        if (this.unidades[indice].tiene_particula) {
          this.estado_actual = "Rechazada" + " | " + this.unidades[indice].campo_vision;
        } else {
          this.estado_actual = "Aceptada";
        }
        this.tiempo_estado = 0;       
        this.tiempo_unidad = this.unidades[indice].tiempo_invertido;
        this.observaciones_unidad = this.unidades[indice].descripcion;
        if (this.unidades[indice].usuario_revision != this.authStore.user_email) {
          this.revisado_por = this.unidades[indice].usuario_revision;
        }
      } else {        
        this.estado_actual = "Agitando";
        this.tiempo_estado = 0;
        this.tiempo_unidad = 0;
        this.observaciones_unidad = "";
        this.pausar();
      }      
      this.unidad_numero = unidad_numero;      
      this.sonido_sonado = false;
    },

    udPrevia() {            
      this.pausar(false);
      this.loadUnidad(this.unidad_numero-1);
    },

    udSiguiente() {            
      this.pausar(false);
      this.loadUnidad(this.unidad_numero+1);
    },

    /**
     * @method atras
     * @description Vuelve a la página anterior.
    */
    atras() {
      const idTest = this.testStore.test_seleccionado.id;      
      this.testStore.clearInfo();
      this.AppInfoStore.clearInfoTest();
      this.$router.push(`/resumenPrevio/${idTest}`);
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
  align-items: flex-start;
  min-width: 500px;
  
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

  margin-left: 10px;
  margin-right: 10px;
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
}

.toggle-txiki > * {
  font-weight: var(--font-peso-semibold);
  font-size: 14px;
}

@media (max-width: 750px) {
  .paneles {
    flex-direction: column-reverse;
    align-items: center;
  }
}
</style>
