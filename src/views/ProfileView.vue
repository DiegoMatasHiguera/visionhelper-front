<template>
  <div class="box">
      <div class="paneles">
        <Panel id="avatarInfo">
          <div class="rowEnMovil">
            <Titulo :texto="user_name"/>
            <img :src="avatar_url" alt="Avatar" class="avatar" @error="handleImageError"/>
            <Titulo :texto="tipo" classTitulo="titulo-claro"/>
          </div>
          <Toggle id="cambio-avatar" v-model="cambio_avatar" label="Cambiar imagen"/>
        </Panel>
        <Panel v-if="cambio_avatar" class="cambio-avatar">
          <div class="cambio-avatar-columna">
            <div v-if="hayAvatar">
              <div class="avatar-container" ref="avatarContainer" @scroll="updateScrollValues">                            
                <img :src="avatar_new" alt="Avatar sin procesar" class="avatar-unprocessed" :style="{
                  width: `${getAvatarWidth()}px`,
                  height: 'auto',
                }"/>
              </div>            
              <img src="@/assets/avatar_delimiter.svg" alt="Delimiter" class="avatar-delimiter"/>
            </div>
            <FormFile label="Subir imagen" accept="image/*" @file-change="handleAvatarChange" />
          </div>
          <Slider id="zoom" label="Zoom" v-model="avatar_zoom" :max="avatar_max_zoom" :min="avatar_min_zoom" orientation="vertical"/>
        </Panel>
        <Panel class="limitado">
          <FormInput v-model="user_email" label="Email" type="email" disabled/>
          <FormInput v-model="fecha_nacimiento" label="Fecha de nacimiento" type="date" />
          <Selector v-model="sexo" name="sexo" label="Sexo">
            <option value="Hombre">Hombre</option>
            <option value="Mujer">Mujer</option>
          </Selector>
          <FormInput v-model="corr_ocular" label="Corrección ocular (I | D)" type="text"/>
          <FormInput v-model="fecha_rev_ocular" label="Última revisión ocular" type="date" />
          <Toggle id="cambio-password" v-model="cambio_password" label="Cambiar contraseña" />
        </Panel>
        <Panel v-if="cambio_password" class="limitado">
          <span v-if="!validatePassword(new_password)" class='error'>
            {{ getPasswordErrorMessage(new_password) }}
          </span>
          <span v-if="validatePassword(new_password)" class='correcto'>
            {{ getPasswordErrorMessage(new_password) }}
          </span>
          <br/>
          <br/>
          <FormInput v-model="old_password" label="Antigua contraseña" type="password" required/>
          <FormInput v-model="new_password" label="Nueva contraseña" type="password" required/>
          <FormInput v-model="new_again_password" label="Repetir nueva contraseña" type="password" required/>
          <br/>
          <br/>
          <span v-if="new_password && new_again_password && new_password !== new_again_password" class="error">
            Las contraseñas no coinciden.
          </span>
        </Panel>
      </div>
      <div class="botones">
        <Button @click="guardar"
          texto="Guardar" 
          :disabled="guardarDisabled"
        />
        <Button @click="atras" 
          texto="Atrás" 
        />
      </div>      
  </div>
</template>

<script>
/**
 * @component ProfileView
 * @description La página donde el usuario puede editar la información del perfil.
 */
import protectedRoute from '@/helpers/protectedRoute';
import { useAppInfoStore } from '@/stores/AppInfoStore';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/Button.vue';
import Panel from '@/components/Panel.vue';
import FormInput from '@/components/FormInput.vue';
import Titulo from '@/components/Titulo.vue';
import Selector from '@/components/Selector.vue';
import Toggle from '@/components/Toggle.vue';
import FormFile from '@/components/FormFile.vue';
import Slider from '@/components/Slider.vue';

export default {
  name: 'ProfileView',
  components: {
    Button,
    Panel,
    FormInput,
    Titulo,
    Selector,
    Toggle,
    FormFile,
    Slider,
  },
  props: {
    statusPopup: Object,
  },
  data() {
    return {
      AppInfoStore: '',
      user_name: '',
      user_email: '',
      tipo: '',
      fecha_nacimiento: '',
      sexo: '',
      corr_ocular: '',
      fecha_rev_ocular: '',
      avatar_url: '',
      avatar_new: '',
      avatar_x: '',
      avatar_y: '',
      avatar_zoom: '',
      avatar_max_zoom: 100,
      avatar_min_zoom: 50,
      avatar_real_width: 380,
      hayAvatar: true,
      cambio_password: false,
      cambio_avatar: false,
      old_password: '',
      new_password: '',
      new_again_password: '',
      guardarDisabled: true,
    };
  },
  //Called when the component is created
  mounted() {
    this.AppInfoStore = useAppInfoStore();
    this.AppInfoStore.seccion = "Editar Perfil";

    this.authStore = useAuthStore();

    if (protectedRoute.accessProtectedRoute() != null) {      
      this.getPerfilInfo();
    }
  },
  methods: {
    /**
     * @method getPerfilInfo
     * @description Recupera la información del perfil del usuario.
    */
    async getPerfilInfo() {     
      // Show loading popup
      const idPopupLoading = this.statusPopup.showLoading('Conectando', 'Recuperando información del usuario...');
      
      const urlSolicitud = "/profile/"+this.authStore.user_email;

      try {
        const response = await protectedRoute.accessProtectedRoute().get(urlSolicitud);

        // Ocultar mensaje de carga
        this.statusPopup.removePopup(idPopupLoading);
        
        // Inserción de datos en el formulario
        this.user_name = response.data.nombre;
        this.avatar_url = this.AppInfoStore.environment+response.data.avatar_url;
        this.avatar_new = this.avatar_url;
        this.tipo = response.data.tipo;
        this.user_email = this.authStore.user_email;
        this.fecha_nacimiento = response.data.fecha_nacimiento;
        this.sexo = response.data.sexo;
        this.corr_ocular = response.data.corr_ocular;
        this.fecha_rev_ocular = response.data.fecha_rev_ocular;

        // Actualizar tamaño máximo de zoom
        this.handleAvatarChange(null);

      } catch (error) {
        this.statusPopup.removePopup(idPopupLoading);
        protectedRoute.handleError(error, this.statusPopup);
      }

      this.guardarDisabled = false;
    },

    handleImageError(event) {
      if (this.avatar_url !== '') {
        console.error('Avatar failed to load:', event.target.src);
        // Set a fallback image
        this.avatar_url = new URL('@/assets/noavatar.png', import.meta.url).href;
        this.hayAvatar = false;
      }
    },

    handleAvatarChange(encodedFiles) {
      // Create an image element to get the natural dimensions
      const img = new Image();
      if (encodedFiles && encodedFiles.length > 0) {
        // Store the encoded file data
        this.avatar_new = encodedFiles[0];
        // Set the source to the encoded file data
        img.src = encodedFiles[0];
        if (this.hayAvatar) {
          this.hayAvatar = true;
        }
      } else {
        // If no file is selected, set the source to the current avatar URL
        img.src = this.avatar_new;
        if (!this.hayAvatar) {
          this.hayAvatar = false;
        }
      }

      img.onload = () => {
        this.avatar_real_width = img.naturalWidth;
        // Calculate what percentage zoom is needed to make the smallest dimension 400px        
        const real_min_dimension = Math.min(img.naturalWidth, img.naturalHeight);
        this.avatar_min_zoom = Math.ceil((380 / real_min_dimension) * 100);
        
        // If new min is higher than max, update max too
        if (this.avatar_min_zoom > this.avatar_max_zoom) {
          this.avatar_max_zoom = this.avatar_min_zoom;
        }

        // Update zoom
        this.avatar_zoom = this.avatar_max_zoom.toString();
        this.getAvatarWidth();
      };
    },

    getAvatarWidth() {    
      // If avatar_zoom is a string, convert it to number
      const zoomValue = Number(this.avatar_zoom || 0);

      // Calculate the width of the image based on the zoom value
      const maxWidth = this.avatar_real_width;
      
      // Linear interpolation between minScale and maxScale
      return (zoomValue / 100) * maxWidth;
    },
  
    // Update avatar_x and avatar_y with current scroll position
    updateScrollValues() {
      const { x, y } = this.getScrollPosition();
      this.avatar_x = x;
      this.avatar_y = y;
    },

    // Get the current scroll position
    getScrollPosition() {
      if (this.$refs.avatarContainer) {
        return {
          x: this.$refs.avatarContainer.scrollLeft,
          y: this.$refs.avatarContainer.scrollTop
        };
      }
      return { x: 0, y: 0 };
    },

    atras() {
      this.$router.push('/');
    },
    
    validatePassword(password) {
      // At least 8 characters
      if (password.length < 8) {
        return false;
      }
      
      // Contains uppercase letter
      if (!/[A-Z]/.test(password)) {
        return false;
      }
      
      // Contains lowercase letter
      if (!/[a-z]/.test(password)) {
        return false;
      }
      
      // Contains number
      if (!/[0-9]/.test(password)) {
        return false;
      }
      
      // Contains special character
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return false;
      }
      
      return true;
    },
  
    getPasswordErrorMessage(password) {
      let errors = [];
      
      if (password.length < 8) {
        errors.push("al menos 8 caracteres");
      }
      
      if (!/[A-Z]/.test(password)) {
        errors.push("una letra mayúscula");
      }
      
      if (!/[a-z]/.test(password)) {
        errors.push("una letra minúscula");
      }
      
      if (!/[0-9]/.test(password)) {
        errors.push("un número");
      }
      
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push("un carácter especial");
      }
      
      if (errors.length === 0) {
        return "La nueva contraseña es válida.";
      } else {
        return "La contraseña debe contener " + errors.join(", ") + ".";
      }      
    },

    async guardar() {
      // Show loading popup
      const idPopupLoading = this.statusPopup.showLoading('Guardando', 'Guardando información del usuario...');
      this.guardarDisabled = true;

      const urlSolicitud = "/profile/"+this.authStore.user_email;

      const jsonEnvio = {
        email: this.user_email,
        tipo: this.tipo,
        nombre: this.user_name,
        fecha_nacimiento: this.fecha_nacimiento,
        sexo: this.sexo,
        corr_ocular: this.corr_ocular,
        fecha_rev_ocular: this.fecha_rev_ocular
      };

      if (this.cambio_password) {
        // Check if passwords match
        if (this.new_password !== this.new_again_password) {
          this.statusPopup.showError('Error', 'Las contraseñas nuevas no coinciden.');          
          this.statusPopup.removePopup(idPopupLoading);
          this.guardarDisabled = false;
          return;
        }
        
        // Validate password complexity
        if (!this.validatePassword(this.new_password)) {
          this.statusPopup.showError('Error', 'Comprobar el formato de la nueva contraseña', 
          this.getPasswordErrorMessage(this.new_password));          
          this.statusPopup.removePopup(idPopupLoading);
          this.guardarDisabled = false;
          return;
        }
               
        jsonEnvio.contrasena_vieja = this.old_password;
        jsonEnvio.contrasena = this.new_password;
      }

      if(this.cambio_avatar) {
        jsonEnvio.avatar_url = this.avatar_new;
        jsonEnvio.avatar_x = this.avatar_x;
        jsonEnvio.avatar_y = this.avatar_y;
        jsonEnvio.avatar_zoom = this.avatar_zoom;
      }

      try {
        const response = await protectedRoute.accessProtectedRoute().post(urlSolicitud, jsonEnvio);

        // Ocultar mensaje de carga
        this.statusPopup.removePopup(idPopupLoading);
        this.statusPopup.showSuccess('Guardado exitoso', 'Información del usuario guardada correctamente.');

        if (this.cambio_password) {
          this.authStore.clearInfo();
          this.$router.push('/login');
        }

        if (this.cambio_avatar) {
          window.location.reload();
        }
      } catch (error) {
        this.statusPopup.removePopup(idPopupLoading);
        protectedRoute.handleError(error, this.statusPopup);
      }

      this.guardarDisabled = false;
    }
  }
};
</script>

<style scoped>
.box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;

  width: 100%;
}

.paneles {
  display: flex;
  justify-content: space-evenly;
  min-width: 500px;

  padding-right: 20px;
  padding-left: 20px;
  width: 100%;
}

.limitado {  
  max-width: 600px;
}

#avatarInfo {
  max-width: 300px;
}

.rowEnMovil {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.botones {
  display: flex;
  align-items: center;
  justify-content: center;
}

.error {
  color: var(--color-error);
}

.correcto {
  color: var(--color-correcto);
}

.avatar {
  width: 140px;
  min-width: 100px;
  height: 140px;

  border: 6px solid var(--color-mas-oscuro);

  border-radius: 50%; /* Creates a perfect circle */
  object-fit: cover; /* Ensures the image covers the area without distortion */
  overflow: hidden; /* Ensures content doesn't spill outside the border */
}

.cambio-avatar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.cambio-avatar-columna {
  display: flex;
  flex-direction: column;
  align-items: center;

  position: relative;
}

.avatar-container {
  display: flex;
  align-items: start;

  max-width: 400px;
  max-height: 400px;
  overflow: scroll;

  border-radius: 8px;
}

.avatar-delimiter {
  top: 0px;
  left: 63px;
  position: absolute;
  z-index: 1;

  width: 385px;
  height: 385px;

  pointer-events: none;

  border: var(--color-mas-oscuro) 4px solid;
  border-radius: 8px;
}

@media (max-width: 750px) {
  .paneles {
    flex-direction: column;
    align-items: center;
  }

  .rowEnMovil {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
    width: 100%;
  }

  /* Los hijos */
  .rowEnMovil > * {
    width: 33%;
    height: auto; /* Maintain aspect ratio */
  }

  #avatarInfo {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    max-width: 600px;
  }
}
</style>
