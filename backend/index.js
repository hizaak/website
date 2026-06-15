const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const specs = require("./config/swagger");
const { initializeAdminAccount } = require("./models/User");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

connectDB();

require("dotenv").config();

const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Trop de requêtes depuis cette adresse IP, veuillez réessayer plus tard.",
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Trop de tentatives de connexion, veuillez réessayer plus tard.",
  skipSuccessfulRequests: true,
});

app.use(limiter);

initializeAdminAccount();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

const authRoutes = require("./routes/authRoutes.js");
const photosRoutes = require("./routes/photosRoutes.js");
const serieRoutes = require("./routes/seriesRoutes.js");

app.use("/login", authLimiter);
app.use(authRoutes);
app.use("/favicon.ico", express.static("public/favicon.ico"));
app.use("/photos", express.static(path.join(__dirname, "public/uploads")));
app.use("/photos", photosRoutes);
app.use("/series", serieRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API Photo Gallery - Consultez /api-docs pour la documentation" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint introuvable" });
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
});
