const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const cors = require("cors");
const { initializeAdminAccount } = require("./models/User");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

connectDB();

require("dotenv").config();

// Appliquer CORS avant les routes
app.use(
  cors({
    origin: "*",
    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "PATCH",
      "OPTIONS",
      "HEAD",
      "CONNECT",
      "TRACE",
    ],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(bodyParser.json());

initializeAdminAccount();

// Routes
const authRoutes = require("./routes/authRoutes.js");
const photosRoutes = require("./routes/photosRoutes.js");
const serieRoutes = require("./routes/seriesRoutes.js");

app.use(authRoutes);
app.use("/favicon.ico", express.static("public/favicon.ico"));
app.use("/photos", express.static(path.join(__dirname, "public/uploads")));
app.use("/photos", photosRoutes);
app.use("/series", serieRoutes);
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

// Middleware pour afficher les requêtes
app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  console.log(`Request body: ${JSON.stringify(req.body)}`);
  next();
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
