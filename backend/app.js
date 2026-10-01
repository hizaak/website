const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const { specs, uiOptions } = require("./config/swagger");
const { UPLOAD_DIR } = require("./config/upload");

const authRoutes = require("./routes/auth");
const worksPageRoutes = require("./routes/pages/works");
const workPageRoutes = require("./routes/pages/work");
const workRoutes = require("./routes/works");
const photoRoutes = require("./routes/photos");
const documentRoutes = require("./routes/documents");
const sitemapController = require("./controllers/sitemap");
const previewController = require("./controllers/preview");

const app = express();

// Behind Nginx Proxy Manager: take the client IP from X-Forwarded-For
// (used by the login rate limit).
app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Frame-Options": "DENY",
  });
  next();
});

app.use(express.json());

// For the docker-compose healthcheck: up only while MongoDB is reachable.
app.get("/health", (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({ status: connected ? "ok" : "database unavailable" });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, uiOptions));

app.use(authRoutes);
app.use("/api/works/:workId/photos", photoRoutes.nested);
app.use("/api/works", workRoutes);
app.use("/api/photos", photoRoutes.collection);
app.use("/api/documents", documentRoutes.api);
app.use("/documents", documentRoutes.files);
app.get("/sitemap.xml", sitemapController.get);
app.use("/__preview", previewController.get);
app.use("/api/pages/works", worksPageRoutes);
app.use("/api/pages/work", workPageRoutes);

app.use(
  "/uploads",
  express.static(UPLOAD_DIR, { maxAge: "1y", immutable: true })
);

app.get("/", (req, res) => {
  res.json({ message: "Portfolio API - See /api-docs for documentation" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

// Everything the routes pass to next(error) ends here. Internal details are
// logged, never sent to the client.
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON body." });
  }

  // A malformed id (/api/photos/abc) is a bad request, not a server failure.
  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: `Invalid ${error.path}.` });
  }

  console.error(`${req.method} ${req.originalUrl} failed:`, error);
  res.status(500).json({ message: "Server error." });
});

module.exports = app;
