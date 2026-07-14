const authService = require('../services/authService');
const { successResponse } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');
const { HTTP_STATUS } = require('../constants');

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;
  const result = await authService.register({ fullName, email, password });
  return successResponse(res, result.message, null, HTTP_STATUS.CREATED);
});

// @desc    Login user & get token
// @route   POST /api/v1/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    token: result.token,
    user: result.user,
  });
});

// @desc    Get user profile
// @route   GET /api/v1/auth/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const result = await authService.getProfile(req.user._id);
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    user: result.user,
  });
});

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Public
const logout = asyncHandler(async (req, res) => {
  const result = authService.logout();
  return successResponse(res, result.message, null, HTTP_STATUS.OK);
});

module.exports = {
  register,
  login,
  getProfile,
  logout,
};
