const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }

  next();
});

const initializeAdminAccount = async () => {
  try {
    const adminUsername = "admin";
    const adminPassword = "admin";

    const admin = new User({
      username: adminUsername,
      password: adminPassword,
    });

    const existingAdmin = await User.findOne({
      username: adminUsername,
    });
    if (!existingAdmin) {
      await admin.save();
      console.log("Admin account created.");
    } else {
      console.log("Admin account already exists.");
    }
  } catch (error) {
    console.error("Error while initializing admin account:", error);
  }
};

const User = mongoose.model("User", userSchema);

module.exports = { User, initializeAdminAccount };
