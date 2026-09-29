const fs = require("fs");
const path = require("path");
const {
  DocumentNameError,
  splitFilename,
  resolveDocumentFilename,
  documentPath,
  toDocument,
  listDocuments,
  findDocumentFilename,
  findDocumentFilenameBySlug,
} = require("../services/documents");

// Types a browser renders as an active page. Served on the site's own
// origin, they could read the admin token from localStorage, so everything
// except PDFs (whose viewer refuses to run sandboxed) is sandboxed.
const UNSANDBOXED_EXTENSIONS = [".pdf"];

const sendNameError = (res, error) =>
  res.status(400).json({ message: error.message, code: error.code });

const sendNotFound = (res) =>
  res.status(404).json({ message: "Document not found.", code: "DOCUMENT_NOT_FOUND" });

const sendNameTaken = (res, filename) =>
  res.status(409).json({
    message: `A document is already published at /documents/${splitFilename(filename).slug}.`,
    code: "DOCUMENT_NAME_TAKEN",
  });

exports.getAll = (req, res) => {
  try {
    res.status(200).json(listDocuments());
  } catch (error) {
    console.error("Error listing documents:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

exports.create = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "File is missing.", code: "DOCUMENT_FILE_MISSING" });
  }

  try {
    const filename = resolveDocumentFilename(
      req.body.name,
      path.extname(req.file.originalname),
      req.file.originalname
    );

    // One URL per slug, whatever the extension: mon-cv.pdf and mon-cv.docx
    // would both claim /documents/mon-cv.
    const existing = findDocumentFilenameBySlug(splitFilename(filename).slug);

    if (existing && !req.body.replace) {
      return sendNameTaken(res, existing);
    }

    fs.writeFileSync(documentPath(filename), req.file.buffer);

    if (existing && existing !== filename) {
      fs.unlinkSync(documentPath(existing));
    }

    res.status(201).json(toDocument(filename));
  } catch (error) {
    if (error instanceof DocumentNameError) {
      return sendNameError(res, error);
    }
    console.error("Error creating document:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

exports.rename = (req, res) => {
  try {
    const current = findDocumentFilename(req.params.filename);
    if (!current) {
      return sendNotFound(res);
    }

    const filename = resolveDocumentFilename(
      req.body.name,
      splitFilename(current).extension
    );

    if (filename === current) {
      return res.status(200).json(toDocument(current));
    }

    if (findDocumentFilenameBySlug(splitFilename(filename).slug)) {
      return sendNameTaken(res, filename);
    }

    fs.renameSync(documentPath(current), documentPath(filename));
    res.status(200).json(toDocument(filename));
  } catch (error) {
    if (error instanceof DocumentNameError) {
      return sendNameError(res, error);
    }
    console.error("Error renaming document:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

exports.delete = (req, res) => {
  try {
    const filename = findDocumentFilename(req.params.filename);
    if (!filename) {
      return sendNotFound(res);
    }

    fs.unlinkSync(documentPath(filename));
    res.status(200).json({ message: "Document deleted." });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// Public: /documents/mon-cv (or /documents/mon-cv.pdf) serves the raw file.
exports.serve = (req, res) => {
  const filename =
    findDocumentFilename(req.params.name) ||
    findDocumentFilenameBySlug(req.params.name);

  if (!filename) {
    return res.status(404).type("text/plain").send("Document not found.");
  }

  const headers = {
    "Content-Disposition": `inline; filename="${filename}"`,
    "X-Content-Type-Options": "nosniff",
    // Documents can be replaced under the same URL: always revalidate.
    "Cache-Control": "no-cache",
  };

  if (!UNSANDBOXED_EXTENSIONS.includes(splitFilename(filename).extension)) {
    headers["Content-Security-Policy"] = "sandbox";
  }

  res.sendFile(documentPath(filename), { headers }, (error) => {
    if (error && !res.headersSent) {
      res.status(404).type("text/plain").send("Document not found.");
    }
  });
};
