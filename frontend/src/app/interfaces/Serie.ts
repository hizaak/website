import { Photo } from './Photo';

export interface Serie {
  _id: string;
  title: string;
  years: string;
  photos: Photo[];
  createdAt: string;
  updatedAt: string;
}
