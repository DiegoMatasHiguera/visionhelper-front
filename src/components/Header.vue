<template>
  <div class="headerGeneral">
    <div class="logoMain">
      <div class="logoEImg">
        <router-link to="/profile"><img class="logoImg" alt="VisionHelper logo" :title="this.authStore.user_name + ' - ' + this.authStore.tipo" src="@/assets/logo.svg"/></router-link>
        <img class="foto" alt="Avatar picture" :src="avatar" @error="handleImageError"/>
      </div>
      <div class="nombreYVersion">
        <router-link to="/"><span class="logoTitulo" title="Ir a Inicio">VisionHelper</span></router-link>
        <span class="version">Cliente v.: {{clienteVersion}} </span>
      </div>
    </div>
    <div class="secciones" :class="{'secciones-with-product': this.AppInfoStore.producto != ''}">
      <div v-if="this.AppInfoStore.producto != ''" class="subseccion">
        <div :title="this.AppInfoStore.producto + ' | ' + this.AppInfoStore.lote + ' | ' + this.AppInfoStore.muestreo">{{ this.AppInfoStore.producto }}</div>
        <div :title="this.AppInfoStore.producto + ' | ' + this.AppInfoStore.lote + ' | ' + this.AppInfoStore.muestreo">{{ this.AppInfoStore.lote }} | {{ this.AppInfoStore.muestreo }}</div>
      </div>
      <div :title="seccion" class="seccion" :class="{'seccion-with-product': this.AppInfoStore.producto != ''}">{{seccion}}</div>
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

    handleImageError(event) {
      console.error('Avatar failed to load:', event.target.src);
      // Set a fallback image
      this.avatar = new URL('@/assets/noavatar.png', import.meta.url).href;
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
  left: 22px;
  top: 21px;
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

.secciones {
  display: flex;
  align-items: flex-end;
  overflow: hidden;

  position: relative;
  right: -25px; /* Negative value extends to the right outside parent */
  
  box-shadow: var(--shadow-button-sobreblanco);  
  border-radius: 8px 0px 0px 8px;
}

.secciones-with-product { 
  box-shadow: none;
  
  padding-top: 5px;
  padding-bottom: 5px;
}

.secciones > * {
  font-family: var(--font-family-titulos);
  font-weight: var(--font-peso-semibold);
  color: var(--color-principal);  
  letter-spacing: 3px;
  height: 60px;
  text-align: right;
  white-space: nowrap;        /* Prevent text from wrapping to a new line */
  overflow: hidden;           /* Hide any content that overflows */
  text-overflow: ellipsis;    /* Display an ellipsis (...) to represent the overflow */

  padding-right: 30px;
  padding-left: 30px;
  padding-top: 5px;
  padding-bottom: 5px;

  background-color: var(--color-fondo);
  border-radius: 8px 0px 0px 8px;
}

.seccion {
  font-size: 32px;

  z-index: 2; /* Ensures it appears above other elements if needed */
}

.seccion-with-product {
  box-shadow: -4px 0px 2px 0px rgba(0, 0, 0, 0.25);
}

.subseccion {
  display: flex;
  flex-direction: column;

  font-size: 20px;
  letter-spacing: 1px;  
  line-height: normal;

  position: relative;
  right: -10px;
  z-index: 1;

  box-shadow: var(--shadow-focus-pequeno);
}

@media (max-width: 750px) {
  .secciones {
    flex-direction: column-reverse;
    overflow: visible;

    max-height: 70px;
  }

  .seccion {
    line-height: 40px;
    height: 50px;
    min-height: 40px;
    font-size: 20px;
  }

  .seccion-with-product {    
    line-height: 30px;
  }

  .subseccion {    
    flex-direction: row;
    top: 2%;  
    min-height: 27px;

    font-size: 14px;

    z-index: 3;
  }

  .subseccion > * {
    margin-right: 10px;
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
    left: 17px;
    top: 16px;
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
