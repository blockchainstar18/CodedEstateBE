const mongoose = require("mongoose");

// const mongoURI = "mongodb://localhost:27017/CodedEstate";
const mongoURI =
  "mongodb+srv://blockchainstar18:********@cluster0.7nwcpni.mongodb.net/CodedEstate";
const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
    });

    console.log("MongoDB is Connected...");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
