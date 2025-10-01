const { validationResult } = require('express-validator');
const memoryDB = require('../services/memoryDatabase');
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

  const { firstName, lastName, email, password, role, phone, companyName } = req.body;

  try {
    // Utiliser la base de données mémoire
    const result = await memoryDB.registerUser({
      firstName,
      lastName,
      email,
      password,
      role: role || 'client',
      phone,
      companyName
    });

    // Définir le cookie d'authentification
    res.cookie('authToken', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 heures
    });

    sendResponse(res, 201, true, 'Utilisateur créé avec succès', {
      token: result.token,
      user: {
        id: result.user._id,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        email: result.user.email,
        role: result.user.role
      }
    });
  } catch (error) {
    if (error.message === 'Cet email est déjà utilisé') {
      return sendResponse(res, 400, false, error.message);
    }
    throw error;
  }
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

  try {
    // Utiliser la base de données mémoire
    const result = await memoryDB.authenticateUser(email, password);
    
    if (!result) {
      return sendResponse(res, 401, false, 'Email ou mot de passe incorrect');
    }

    // Définir le cookie d'authentification
    res.cookie('authToken', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 heures
    });

    sendResponse(res, 200, true, 'Connexion réussie', {
      token: result.token,
      user: {
        id: result.user._id,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        email: result.user.email,
        role: result.user.role
      }
    });
  } catch (error) {
    return sendResponse(res, 401, false, 'Erreur d\'authentification');
  }
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