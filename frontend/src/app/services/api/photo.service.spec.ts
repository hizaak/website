import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { PhotoService } from './photo.service';
import { environment } from '../../../environments/environment';

describe('PhotoService', () => {
  let service: PhotoService;
  const api = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    service = TestBed.inject(PhotoService);
  });

  it('lists every size and the original in the srcset', () => {
    const srcset = service.getPhotoSrcset({
      filename: 'a.jpg',
      width: 3000,
      sizes: [
        { size: 1280, width: 1280, height: 853 },
        { size: 2048, width: 2048, height: 1365 },
      ],
    });

    expect(srcset).toBe(
      `${api}/uploads/sizes/1280/a.jpg 1280w, ${api}/uploads/sizes/2048/a.jpg 2048w, ${api}/uploads/a.jpg 3000w`
    );
  });

  it('has no srcset while the dimensions are unknown', () => {
    expect(service.getPhotoSrcset({ filename: 'a.jpg' })).toBe('');
  });
});
