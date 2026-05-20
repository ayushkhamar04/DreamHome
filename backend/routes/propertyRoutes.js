const express = require('express');
const router = express.Router();
const multer = require('multer');
const { 
  submitProperty, 
  getOwnerProperties, 
  getApprovedProperties,
  getPropertyById ,
  generateAndSaveReceipt,
   markPropertyAsSold,
  markPropertyAsAvailable,
  getNearbyProperties,
} = require('../controllers/propertyController');
const { protect } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Submit property with image uploads (protected route)
router.post(
  '/submit',
  protect, // ADD THIS - protect middleware BEFORE upload
  upload.fields([
    { name: 'propertyImages', maxCount: 7 },
    { name: 'propertyProof', maxCount: 1 }
  ]),
  submitProperty
);

// Get owner's properties (protected route)
router.get('/owner', protect, getOwnerProperties); // ADD protect here too
router.post('/receipt/:propertyId', protect, generateAndSaveReceipt);
// Get all approved properties (public route - for home page)
router.get('/approved', getApprovedProperties);

// Get nearby properties (public route) - must be before /:id
router.get('/nearby', getNearbyProperties);

// Get single property by ID (public route)
router.get('/:id', getPropertyById);
router.patch('/:id/mark-sold', protect, markPropertyAsSold);
router.patch('/:id/mark-available', protect, markPropertyAsAvailable);
module.exports = router;