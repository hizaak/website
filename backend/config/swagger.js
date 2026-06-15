const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Portfolio Photographique API",
      version: "2.0.0",
      description: "API REST pour la gestion des Works et Photos",
      contact: {
        name: "Alexandre Maurice",
      },
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === "production"
            ? process.env.PROD_URL
            : `http://localhost:${process.env.PORT || 3000}`,
        description:
          process.env.NODE_ENV === "production" ? "Production" : "Development",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token obtenu via POST /login",
        },
      },
      schemas: {
        Work: {
          type: "object",
          required: ["title"],
          properties: {
            _id: { type: "string", example: "665a1b2c3d4e5f6789012345" },
            title: { type: "string", example: "Yosemite" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        WorkCreate: {
          type: "object",
          required: ["title"],
          properties: {
            title: { type: "string", example: "Yosemite" },
          },
        },
        WorkUpdate: {
          type: "object",
          properties: {
            title: { type: "string", example: "Trees" },
          },
        },
        Photo: {
          type: "object",
          required: ["workId", "title", "photoDate", "filename"],
          properties: {
            _id: { type: "string", example: "665a1b2c3d4e5f6789012346" },
            workId: { type: "string", example: "665a1b2c3d4e5f6789012345" },
            title: { type: "string", example: "Morning Light" },
            photoDate: { type: "string", example: "14/08/2023" },
            filename: {
              type: "string",
              example: "550e8400-e29b-41d4-a716-446655440000.jpg",
            },
            originalFilename: { type: "string", example: "morning-light.jpg" },
            mimeType: { type: "string", example: "image/jpeg" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        PhotoCreate: {
          type: "object",
          required: ["title", "photoDate", "photo"],
          properties: {
            title: { type: "string", example: "Morning Light" },
            photoDate: { type: "string", example: "14/08/2023" },
            photo: { type: "string", format: "binary" },
          },
        },
        PhotoUpdate: {
          type: "object",
          properties: {
            title: { type: "string", example: "Granite Wall" },
            photoDate: { type: "string", example: "03/11/2024" },
            photo: { type: "string", format: "binary", description: "Optionnel" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["username", "password"],
          properties: {
            username: { type: "string", example: "admin" },
            password: { type: "string", example: "admin" },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Connexion réussie." },
            token: { type: "string" },
          },
        },
        Message: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: { type: "string" },
            errors: { type: "array", items: { type: "string" } },
          },
        },
      },
    },
    paths: {
      "/login": {
        post: {
          tags: ["Authentication"],
          summary: "Connexion admin",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginRequest" },
              },
            },
          },
          responses: {
            200: {
              description: "Connexion réussie",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/LoginResponse" },
                },
              },
            },
            401: { description: "Identifiants invalides" },
          },
        },
      },
      "/api/works": {
        get: {
          tags: ["Works"],
          summary: "Liste tous les Works",
          responses: {
            200: {
              description: "Liste des Works",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Work" },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ["Works"],
          summary: "Créer un Work",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/WorkCreate" },
              },
            },
          },
          responses: {
            201: {
              description: "Work créé",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Work" },
                },
              },
            },
            409: { description: "Titre déjà utilisé" },
          },
        },
      },
      "/api/works/{id}": {
        get: {
          tags: ["Works"],
          summary: "Obtenir un Work",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: {
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Work" },
                },
              },
            },
            404: { description: "Work introuvable" },
          },
        },
        put: {
          tags: ["Works"],
          summary: "Modifier un Work",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/WorkUpdate" },
              },
            },
          },
          responses: {
            200: {
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Work" },
                },
              },
            },
            404: { description: "Work introuvable" },
            409: { description: "Titre déjà utilisé" },
          },
        },
        delete: {
          tags: ["Works"],
          summary: "Supprimer un Work et ses Photos",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: {
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Message" },
                },
              },
            },
            404: { description: "Work introuvable" },
          },
        },
      },
      "/api/works/{workId}/photos": {
        get: {
          tags: ["Photos"],
          summary: "Photos d'un Work",
          parameters: [
            { name: "workId", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: {
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Photo" },
                  },
                },
              },
            },
            404: { description: "Work introuvable" },
          },
        },
        post: {
          tags: ["Photos"],
          summary: "Ajouter une Photo à un Work",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "workId", in: "path", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: { $ref: "#/components/schemas/PhotoCreate" },
              },
            },
          },
          responses: {
            201: {
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Photo" },
                },
              },
            },
            400: { description: "Validation ou format fichier invalide" },
            404: { description: "Work introuvable" },
          },
        },
      },
      "/api/photos/{id}": {
        get: {
          tags: ["Photos"],
          summary: "Obtenir une Photo",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: {
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Photo" },
                },
              },
            },
            404: { description: "Photo introuvable" },
          },
        },
        put: {
          tags: ["Photos"],
          summary: "Modifier une Photo",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            content: {
              "multipart/form-data": {
                schema: { $ref: "#/components/schemas/PhotoUpdate" },
              },
            },
          },
          responses: {
            200: {
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Photo" },
                },
              },
            },
            404: { description: "Photo introuvable" },
          },
        },
        delete: {
          tags: ["Photos"],
          summary: "Supprimer une Photo",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: {
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Message" },
                },
              },
            },
            404: { description: "Photo introuvable" },
          },
        },
      },
    },
  },
  apis: [],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
