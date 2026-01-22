import Article from '../models/Article.js';

class ArticlesController {
  /**
   * Obtener todos los artículos de un usuario
   */
  static async index(req, res) {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ 
          success: false, 
          error: 'userId es requerido' 
        });
      }

      const articles = await Article.findByUser(userId);

      res.json({
        success: true,
        data: articles,
        count: articles.length
      });
    } catch (error) {
      console.error('Error obteniendo artículos:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  /**
   * Obtener un artículo específico
   */
  static async show(req, res) {
    try {
      const { id } = req.params;

      const article = await Article.findById(id);
      
      if (!article) {
        return res.status(404).json({ 
          success: false, 
          error: 'Artículo no encontrado' 
        });
      }

      res.json({
        success: true,
        data: article
      });
    } catch (error) {
      console.error('Error obteniendo artículo:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  /**
   * Crear un nuevo artículo
   */
  static async store(req, res) {
    try {
      const { user_id, name, quantity, category, expiry_date } = req.body;

      if (!user_id || !name) {
        return res.status(400).json({ 
          success: false, 
          error: 'user_id y name son requeridos' 
        });
      }

      const article = await Article.create({
        user_id,
        name,
        quantity: quantity || 1,
        category: category || 'General',
        expiry_date
      });

      res.status(201).json({
        success: true,
        data: article,
        message: 'Artículo creado exitosamente'
      });
    } catch (error) {
      console.error('Error creando artículo:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  /**
   * Actualizar un artículo
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // No permitir actualizar user_id
      delete updates.user_id;
      delete updates.id;

      const article = await Article.update(id, updates);

      res.json({
        success: true,
        data: article,
        message: 'Artículo actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error actualizando artículo:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  /**
   * Eliminar un artículo
   */
  static async destroy(req, res) {
    try {
      const { id } = req.params;

      await Article.delete(id);

      res.json({
        success: true,
        message: 'Artículo eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando artículo:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  /**
   * Obtener artículos críticos (próximos a vencer)
   */
  static async getCritical(req, res) {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ 
          success: false, 
          error: 'userId es requerido' 
        });
      }

      const criticalArticles = await Article.findCritical(userId);

      res.json({
        success: true,
        data: criticalArticles,
        count: criticalArticles.length
      });
    } catch (error) {
      console.error('Error obteniendo artículos críticos:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
}

export default ArticlesController;
