const { validationResult } = require('express-validator');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/sendResponse');

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(res, 400, false, 'Données invalides', null, errors.array());
  }

  const { firstName, lastName, email, password, role, phone } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return sendResponse(res, 400, false, 'Un utilisateur avec cet email existe déjà');
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role: role || 'client',
    phone
  });

  // Generate token
  const token = user.getSignedJwtToken();

  sendResponse(res, 201, true, 'Utilisateur créé avec succès', {
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      fullName: user.fullName
    }
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(res, 400, false, 'Données invalides', null, errors.array());
  }

  const { email, password } = req.body;

  // Find user with password
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return sendResponse(res, 401, false, 'Email ou mot de passe incorrect');
  }

  // Check if user is active
  if (!user.isActive) {
    return sendResponse(res, 401, false, 'Compte désactivé. Contactez l\'administrateur');
  }

  // Check password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return sendResponse(res, 401, false, 'Email ou mot de passe incorrect');
  }

  // Update last login
  await user.updateLastLogin();

  // Generate token
  const token = user.getSignedJwtToken();

  sendResponse(res, 200, true, 'Connexion réussie', {
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      lastLogin: user.lastLogin
    }
  });
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  sendResponse(res, 200, true, 'Profil utilisateur récupéré', {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      fullName: user.fullName,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    }
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(res, 400, false, 'Données invalides', null, errors.array());
  }

  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phone: req.body.phone
  };

  const user = await User.findByIdAndUpdate(
    req.user.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  );

  sendResponse(res, 200, true, 'Profil mis à jour avec succès', {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      fullName: user.fullName
    }
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(res, 400, false, 'Données invalides', null, errors.array());
  }

  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  const isMatch = await user.matchPassword(req.body.currentPassword);
  if (!isMatch) {
    return sendResponse(res, 400, false, 'Mot de passe actuel incorrect');
  }

  user.password = req.body.newPassword;
  await user.save();

  sendResponse(res, 200, true, 'Mot de passe modifié avec succès');
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  // In a real application, you might want to blacklist the token
  // For now, we'll just send a success response
  sendResponse(res, 200, true, 'Déconnexion réussie');
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout
};