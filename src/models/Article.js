import supabase from '../config/supabase.js';

class Article {
  /**
   * Obtener todos los artículos de un usuario con cálculo de días restantes
   */
  static async findByUser(userId) {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', userId)
      .order('id', { ascending: false });

    if (error) throw error;

    // Calcular días restantes y status
    return data.map(article => {
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
    const { data, error } = await supabase
      .from('inventory')
      .insert([articleData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Crear múltiples artículos (bulk insert)
   */
  static async createMany(articles) {
    const { data, error } = await supabase
      .from('inventory')
      .insert(articles)
      .select();

    if (error) throw error;
    return data;
  }

  /**
   * Buscar artículo por ID
   */
  static async findById(id) {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Actualizar artículo
   */
  static async update(id, updates) {
    const { data, error } = await supabase
      .from('inventory')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Eliminar artículo
   */
  static async delete(id) {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  /**
   * Obtener artículos por categoría
   */
  static async findByCategory(userId, category) {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', userId)
      .eq('category', category)
      .order('expiry_date', { ascending: true });

    if (error) throw error;
    return data;
  }

  /**
   * Obtener artículos críticos (próximos a vencer)
   */
  static async findCritical(userId, daysThreshold = 3) {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', userId)
      .order('expiry_date', { ascending: true });

    if (error) throw error;

    // Filtrar artículos críticos
    const today = new Date();
    return data.filter(article => {
      if (!article.expiry_date) return false;
      const expiryDate = new Date(article.expiry_date);
      const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      return daysLeft <= daysThreshold && daysLeft >= 0;
    });
  }
}

export default Article;
