const fs = require("fs");
const path = require("path");
const { DOCUMENTS_DIR } = require("../config/upload");
const { slugify } = require("../utils/slug");

// The filesystem is the source of truth: a document is just a file in
// DOCUMENTS_DIR, and its public URL is its filename without the extension
// (/documents/mon-cv serves mon-cv.pdf). Names are restricted to lowercase
// URL-safe characters so the filename can be used as-is in the URL and can
// never escape DOCUMENTS_DIR.
const SLUG_PATTERN = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/;
const EXTENSION_PATTERN = /^(?:\.[a-z0-9]{1,10})?$/;
const MAX_SLUG_LENGTH = 100;

class DocumentNameError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

const splitFilename = (filename) => {
  const extension = path.extname(filename).toLowerCase();
  return {
    slug: filename.slice(0, filename.length - extension.length),
    extension,
  };
};

const isValidDocumentFilename = (filename) => {
  if (typeof filename !== "string") {
    return false;
  }

  const { slug, extension } = splitFilename(filename);
  return (
    filename === filename.toLowerCase() &&
    slug.length <= MAX_SLUG_LENGTH &&
    SLUG_PATTERN.test(slug) &&
    EXTENSION_PATTERN.test(extension)
  );
};

// Turns the name typed in the admin ("mon-cv.pdf", or just "mon-cv") into the
// stored filename. The extension is always the real file's one: it may be
// omitted, but not changed, since it decides the Content-Type we serve.
const resolveDocumentFilename = (requestedName, fileExtension, fallbackName) => {
  const extension = fileExtension.toLowerCase();

  if (!EXTENSION_PATTERN.test(extension)) {
    throw new DocumentNameError(
      "DOCUMENT_EXTENSION_INVALID",
      `Unsupported file extension "${extension}".`
    );
  }

  let slug = (requestedName || "").trim();

  if (!slug) {
    slug = slugify(splitFilename(fallbackName || "").slug);
  } else if (extension && slug.toLowerCase().endsWith(extension)) {
    slug = slug.slice(0, slug.length - extension.length);
  } else if (path.extname(slug)) {
    throw new DocumentNameError(
      "DOCUMENT_EXTENSION_MISMATCH",
      `The extension must stay "${extension || "(none)"}".`
    );
  }

  const filename = `${slug}${extension}`;

  if (!isValidDocumentFilename(filename)) {
    throw new DocumentNameError(
      "DOCUMENT_NAME_INVALID",
      "Only lowercase letters, digits, - and _ are allowed in the name."
    );
  }

  return filename;
};

const documentPath = (filename) => path.join(DOCUMENTS_DIR, filename);

const toDocument = (filename) => {
  const stats = fs.statSync(documentPath(filename));
  const { slug, extension } = splitFilename(filename);

  return {
    filename,
    slug,
    extension,
    size: stats.size,
    updatedAt: stats.mtime,
  };
};

const listDocumentFilenames = () =>
  fs
    .readdirSync(DOCUMENTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && isValidDocumentFilename(entry.name))
    .map((entry) => entry.name)
    .sort();

const listDocuments = () => listDocumentFilenames().map(toDocument);

const findDocumentFilename = (filename) =>
  isValidDocumentFilename(filename) && fs.existsSync(documentPath(filename))
    ? filename
    : null;

const findDocumentFilenameBySlug = (slug) =>
  listDocumentFilenames().find((filename) => splitFilename(filename).slug === slug) || null;

module.exports = {
  DocumentNameError,
  splitFilename,
  resolveDocumentFilename,
  documentPath,
  toDocument,
  listDocuments,
  findDocumentFilename,
  findDocumentFilenameBySlug,
};
