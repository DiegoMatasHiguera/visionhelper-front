<template>
  <div class="box">
    <form class="login-form" @submit.prevent="login">
      <div class="form-group">
        <label for="email">Email:</label>
        <input 
          type="email" 
          id="email" 
          v-model="user_email" 
          class="form-input"
          required
        >
      </div>
      
      <div class="form-group">
        <label for="password">Contraseña:</label>
        <input 
          type="password" 
          id="password" 
          v-model="password" 
          class="form-input"
          required
        >
      </div>
      
      <div class="forgot-password">
        <a href="#">¿Olvidaste tu contraseña?</a>
      </div>
      
      <button type="submit" class="login-button" :disabled="isLoading">
        {{ isLoading ? 'Conectando...' : 'Entrar' }}
      </button>
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

export default {
  name: 'LoginView',
  props: {
    statusPopup: Object
  },
  data() {
    return {
      user_email: '',
      password: '',
      isLoading: false,
    };
  },
  methods: {
    /**
     * @method login
     * @description Controla el envío del formulario de inicio de sesión.
    */
    async login() {
      this.isLoading = true;
      
      const authStore = useAuthStore()
      const AppInfoStore = useAppInfoStore()
      const urlLogin = AppInfoStore.environment+'/auth/login';

      // Show loading popup
      this.statusPopup.showLoading('Conectando', 'Verificando credenciales...');

      const jsonEnvio = {
        user_email: this.user_email,
        password: this.password,
      };

      try {
        const response = await axios.post(urlLogin, jsonEnvio);

        const { access_token, refresh_token } = response.data;

        // Store tokens
        authStore.setTokens(access_token, refresh_token);

        // Mostrar mensaje de éxito
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
        this.statusPopup.showError("Error de conexión", errorMessage, {
          showButton: true,
          buttonText: 'Intentar de nuevo',
          actionCallback: () => {
            this.password = ''; // Clear password field
          }
        });
      }

      this.isLoading = false;
    }
  }
};
</script>

<style scoped>
.box {
  font-weight: var(--font-peso-semibold);

  width: 100%;
  max-width: 600px;
  padding: 40px 20px;
  background-color: transparent;
}

.login-form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  width: 100%;
}

.form-group {
  display: flex;
  justify-content: space-between;
  align-items: center;

  margin-bottom: 25px;
}

label {
  flex: 0 0 auto;
  font-size: 30px;
  text-align: right;
}

.form-input {
  flex: 0 0 auto; /* Don't grow or shrink, maintain natural size */
  
  width: 60%;
  height: 60px;
  padding: 12px;
  border: var(--color-oscuro) 4px solid;
  border-radius: 8px;
  background-color: var(--color-principal);

  font-size: 20px;
  color: var(--color-mas-oscuro);

  transition: box-shadow 0.3s ease-in-out;
}

.form-input:focus {
  box-shadow: var(--shadow-focus-pequeno);
}

.forgot-password {
  text-align: center;
  font-size: 20px;

  margin-bottom: 25px;
}

.login-button {
  align-self: center;
  
  background-color: var(--color-oscuro);
}

</style>
