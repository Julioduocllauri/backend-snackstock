const { User } = require('../models/Model');

/**
 * Middleware para verificar que el usuario esté autenticado
 * En producción deberías usar JWT tokens
 */
const authMiddleware = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;

    if (!userId) {
      return res.status(401).json({ 
        success: false,
        error: 'No autenticado. Se requiere userId' 
      });
    }

    // Verificar que el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Usuario no encontrado' 
      });
    }

    // Agregar usuario al request
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

module.exports = { authMiddleware };
