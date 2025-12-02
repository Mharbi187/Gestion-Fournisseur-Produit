const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateOTP, sendOTPEmail, sendWelcomeEmail } = require('../utils/emailService');

// OTP expiry time (10 minutes)
const OTP_EXPIRY_MINUTES = 10;


// Register user (self-registration, always creates client)
exports.register = async (req, res) => {
  try {
    const { nom, prenom, email, motdepasse, adresse } = req.body;

    // Validate required fields
    if (!nom || !prenom || !email || !motdepasse) {
      return res.status(400).json({
        success: false,
        message: 'Nom, prénom, email et mot de passe sont requis'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format d\'email invalide'
      });
    }

    // Password strength validation
    if (motdepasse.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 8 caractères'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      // If user exists but not verified, allow re-registration with new OTP
      if (!existingUser.isVerified) {
        const otp = generateOTP();
        existingUser.otp = {
          code: otp,
          expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
          purpose: 'verification'
        };
        existingUser.mdp = await bcrypt.hash(motdepasse, 12);
        existingUser.nom = nom;
        existingUser.prenom = prenom;
        await existingUser.save();
        
        try {
          const mailRes = await sendOTPEmail(email, otp, 'verification');
          if (mailRes && mailRes.previewUrl) console.log('OTP preview URL (resend existing user):', mailRes.previewUrl);
        } catch (emailError) {
          console.error('Email sending failed (non-fatal):', emailError.message);
        }
        
        return res.status(200).json({
          success: true,
          message: 'Un nouveau code de vérification a été envoyé à votre email',
          requiresVerification: true,
          email: email.toLowerCase()
        });
      }
      
      return res.status(400).json({ 
        success: false,
        message: 'Cet email existe déjà' 
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Create user with client role only (unverified)
    const hashedPassword = await bcrypt.hash(motdepasse, 12);
    const user = new User({
      nom,
      prenom,
      email: email.toLowerCase(),
      mdp: hashedPassword,
      role: 'client',
      adresse,
      isVerified: false,
      otp: {
        code: otp,
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
        purpose: 'verification'
      }
    });

    await user.save();

    // Send OTP email (don't fail registration if email fails)
    try {
      const mailRes = await sendOTPEmail(email, otp, 'verification');
      if (mailRes && mailRes.previewUrl) console.log('OTP preview URL (register):', mailRes.previewUrl);
    } catch (emailError) {
      console.error('Email sending failed (non-fatal):', emailError.message);
      // Continue with registration - user can request resend
    }

    res.status(201).json({
      success: true,
      message: 'Code de vérification envoyé à votre email',
      requiresVerification: true,
      email: email.toLowerCase()
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(400).json({
      success: false,
      message: 'Erreur de création',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Verify OTP and complete registration
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email et code OTP sont requis'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    if (user.isVerified && user.otp?.purpose !== 'reset') {
      return res.status(400).json({
        success: false,
        message: 'Ce compte est déjà vérifié'
      });
    }

    // Check OTP
    if (!user.otp || !user.otp.code) {
      return res.status(400).json({
        success: false,
        message: 'Aucun code OTP en attente. Veuillez vous réinscrire.'
      });
    }

    if (user.otp.code !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Code OTP invalide'
      });
    }

    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Code OTP expiré. Veuillez en demander un nouveau.'
      });
    }

    // If this is for password reset
    if (user.otp.purpose === 'reset') {
      return res.status(200).json({
        success: true,
        message: 'Code vérifié. Vous pouvez maintenant réinitialiser votre mot de passe.',
        canResetPassword: true,
        email: user.email
      });
    }

    // Mark as verified
    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    // Send welcome email
    try {
      const welcomeRes = await sendWelcomeEmail(user.email, user.prenom);
      if (welcomeRes && welcomeRes.previewUrl) console.log('Welcome email preview URL:', welcomeRes.previewUrl);
    } catch (e) {
      console.error('Error sending welcome email (non-fatal):', e);
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email, name: user.prenom },
      process.env.JWT_SECRET || 'Mohamedharbiaaaa',
      { expiresIn: '30d' }
    );

    res.status(200).json({
      success: true,
      message: 'Compte vérifié avec succès!',
      token,
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        adresse: user.adresse
      }
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur de vérification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email requis'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    if (user.isVerified && !user.otp?.purpose) {
      return res.status(400).json({
        success: false,
        message: 'Ce compte est déjà vérifié'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const purpose = user.otp?.purpose || 'verification';
    
    user.otp = {
      code: otp,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
      purpose
    };
    await user.save();

    // Send OTP email
    const mailRes = await sendOTPEmail(email, otp, purpose);
    if (mailRes && mailRes.previewUrl) console.log('OTP preview URL (resendOTP):', mailRes.previewUrl);

    res.status(200).json({
      success: true,
      message: 'Nouveau code envoyé à votre email'
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du code',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Forgot password - request OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email requis'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if email exists
      return res.status(200).json({
        success: true,
        message: 'Si cet email existe, un code de réinitialisation sera envoyé'
      });
    }

    // Generate OTP for password reset
    const otp = generateOTP();
    user.otp = {
      code: otp,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
      purpose: 'reset'
    };
    await user.save();

    // Send OTP email
    const mailRes = await sendOTPEmail(email, otp, 'reset');
    if (mailRes && mailRes.previewUrl) console.log('OTP preview URL (forgotPassword):', mailRes.previewUrl);

    res.status(200).json({
      success: true,
      message: 'Code de réinitialisation envoyé à votre email'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Reset password with OTP
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, code OTP et nouveau mot de passe sont requis'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 8 caractères'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Check OTP
    if (!user.otp || user.otp.purpose !== 'reset') {
      return res.status(400).json({
        success: false,
        message: 'Aucune demande de réinitialisation en cours'
      });
    }

    if (user.otp.code !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Code OTP invalide'
      });
    }

    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Code OTP expiré'
      });
    }

    // Update password
    user.mdp = await bcrypt.hash(newPassword, 12);
    user.otp = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Admin registration endpoint
exports.registerAdmin = async (req, res) => {
  try {
    
    const { nom, prenom, email, motdepasse, adresse, adminSecret } = req.body;
     const receivedSecret = (adminSecret || '').toString().trim();
    const expectedSecret = (process.env.ADMIN_SECRET || '').toString().trim();
    console.log('Received:', JSON.stringify(receivedSecret)); // Debug
    console.log('Expected:', JSON.stringify(expectedSecret));
    
    console.log('Received adminSecret:', adminSecret); // Debug log
    console.log('Expected adminSecret:', process.env.ADMIN_SECRET);
    // Verify admin secret
    if (receivedSecret !== expectedSecret) {
      return res.status(403).json({
        success: false,
        message: 'Clé secrète admin invalide',
        received: receivedSecret,
        expected: expectedSecret,
        lengthReceived: receivedSecret.length,
        lengthExpected: expectedSecret.length
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Cet email existe déjà' 
      });
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(motdepasse, 12);
    const user = new User({
      nom,
      prenom,
      email: email.toLowerCase(),
      mdp: hashedPassword,
      role: 'admin',
      adresse
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'Mohamedharbiaaaa',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'Admin créé avec succès',
      token,
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        adresse: user.adresse
      }
    });

  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// Verify user role (for admin dashboard)
exports.verifyAdminRole = async (req, res) => {
  try {
    // The auth middleware already verified the token and set req.user
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: admin role required'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Admin access verified'
    });

  } catch (error) {
    console.error('Admin verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying admin status'
    });
  }
};
// Verify user role
exports.verifyRole = async (req, res) => {
  try {
    // Get user ID from authenticated request
    const userId = req.user.userId;
    
    // Find user and select only the role field
    const user = await User.findById(userId).select('role');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      role: user.role
    });
    
  } catch (error) {
    console.error('Role verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying role',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, motdepasse } = req.body;
    
    // Validate input
    if (!email || !motdepasse) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe sont requis'
      });
    }

    // Find user with password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+mdp');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }
    
    const isPasswordValid = await bcrypt.compare(motdepasse, user.mdp);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    // Generate JWT token with user's first name
    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role,
        email: user.email,
        name: user.prenom  // Added this line to include first name
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Return response without password
    const userResponse = user.toObject();
    delete userResponse.mdp;

    res.json({
      success: true,
      token,
      user: userResponse,
      expiresIn: '30d'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


// Get current user
// In userController.js - modify getCurrentUser
exports.getCurrentUser = async (req, res) => {
  try {
    console.log('Fetching user for ID:', req.user.userId); // Debug log
    const user = await User.findById(req.user.userId).select('-mdp');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Utilisateur non trouvé' 
      });
    }
    
    // Return consistent response structure
    res.status(200).json({
      success: true,
      message: 'User data retrieved successfully',
      data: {
        ...user.toObject(),
        adresse: user.adresse || {
          rue: '',
          ville: '',
          codePostal: '',
          pays: ''
        }
      }
    });
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId).select('+mdp');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    const isMatch = await bcrypt.compare(currentPassword, user.mdp);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      });
    }
    
    user.mdp = await bcrypt.hash(newPassword, 12);
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Mot de passe mis à jour avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Create user (admin only)
exports.createUser = async (req, res) => {
  try {
    const { nom, prenom, email, mdp, role = 'client', adresse } = req.body;

    // Basic validation
    if (!nom || !prenom || !email || !mdp) {
      return res.status(400).json({ 
        success: false,
        message: 'Nom, prénom, email et mot de passe sont requis' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format d\'email invalide'
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Cet email est déjà utilisé' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(mdp, 12);

    // Create user with specified role
    const user = new User({
      nom,
      prenom,
      email: email.toLowerCase(),
      mdp: hashedPassword,
      role,
      adresse
    });

    await user.save();

    // Return user without password and include a JWT for the created user
    const userResponse = user.toObject();
    delete userResponse.mdp;

    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role,
        email: user.email,
        name: user.prenom
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: userResponse,
      token,
      expiresIn: '30d'
    });

  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: 'Erreur de création', 
      error: error.message 
    });
  }
};

// Get current user's role
exports.getUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('role');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    res.status(200).json({
      success: true,
      role: user.role
    });
  } catch (error) {
    console.error('Get user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all users (admin only)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-mdp');
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};

// Get single user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-mdp');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Utilisateur non trouvé' 
      });
    }
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { nom, prenom, adresse, statut, role } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { nom, prenom, adresse, statut, role },
      { 
        new: true,
        runValidators: true
      }
    ).select('-mdp');

    if (!updatedUser) {
      return res.status(404).json({ 
        success: false,
        message: 'Utilisateur non trouvé' 
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: updatedUser
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: 'Erreur de mise à jour',
      error: error.message 
    });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Utilisateur non trouvé' 
      });
    }
    
    res.status(200).json({ 
      success: true,
      message: 'Utilisateur supprimé avec succès' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};