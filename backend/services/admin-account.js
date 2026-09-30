const User = require("../models/User");
const { ADMIN_PASSWORD_MIN_LENGTH } = require("../config/validation");

// Creates the admin account on first start, with the password given in
// ADMIN_PASSWORD. Never falls back to a default password.
const initializeAdminAccount = async () => {
  try {
    const adminUsername = "admin";

    // The account can be renamed from the admin, so look for any account.
    const existingAdmin = await User.exists({});

    if (existingAdmin) {
      console.log("Admin account already exists.");
      return;
    }

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword || adminPassword.length < ADMIN_PASSWORD_MIN_LENGTH) {
      console.warn(
        `Admin account not created: set ADMIN_PASSWORD (${ADMIN_PASSWORD_MIN_LENGTH} characters or more).`
      );
      return;
    }

    const admin = new User({
      username: adminUsername,
      password: adminPassword,
    });
    await admin.save();
    console.log("Admin account created.");
  } catch (error) {
    console.error("Error while initializing admin account:", error);
  }
};

module.exports = { initializeAdminAccount };
