<template>
  <div class="footerGeneral">
    <div class="campo-izq">(c) 2025 - Tomeitas Tecnologies S.L.</div>
    <div class="campo"><span class  ="user_name">{{user_name}} - </span><a href="#" @click.prevent="desconectar">Logout</a></div>
    <div class="campo-der"><router-link to="/">Acerca de</router-link></div>
  </div>
</template>

<script>
import protectedRoute from '@/helpers/protectedRoute';
import { useAuthStore } from '@/stores/authStore'

export default {
  name: 'Footer',
  props: {
    statusPopup: Object
  },
  data() {
    return {
      authStore: '',
    };
  },
  //Called when the component is created
  mounted() {    
    this.authStore = useAuthStore();
  },
  computed: {
    user_name() {
      return this.authStore.user_name;
    }
  },
  methods: {
    /**
     * @method desconectar
     * @description Desconecta a un usuario.
    */
    async desconectar() {     
       // Show loading popup, primero limpiamos cualquier popup anterior
      this.statusPopup.clearAll()
      const idPopupLoading = this.statusPopup.showLoading('Desconectando', 'Logout del usuario en proceso...');
      
      const urlSolicitud = "/auth/logout";

      try {
        const response = await protectedRoute.accessProtectedRoute().post(urlSolicitud);
        // Si código OK, eliminamos toda información de usuario local
        this.authStore.clearInfo();

        // Mostrar mensaje de éxito y cerrar el anterior popup
        this.statusPopup.showSuccess('Desconexión exitosa', '¡Hasta luego!');
        this.statusPopup.removePopup(idPopupLoading);

        this.$router.push('/login');        
      } catch (error) {
        this.statusPopup.removePopup(idPopupLoading);
        protectedRoute.handleError(error, this.statusPopup);
      }
    },
  }
};
</script>

<style scoped>
.footerGeneral {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--color-claro);
  filter: drop-shadow(4px 4px 12px rgba(0, 0, 0, 0.25));
  padding: 8px;
  border-radius: 8px 8px 0px 0px;
  position: relative;
}

.campo, .campo-izq, .campo-der {
  flex: 1;
  width: 33.333%;  

  font-family: var(--font-family-titulos);
  font-size: 14px;
  font-weight: var(--font-peso-medium);
  color: var(--color-principal);

  text-align: center;
}

.campo {
  filter: var(--shadow-titulo);
}

.campo-izq {
  text-align: left;
  white-space: nowrap;        /* Prevent text from wrapping to a new line */
  overflow: hidden;           /* Hide any content that overflows */
  text-overflow: ellipsis;    /* Display an ellipsis (...) to represent the overflow */
}

.campo-der {
  text-align: right;
}

@media (max-width: 750px) {
  .campo, .campo-izq, .campo-der {
    font-size: 12px;
  }

  .user_name {
    display: none;
  }
}
</style>
