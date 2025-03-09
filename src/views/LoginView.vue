<template>
  <div class="box">
    <form class="login-form" @submit.prevent="login">
      <FormInput
        label="Correo electrónico"
        v-model="user_email"
        type="email"
        required
      />      
      <FormInput
        label="Contraseña"
        v-model="password"
        type="password"
        required
      />      
      <div class="forgot-password">
        <a href="#">¿Olvidaste tu contraseña?</a>
      </div>
      <Button
        texto="Entrar"
        type="submit"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Conectando...' : 'Entrar' }}
      </Button>      
    </form>
  </div>
</template>

<script>
/**
 * @component LoginView
 * @description La página de inicio de sesión de la aplicación.
 */

import axios from 'axios';
import { useAuthStore } from '@/stores/authStore'
import { useAppInfoStore } from '@/stores/AppInfoStore'
import FormInput from '@/components/FormInput.vue';
import Button from '@/components/Button.vue';

export default {
  name: 'LoginView',
  components: {
    FormInput,
    Button,
  },
  props: {
    statusPopup: Object
  },
  data() {
    return {
      user_email: '',
      password: '',
      isLoading: false,
      AppInfoStore: '',
    };
  },
  mounted() {    
    this.AppInfoStore = useAppInfoStore();
    this.AppInfoStore.seccion = "Login";
  },
  methods: {
    /**
     * @method login
     * @description Controla el envío del formulario de inicio de sesión.
    */
    async login() {
      this.isLoading = true;
      
      const authStore = useAuthStore();
      const urlLogin = this.AppInfoStore.environment+'/auth/login';

      // Show loading popup
      const idPopupLoading = this.statusPopup.showLoading('Conectando', 'Verificando credenciales...');

      const jsonEnvio = {
        user_email: this.user_email,
        password: this.password,
      };

      try {
        const response = await axios.post(urlLogin, jsonEnvio);

        const access_token = response.data["access_token"];
        const refresh_token = response.data["refresh_token"];
        const user_email = response.data['user_email'];
        const user_name = response.data['user_name'];
        const tipo = response.data['tipo'];

        // Store tokens, email, usuario y tipo
        authStore.setInfo(access_token, refresh_token, user_email, user_name, tipo);

        // Mostrar mensaje de éxito
        this.statusPopup.removePopup(idPopupLoading);
        this.statusPopup.showSuccess('Conexión exitosa', 'Redireccionando...');

        // Redireccionar al dashboard
        setTimeout(() => {
          this.$router.push('/dashboard');
        }, 1500);
      } catch (error) {
        var errorMessage = "";
        if (error.response.data) {
          for (const key in error.response.data) {
            errorMessage += `${key}: ${error.response.data[key]}\n`;
          }
        } else {
          // Si es problema de la aplicación cliente:
          errorMessage = error.message;
        }

        // Error case with action button and callback
        this.statusPopup.removePopup(idPopupLoading);
        this.statusPopup.showError("Error de conexión", errorMessage, {
          showButton: true,
          buttonText: 'Intentar de nuevo',
          actionCallback: () => {
            this.password = ''; // Clear password field
          }
        });
        
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.box {
  font-weight: var(--font-peso-semibold);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  height: 100%;
  width: 100%;
  max-width: 600px;
  padding: 40px 20px;
  background-color: transparent;
}

.login-form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.login-form * {
  margin-bottom: 20px;
}
</style>
