// A smaller version of a photo, served from /uploads/sizes/<size>/<filename>.
export interface PhotoSize {
  size: number;
  width: number;
  height: number;
}

export interface Photo {
  _id: string;
  workId: string;
  title: string;
  // Midnight UTC of the day the photo was taken, as an ISO string.
  photoDate: string;
  filename: string;
  thumbnailFilename?: string;
  // Name of the uploaded file.
  originalFilename: string;
  // Set when the uploaded file is kept: it can then be downloaded from the
  // admin (photos uploaded before originals were kept have none).
  originalFile?: string;
  mimeType: string;
  width?: number;
  height?: number;
  sizes?: PhotoSize[];
  position: number;
  createdAt: string;
  updatedAt: string;
}

const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg'];
const ALLOWED_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg'];

// Value for an <input type="date">: "2023-08-14".
export function toDateInputValue(photoDate: string): string {
  return photoDate.slice(0, 10);
}

export function isAllowedImageFile(file: File): boolean {
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  return ALLOWED_IMAGE_TYPES.includes(file.type) && ALLOWED_IMAGE_EXTENSIONS.includes(ext);
}
