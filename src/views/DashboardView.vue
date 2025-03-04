<template>
  <div class="box">      
      <button class="button-big" @click="getNumeroLotesNuevos">
        <img src="@/assets/profile-icon.svg" alt="Perfil" class="button-icon" />
        Perfil
      </button>
      <button class="button-big">
        <img src="@/assets/profile-icon.svg" alt="Perfil" class="button-icon" />
        Perfil
      </button>
      <button class="button-big">
        <img src="@/assets/profile-icon.svg" alt="Perfil" class="button-icon" />
        Perfil
      </button>
  </div>
</template>

<script>
/**
 * @component DashboardView
 * @description La página de origen de la aplicación, una vez logineado el usuario.
 */
import protectedRoute from '@/helpers/protectedRoute';
import { useAppInfoStore } from '@/stores/AppInfoStore';

export default {
  name: 'DashboardView',
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
    if (protectedRoute.accessProtectedRoute() != null) {      
      this.AppInfoStore = useAppInfoStore();
      this.AppInfoStore.seccion = "Inicio";
      this.getNumeroLotesNuevos();
    } else {
      this.$router.push('/login');
    }
  },
  methods: {
    /**
     * @method getNumeroLotesNuevos
     * @description Recupera la cantidad de lotes nuevos para mostrarlo encima del botón de Ver Lotes.
    */
    async getNumeroLotesNuevos() {     
      // Show loading popup
      this.statusPopup.showLoading('Conectando', 'Recuperando información de lotes nuevos...');
      
      const urlSolicitud = "/auth/login";

      try {
        const response = await protectedRoute.accessProtectedRoute().get(urlSolicitud);
        protectedRoute.updateAuthInfo(response);

        // Ocultar mensaje de carga
        this.statusPopup.hide();
        
        // TODO: cargar la información de lotes nuevos

      } catch (error) {
        protectedRoute.handleError(error, this.statusPopup, this.$router);
      }
    }
  }
};
</script>

<style scoped>
.button-icon {
  filter: var(--color-filter-principal);
  width: 120px;

  margin-bottom: 25px;
}

.button-big {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  width: 200px;
  height: 225px;

  margin: 20px;
  
  background-color: var(--color-oscuro);
  
  font-weight: var(--font-peso-bold);
}

.box {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  overflow: visible; 

  height: 90%;
  width: 100%;
  background-color: transparent;
}
</style>
