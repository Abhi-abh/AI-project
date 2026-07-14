const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/AppError');

class AuthService {
  /**
   * Register a new user.
   * @param {Object} registerData 
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async register({ fullName, email, password }) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    await userRepository.createUser({
      fullName,
      email,
      password,
    });

    return {
      success: true,
      message: 'Registration successful',
    };
  }

  /**
   * Authenticate user credentials.
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<{success: boolean, token: string, user: Object}>}
   */
  async login(email, password) {
    const user = await userRepository.findByEmail(email, true);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact support.', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = user.generateJWT();

    // Map clean user data (excluding password)
    const cleanedUser = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return {
      success: true,
      token,
      user: cleanedUser,
    };
  }

  /**
   * Retrieve user profile details.
   * @param {string} userId 
   * @returns {Promise<{success: boolean, user: Object}>}
   */
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User profile not found', 404);
    }

    return {
      success: true,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  /**
   * Stateless acknowledgement of logout.
   * @returns {{success: boolean, message: string}}
   */
  logout() {
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }
}

module.exports = new AuthService();
