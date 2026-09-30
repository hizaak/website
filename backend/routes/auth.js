const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const authController = require("../controllers/auth");
const { verifyToken } = require("../config/authMiddleware");
const {
  validateRequest,
  loginSchema,
  accountUpdateSchema,
} = require("../config/validation");

// Slows down password guessing: 10 failed attempts per IP every 15 minutes,
// shared between logging in and updating the account.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many login attempts, try again later." },
});

router.post("/login", loginLimiter, validateRequest(loginSchema), authController.login);
router.get("/account", verifyToken, authController.getAccount);
router.put(
  "/account",
  verifyToken,
  loginLimiter,
  validateRequest(accountUpdateSchema),
  authController.updateAccount
);

module.exports = router;
