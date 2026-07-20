const User = require("../models/User");

const initializeAdminAccount = async () => {
  try {
    const adminUsername = "admin";
    const adminPassword = "admin";

    const existingAdmin = await User.findOne({ username: adminUsername });

    if (!existingAdmin) {
      const admin = new User({
        username: adminUsername,
        password: adminPassword,
      });
      await admin.save();
      console.log("Admin account created.");
    } else {
      console.log("Admin account already exists.");
    }
  } catch (error) {
    console.error("Error while initializing admin account:", error);
  }
};

module.exports = { initializeAdminAccount };
