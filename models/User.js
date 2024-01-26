const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
  },
  inbox: [],
});

module.exports = User = mongoose.model("user", UserSchema);
