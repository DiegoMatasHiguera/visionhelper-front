<template>
  <transition name="popup-fade">
    <div v-if="isVisible" class="popup-container" :class="popupType">
      <div class="popup-content">
        <div class="popup-icon">
          <i :class="iconClass"></i>
        </div>
        <div class="popup-message">
          <h3 class="popup-title">{{ title }}</h3>
          <p v-if="message" class="popup-description">{{ message }}</p>
        </div>
        <button @click="hide" class="popup-close" aria-label="Close">
          <span>&times;</span>
        </button>
      </div>
      <div v-if="showButton" class="popup-actions">
        <button @click="handleAction" class="popup-button">{{ buttonText }}</button>
      </div>
    </div>
  </transition>
</template>

<script>
/**
 * @component StatusPopup
 * @description A reusable popup component for displaying status messages, alerts, and loading states.
 * @example
 * // Basic usage
 * this.$refs.statusPopup.show('Success', 'Operation completed successfully');
 * 
 * // With more options
 * this.$refs.statusPopup.show({
 *   title: 'Error',
 *   message: 'Failed to save data',
 *   type: 'error',
 *   autoClose: false,
 *   showButton: true,
 *   buttonText: 'Try Again'
 * });
 */
export default {
  name: 'StatusPopup',
  data() {
    return {
      isVisible: false,
      title: '',
      message: '',
      type: 'info',
      autoClose: true,
      duration: 5000,
      showButton: false,
      buttonText: 'OK',
      timer: null,
      actionCallback: null
    }
  },
  computed: {
    /**
     * @computed popupType
     * @description Generates the CSS class for the popup based on its type
     * @returns {string} CSS class name
     */
    popupType() {
      return `popup-${this.type}`;
    },
    
    /**
     * @computed iconClass
     * @description Returns the appropriate FontAwesome icon class based on the popup type
     * @returns {string} FontAwesome icon class
     */
    iconClass() {
      const iconMap = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle',
        loading: 'fas fa-spinner fa-spin'
      };
      return iconMap[this.type];
    }
  },
  methods: {
    /**
     * @method show
     * @description Shows the popup with the provided configuration
     * @param {string|Object} titleOrConfig - Either a title string or a config object
     * @param {string} [message] - The message to display (when first param is title string)
     * @param {string} [type='info'] - Type of popup: 'success', 'error', 'warning', 'info', 'loading'
     * @param {boolean} [autoClose=true] - Whether to auto-close the popup
     * @param {number} [duration=5000] - Time in ms before auto-closing
     * @param {boolean} [showButton=false] - Whether to show an action button
     * @param {string} [buttonText='OK'] - Text for the action button
     * @param {Function} [actionCallback] - Callback to execute when button is clicked
     */
    show(titleOrConfig, message, type = 'info', autoClose = true, duration = 5000, showButton = false, buttonText = 'OK', actionCallback = null) {
      // Clear any existing timers
      this.clearTimer();
      
      // Handle configuration object
      if (typeof titleOrConfig === 'object') {
        const config = titleOrConfig;
        this.title = config.title || '';
        this.message = config.message || '';
        this.type = config.type || 'info';
        this.autoClose = config.autoClose !== undefined ? config.autoClose : true;
        this.duration = config.duration || 5000;
        this.showButton = config.showButton || false;
        this.buttonText = config.buttonText || 'OK';
        this.actionCallback = config.actionCallback || null;
      } else {
        // Handle individual parameters
        this.title = titleOrConfig;
        this.message = message || '';
        this.type = type;
        this.autoClose = autoClose;
        this.duration = duration;
        this.showButton = showButton;
        this.buttonText = buttonText;
        this.actionCallback = actionCallback;
      }
      
      // Show the popup
      this.isVisible = true;
      
      // Start auto-close timer if needed
      if (this.autoClose && this.duration > 0) {
        this.startTimer();
      }
      
      return this; // For method chaining
    },
    
    /**
     * @method hide
     * @description Hides the popup
     */
    hide() {
      this.clearTimer();
      this.isVisible = false;
      return this; // For method chaining
    },
    
    /**
     * @method handleAction
     * @description Handles the button click action
     */
    handleAction() {
      if (typeof this.actionCallback === 'function') {
        this.actionCallback();
      }
      this.hide();
    },
    
    /**
     * @method startTimer
     * @description Starts the auto-close timer
     * @private
     */
    startTimer() {
      this.clearTimer();
      this.timer = setTimeout(() => {
        this.hide();
      }, this.duration);
    },
    
    /**
     * @method clearTimer
     * @description Clears the auto-close timer
     * @private
     */
    clearTimer() {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    },
    
    /**
     * @method showSuccess
     * @description Shorthand to show a success popup
     * @param {string} title - The popup title
     * @param {string} [message] - The popup message
     * @param {Object} [options] - Additional options
     */
    showSuccess(title, message = '', options = {}) {
      return this.show({
        title,
        message,
        type: 'success',
        ...options
      });
    },
    
    /**
     * @method showError
     * @description Shorthand to show an error popup
     * @param {string} title - The popup title
     * @param {string} [message] - The popup message
     * @param {Object} [options] - Additional options
     */
    showError(title, message = '', options = {}) {
      return this.show({
        title,
        message,
        type: 'error',
        autoClose: false,
        ...options
      });
    },
    
    /**
     * @method showWarning
     * @description Shorthand to show a warning popup
     * @param {string} title - The popup title
     * @param {string} [message] - The popup message
     * @param {Object} [options] - Additional options
     */
    showWarning(title, message = '', options = {}) {
      return this.show({
        title,
        message,
        type: 'warning',
        ...options
      });
    },
    
    /**
     * @method showLoading
     * @description Shorthand to show a loading popup
     * @param {string} title - The popup title
     * @param {string} [message] - The popup message
     */
    showLoading(title, message = '') {
      return this.show({
        title,
        message,
        type: 'loading',
        autoClose: false
      });
    }
  },
  beforeUnmount() {
    this.clearTimer();
  }
}
</script>

<style scoped>
.popup-container {
  position: fixed;
  top: 160px;
  right: 20px;
  z-index: 9999;
  width: 400px;
  background-color: var(--color-principal);
  border-radius: 8px;
  box-shadow: var(--shadow-focus-grande);
  overflow: hidden;
}

.popup-content {
  display: flex;
  padding: 16px;
  align-items: flex-start;
  justify-content: center;
}

.popup-icon {
  margin-right: 12px;
  font-size: 24px;
  display: flex;
  align-items: center;
}

.popup-message {
  flex: 1;
}

.popup-title {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: var(--font-peso-bold);
  color: var(--color-mas-oscuro);
}

.popup-description {
  margin: 0;
  font-size: 16px;
  color: var(--color-mas-oscuro);
}

.popup-close {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  padding: 0;
  color: var(--color-oscuro);  
  box-shadow: none;
}

.popup-actions {
  padding: 0 16px 16px;
  text-align: right;
}

.popup-button {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 16px;

  transition: background-color 0.3s ease-in-out;
  background-color: var(--color-oscuro);

  box-shadow: none;
}

.popup-button:hover {
  background-color: var(--color-mas-oscuro);
}

/* Status types */
.popup-success .popup-icon {
  color: var(--color-correcto);
}

.popup-error .popup-icon {
  color: var(--color-error);
}

.popup-warning .popup-icon {
  color: var(--color-resalte);
}

.popup-info .popup-icon {
  color: var(--color-resalte);
}

.popup-loading .popup-icon {
  color: var(--color-claro);
}

/* Animation */
.popup-fade-enter-active,
.popup-fade-leave-active {
  transition: all 0.3s ease;
}

.popup-fade-enter-from,
.popup-fade-leave-to {
  transform: translateX(40px);
  opacity: 0;
}
</style>