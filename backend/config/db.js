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
    // Encoded so that the password may contain any character (@, :, /...).
    const user = encodeURIComponent(process.env.MONGO_USER);
    const password = encodeURIComponent(process.env.MONGO_PASS);
    const address = `${host}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`;
    const mongoURI = `mongodb://${user}:${password}@${address}`;
    // Never log the password.
    console.log(`Connecting to MongoDB: ${address} as ${process.env.MONGO_USER}`);
    // Se connecter à MongoDB
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
