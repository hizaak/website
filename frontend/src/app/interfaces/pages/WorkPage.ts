export interface WorkPagePhoto {
  _id: string;
  title: string;
  photoDate: string;
}

export interface WorkPage {
  _id: string;
  title: string;
  photos: WorkPagePhoto[];
}