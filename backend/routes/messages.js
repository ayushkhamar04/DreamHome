const express = require('express');
const { protect } = require('../middleware/auth');
const Message = require('../models/Message');
const Inquiry = require('../models/Inquiry');

const router = express.Router();

// Check for latest messages across all accepted inquiries for the current user
router.get('/unread/check', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all accepted inquiries where the user is a participant
    const inquiries = await Inquiry.find({
      $or: [
        { buyer: userId },
        { seller: userId }
      ],
      status: 'accepted'
    });

    const inquiryIds = inquiries.map(inq => inq._id);

    // Get the latest message for each of these inquiries
    const latestMessages = await Promise.all(
      inquiryIds.map(async (inquiryId) => {
        const msg = await Message.findOne({ inquiry: inquiryId })
          .populate('sender', 'name email role')
          .sort({ createdAt: -1 });
        return msg;
      })
    );

    // Filter out nulls and format response
    const activeChats = latestMessages.filter(msg => msg !== null);

    res.status(200).json({ success: true, activeChats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all messages for an inquiry
router.get('/:inquiryId', protect, async (req, res) => {
  try {
    const { inquiryId } = req.params;
    const userId = req.user.id;

    // Verify user is either buyer or seller on this inquiry
    const inquiry = await Inquiry.findById(inquiryId);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    if (inquiry.buyer.toString() !== userId && inquiry.seller.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to view messages for this inquiry' });
    }

    const messages = await Message.find({ inquiry: inquiryId })
      .populate('sender', 'name email role')
      .populate('receiver', 'name email role')
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, count: messages.length, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send a message
router.post('/', protect, async (req, res) => {
  try {
    const { inquiryId, message } = req.body;
    const senderId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const inquiry = await Inquiry.findById(inquiryId);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    // Verify user is part of the inquiry
    if (inquiry.buyer.toString() !== senderId && inquiry.seller.toString() !== senderId) {
      return res.status(403).json({ success: false, message: 'Not authorized to send messages for this inquiry' });
    }

    // Check if inquiry is accepted
    if (inquiry.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Chat is only enabled for accepted inquiries' });
    }

    // Determine receiver
    const receiverId = inquiry.buyer.toString() === senderId ? inquiry.seller : inquiry.buyer;

    const newMessage = await Message.create({
      inquiry: inquiryId,
      sender: senderId,
      receiver: receiverId,
      message: message.trim(),
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'name email role')
      .populate('receiver', 'name email role');

    res.status(201).json({ success: true, message: populatedMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
