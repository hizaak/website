// config/db.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = async () => {
  try {
    // Créer l'URL de connexion MongoDB à partir des variables du fichier .env
    if (process.env.NODE_ENV === "production") {
      var host = "mongodb";
    } else {
      var host = process.env.MONGO_HOST;
    }
    const mongoURI = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${host}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`;
    console.log("Connecting to MongoDB:", mongoURI);
    // Se connecter à MongoDB
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
