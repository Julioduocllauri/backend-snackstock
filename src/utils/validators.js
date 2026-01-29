/**
 * Valida los datos de registro de usuario
 * @param {Object} userData - Datos del usuario
 * @returns {Object} - Objeto con errores (vacío si todo está bien)
 */
export function validateRegister(userData) {
  const errors = {};

  const email = (userData.email || '').trim();
  const password = userData.password || '';
  const name = (userData.name || '').trim();

  // Validar nombre
  if (!name) {
    errors.name = 'El nombre es obligatorio';
  } else if (name.length < 2) {
    errors.name = 'El nombre debe tener al menos 2 caracteres';
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    errors.email = 'El email es obligatorio';
  } else if (!emailRegex.test(email)) {
    errors.email = 'Email inválido';
  }

  // Validar password
  if (!password) {
    errors.password = 'La contraseña es obligatoria';
  } else if (password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres';
  }

  return errors;
}

/**
 * Valida los datos de un artículo
 * @param {Object} articleData - Datos del artículo
 * @returns {Object} - Objeto con errores (vacío si todo está bien)
 */
export function validateArticle(articleData) {
  const errors = {};

  const name = (articleData.name || '').trim();
  const quantity = articleData.quantity;

  // Validar nombre
  if (!name) {
    errors.name = 'El nombre del artículo es obligatorio';
  } else if (name.length < 2) {
    errors.name = 'El nombre debe tener al menos 2 caracteres';
  }

  // Validar cantidad
  if (quantity === undefined || quantity === null) {
    errors.quantity = 'La cantidad es obligatoria';
  } else if (typeof quantity !== 'number' || quantity < 0) {
    errors.quantity = 'La cantidad debe ser un número positivo';
  }

  return errors;
}
