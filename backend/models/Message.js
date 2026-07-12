const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    inquiry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inquiry',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ inquiry: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
