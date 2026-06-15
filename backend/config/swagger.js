const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Photo Gallery API",
      version: "1.0.0",
      description: "API pour la gestion de galeries photo avec authentification JWT",
      contact: {
        name: "Alexandre Maurice",
        email: "contact@example.com",
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === "production"
          ? process.env.PROD_URL
          : `http://localhost:${process.env.PORT || 3000}`,
        description:
          process.env.NODE_ENV === "production"
            ? "Production server"
            : "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token pour l'authentification",
        },
      },
      schemas: {
        Photo: {
          type: "object",
          required: ["title", "date"],
          properties: {
            _id: {
              type: "string",
              description: "ID unique de la photo",
            },
            title: {
              type: "string",
              description: "Titre de la photo",
            },
            path: {
              type: "string",
              description: "Chemin d'accès au fichier de la photo",
            },
            date: {
              type: "string",
              format: "date-time",
              description: "Date de la photo",
            },
            serie: {
              type: "string",
              description: "ID de la série associée",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Serie: {
          type: "object",
          required: ["title", "years"],
          properties: {
            _id: {
              type: "string",
              description: "ID unique de la série",
            },
            title: {
              type: "string",
              description: "Titre de la série",
            },
            years: {
              type: "string",
              pattern: "^\\d{4}(-\\d{4})?$",
              description: "Année(s) de la série (ex: '2024' ou '2022-2024')",
            },
            photos: {
              type: "array",
              items: {
                type: "string",
              },
              description: "IDs des photos dans la série",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["username", "password"],
          properties: {
            username: {
              type: "string",
              description: "Nom d'utilisateur",
            },
            password: {
              type: "string",
              description: "Mot de passe",
            },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Message de confirmation",
            },
            token: {
              type: "string",
              description: "JWT token pour l'authentification",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: {
              type: "string",
            },
            errors: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },
        },
      },
    },
    security: [],
  },
  apis: [],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
