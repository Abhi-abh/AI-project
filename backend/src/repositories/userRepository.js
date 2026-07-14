const User = require('../models/User');

class UserRepository {
  /**
   * Create a new user in the database.
   * @param {Object} userData 
   * @returns {Promise<User>}
   */
  async createUser(userData) {
    return await User.create(userData);
  }

  /**
   * Find a user by email.
   * @param {string} email 
   * @param {boolean} [includePassword=false] - Whether to select the password field.
   * @returns {Promise<User|null>}
   */
  async findByEmail(email, includePassword = false) {
    let query = User.findOne({ email });
    if (includePassword) {
      query = query.select('+password');
    }
    return await query;
  }

  /**
   * Find a user by ID.
   * @param {string} id 
   * @returns {Promise<User|null>}
   */
  async findById(id) {
    return await User.findById(id);
  }

  /**
   * Update user details.
   * @param {string} id 
   * @param {Object} updateData 
   * @returns {Promise<User|null>}
   */
  async updateUser(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }
}

module.exports = new UserRepository();
