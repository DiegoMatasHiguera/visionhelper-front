<template>
  <div class="box">
      <div class="paneles">
        <Panel class="panel">
          Seleccionar Producto:
          <div class="lista">
            <Element
              v-for="producto in this.productos"
              :texto="producto.nombre"
              :tipo="producto.estado"
              :disabled="producto.estado == 'Bloqueado' ? true : false"
              :seleccionado="producto.id == clickadoProducto ? true : false"
              @click="clickarProducto(producto)"
            />
          </div>
        </Panel>
        <Panel v-if="clickadoProducto != ''" class="panel">
          Seleccionar Lote del Producto:
          <div class="lista">
            <Element
              v-for="lote in this.lotes_filtrados"
              :texto="lote.id"
              :tipo="lote.estado"
              :disabled="lote.estado == 'Bloqueado' ? true : false"
              :seleccionado="lote.id == clickadoLote"
              @click="clickarLote(lote)"
            />
          </div>
        </Panel>
        <Panel v-if="clickadoLote != ''" class="panel">
          Seleccionar tipo de Test del Lote del Producto:
          <div class="lista">
            <Element
              v-for="test in this.tests_filtrados"
              :texto="test.nombre_muestreo"
              :tipo="test.estado"
              :disabled="test.estado == 'Bloqueado' ? true : false"
              :seleccionado="test.id == clickadoTest"
              @click="clickarTest(test)"
            />
          </div>
        </Panel>
      </div>
      <div class="botones">
        <Button @click="atras" 
          texto="Atrás" 
        />
      </div>      
  </div>
</template>

<script>
/**
 * @component LotesView
 * @description La página donde el usuario puede ver los tests disponibles.
 */
import protectedRoute from '@/helpers/protectedRoute';
import { useAppInfoStore } from '@/stores/AppInfoStore';
import { useAuthStore } from '@/stores/authStore';
import { useTestsStore } from '@/stores/testStore';
import Button from '@/components/Button.vue';
import Panel from '@/components/Panel.vue';
import Element from '@/components/Element.vue';

export default {
  name: 'LotesView',
  components: {
    Button,
    Panel,
    Element,
  },
  props: {
    statusPopup: Object,
  },
  data() {
    return {
      AppInfoStore: '',
      authStore: '',
      testStore: '',  
      productos: [],
      lotes: [],
      lotes_filtrados: [],
      tests: [],
      tests_filtrados: [],
      clickadoProducto: "",
      clickadoLote: "",
      clickadoTest: "",
    };
  },
  //Called when the component is created
  async mounted() {    
    this.authStore = useAuthStore();
    this.AppInfoStore = useAppInfoStore();
    this.AppInfoStore.seccion = "Ver Lotes";
    this.testStore = useTestsStore();

    if (protectedRoute.accessProtectedRoute() != null) { 
      if (await this.getTests()) {
        if (await this.getLotes()) {
          if (await this.getProductos()) {
            // Ya tenemos toda la info necesaria, ahora vamos a establecer los estados de los lotes y productos para mostrarlos en los elements
            for (var producto of this.productos) {
              for (var lote of this.lotes) {
                if (producto.id == lote.codigo_producto) {
                  for (var test of this.tests) {
                    if (test.lote == lote.id) {
                      // Primero asignamos coloritos a los lotes según los tests disponibles
                      if (test.estado == "Nuevo") {
                        lote.estado = test.estado;
                      } else if (test.estado == "Muestreando" || test.estado == "Visualizando") {
                        if (lote.estado != "Nuevo") {
                          if (test.ult_usuario == this.authStore.user_email) {
                            lote.estado = test.estado;
                          } else {
                            lote.estado = "Bloqueado";
                          }
                        }
                      } else if (test.estado == "Bloqueado") {
                        if (lote.estado != "Nuevo" && lote.estado != "Muestreando" && lote.estado != "Visualizando") {
                          lote.estado = test.estado;
                        }
                      } else {
                        if (lote.estado != "Nuevo" && lote.estado != "Muestreando" && lote.estado != "Visualizando" && lote.estado != "Bloqueado") {
                          lote.estado = "Disponible";
                        }
                      }

                      break;
                    }                  
                  }

                  // Luego asignamos coloritos a los productos según los lotes disponibles
                  if (lote.estado == "Nuevo") {
                    producto.estado = lote.estado;
                  } else if (lote.estado == "Muestreando" || lote.estado == "Visualizando") {
                    if (producto.estado != "Nuevo") {
                      producto.estado = lote.estado;
                    }
                  } else if (lote.estado == "Bloqueado") {
                    if (producto.estado != "Nuevo" && producto.estado != "Muestreando" && producto.estado != "Visualizando") {
                      producto.estado = lote.estado;
                    }
                  } else {
                    if (producto.estado != "Nuevo" && producto.estado != "Muestreando" && producto.estado != "Visualizando" && producto.estado != "Bloqueado") {
                      producto.estado = "Disponible";
                    }
                  }

                  break;
                }
              }
            }
          }          
        }
      }
    }
  },
  methods: {
    /**
     * @method getTests
     * @description Recupera los tests disponibles.
    */
    async getTests() {
      // Show loading popup
      const idPopupLoading = this.statusPopup.showLoading('Conectando', 'Recuperando información de tests nuevos...');
      
      const urlSolicitud = this.AppInfoStore.environment+"/tests/";
      const jsonEnvio = {
        tipo_usuario: this.authStore.tipo,
        user_email: this.authStore.user_email,
      };

      try {
        const response = await protectedRoute.accessProtectedRoute().post(urlSolicitud, jsonEnvio);

        // Ocultar mensaje de carga
        this.statusPopup.removePopup(idPopupLoading);
        
        // Cargar la información de tests nuevos, exceptuando los exámenes
        for (let i = 0; i < response.data.length; i++) {
          if (!response.data[i].nombre_muestreo.includes("Examen")) {
            this.tests.push(response.data[i]);
          }
        }
        
        return true;
      } catch (error) {
        this.statusPopup.removePopup(idPopupLoading);
        protectedRoute.handleError(error, this.statusPopup);         

        return false;
      }      
    },
    /**
     * @method getLotes
     * @description Recupera la info de los lotes de los tests disponibles.
    */
    async getLotes() {      
      // Show loading popup
      const idPopupLoading = this.statusPopup.showLoading('Conectando', 'Recuperando información de lotes...');
      
      var lotesASolicitar = [];
      for (let i = 0; i < this.tests.length; i++) {
        if (!lotesASolicitar.includes(this.tests[i].lote)) {
          lotesASolicitar.push(this.tests[i].lote);
        }
      }
      const jsonEnvio = {
        lotes: lotesASolicitar,
      };

      const urlSolicitud = "/lotes";
      try {
        const response = await protectedRoute.accessProtectedRoute().post(urlSolicitud, jsonEnvio);

        this.lotes = response.data;

        // Ocultar mensaje de carga
        this.statusPopup.removePopup(idPopupLoading);

        return true;
      } catch (error) {
        this.statusPopup.removePopup(idPopupLoading);
        protectedRoute.handleError(error, this.statusPopup);

        return false;
      }      
    },
    /**
     * @method getProductos
     * @description Recupera la info de los productos de los lotes de los tests disponibles.
    */
    async getProductos() {      
      // Show loading popup
      const idPopupLoading = this.statusPopup.showLoading('Conectando', 'Recuperando información de productos...');

      var productosASolicitar = [];
      for (let i = 0; i < this.lotes.length; i++) {
        if (!productosASolicitar.includes(this.lotes[i].codigo_producto)) {
          productosASolicitar.push(this.lotes[i].codigo_producto);
        }
      }
      const jsonEnvio = {
        productos: productosASolicitar,
      };
      
      const urlSolicitud = "/productos";
      try {
        const response = await protectedRoute.accessProtectedRoute().post(urlSolicitud, jsonEnvio);

        this.productos = response.data;

        // Ocultar mensaje de carga
        this.statusPopup.removePopup(idPopupLoading);

        return true;
      } catch (error) {
        this.statusPopup.removePopup(idPopupLoading);
        protectedRoute.handleError(error, this.statusPopup);

        return false;
      }      
    },

    /**
     * @method clickarProducto
     * @description Muestra los lotes disponibles para un producto.
     * @param {String} producto - El id del producto.
    */
    clickarProducto(producto) {
      this.lotes_filtrados = [];
      for (var lote of this.lotes) {
        if (lote.codigo_producto == producto.id) {
          this.lotes_filtrados.push(lote);
        }
      }
      
      this.clickadoTest = "";
      this.clickadoLote = "";
      this.clickadoProducto = producto.id;

      // Almacenar el producto en el store
      this.testStore.producto_seleccionado = producto;
    },

    /**
     * @method clickarLote
     * @description Muestra los tests disponibles para un lote.
     * @param {String} lote - El id del lote.
    */
    clickarLote(lote) {
      this.tests_filtrados = [];
      for (var test of this.tests) {
        if (test.lote == lote.id) {
          this.tests_filtrados.push(test);
        }
      }
      
      this.clickadoTest = "";
      this.clickadoLote = lote.id;

      // Almacenar el lote en el store
      this.testStore.lote_seleccionado = lote;
    },

    /**
     * @method clickarTest
     * @description Redirige hacia el inicio de un test.
     * @param {String} test - El id del test.
    */
    clickarTest(test) {
      this.clickadoTest = test.id;

      // Almacenar el test en el store
      this.testStore.test_seleccionado = test;

      this.$router.push(`/muestreo/${test.id}`);
    },

    /**
     * @method atras
     * @description Vuelve a la página anterior.
    */
    atras() {
      this.$router.push('/dashboard');
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

.panel {
  display: flex;
  flex-direction: column;
  align-items: start;

  max-width: 600px;

  font-size: 20px;
  font-weight: var(--font-peso-bold);
}

.lista {
  width: 100%;
  max-height: 300px;
  overflow-y: auto;

  display: flex;
  flex-direction: column;

  margin-top: 10px;
  padding: 10px;

  border-radius: 8px;

  background-color: var(--color-principal);
}

.botones {
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 750px) {
  .paneles {
    flex-direction: column;
    align-items: center;
  }
}
</style>
