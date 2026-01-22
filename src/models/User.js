import supabase from '../config/supabase.js';

class User {
  /**
   * Crear un nuevo usuario
   */
  static async create(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        email: userData.email,
        password: userData.password, // En producción: hashear con bcrypt
        name: userData.name,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Buscar usuario por email
   */
  static async findByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no encontrado
    return data;
  }

  /**
   * Buscar usuario por ID
   */
  static async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Actualizar usuario
   */
  static async update(id, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Eliminar usuario
   */
  static async delete(id) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
}

export default User;
