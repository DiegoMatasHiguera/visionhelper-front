<template>
  <div class="popup-manager">
    <transition-group name="popup-fade">
      <div
        v-for="popup in popups"
        :key="popup.id"
        class="popup-container"
        :class="getPopupType(popup)"
        :style="{ top: `${160 + (popups.indexOf(popup) * 100)}px` }"
        @mouseenter="handlePopupEnter(popup)"
        @mouseleave="handlePopupLeave(popup)"
        @focusin="handlePopupEnter(popup)"
        @focusout="handlePopupLeave(popup)"
        tabindex="0"
      >
        <div class="popup-content">
          <div class="popup-icon">
            <i :class="getIconClass(popup.type)"></i>
          </div>
          <div class="popup-message">
            <h3 class="popup-title">{{ popup.title }}</h3>
            <p v-if="popup.message" class="popup-description">{{ popup.message }}</p>
          </div>
          <div class="close-button-container">
            <svg class="timer-circle" v-if="popup.autoClose" width="30" height="30" viewBox="0 0 30 30">
              <circle
                cx="15"
                cy="15"
                r="12"
                fill="transparent"
                stroke="var(--color-claro)"
                stroke-width="2"
              />
              <circle
                cx="15"
                cy="15"
                r="12"
                fill="transparent"
                stroke="var(--color-oscuro)"
                stroke-width="2.5"
                stroke-dasharray="75.4"
                :stroke-dashoffset="(popup.progress || 0) * 75.4"
                transform="rotate(-90, 15, 15)"
              />
            </svg>
            <button @click="removePopup(popup.id)" class="popup-close" aria-label="Close">
              <span>&times;</span>
            </button>
          </div>
        </div>
        <div v-if="popup.showButton" class="popup-actions">
          <button @click="handleAction(popup)" class="popup-button">{{ popup.buttonText }}</button>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script>
/**
 * @component StatusPopup
 * @description Manages multiple status popups on screen simultaneously
 */
export default {
  name: 'StatusPopup',
  data() {
    return {
      popups: [],
      counter: 0,
      timeoutIds: {}, // Store timeout IDs for each popup
      animationFrameIds: {} // Store animation frame IDs for each popup
    }
  },
  methods: {
    /**
     * @method addPopup
     * @description Adds a new popup to the display stack
     */
    addPopup(config) {
      const id = this.counter++;
      const popup = {
        id,
        title: config.title || '',
        message: config.message || '',
        type: config.type || 'info',
        autoClose: config.autoClose !== undefined ? config.autoClose : true,
        duration: config.duration || 3000,
        showButton: config.showButton || false,
        buttonText: config.buttonText || 'OK',
        actionCallback: config.actionCallback || null,
        active: false, // Track if mouse/focus is on popup
        progress: 0, // Progress of countdown (0 to 1)
        startTime: null, // When the countdown started
        hasInteracted: config.hasInteracted !== undefined ? config.hasInteracted : false, // Flag to track if user has interacted with the popup. You can force an interaction to start timer
      };
      
      this.popups.push(popup);
      
      // We'll start the countdown in handlePopupLeave when hasInteracted becomes true
      this.handlePopupLeave(popup);
      
      return id; // Return popup ID for reference
    },
    
    /**
     * @method removePopup
     * @description Removes a popup by ID
     */
    removePopup(id) {
      // Clear any existing timeout and animation for this popup
      if (this.timeoutIds[id]) {
        clearTimeout(this.timeoutIds[id]);
        delete this.timeoutIds[id];
      }
      
      if (this.animationFrameIds[id]) {
        cancelAnimationFrame(this.animationFrameIds[id]);
        delete this.animationFrameIds[id];
      }
      
      const index = this.popups.findIndex(popup => popup.id === id);
      if (index !== -1) {
        this.popups.splice(index, 1);
      }
    },
    
    /**
     * @method handleAction
     * @description Handles the button click action for a popup
     */
    handleAction(popup) {
      if (typeof popup.actionCallback === 'function') {
        popup.actionCallback();
      }
      this.removePopup(popup.id);
    },
    
    /**
     * @method getPopupType
     * @description Gets the CSS class for the popup based on its type
     */
    getPopupType(popup) {
      return `popup-${popup.type}`;
    },
    
    /**
     * @method getIconClass
     * @description Returns the appropriate icon class based on popup type
     */
    getIconClass(type) {
      const iconMap = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle',
        loading: 'fas fa-spinner fa-spin'
      };
      return iconMap[type];
    },
    
    /**
     * @method handlePopupEnter
     * @description Handles mouseenter/focusin events on a popup
     */
    handlePopupEnter(popup) {
      popup.active = true;
      popup.hasInteracted = true; // Mark that user has interacted with this popup
      
      // Pause countdown animation
      if (popup.autoClose && this.timeoutIds[popup.id]) {
        clearTimeout(this.timeoutIds[popup.id]);
        
        if (this.animationFrameIds[popup.id]) {
          cancelAnimationFrame(this.animationFrameIds[popup.id]);
        }
      }
    },
    
    /**
     * @method handlePopupLeave
     * @description Handles mouseleave/focusout events on a popup
     */
    handlePopupLeave(popup) {
      popup.active = false;
      
      // Only start/resume countdown if user has interacted with this popup
      if (popup.hasInteracted && popup.autoClose && popup.duration > 0) {
        this.startCountdownAnimation(popup);
      }
    },
    
    /**
     * @method startCountdownAnimation
     * @description Starts or resumes the countdown animation for a popup
     */
    startCountdownAnimation(popup) {
      // Clear any existing timeout for this popup
      if (this.timeoutIds[popup.id]) {
        clearTimeout(this.timeoutIds[popup.id]);
      }
      
      // Cancel any existing animation frame
      if (this.animationFrameIds[popup.id]) {
        cancelAnimationFrame(this.animationFrameIds[popup.id]);
      }
      
      // Calculate remaining time based on current progress
      const remainingTime = popup.progress !== undefined 
        ? popup.duration * (1 - popup.progress) 
        : popup.duration;
      
      // Set timeout to remove popup after remaining time
      this.timeoutIds[popup.id] = setTimeout(() => {
        this.removePopup(popup.id);
      }, remainingTime);
      
      // Start the animation
      popup.startTime = Date.now();
      
      const animate = () => {
        const currentTime = Date.now();
        const elapsedTime = currentTime - popup.startTime;
        
        // Calculate progress (0 to 1)
        popup.progress = Math.min(elapsedTime / remainingTime, 1);
        
        // Continue animation until progress reaches 1
        if (popup.progress < 1 && !popup.active) {
          this.animationFrameIds[popup.id] = requestAnimationFrame(animate);
        }
      };
      
      // Start animation
      this.animationFrameIds[popup.id] = requestAnimationFrame(animate);
    },
    
    /**
     * @method showSuccess
     * @description Shorthand to show a success popup
     */
    showSuccess(title, message = '', options = {}) {
      return this.addPopup({
        title,
        message,
        type: 'success',
        hasInteracted: true,
        ...options
      });
    },
    
    /**
     * @method showError
     * @description Shorthand to show an error popup
     */
    showError(title, message = '', options = {}) {
      return this.addPopup({
        title,
        message,
        type: 'error',
        ...options
      });
    },
    
    /**
     * @method showWarning
     * @description Shorthand to show a warning popup
     */
    showWarning(title, message = '', options = {}) {
      return this.addPopup({
        title,
        message,
        type: 'warning',
        hasInteracted: true,
        showDuration: 5000,
        ...options
      });
    },
    
    /**
     * @method showLoading
     * @description Shows a loading popup and returns its ID
     */
    showLoading(title, message = '') {
      return this.addPopup({
        title,
        message,
        type: 'loading',
        autoClose: false
      });
    },
    
    /**
     * @method clearAll
     * @description Clears all popups
     */
    clearAll() {
      // Clear all timeouts and animation frames
      Object.keys(this.timeoutIds).forEach(id => {
        clearTimeout(this.timeoutIds[id]);
      });
      
      Object.keys(this.animationFrameIds).forEach(id => {
        cancelAnimationFrame(this.animationFrameIds[id]);
      });
      
      this.timeoutIds = {};
      this.animationFrameIds = {};
      this.popups = [];
    }
  },
  beforeUnmount() {
    // Clean up all timeouts and animation frames when component is unmounted
    Object.keys(this.timeoutIds).forEach(id => {
      clearTimeout(this.timeoutIds[id]);
    });
    
    Object.keys(this.animationFrameIds).forEach(id => {
      cancelAnimationFrame(this.animationFrameIds[id]);
    });
  }
}
</script>

<style scoped>
.popup-manager {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.popup-container {
  position: fixed;
  right: 20px;
  width: 400px;
  background-color: var(--color-principal);
  border-radius: 8px;
  box-shadow: var(--shadow-focus-grande);
  overflow: hidden;
  pointer-events: auto;
  transition: top 0.3s ease;
}

.popup-container:hover, .popup-container:focus {
  outline: 2px solid var(--color-resalte);
  outline-offset: 2px;
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

.close-button-container {
  position: relative;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timer-circle {
  position: absolute;
  top: 0;
  left: 0;
}

.popup-close {
  position: absolute;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  padding: 0;
  color: var(--color-oscuro);  
  box-shadow: none;
  z-index: 1;
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