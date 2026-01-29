import db from '../config/database.js';

class User {
  /**
   * Crear un nuevo usuario
   */
  static async create(userData) {
    const [user] = await db('users')
      .insert({
        email: userData.email,
        password: userData.password, // En producción: hashear con bcrypt
        name: userData.name,
        created_at: new Date()
      })
      .returning('*');

    return user;
  }

  /**
   * Buscar usuario por email
   */
  static async findByEmail(email) {
    const user = await db('users')
      .where({ email })
      .first();

    return user || null;
  }

  /**
   * Buscar usuario por ID
   */
  static async findById(id) {
    const user = await db('users')
      .where({ id })
      .first();

    return user;
  }

  /**
   * Actualizar usuario
   */
  static async update(id, updates) {
    const [user] = await db('users')
      .where({ id })
      .update(updates)
      .returning('*');

    return user;
  }

  /**
   * Eliminar usuario
   */
  static async delete(id) {
    await db('users')
      .where({ id })
      .delete();

    return true;
  }
}

export default User;
