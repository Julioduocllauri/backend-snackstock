import User from '../models/User.js';

class AuthController {
  /**
   * Registro de nuevo usuario
   */
  static async register(req, res) {
    try {
      const { email, password, name } = req.body;

      // Validación básica
      if (!email || !password || !name) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email, password y nombre son requeridos' 
        });
      }

      // Verificar si el usuario ya existe
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ 
          success: false, 
          error: 'El usuario ya existe' 
        });
      }

      // Crear usuario (en producción: hashear password con bcrypt)
      const user = await User.create({ email, password, name });

      // No enviar password en la respuesta
      delete user.password;

      res.status(201).json({
        success: true,
        data: user,
        message: 'Usuario creado exitosamente'
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  /**
   * Login de usuario
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email y password son requeridos' 
        });
      }

      // Buscar usuario
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: 'Credenciales inválidas' 
        });
      }

      // Verificar password (en producción: usar bcrypt.compare)
      if (user.password !== password) {
        return res.status(401).json({ 
          success: false, 
          error: 'Credenciales inválidas' 
        });
      }

      // No enviar password en la respuesta
      delete user.password;

      res.json({
        success: true,
        data: user,
        message: 'Login exitoso'
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  /**
   * Obtener perfil del usuario
   */
  static async getProfile(req, res) {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          error: 'Usuario no encontrado' 
        });
      }

      delete user.password;

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
}

export default AuthController;
