<template>
  <div class="box">      
    <ButtonBig @click="irAPerfil"
      :imagen="'/src/assets/profile-icon.svg'" 
      texto="Perfil" 
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
      avisos_cualificaciones: false,
      AppInfoStore: '',
    };
  },
  //Called when the component is created
  mounted() {
    this.AppInfoStore = useAppInfoStore();
    this.AppInfoStore.seccion = "Inicio";

    if (protectedRoute.accessProtectedRoute() != null) {      
      this.getNumeroLotesNuevos();
    }
  },
  methods: {
    /**
     * @method getNumeroLotesNuevos
     * @description Recupera la cantidad de lotes nuevos para mostrarlo encima del botón de Ver Lotes.
    */
    async getNumeroLotesNuevos() {     
      // Show loading popup
      const idPopupLoading = this.statusPopup.showLoading('Conectando', 'Recuperando información de lotes nuevos...');
      
      const urlSolicitud = "/lotes/nuevos";

      try {
        const response = await protectedRoute.accessProtectedRoute().get(urlSolicitud);

        // Ocultar mensaje de carga
        this.statusPopup.removePopup(idPopupLoading);
        
        // TODO: cargar la información de lotes nuevos

      } catch (error) {
        this.statusPopup.removePopup(idPopupLoading);
        protectedRoute.handleError(error, this.statusPopup);
      }
    },

    irAPerfil() {
      this.$router.push('/profile');
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
