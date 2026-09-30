const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({
      message: "Login successful.",
      token: token,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

exports.getAccount = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    res.status(200).json({ username: user.username });
  } catch (error) {
    console.error("Error while loading account:", error);
    res.status(500).json({ message: "Server error." });
  }
};

exports.updateAccount = async (req, res) => {
  const { currentPassword, newUsername, newPassword } = req.body;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // 403 rather than 401, which means an expired session.
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(403).json({ message: "Current password is incorrect." });
    }

    if (newUsername && newUsername !== user.username) {
      const taken = await User.exists({ username: newUsername, _id: { $ne: user._id } });
      if (taken) {
        return res.status(409).json({ message: "Username already taken." });
      }
      user.username = newUsername;
    }

    if (newPassword) {
      user.password = newPassword;
    }

    user.updatedAt = Date.now();
    await user.save();

    res.status(200).json({ username: user.username });
  } catch (error) {
    console.error("Error while updating account:", error);
    res.status(500).json({ message: "Server error." });
  }
};
