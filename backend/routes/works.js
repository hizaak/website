const express = require("express");
const router = express.Router();

const workController = require("../controllers/work");
const { verifyToken } = require("../config/authMiddleware");
const {
  validateRequest,
  workSchema,
  workUpdateSchema,
} = require("../config/validation");

router.get("/", workController.getAll);
router.post("/", verifyToken, validateRequest(workSchema), workController.create);
router.get("/:id", workController.get);
router.put("/:id", verifyToken, validateRequest(workUpdateSchema), workController.update);
router.delete("/:id", verifyToken, workController.delete);

module.exports = router;
