const multer = require('multer');
const AppError = require('../utils/AppError');

// Store files in memory buffer for stream uploading to Cloudinary
const storage = multer.memoryStorage();

// File filter for images (profile avatar, course thumbnails)
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files (JPG, PNG, WEBP) are allowed!', 400), false);
  }
};

// File filter for assignments (documents, images, PDFs, archives)
const assignmentFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
    'application/x-zip-compressed',
    'text/plain',
    'image/jpeg',
    'image/png'
  ];

  if (allowedTypes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type! Allowed: PDF, DOC, DOCX, ZIP, TXT, JPG, PNG.', 400), false);
  }
};

const uploadAvatar = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).single('avatar');

const uploadThumbnail = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
}).single('thumbnail');

const uploadAssignmentFiles = multer({
  storage,
  fileFilter: assignmentFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
}).array('files', 5); // Max 5 files

module.exports = {
  uploadAvatar,
  uploadThumbnail,
  uploadAssignmentFiles
};
