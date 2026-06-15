const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { validateRequest, loginSchema } = require("../config/validation");

/**
 * @swagger
 * /login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Authentifier un utilisateur
 *     description: Connexion avec identifiants pour obtenir un token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Champs manquants ou invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Identifiants invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/login", validateRequest(loginSchema), authController.login);

module.exports = router;
