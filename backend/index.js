const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const specs = require("./config/swagger");
const { initializeAdminAccount } = require("./services/admin-account");
const { backfillMissingThumbnails } = require("./services/photo-thumbnails");
const path = require("path");

require("dotenv").config();

const app = express();

// Behind Nginx Proxy Manager: take the client IP from X-Forwarded-For
// (used by the login rate limit).
app.set("trust proxy", 1);
const port = process.env.PORT || 3000;

connectDB();

const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

initializeAdminAccount();
backfillMissingThumbnails();

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs)
);

const authRoutes = require("./routes/auth");
const worksPageRoutes = require("./routes/pages/works");
const workPageRoutes = require("./routes/pages/work");
const workRoutes = require("./routes/works");
const photoRoutes = require("./routes/photos");
const documentRoutes = require("./routes/documents");
const sitemapController = require("./controllers/sitemap");
const previewController = require("./controllers/preview");

app.use(authRoutes);

app.use(
  "/api/works/:workId/photos",
  photoRoutes.nested
);

app.use(
  "/api/works",
  workRoutes
);

app.use(
  "/api/photos",
  photoRoutes.collection
);

app.use(
  "/api/documents",
  documentRoutes.api
);

app.use(
  "/documents",
  documentRoutes.files
);

app.get("/sitemap.xml", sitemapController.get);
app.use("/__preview", previewController.get);

app.use(
  "/api/pages/works",
  worksPageRoutes
);

app.use(
  "/api/pages/work",
  workPageRoutes
);

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads"),
    { maxAge: "1y", immutable: true }
  )
);

app.get("/", (req, res) => {
  res.json({
    message:
      "Portfolio API - See /api-docs for documentation",
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: "Endpoint not found",
  });
});

app.listen(port, () => {
  console.log(
    `App listening on port ${port}`
  );

  console.log(
    `Swagger UI available at http://localhost:${port}/api-docs`
  );
});