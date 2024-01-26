const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
  personOne: {
    type: String,
    required: true,
    unique: false,
  },

  personTwo: {
    type: String,
    required: true,
    unique: false,
  },

  nftId: {
    type: String,
    required: true,
    unique: false,
  },

  messages: [
    {
      sender: {
        type: String,
        required: true,
      },
      generatedTime: {
        type: Date,
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
    },
  ],
});

module.exports = Chat = mongoose.model("chat", ChatSchema);
