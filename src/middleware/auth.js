const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('[Auth] Token received:', token ? '*****' : 'none');
  
  if (!token) {
    console.error('[Auth] No token provided');
    return res.status(401).json({
      success: false,
      message: 'Token d\'authentification requis'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('[Auth] Token verification failed:', err.message);
      
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({
          success: false,
          message: 'Token expiré',
          expired: true
        });
      }
      
      return res.status(403).json({
        success: false,
        message: 'Token invalide'
      });
    }
    
    console.log('[Auth] Token decoded:', { 
      userId: decoded.userId, 
      role: decoded.role,
      email: decoded.email 
    });
    req.user = decoded;
    next();
  });
};

/**
 * Role Authorization Middleware
 * @param {string[]} allowedRoles - Array of allowed roles (e.g., ['admin', 'manager'])
 */
const authorizedRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.error('[Auth] No user in request');
      return res.status(401).json({
        success: false,
        message: 'Non authentifié'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      console.error(`[Auth] Role ${req.user.role} not authorized`);
      return res.status(403).json({
        success: false,
        message: `Accès refusé. Rôles autorisés: ${allowedRoles.join(', ')}`
      });
    }

    console.log(`[Auth] User ${req.user.userId} authorized as ${req.user.role}`);
    next();
  };
};

/**
 * Ownership Check Middleware
 * Verifies if user is owner of the resource or admin
 */
const isOwnerOrAdmin = (req, res, next) => {
  const resourceId = req.params.id;
  const { userId, role } = req.user;

  if (role === 'admin') {
    return next();
  }

  if (resourceId !== userId) {
    console.error(`[Auth] User ${userId} unauthorized for resource ${resourceId}`);
    return res.status(403).json({
      success: false,
      message: 'Vous ne pouvez accéder qu\'à vos propres ressources'
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  authorizedRole,
  isOwnerOrAdmin
};