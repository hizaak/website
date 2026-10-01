import { suggestDocumentFilename } from './DocumentFile';
import { toDateInputValue } from './Photo';

describe('suggestDocumentFilename', () => {
  it('turns any file name into a URL-safe one', () => {
    expect(suggestDocumentFilename('Mon_CV Été.PDF')).toBe('mon-cv-ete.pdf');
    expect(suggestDocumentFilename('notes')).toBe('notes');
  });
});

describe('toDateInputValue', () => {
  it('keeps the day of a UTC date', () => {
    expect(toDateInputValue('2023-08-14T00:00:00.000Z')).toBe('2023-08-14');
  });
});
