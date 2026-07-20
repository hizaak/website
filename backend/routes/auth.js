const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const { validateRequest, loginSchema } = require("../config/validation");

router.post("/login", validateRequest(loginSchema), authController.login);

module.exports = router;
