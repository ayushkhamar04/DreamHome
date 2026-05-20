const Property = require('../models/Property');
const { uploadImage } = require('../config/cloudinary');
const { generateReceipt } = require('../utils/pdfGenerator'); // adjust path

// Submit property
const submitProperty = async (req, res) => {
  try {
    const {
      propertyName, 
      propertyType,
      sqft,
      city,
      address,
      facilities,
      bhk,
      propertyFor,
      price,
      ownerName,
      ownerEmail,
      ownerPhone,
      charges,
      paymentMethod,
      paymentDetails,
      locationLat,
      locationLng,
      googleMapsUrl,
    } = req.body;

    // Validate image count
    const propertyImages = req.files.propertyImages;
    const propertyProof = req.files.propertyProof;

    if (!propertyImages || propertyImages.length < 5 || propertyImages.length > 7) {
      return res.status(400).json({
        success: false,
        message: 'Please upload between 5 and 7 property images',
      });
    }

    if (!propertyProof || propertyProof.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Property proof is required',
      });
    }

    // Upload images to Cloudinary
    const imageUrls = [];
    for (const file of propertyImages) {
      const url = await uploadImage(file.buffer, 'properties');
      imageUrls.push(url);
    }

    // Upload property proof
    const proofUrl = await uploadImage(propertyProof[0].buffer, 'proofs');

    // Parse facilities if it's a string
    const parsedFacilities = typeof facilities === 'string' ? JSON.parse(facilities) : facilities;

    // Parse payment details if it's a string
    const parsedPaymentDetails = typeof paymentDetails === 'string' 
      ? JSON.parse(paymentDetails) 
      : paymentDetails;

    // Create property
    const property = await Property.create({
      user: req.user._id,
      propertyName, 
      propertyType,
      sqft: Number(sqft),
      city,
      address,
      facilities: parsedFacilities || [],
      bhk,
      propertyFor,
      price: Number(price),
      ownerName,
      ownerEmail,
      ownerPhone,
      propertyImages: imageUrls,
      propertyProof: proofUrl,
      charges: Number(charges),
      paymentMethod,
      paymentDetails: parsedPaymentDetails || {},
      location: {
        lat: locationLat ? Number(locationLat) : undefined,
        lng: locationLng ? Number(locationLng) : undefined,
        googleMapsUrl: googleMapsUrl || undefined,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Property submitted successfully',
      propertyId: property._id,
    });
  } catch (error) {
    console.error('Error in submitProperty:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit property',
      error: error.message,
    });
  }
};

// Get owner's properties
const getOwnerProperties = async (req, res) => {
  try {
    // Use authenticated user's ID instead of email query
    const properties = await Property.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      properties,
    });
  } catch (error) {
    console.error('Error in getOwnerProperties:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch properties',
      error: error.message,
    });
  }
};

// Get all approved properties (for home page) - UPDATED to exclude sold properties
const getApprovedProperties = async (req, res) => {
  try {
    // Only show properties that are approved AND not sold
    const properties = await Property.find({ 
      status: 'approved',
      sold: false  // NEW: exclude sold properties
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      properties,
      count: properties.length,
    });
  } catch (error) {
    console.error('Error in getApprovedProperties:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch approved properties',
      error: error.message,
    });
  }
};

// Get single property by ID
const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    res.status(200).json({
      success: true,
      property,
    });
  } catch (error) {
    console.error('Error in getPropertyById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch property',
      error: error.message,
    });
  }
};

// NEW: Mark property as sold
const markPropertyAsSold = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    // Check if the user owns this property
    if (property.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this property',
      });
    }

    // Update sold status
    property.sold = true;
    property.soldDate = new Date();
    await property.save();

    res.status(200).json({
      success: true,
      message: 'Property marked as sold successfully',
      property,
    });
  } catch (error) {
    console.error('Error in markPropertyAsSold:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark property as sold',
      error: error.message,
    });
  }
};

// NEW: Mark property as available (unsold)
const markPropertyAsAvailable = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    // Check if the user owns this property
    if (property.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this property',
      });
    }

    // Update sold status
    property.sold = false;
    property.soldDate = null;
    await property.save();

    res.status(200).json({
      success: true,
      message: 'Property marked as available successfully',
      property,
    });
  } catch (error) {
    console.error('Error in markPropertyAsAvailable:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark property as available',
      error: error.message,
    });
  }
};

const generateAndSaveReceipt = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.receiptUrl) {
      return res.status(200).json({
        success: true,
        message: 'Receipt already exists',
        receiptUrl: property.receiptUrl,
      });
    }

    // Optional: only allow for approved properties
    if (property.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Cannot generate receipt for non-approved property',
      });
    }

    const receiptUrl = await generateReceipt(property);

    // Save URL back to document
    property.receiptUrl = receiptUrl;
    await property.save();

    res.status(200).json({
      success: true,
      receiptUrl,
      message: 'Receipt generated and saved',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to generate receipt',
      error: err.message,
    });
  }
};

// Get nearby properties by location
const getNearbyProperties = async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const radiusInKm = parseFloat(radius) || 10;

    // Get all approved, non-sold properties with location data
    const properties = await Property.find({
      status: 'approved',
      sold: false,
      'location.lat': { $exists: true },
      'location.lng': { $exists: true },
    });

    // Calculate distance and filter
    const nearbyProperties = properties
      .map(property => {
        const propLat = property.location.lat;
        const propLng = property.location.lng;

        // Haversine formula to calculate distance
        const R = 6371; // Earth's radius in km
        const dLat = (propLat - userLat) * Math.PI / 180;
        const dLng = (propLng - userLng) * Math.PI / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(userLat * Math.PI / 180) *
          Math.cos(propLat * Math.PI / 180) *
          Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return { ...property.toObject(), distance };
      })
      .filter(property => property.distance <= radiusInKm)
      .sort((a, b) => a.distance - b.distance);

    res.status(200).json({
      success: true,
      properties: nearbyProperties,
      count: nearbyProperties.length,
      radius: radiusInKm,
    });
  } catch (error) {
    console.error('Error in getNearbyProperties:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby properties',
      error: error.message,
    });
  }
};

module.exports = {
  submitProperty,
  getOwnerProperties,
  getApprovedProperties,
  getPropertyById,
  generateAndSaveReceipt,
  markPropertyAsSold,
  markPropertyAsAvailable,
  getNearbyProperties,
};