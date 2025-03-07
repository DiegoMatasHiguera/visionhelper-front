<template>
  <div class="headerGeneral">
    <div class="logoMain">
      <div class="logoEImg">
        <router-link to="/profile"><img class="logoImg" alt="VisionHelper logo" src="@/assets/logo.svg"/></router-link>
        <img class="foto" alt="Avatar picture" :src="avatar"/>
      </div>
      <div class="nombreYVersion">
        <router-link to="/"><span class="logoTitulo">VisionHelper</span></router-link>
        <span class="version">Cliente v.: {{clienteVersion}} </span>
      </div>
    </div>
    <div class="seccion">
      {{seccion}}
    </div>
  </div>
</template>

<script>
import protectedRoute from '@/helpers/protectedRoute';
import { useAppInfoStore } from '@/stores/AppInfoStore';
import { useAuthStore } from '@/stores/authStore';

export default {
  name: 'Header',
  props: {
    statusPopup: Object
  },
  data() {
    return {
      AppInfoStore: '',
      authStore: '',
      avatar: new URL('@/assets/noavatar.png', import.meta.url).href,
    };
  },
  //Called when the component is created
  mounted() {    
    this.AppInfoStore = useAppInfoStore();
    this.authStore = useAuthStore();

    // Controlamos ya de paso si el usuario está logueado
    if (protectedRoute.accessProtectedRoute() != null) {      
      this.getAvatar();
    } else {
      this.$router.push('/login');
    }
  },
  // Se actualizan estos campos dinámicamente
  computed: {
    clienteVersion() {
      return this.AppInfoStore.clientVersion;
    },
    seccion() {
      return this.AppInfoStore.seccion;
    }
  },
  methods: {
    /**
     * @method getNumeroLotesNuevos
     * @description Recupera la cantidad de lotes nuevos para mostrarlo encima del botón de Ver Lotes.
    */
    async getAvatar() {     
       
      const urlSolicitud = "/profile/"+this.authStore.user_email;

      try {
        const response = await protectedRoute.accessProtectedRoute().get(urlSolicitud);
        // Si código OK, actualizamos el token (si ha cambiado)
        protectedRoute.updateAccessToken(response);
        
        if (response.data.avatar_url != null) {
          this.avatar = this.AppInfoStore.environment+response.data.avatar_url;
        }
      } catch (error) {
        protectedRoute.handleError(error, this.statusPopup);
        this.$router.push('/login');
      }
    },

    irAPerfil() {
      this.$router.push('/profile');
    },
  }
};
</script>

<style scoped>
.headerGeneral {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--color-claro);
  filter: drop-shadow(4px 4px 12px rgba(0, 0, 0, 0.25));
  padding: 8px;
  border-radius: 0px 0px 8px 8px;
}

.logoMain {
  display: flex;
  align-items: center;
}

.logoEImg {
  display: flex;
  margin-right: 10px;
  position: relative;
}

.logoImg {
  color: var(--color-principal);
  filter: var(--color-filter-principal) var(--shadow-titulo);

 /* Make SVG responsive */
  max-height: 75px;
  min-height: 75px;
  object-fit: contain; /* Maintain aspect ratio while fitting in the container */
}

.foto {
  width: 40px;
  height: 40px;
  position: absolute;
  left: 23px;
  top: 20px;
  z-index: -1;

  border-radius: 50%; /* Creates a perfect circle */
  object-fit: cover; /* Ensures the image covers the area without distortion */
  overflow: hidden; /* Ensures content doesn't spill outside the border */
}

.logoTitulo {
  font-size: 32px;
  letter-spacing: 3px;
  font-weight: var(--font-peso-semibold);
  color: var(--color-principal);

  filter: var(--shadow-titulo);
}

.nombreYVersion {
  display: flex;
  flex-direction: column;

  position: relative;

  font-family: var(--font-family-titulos);
  font-size: 14px;
}

.version {
  position: absolute;
  top: 45px;
  left: 15px;
  filter: var(--shadow-titulo);
}

.seccion {
  font-family: var(--font-family-titulos);
  font-size: 32px;
  letter-spacing: 3px;
  font-weight: var(--font-peso-semibold);
  color: var(--color-principal);
  text-align: right;
  white-space: nowrap;        /* Prevent text from wrapping to a new line */
  overflow: hidden;           /* Hide any content that overflows */
  text-overflow: ellipsis;    /* Display an ellipsis (...) to represent the overflow */

  padding-right: 30px;
  padding-left: 30px;
  padding-top: 5px;
  padding-bottom: 5px;

  position: relative;
  right: -25px; /* Negative value extends to the right outside parent */
  z-index: 1; /* Ensures it appears above other elements if needed */

  background-color: var(--color-fondo);
  border-radius: 8px 0px 0px 8px;
  
  box-shadow: var(--shadow-button-sobreblanco);
}

@media (max-width: 750px) {
  .seccion {
    font-size: 22px;
  }

  .logoEImg {
    margin-right: 2px;
  }

  .logoImg {
    max-height: 50px;
    min-height: 50px;
  }

  .foto {
    width: 25px;
    height: 25px;
    left: 18px;
    top: 15px;
  }

  .logoTitulo {
    font-size: 24px;
  }
  
  .version {
    position: relative;
    top: -10px;
    left: 10px;
  }
}
</style>
