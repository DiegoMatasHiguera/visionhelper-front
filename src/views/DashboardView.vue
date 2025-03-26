<template>
  <div class="box">      
    <ButtonBig @click="irAPerfil"
      :imagen="'/src/assets/profile-icon.svg'" 
      texto="Perfil" 
    />
    <ButtonBig @click="irALotes"
      :imagen="'/src/assets/vial.svg'" 
      texto="Lotes"
      :texto_notificacion="texto_lotes_nuevos"
      tipo_notificacion="amarilla"
      :disabled="!cualificado"
      :title="!cualificado ? 'No puedes ver lotes hasta que no hagas el examen!' : ''" 
    />
    <ButtonBig @click="irAExamenes"
      :imagen="'/src/assets/exam-icon.svg'" 
      texto="Exámenes"
      :texto_notificacion="texto_examenes_nuevos"
      :tipo_notificacion="cualificado ? 'amarilla' : 'roja'"
      disabled
      title="Pendiente implementar..."
    />
  </div>
</template>

<script>
/**
 * @component DashboardView
 * @description La página de origen de la aplicación, una vez logineado el usuario.
 */
import protectedRoute from '@/helpers/protectedRoute';
import { useAppInfoStore } from '@/stores/AppInfoStore';
import { useAuthStore } from '@/stores/authStore';
import { useTestsStore } from '@/stores/testStore';
import ButtonBig from '@/components/ButtonBig.vue';

export default {
  name: 'DashboardView',
  components: {
    ButtonBig
  },
  props: {
    statusPopup: Object
  },
  data() {
    return {
      numero_lotes_nuevos: 0,
      numero_examenes_nuevos: 0,
      cualificado: false,
      AppInfoStore: '',
      authStore: '',
      testStore: '',
    };
  },
  computed: {
    texto_lotes_nuevos() {
      return this.numero_lotes_nuevos > 0 ? (String) (this.numero_lotes_nuevos) : "";
    },
    texto_examenes_nuevos() {
      return this.numero_examenes_nuevos > 0 ? (String) (this.numero_examenes_nuevos) : "";
    }
  },
  //Called when the component is created
  async mounted() {
    this.authStore = useAuthStore();
    this.AppInfoStore = useAppInfoStore();
    this.AppInfoStore.seccion = "Inicio";
    this.AppInfoStore.generarTitle();
    this.testStore = useTestsStore();

    // Limpiamos la información de tests y muestreos
    this.testStore.clearInfo();
    this.testStore.clearInfoMuestreo();
    this.AppInfoStore.clearInfoTest();

    if (protectedRoute.accessProtectedRoute() != null) {      
      await this.getTestsPendientes();
      this.getInfoUsuario();
    } else {
      this.$router.push('/login');
    }
  },
  methods: {
    /**
     * @method getInfoUsuario
     * @description Recupera la información del usuario para mostrarla en el dashboard.
    */
    async getInfoUsuario() {     
      // Show loading popup
      const idPopupLoading = this.statusPopup.showLoading('Conectando', 'Recuperando información de usuario...');
      
      const urlSolicitud = "/profile/"+this.authStore.user_email;

      try {
        const response = await protectedRoute.accessProtectedRoute().get(urlSolicitud);

        // Ocultar mensaje de carga
        this.statusPopup.removePopup(idPopupLoading);
        
        // Cargar la información de usuario.
        this.cualificado = response.data.cualificado;
        this.authStore.setUserName(response.data.nombre);
        this.authStore.setTipo(response.data.tipo);
      } catch (error) {
        this.statusPopup.removePopup(idPopupLoading);
        protectedRoute.handleError(error, this.statusPopup);
      }
    },

    /**
     * @method getTestsPendientes
     * @description Recupera la cantidad de tests pendientes para mostrarlo encima del botón de Ver Lotes.
    */
    async getTestsPendientes() {     
      // Show loading popup
      const idPopupLoading = this.statusPopup.showLoading('Conectando', 'Recuperando información de lotes nuevos...');
      
      const urlSolicitud = this.AppInfoStore.environment+"/tests/";
      const jsonEnvio = {
        tipo_usuario: this.authStore.tipo,
        user_email: this.authStore.user_email,
      };

      try {
        const response = await protectedRoute.accessProtectedRoute().post(urlSolicitud, jsonEnvio);

        // Ocultar mensaje de carga
        this.statusPopup.removePopup(idPopupLoading);
        
        // Cargar la información de tests nuevos.
        for (let i = 0; i < response.data.length; i++) {
          if (response.data[i].estado != "Aceptado" && response.data[i].estado != "Rechazado") {
            if (response.data[i].nombre_muestreo.includes("Examen")) {
              this.numero_examenes_nuevos++;
            } else {
              this.numero_lotes_nuevos++;
            }
          }
        }
      } catch (error) {
        this.statusPopup.removePopup(idPopupLoading);
        protectedRoute.handleError(error, this.statusPopup);
      }
    },

    irAPerfil() {
      this.$router.push('/profile');
    },

    irALotes() {
      this.$router.push('/lotes');
    },

    irAExamenes() {
      this.$router.push('/examenes');
    },
  }
};
</script>

<style scoped>
.box {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  overflow: visible; 

  width: 100%;
  background-color: transparent;
}
</style>
