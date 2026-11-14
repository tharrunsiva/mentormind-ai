const { User, LearnerProfile, CareerPath } = require('../models');
const { generateToken } = require('../utils/token');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      educationLevel,
      institution,
      currentYear,
      careerStatus,
      targetCareer,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'learner',
      educationLevel: educationLevel || 'Undergraduate',
      institution: institution || '',
      currentYear: currentYear || '3rd Year',
      careerStatus: careerStatus || 'Student',
      profileCompleted: false,
    });

    // Find default career if requested
    let targetCareerDoc = null;
    if (targetCareer) {
      targetCareerDoc = await CareerPath.findById(targetCareer);
    }
    if (!targetCareerDoc) {
      targetCareerDoc = await CareerPath.findOne({ slug: 'full-stack-developer' });
    }

    // Create Initial LearnerProfile
    const profile = await LearnerProfile.create({
      user: user._id,
      fullName: user.name,
      education: user.educationLevel,
      institution: user.institution,
      currentYear: user.currentYear,
      targetCareer: targetCareerDoc ? targetCareerDoc._id : null,
      targetCareerName: targetCareerDoc ? targetCareerDoc.title : 'Full Stack Developer',
      existingTechnicalSkills: [],
      existingSoftSkills: ['Problem Solving', 'Communication'],
      careerReadinessScore: 20,
      streakDays: 1,
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted,
      },
      profile,
      message: 'Account successfully registered.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const profile = await LearnerProfile.findOne({ user: user._id });
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted,
      },
      profile,
      message: 'Logged in successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently authenticated user & profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let profile = await LearnerProfile.findOne({ user: user._id }).populate('targetCareer');

    if (!profile) {
      profile = await LearnerProfile.create({
        user: user._id,
        fullName: user.name,
        education: user.educationLevel,
        institution: user.institution,
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted,
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with that email address.' });
    }

    // In production, an email with a reset link is sent. For local demo, return success and a reset token
    const resetToken = 'reset_' + Math.random().toString(36).substring(2, 15);
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 mins
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset link generated.',
      resetToken, // Provided for easy development / demo testing
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide reset token and new password.' });
    }

    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token.' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been successfully updated. You may now log in.',
    });
  } catch (error) {
    next(error);
  }
};
