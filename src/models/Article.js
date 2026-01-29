import db from '../config/database.js';

class Article {
  /**
   * Obtener todos los artículos de un usuario con cálculo de días restantes
   */
  static async findByUser(userId) {
    const articles = await db('articles')
      .where({ user_id: userId })
      .orderBy('id', 'desc');

    // Calcular días restantes y status
    return articles.map(article => {
      if (!article.expiry_date) return article;

      const today = new Date();
      const expiryDate = new Date(article.expiry_date);
      const timeDiff = expiryDate - today;
      const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

      let status = 'green';
      if (daysLeft <= 3) status = 'red';
      else if (daysLeft <= 7) status = 'yellow';

      return {
        ...article,
        days_left: daysLeft,
        status
      };
    });
  }

  /**
   * Crear un nuevo artículo
   */
  static async create(articleData) {
    const [article] = await db('articles')
      .insert(articleData)
      .returning('*');

    return article;
  }

  /**
   * Crear múltiples artículos (bulk insert)
   */
  static async createMany(articles) {
    const createdArticles = await db('articles')
      .insert(articles)
      .returning('*');

    return createdArticles;
  }

  /**
   * Buscar artículo por ID
   */
  static async findById(id) {
    const article = await db('articles')
      .where({ id })
      .first();

    return article;
  }

  /**
   * Actualizar artículo
   */
  static async update(id, updates) {
    const [article] = await db('articles')
      .where({ id })
      .update(updates)
      .returning('*');

    return article;
  }

  /**
   * Eliminar artículo
   */
  static async delete(id) {
    await db('articles')
      .where({ id })
      .delete();

    return true;
  }

  /**
   * Obtener artículos por categoría
   */
  static async findByCategory(userId, category) {
    const articles = await db('articles')
      .where({ user_id: userId, category })
      .orderBy('expiry_date', 'asc');

    return articles;
  }

  /**
   * Obtener artículos críticos (próximos a vencer)
   */
  static async findCritical(userId, daysThreshold = 3) {
    const articles = await db('articles')
      .where({ user_id: userId })
      .orderBy('expiry_date', 'asc');

    // Filtrar artículos críticos
    const today = new Date();
    return articles.filter(article => {
      if (!article.expiry_date) return false;
      const expiryDate = new Date(article.expiry_date);
      const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      return daysLeft <= daysThreshold && daysLeft >= 0;
    });
  }
}

export default Article;
