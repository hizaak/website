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

// Documents kept out of search results, except the CV linked from the
// about page.
const INDEXED_SLUGS = ["cv"];

const sendNameError = (res, error) =>
  res.status(400).json({ message: error.message, code: error.code });

const sendNotFound = (res) =>
  res.status(404).json({ message: "Document not found.", code: "DOCUMENT_NOT_FOUND" });

const sendNameTaken = (res, filename) =>
  res.status(409).json({
    message: `A document is already published at /documents/${splitFilename(filename).slug}.`,
    code: "DOCUMENT_NAME_TAKEN",
  });

exports.getAll = (req, res, next) => {
  try {
    res.status(200).json(listDocuments());
  } catch (error) {
    next(error);
  }
};

exports.create = (req, res, next) => {
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
    next(error);
  }
};

exports.rename = (req, res, next) => {
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
    next(error);
  }
};

exports.delete = (req, res, next) => {
  try {
    const filename = findDocumentFilename(req.params.filename);
    if (!filename) {
      return sendNotFound(res);
    }

    fs.unlinkSync(documentPath(filename));
    res.status(200).json({ message: "Document deleted." });
  } catch (error) {
    next(error);
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

  const { slug, extension } = splitFilename(filename);

  if (!INDEXED_SLUGS.includes(slug)) {
    headers["X-Robots-Tag"] = "noindex";
  }

  if (!UNSANDBOXED_EXTENSIONS.includes(extension)) {
    headers["Content-Security-Policy"] = "sandbox";
  }

  res.sendFile(documentPath(filename), { headers }, (error) => {
    if (error && !res.headersSent) {
      res.status(404).type("text/plain").send("Document not found.");
    }
  });
};
