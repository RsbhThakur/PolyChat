const mongoose = require("mongoose");

// Message Schema - Individual messages in a conversation
const messageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    default: null,
  },
  response: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Chat Schema - Complete conversation with multiple messages
const chatSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  messages: {
    type: [messageSchema],
    default: [],
  },
});

const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);
module.exports = Chat;
