<template>
  <div class="box">      
      <button type="submit" class="button-big">
        <img src="@/assets/profile-icon.svg" alt="Perfil" class="button-icon" />
        Perfil
      </button>
      <button type="submit" class="button-big">
        <img src="@/assets/profile-icon.svg" alt="Perfil" class="button-icon" />
        Perfil
      </button>
      <button type="submit" class="button-big">
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

export default {
  name: 'DashboardView',
  props: {
    statusPopup: Object
  },
  data() {
    return {
      numero_lotes_nuevos: 0,
      avisos_cualificaciones: false,
    };
  },
  // Called when the component is created
  created() {
    if (protectedRoute.accessProtectedRoute() != null) {
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
  width: 150px;
  margin: 20px;
}

.button-big {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  margin: 20px;
  
  background-color: var(--color-oscuro);
  
  font-weight: var(--font-peso-bold);
}

.box {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  overflow: visible; 

  height: 100%;
  width: 100%;
  margin-top: 20px;
  margin-bottom: 20px;
  background-color: transparent;
}
</style>
