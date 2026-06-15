const express = require("express");
const router = express.Router();

const serieController = require("../controllers/serieController");
const { verifyToken } = require("../config/authMiddleware");
const { validateRequest, serieSchema, serieUpdateSchema } = require("../config/validation");

/**
 * @swagger
 * /series:
 *   post:
 *     tags:
 *       - Series
 *     summary: Créer une nouvelle série
 *     description: Ajouter une nouvelle série de photos (nécessite authentification)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Serie'
 *     responses:
 *       201:
 *         description: Série créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Serie'
 *       400:
 *         description: Validation échouée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 *   get:
 *     tags:
 *       - Series
 *     summary: Récupérer toutes les séries
 *     description: Obtenir la liste de toutes les séries
 *     responses:
 *       200:
 *         description: Liste des séries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Serie'
 *       500:
 *         description: Erreur serveur
 *
 * /series/{id}:
 *   get:
 *     tags:
 *       - Series
 *     summary: Récupérer une série par ID
 *     description: Obtient les détails d'une série spécifique avec ses photos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la série
 *     responses:
 *       200:
 *         description: Détails de la série
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Serie'
 *       404:
 *         description: Série introuvable
 *       500:
 *         description: Erreur serveur
 *   put:
 *     tags:
 *       - Series
 *     summary: Mettre à jour une série
 *     description: Modifie les informations d'une série (nécessite authentification)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la série
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               years:
 *                 type: string
 *     responses:
 *       200:
 *         description: Série mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 serie:
 *                   $ref: '#/components/schemas/Serie'
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Série introuvable
 *       500:
 *         description: Erreur serveur
 *   delete:
 *     tags:
 *       - Series
 *     summary: Supprimer une série
 *     description: Supprime une série et toutes ses photos associées (nécessite authentification)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la série
 *     responses:
 *       200:
 *         description: Série supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Série introuvable
 *       500:
 *         description: Erreur serveur
 */

router.post("/", verifyToken, validateRequest(serieSchema), serieController.create);
router.get("/", serieController.getAll);
router.get("/:id", serieController.get);
router.put("/:id", verifyToken, validateRequest(serieUpdateSchema), serieController.update);
router.delete("/:id", verifyToken, serieController.delete);

module.exports = router;
