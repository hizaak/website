import { PhotoSize } from '../Photo';

export interface WorkPagePhoto {
  _id: string;
  title: string;
  photoDate: string;
  filename: string;
  width?: number;
  height?: number;
  sizes?: PhotoSize[];
}

export interface WorkPage {
  _id: string;
  title: string;
  slug: string;
  photos: WorkPagePhoto[];
}
