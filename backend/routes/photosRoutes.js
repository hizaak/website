const express = require("express");
const router = express.Router();
const multer = require("multer");

const photoController = require("../controllers/photoController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/", upload.single("photo"), photoController.create);

// doit être avant /:id pour éviter les conflits... ffs
router.get("/random", photoController.getRandomPhoto);
router.get("/", photoController.getAll);
router.get("/:id", photoController.get);

router.put("/:id", photoController.update);

router.delete("/:id", photoController.delete);

module.exports = router;
