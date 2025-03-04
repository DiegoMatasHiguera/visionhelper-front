
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore'
import { useAppInfoStore } from '@/stores/AppInfoStore'

/**
 * @function accessProtectedRoute
 * @description Función que permite acceder a rutas protegidas.
 * @returns {Object} Objeto que permite realizar peticiones a rutas protegidas.
 */
export function accessProtectedRoute() {
    const authStore = useAuthStore();
    const AppInfoStore = useAppInfoStore();
    
    var axiosClient = axios.create({
        baseURL: AppInfoStore.environment,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
    });
    
    if (authStore.accessToken && authStore.refreshToken) {
        // Add tokens to every request
        axiosClient.interceptors.request.use(config => {
            config.headers['access_token'] = authStore.accessToken;
            config.headers['refresh_token'] = authStore.refreshToken;
            return config;
        });
    } else {
        axiosClient = null;
    }   
    
    return axiosClient;
}

/**
 * @function updateAuthInfo
 * @description Función que actualiza la información de autenticación del usuario.
 * @param {Object} response Respuesta de la petición realizada.
 */
export function updateAuthInfo(response) {    
    authStore.setAccessToken(response.headers['access_token']);
    // Resto info general una vez logineado:
    authStore.user_email = response.headers['user_email'];
    authStore.user_name = response.headers['user_name'];
    authStore.tipo = response.headers['tipo'];
}

/**
 * @function handleError
 * @description Función que maneja los errores de una petición.
 * @param {Object} error Error de la petición.
 * @param {Object} statusPopup Objeto que maneja los mensajes de estado.
 * @param {Object} router Objeto que maneja las rutas.
 */
export function handleError(error, statusPopup, router) {
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
    statusPopup.showError("Error de conexión", errorMessage, {
        actionCallback: () => {
        // Redirigir a la página de inicio de sesión
        router.push({ name: 'Login' });
        }
    });
}

export default {
    accessProtectedRoute,
    updateAuthInfo,
    handleError
}