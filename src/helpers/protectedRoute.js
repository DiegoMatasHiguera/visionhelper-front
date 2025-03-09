import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { useAppInfoStore } from '@/stores/AppInfoStore';

/**
 * @function accessProtectedRoute
 * @description Función que permite acceder a rutas protegidas.
 * @returns {Object} Objeto que permite realizar peticiones a rutas protegidas.
 */
export function accessProtectedRoute() {
  const appInfoStore = useAppInfoStore();
  const authStore = useAuthStore();
  
  var axiosClient = axios.create({
    baseURL: appInfoStore.environment,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
  
  if (authStore.accessToken != null && authStore.refreshToken != null) {
    // Add tokens to every request
    axiosClient.interceptors.request.use(config => {
      config.headers['access_token'] = authStore.accessToken;
      config.headers['refresh_token'] = authStore.refreshToken;
      config.headers['user_email'] = authStore.user_email;
      config.headers['tipo'] = authStore.tipo;
      return config;
    });
  } else {
    axiosClient = null;
  }   
  
  return axiosClient;
}

/**
 * @function updateAccessToken
 * @description Función que actualiza el access token si estaba caducado.
 * @param {Object} response Respuesta de la petición realizada.
 */
export function updateAccessToken(response) {
  if (response.headers['access_token']) {    
    const authStore = useAuthStore();
    authStore.updateAccessToken(response.headers['access_token']);
  }
}

/**
 * @function handleError
 * @description Función que maneja los errores de una petición.
 * @param {Object} error Error de la petición.
 * @param {Object} statusPopup Objeto que maneja los mensajes de estado.
 */
export function handleError(error, statusPopup) {
  var errorMessage = "";
  if (error.response && error.response.data) {
    for (const key in error.response.data) {
      errorMessage += `${key}: ${error.response.data[key]}\n`;
    }
  } else {
    // Si es problema de la aplicación cliente:
    errorMessage = error.message;
  }

  if (statusPopup) {
    statusPopup.showError("Error de conexión", errorMessage);
  } else {
    console.error(errorMessage);
  }
}

export default {
  accessProtectedRoute,
  updateAccessToken,
  handleError
}