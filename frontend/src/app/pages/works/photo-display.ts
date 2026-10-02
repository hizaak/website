// Shared by the work and home pages, which show a photo the same way.

// Must match the max-width of .photo in _photo.scss, so that the browser
// picks the right version from the srcset.
export const PHOTO_SIZES_ATTRIBUTE = '(max-width: 768px) 100vw, calc(100vw - 100px)';

// French readers expect 14/08/2023; for anyone else that order is ambiguous
// (08/14 in the US), so English spells the month out: 14 Aug 2023.
export const DATE_FORMATS: Record<'fr' | 'en', string> = {
  fr: 'dd/MM/yyyy',
  en: 'd MMM yyyy',
};
