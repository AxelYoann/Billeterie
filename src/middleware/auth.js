const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Middleware d'authentification JWT pour API
 * Vérifie la validité du token et attache l'utilisateur à la requête
 */
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Accès refusé. Aucun token fourni.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Token invalide. Utilisateur non trouvé.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Token invalide.'
    });
  }
};

/**
 * Middleware pour extraire les informations utilisateur du token JWT
 * et les rendre disponibles dans les vues (pour les pages web)
 */
const extractUserFromToken = async (req, res, next) => {
  try {
    // Récupérer le token depuis les cookies ou les headers
    const token = req.cookies?.authToken || 
                  req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      // Vérifier et décoder le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      
      // Récupérer les informations utilisateur complètes
      const user = await User.findById(decoded.id || decoded.userId);
      
      if (user) {
        // Ajouter l'utilisateur à l'objet request
        req.user = user;
        
        // Rendre l'utilisateur disponible dans toutes les vues
        res.locals.user = user;
        res.locals.isAuthenticated = true;
      }
    }
    
    // Si pas de token ou utilisateur non trouvé
    if (!req.user) {
      res.locals.user = null;
      res.locals.isAuthenticated = false;
    }
    
    next();
  } catch (error) {
    // Token invalide ou expiré
    res.locals.user = null;
    res.locals.isAuthenticated = false;
    next();
  }
};

/**
 * Middleware d'autorisation par rôle
 * @param {...string} roles - Rôles autorisés
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Accès refusé. Authentification requise.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé. Privilèges insuffisants.'
      });
    }

    next();
  };
};

/**
 * Middleware pour protéger les routes qui nécessitent une authentification
 */
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/auth/login?redirect=' + encodeURIComponent(req.originalUrl));
  }
  next();
};

/**
 * Middleware pour protéger les routes prestataires
 */
const requireProvider = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/auth/login?redirect=' + encodeURIComponent(req.originalUrl));
  }
  
  if (req.user.role !== 'provider' && req.user.role !== 'admin') {
    return res.status(403).render('error', {
      title: 'Accès refusé',
      message: 'Vous devez être prestataire pour accéder à cette page.',
      error: { status: 403 }
    });
  }
  
  next();
};

/**
 * Middleware pour protéger les routes admin
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/auth/login?redirect=' + encodeURIComponent(req.originalUrl));
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).render('error', {
      title: 'Accès refusé',
      message: 'Vous devez être administrateur pour accéder à cette page.',
      error: { status: 403 }
    });
  }
  
  next();
};

/**
 * Middleware pour rediriger les utilisateurs connectés loin des pages de connexion
 */
const redirectIfAuthenticated = (req, res, next) => {
  if (req.user) {
    return res.redirect('/dashboard');
  }
  next();
};

module.exports = {
  authenticate,
  authorize,
  extractUserFromToken,
  requireAuth,
  requireProvider,
  requireAdmin,
  redirectIfAuthenticated
};