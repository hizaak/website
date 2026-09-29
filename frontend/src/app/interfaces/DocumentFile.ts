export interface DocumentFile {
  filename: string;
  slug: string;
  extension: string;
  size: number;
  updatedAt: string;
}

// Mirrors the backend naming rules: "Mon_CV Été.PDF" -> "mon-cv-ete.pdf".
export function suggestDocumentFilename(originalName: string): string {
  const dotIndex = originalName.lastIndexOf('.');
  const hasExtension = dotIndex > 0;
  const base = hasExtension ? originalName.slice(0, dotIndex) : originalName;
  const extension = hasExtension ? originalName.slice(dotIndex).toLowerCase() : '';

  const slug = base
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${slug}${extension}`;
}
