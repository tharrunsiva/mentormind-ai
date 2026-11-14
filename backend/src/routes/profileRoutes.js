const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

// Multer storage configuration for PDF resume uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `resume-${req.user.id}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF resume files are accepted.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter,
});

router.get('/', protect, profileController.getProfile);
router.get('/me', protect, profileController.getProfile);
router.put('/', protect, profileController.updateProfile);
router.put('/me', protect, profileController.updateProfile);
router.post('/resume', protect, upload.single('resume'), profileController.uploadResume);
router.post('/resume/confirm', protect, profileController.confirmResume);

module.exports = router;
