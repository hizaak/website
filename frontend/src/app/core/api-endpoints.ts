export const API_ENDPOINTS = {
  auth: {
    login: 'login',
    account: 'account',
  },
  pages: {
    works: 'api/pages/works',
    work: (id: string) => `api/pages/work/${id}`,
  },
  works: {
    base: 'api/works',
    byId: (id: string) => `api/works/${id}`,
    photos: (workId: string) => `api/works/${workId}/photos`,
    reorderPhotos: (workId: string) => `api/works/${workId}/photos/reorder`,
  },
  photos: {
    byId: (id: string) => `api/photos/${id}`,
  },
  documents: {
    base: 'api/documents',
    byFilename: (filename: string) => `api/documents/${encodeURIComponent(filename)}`,
  },
} as const;
