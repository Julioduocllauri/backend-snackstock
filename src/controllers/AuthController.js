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

      // Actualizar información de login
      const updates = { last_login: new Date() };
      
      // Si es el primer login, marcarlo
      if (user.is_first_login) {
        updates.first_login = new Date();
        updates.is_first_login = false;
      }
      
      await User.update(user.id, updates);
      
      // Actualizar objeto user con los nuevos valores
      user.is_first_login = updates.is_first_login !== undefined ? updates.is_first_login : user.is_first_login;
      user.onboarding_completed = user.onboarding_completed || false;

      // No enviar password en la respuesta
      delete user.password;

      res.json({
        success: true,
        data: user,
        message: 'Login exitoso',
        showOnboarding: !user.onboarding_completed
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

  /**
   * Completar onboarding del usuario
   */
  static async completeOnboarding(req, res) {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          error: 'Usuario no encontrado' 
        });
      }

      await User.update(userId, { onboarding_completed: true });

      res.json({
        success: true,
        message: 'Onboarding completado exitosamente'
      });
    } catch (error) {
      console.error('Error completando onboarding:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
}

export default AuthController;
