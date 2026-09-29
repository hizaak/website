const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Portfolio Photographique API",
      version: "2.0.0",
      description: "REST API for managing Works and Photos",
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
          description: "JWT token obtained via POST /login",
        },
      },
      schemas: {
        Work: {
          type: "object",
          required: ["title"],
          properties: {
            _id: { type: "string", example: "665a1b2c3d4e5f6789012345" },
            title: { type: "string", example: "Yosemite" },
            slug: { type: "string", example: "yosemite" },
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
            position: { type: "number", example: 0 },
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
            photo: { type: "string", format: "binary", description: "Optional" },
          },
        },
        PhotoReorder: {
          type: "object",
          required: ["photoIds"],
          properties: {
            photoIds: {
              type: "array",
              items: { type: "string" },
              example: ["665a1b2c3d4e5f6789012346", "665a1b2c3d4e5f6789012347"],
            },
          },
        },
        WorkListItem: {
          type: "object",
          properties: {
            _id: { type: "string", example: "665a1b2c3d4e5f6789012345" },
            title: { type: "string", example: "Yosemite" },
            slug: { type: "string", example: "yosemite" },
            yearRange: { type: "string", example: "2022-2024" },
          },
        },
        WorkPage: {
          type: "object",
          properties: {
            _id: { type: "string", example: "665a1b2c3d4e5f6789012345" },
            title: { type: "string", example: "Yosemite" },
            slug: { type: "string", example: "yosemite" },
            photos: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  _id: { type: "string", example: "665a1b2c3d4e5f6789012346" },
                  title: { type: "string", example: "Morning Light" },
                  photoDate: { type: "string", example: "14/08/2023" },
                  filename: { type: "string", example: "morning-light.jpg" },
                },
              },
            },
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
            message: { type: "string", example: "Login successful." },
            token: { type: "string" },
          },
        },
        Document: {
          type: "object",
          properties: {
            filename: { type: "string", example: "mon-cv.pdf" },
            slug: { type: "string", example: "mon-cv" },
            extension: { type: "string", example: ".pdf" },
            size: { type: "number", example: 104857 },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        DocumentCreate: {
          type: "object",
          required: ["document"],
          properties: {
            document: { type: "string", format: "binary" },
            name: {
              type: "string",
              example: "mon-cv.pdf",
              description:
                "Stored filename (extension optional, cannot differ from the file's). Defaults to the slugified original name.",
            },
            replace: {
              type: "boolean",
              description: "Replace the document already published under the same slug.",
            },
          },
        },
        DocumentRename: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", example: "cv-2026.pdf" },
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
          summary: "Admin login",
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
              description: "Login successful",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/LoginResponse" },
                },
              },
            },
            401: { description: "Invalid credentials" },
          },
        },
      },
      "/api/works": {
        get: {
          tags: ["Works"],
          summary: "List all Works",
          responses: {
            200: {
              description: "List of Works",
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
          summary: "Create a Work",
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
              description: "Work created",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Work" },
                },
              },
            },
            409: { description: "Title already in use" },
          },
        },
      },
      "/api/works/{id}": {
        get: {
          tags: ["Works"],
          summary: "Get a Work",
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
            404: { description: "Work not found" },
          },
        },
        put: {
          tags: ["Works"],
          summary: "Update a Work",
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
            404: { description: "Work not found" },
            409: { description: "Title already in use" },
          },
        },
        delete: {
          tags: ["Works"],
          summary: "Delete a Work and its Photos",
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
            404: { description: "Work not found" },
          },
        },
      },
      "/api/works/{workId}/photos": {
        get: {
          tags: ["Photos"],
          summary: "List a Work's Photos",
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
            404: { description: "Work not found" },
          },
        },
        post: {
          tags: ["Photos"],
          summary: "Add a Photo to a Work",
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
            400: { description: "Validation error or invalid file format" },
            404: { description: "Work not found" },
          },
        },
      },
      "/api/works/{workId}/photos/reorder": {
        put: {
          tags: ["Photos"],
          summary: "Reorder a Work's Photos",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "workId", in: "path", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PhotoReorder" },
              },
            },
          },
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
            400: { description: "The photo list does not match this work" },
            404: { description: "Work not found" },
          },
        },
      },
      "/api/photos/{id}": {
        get: {
          tags: ["Photos"],
          summary: "Get a Photo",
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
            404: { description: "Photo not found" },
          },
        },
        put: {
          tags: ["Photos"],
          summary: "Update a Photo",
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
            404: { description: "Photo not found" },
          },
        },
        delete: {
          tags: ["Photos"],
          summary: "Delete a Photo",
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
            404: { description: "Photo not found" },
          },
        },
      },
      "/api/documents": {
        get: {
          tags: ["Documents"],
          summary: "List Documents",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Document" },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ["Documents"],
          summary: "Upload a Document",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: { $ref: "#/components/schemas/DocumentCreate" },
              },
            },
          },
          responses: {
            201: {
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Document" },
                },
              },
            },
            400: { description: "Missing file or invalid name" },
            409: { description: "A Document is already published under this slug" },
            413: { description: "File too large" },
          },
        },
      },
      "/api/documents/{filename}": {
        put: {
          tags: ["Documents"],
          summary: "Rename a Document",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "filename", in: "path", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DocumentRename" },
              },
            },
          },
          responses: {
            200: {
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Document" },
                },
              },
            },
            400: { description: "Invalid name" },
            404: { description: "Document not found" },
            409: { description: "A Document is already published under this slug" },
          },
        },
        delete: {
          tags: ["Documents"],
          summary: "Delete a Document",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "filename", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: {
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Message" },
                },
              },
            },
            404: { description: "Document not found" },
          },
        },
      },
      "/documents/{name}": {
        get: {
          tags: ["Documents"],
          summary: "Serve a Document's raw file (by slug or full filename)",
          parameters: [
            { name: "name", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: { description: "The raw file" },
            404: { description: "Document not found" },
          },
        },
      },
      "/api/pages/works": {
        get: {
          tags: ["Pages"],
          summary: "Get the Works list page data",
          responses: {
            200: {
              description: "List of Works for the listing page",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/WorkListItem" },
                  },
                },
              },
            },
          },
        },
      },
      "/api/pages/work/{id}": {
        get: {
          tags: ["Pages"],
          summary: "Get a Work detail page data",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: {
              description: "Work detail with its ordered Photos",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/WorkPage" },
                },
              },
            },
            404: { description: "Work not found" },
          },
        },
      },
    },
  },
  apis: [],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
