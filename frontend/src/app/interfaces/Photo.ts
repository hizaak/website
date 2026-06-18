export interface Photo {
  _id: string;
  workId: string;
  title: string;
  photoDate: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg'];
export const ALLOWED_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg'];

export function extractYearFromPhotoDate(photoDate: string): string {
  const parts = photoDate.split('/');
  return parts[parts.length - 1] || photoDate;
}

export function isAllowedImageFile(file: File): boolean {
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  return ALLOWED_IMAGE_TYPES.includes(file.type) && ALLOWED_IMAGE_EXTENSIONS.includes(ext);
}
