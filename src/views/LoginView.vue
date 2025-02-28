<template>
  <div class="login-container">
    <div class="login-box">
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
        
        <button type="submit" class="login-button">Entrar</button>
      </form>
      <p v-if="statusMessage" class="status">{{ statusMessage }}</p>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore'
import { useServerInfoStore } from '@/stores/serverInfoStore'

export default {
  data() {
    return {
      user_email: '',
      password: '',
      errorMessage: '',
      statusMessage: '',
    };
  },
  methods: {
    async login() {
      const authStore = useAuthStore()
      const serverInfoStore = useServerInfoStore()
      const urlLogin = serverInfoStore.environment+'/auth/login';

      this.statusMessage = "Connecting";
      this.errorMessage = "";

      const jsonEnvio = {
        user_email: this.user_email,
        password: this.password,
      };

      try {
        const response = await axios.post(urlLogin, jsonEnvio);

        const { access_token, refresh_token } = response.data;

        // Store tokens
        authStore.setTokens(access_token, refresh_token);

        this.statusMessage = "Login Successful";
      } catch (error) {
        if (error.response.data.error) {
          this.errorMessage = error.response.data.error;
        } else {
          // Si es problema del cliente
          this.errorMessage = error.message;
        }
        
        this.statusMessage = "";
      }
    }
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  background-color: #337597;
}

.login-box {
  width: 100%;
  max-width: 450px;
  padding: 40px 20px;
  background-color: transparent;
}

.login-form {
  width: 100%;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: white;
  font-size: 16px;
  text-align: right;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 4px;
  background-color: white;
  font-size: 16px;
  transition: box-shadow 0.3s ease;
}

.form-input:focus {
  outline: none;
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
}

.forgot-password {
  text-align: center;
  margin: 15px 0 25px;
}

.forgot-password a {
  color: white;
  text-decoration: none;
  font-size: 14px;
}

.forgot-password a:hover {
  text-decoration: underline;
}

.login-button {
  width: 100%;
  padding: 12px;
  background-color: #1a4b66;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.login-button:hover {
  background-color: #133850;
}

.status {
  color: green;
  text-align: center;
  margin-top: 20px;
}

.error {
  color: red;
  text-align: center;
  margin-top: 20px;
}
</style>
