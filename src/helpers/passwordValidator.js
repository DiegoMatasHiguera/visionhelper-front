/**
 * Password validation helper functions
 */

/**
 * Validates the complexity of a password.
 * @param {String} password - The password to validate.
 * @returns {Boolean} - Whether the password is valid.
 */
export function validatePasswordComplexity(password) {
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
}

/**
 * Gets an error message for password validation failures.
 * @param {String} password - The password to check.
 * @returns {String} - A message describing what the password is missing.
 */
export function getPasswordValidationMessage(password) {
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
}