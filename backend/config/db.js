const mongoose = require("mongoose");

// In production, MongoDB is the "mongodb" service of docker-compose.yml.
const mongoUri = () => {
  const host = process.env.NODE_ENV === "production" ? "mongodb" : process.env.MONGO_HOST;
  // Encoded so that the password may contain any character (@, :, /...).
  const user = encodeURIComponent(process.env.MONGO_USER);
  const password = encodeURIComponent(process.env.MONGO_PASS);
  const address = `${host}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`;

  return { uri: `mongodb://${user}:${password}@${address}`, address };
};

const connectDB = async () => {
  const { uri, address } = mongoUri();
  // Never log the password.
  console.log(`Connecting to MongoDB: ${address} as ${process.env.MONGO_USER}`);
  await mongoose.connect(uri);
  console.log("MongoDB connected");
};

module.exports = connectDB;
