<template>
  <div class="box">
      <div class="paneles">
        <Panel id="avatarInfo">
          <div class="rowEnMovil">
            <Titulo :texto="user_name"/>
            <img :src="avatar_url" alt="Avatar" class="avatar"/>
            <Titulo :texto="tipo" classTitulo="titulo-claro"/>
          </div>
          <Checkbox id="cambio-avatar" v-model="cambio_avatar" label="Cambiar imagen" disabled/>
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
          <Checkbox id="cambio-password" v-model="cambio_password" label="Cambiar contraseña" />
        </Panel>
        <Panel v-if="cambio_password" class="limitado">
          <FormInput v-model="old_password" label="Antigua contraseña" type="password"/>
          <FormInput v-model="new_password" label="Nueva contraseña" type="password"/>
          <FormInput v-model="new_again_password" label="Repetir nueva contraseña" type="password"/>
        </Panel>
      </div>
      <div class="botones">
        <Button @click="guardar"
          texto="Guardar" 
          disabled
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
import Checkbox from '@/components/Checkbox.vue';

export default {
  name: 'ProfileView',
  components: {
    Button,
    Panel,
    FormInput,
    Titulo,
    Selector,
    Checkbox,
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
      avatar_x: '',
      avatar_y: '',
      cambio_password: false,
      cambio_avatar: false,
      old_password: '',
      new_password: '',
      new_again_password: '',
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
        this.tipo = response.data.tipo;
        this.user_email = this.authStore.user_email;
        this.fecha_nacimiento = response.data.fecha_nacimiento;
        this.sexo = response.data.sexo;
        this.corr_ocular = response.data.corr_ocular;
        this.fecha_rev_ocular = response.data.fecha_rev_ocular;

      } catch (error) {
        this.statusPopup.removePopup(idPopupLoading);
        protectedRoute.handleError(error, this.statusPopup);
      }
    },

    atras() {
      this.$router.push('/');
    },

    guardar() {

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

.avatar {
  width: 140px;
  min-width: 100px;
  height: 140px;

  border: 6px solid var(--color-mas-oscuro);

  border-radius: 50%; /* Creates a perfect circle */
  object-fit: cover; /* Ensures the image covers the area without distortion */
  overflow: hidden; /* Ensures content doesn't spill outside the border */
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
