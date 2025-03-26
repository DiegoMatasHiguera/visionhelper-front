<template>
  <div class="box">
    <form class="login-form" @submit.prevent="register">
      <FormInput
        label="Nombre y apellidos"
        v-model="nombre_apellidos"
        type="text"
        required
      />
      <FormInput
        label="Correo electrónico"
        v-model="user_email"
        type="email"
        required
      />
      <Selector v-model="tipo" name="tipo" label="Tipo usuario" required>
        <option value="Elaboración">Elaboración</option>
        <option value="Control de Calidad">Control de Calidad</option>
        <option value="Administrador" disabled title="Pendiente implementar...">Administrador</option>
      </Selector>
      <span v-if="!validatePassword(password)" class='error'>
            {{ getPasswordErrorMessage(password) }}
      </span>
      <span v-if="validatePassword(password)" class='correcto'>
        {{ getPasswordErrorMessage(password) }}
      </span>      
      <FormInput
        label="Contraseña"
        v-model="password"
        type="password"
        required
      />
      <FormInput
        label="Repetir contraseña"
        v-model="again_password"
        type="password"
        required
      />
      <span v-if="password && again_password && password !== again_password" class="error">
            Las contraseñas no coinciden.
      </span>
      <Button
        texto="Registrarse"
        type="submit"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Registrándose...' : 'Entrar' }}
      </Button>
      <div class="forgot-password">
        <router-link to="/login">¿Ya registrado? ¡Loginéate!</router-link>
      </div>     
    </form>
  </div>
</template>

<script>
/**
 * @component RegisterView 
 * @description La página de registro de un usuario.
 */

import axios from 'axios';
import { useAuthStore } from '@/stores/authStore'
import { useAppInfoStore } from '@/stores/AppInfoStore'
import { validatePasswordComplexity, getPasswordValidationMessage } from '@/helpers/passwordValidator';
import FormInput from '@/components/FormInput.vue';
import Button from '@/components/Button.vue';
import Selector from '@/components/Selector.vue';

export default {
  name: 'RegisterView',
  components: {
    FormInput,
    Button,
    Selector,
  },
  props: {
    statusPopup: Object
  },
  data() {
    return {
      nombre_apellidos: '',
      user_email: '',
      password: '',
      again_password: '',
      tipo: 'Elaboración',
      isLoading: false,
      AppInfoStore: '',
    };
  },
  mounted() {    
    this.AppInfoStore = useAppInfoStore();
    this.AppInfoStore.seccion = "Registro";    
    this.AppInfoStore.generarTitle();
  },
  methods: {
    /**
     * @method validatePassword
     * @description Valida la complejidad de una contraseña.
     * @param {String} password - La contraseña a validar.
     * @returns {Boolean} - Si la contraseña es válida.
    */
    validatePassword(password) {
      return validatePasswordComplexity(password);
    },
  
    getPasswordErrorMessage(password) {
      return getPasswordValidationMessage(password);
    },
    /**
     * @method register
     * @description Controla el envío del registro de un nuevo usuario.
    */
    async register() {
      // Check if passwords match
      if (this.password !== this.again_password) {
        this.statusPopup.showError('Error', 'Las contraseñas no coinciden.');          
        return;
      }
      
      // Validate password complexity
      if (!this.validatePassword(this.password)) {
        this.statusPopup.showError('Error', 'Comprobar el formato de la contraseña', 
        this.getPasswordErrorMessage(this.password));
        return;
      }

      this.isLoading = true;
      
      const authStore = useAuthStore();
      const urlLogin = this.AppInfoStore.environment+'/auth/register';

      // Show loading popup
      const idPopupLoading = this.statusPopup.showLoading('Conectando', 'Registrando nuevo usuario...');

      const jsonEnvio = {
        user_email: this.user_email,
        password: this.password,
        tipo: this.tipo,
        nombre: this.nombre_apellidos
      };

      try {
        const response = await axios.post(urlLogin, jsonEnvio);

        // Store tokens, email, usuario y tipo
        authStore.setInfo(access_token, refresh_token, user_email, user_name, tipo);

        // Mostrar mensaje de éxito
        this.statusPopup.removePopup(idPopupLoading);
        this.statusPopup.showSuccess('Registro exitoso', 'Redireccionando a login...');

        // Redireccionar al login
        setTimeout(() => {
          this.$router.push('/login');
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
            this.password = '';
            this.again_password = ''; // Clear password fields
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
  justify-content: flex-start;
  
  height: 100%;
  width: 100%;
  max-width: 600px;
  padding: 40px 20px;
  background-color: transparent;
}

.login-form {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
}

.login-form * {
  margin-bottom: 10px;
}

.error {
  color: var(--color-error);
}

.correcto {
  color: var(--color-correcto);
}
</style>
