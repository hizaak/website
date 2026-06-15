const express = require("express");
const router = express.Router();
const multer = require("multer");

const photoController = require("../controllers/photoController");
const { verifyToken } = require("../config/authMiddleware");
const { validateRequest, photoSchema, photoUpdateSchema } = require("../config/validation");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

/**
 * @swagger
 * /photos:
 *   post:
 *     tags:
 *       - Photos
 *     summary: Créer une nouvelle photo
 *     description: Ajouter une nouvelle photo à la galerie (nécessite authentification)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - date
 *               - photo
 *             properties:
 *               title:
 *                 type: string
 *                 description: Titre de la photo
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Date de la photo
 *               serie:
 *                 type: string
 *                 description: ID de la série (optionnel)
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Fichier image de la photo
 *     responses:
 *       201:
 *         description: Photo créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Photo'
 *       400:
 *         description: Validation échouée ou fichier manquant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Non authentifié
 *       409:
 *         description: Le titre existe déjà
 *       500:
 *         description: Erreur serveur
 *   get:
 *     tags:
 *       - Photos
 *     summary: Récupérer toutes les photos
 *     description: Obtenir la liste de toutes les photos de la galerie
 *     responses:
 *       200:
 *         description: Liste des photos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Photo'
 *       500:
 *         description: Erreur serveur
 *
 * /photos/random:
 *   get:
 *     tags:
 *       - Photos
 *     summary: Obtenir une photo aléatoire
 *     description: Récupère une photo aléatoire de la galerie
 *     responses:
 *       200:
 *         description: Photo aléatoire
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Photo'
 *       404:
 *         description: Aucune photo trouvée
 *       500:
 *         description: Erreur serveur
 *
 * /photos/{id}:
 *   get:
 *     tags:
 *       - Photos
 *     summary: Récupérer une photo par ID
 *     description: Obtient les détails d'une photo spécifique
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la photo
 *     responses:
 *       200:
 *         description: Détails de la photo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Photo'
 *       404:
 *         description: Photo introuvable
 *       500:
 *         description: Erreur serveur
 *   put:
 *     tags:
 *       - Photos
 *     summary: Mettre à jour une photo
 *     description: Modifie les informations d'une photo (nécessite authentification)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la photo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               serie:
 *                 type: string
 *     responses:
 *       200:
 *         description: Photo mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 photo:
 *                   $ref: '#/components/schemas/Photo'
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Photo introuvable
 *       500:
 *         description: Erreur serveur
 *   delete:
 *     tags:
 *       - Photos
 *     summary: Supprimer une photo
 *     description: Supprime une photo de la galerie (nécessite authentification)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la photo
 *     responses:
 *       200:
 *         description: Photo supprimée avec succès
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
 *         description: Photo introuvable
 *       500:
 *         description: Erreur serveur
 */

router.post("/", verifyToken, upload.single("photo"), validateRequest(photoSchema), photoController.create);

router.get("/random", photoController.getRandomPhoto);

router.get("/", photoController.getAll);

router.get("/:id", photoController.get);

router.put("/:id", verifyToken, validateRequest(photoUpdateSchema), photoController.update);

router.delete("/:id", verifyToken, photoController.delete);

module.exports = router;
