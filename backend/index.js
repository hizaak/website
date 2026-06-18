const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const specs = require("./config/swagger");
const { initializeAdminAccount } = require("./models/User");
const path = require("path");

require("dotenv").config();

const app = express();
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

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs)
);

const authRoutes = require("./routes/auth");
const getWorksRoutes = require("./routes/pages/getWorks");
const getWorkPhotosRoutes = require("./routes/pages/getWork");
const workRoutes = require("./routes/works");
const photoRoutes = require("./routes/photos");

app.use(authRoutes);

app.use(
  "/api/works",
  workRoutes
);

app.use(
  "/api/pages/works",
  getWorksRoutes
);

app.use(
  "/api/pages/work",
  getWorkPhotosRoutes
);

app.use(
  "/api/photos",
  photoRoutes
);

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

app.get("/", (req, res) => {
  res.json({
    message:
      "Portfolio API - Consultez /api-docs pour la documentation",
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: "Endpoint introuvable",
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