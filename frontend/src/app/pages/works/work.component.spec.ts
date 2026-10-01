import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideTranslateService } from '@ngx-translate/core';

import { WorkComponent } from './work.component';
import { WorkPage } from '../../interfaces/pages/WorkPage';
import { environment } from '../../../environments/environment';

const WORK: WorkPage = {
  _id: 'w1',
  title: 'Gavarnie',
  slug: 'gavarnie',
  photos: [
    {
      _id: 'p1',
      title: 'Cirque',
      photoDate: '2023-08-14T00:00:00.000Z',
      filename: 'p1.jpg',
      width: 3000,
      height: 2000,
      sizes: [{ size: 1280, width: 1280, height: 853 }],
    },
    { _id: 'p2', title: 'Brèche', photoDate: '2019-05-01T00:00:00.000Z', filename: 'p2.jpg' },
  ],
};

describe('WorkComponent', () => {
  let harness: RouterTestingHarness;
  let http: HttpTestingController;

  const open = async (url: string) => {
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    http.expectOne(`${environment.apiUrl}/api/pages/work/gavarnie`).flush(WORK);
    await harness.fixture.whenStable();
    harness.detectChanges();
  };

  const pressKey = (key: string, target: EventTarget = document.body) => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'en/works/:id/:photoIndex', component: WorkComponent },
          { path: 'en/works/:id', component: WorkComponent },
        ]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService({ fallbackLang: 'en' }),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  it('shows the photo with every size in its srcset', async () => {
    await open('/en/works/gavarnie/1');

    const img: HTMLImageElement = harness.routeNativeElement!.querySelector('img.photo')!;
    expect(img.getAttribute('srcset')).toContain('/uploads/sizes/1280/p1.jpg 1280w');
    expect(img.getAttribute('srcset')).toContain('/uploads/p1.jpg 3000w');
    expect(img.getAttribute('width')).toBe('3000');
    expect(img.getAttribute('fetchpriority')).toBe('high');
    // In English, the month is spelled out: 08/14 or 14/08 would be ambiguous.
    expect(harness.routeNativeElement!.textContent).toContain('14 Aug 2023');
  });

  it('links every photo number but the current one, each in its own box', async () => {
    await open('/en/works/gavarnie/1');

    const numbers = Array.from(
      harness.routeNativeElement!.querySelectorAll<HTMLElement>('.photo-number')
    );
    expect(numbers.map((number) => number.textContent!.trim())).toEqual(['1', '2']);
    expect(numbers[0].tagName).toBe('B');
    expect(numbers[0].getAttribute('aria-current')).toBe('page');
    expect(numbers[1].getAttribute('href')).toBe('/en/works/gavarnie/2');
  });

  it('shows the next photo when the photo is clicked, the first after the last', async () => {
    await open('/en/works/gavarnie/1');
    const router = TestBed.inject(Router);
    const photoLink = () =>
      harness.routeNativeElement!.querySelector<HTMLAnchorElement>('a:has(img.photo)')!;

    expect(photoLink().getAttribute('href')).toBe('/en/works/gavarnie/2');

    photoLink().click();
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(router.url).toBe('/en/works/gavarnie/2');
    expect(photoLink().getAttribute('href')).toBe('/en/works/gavarnie/1');
  });

  it('opens the first photo when the number is missing or out of range', async () => {
    await open('/en/works/gavarnie/9');
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/en/works/gavarnie/1');
  });

  it('moves between photos with the arrow keys', async () => {
    await open('/en/works/gavarnie/1');
    const router = TestBed.inject(Router);

    pressKey('ArrowRight');
    await harness.fixture.whenStable();
    expect(router.url).toBe('/en/works/gavarnie/2');

    // Already on the last photo.
    pressKey('ArrowRight');
    await harness.fixture.whenStable();
    expect(router.url).toBe('/en/works/gavarnie/2');

    pressKey('ArrowLeft');
    await harness.fixture.whenStable();
    expect(router.url).toBe('/en/works/gavarnie/1');
  });

  it('ignores the arrow keys while typing in a field', async () => {
    await open('/en/works/gavarnie/1');
    const input = document.createElement('input');
    document.body.appendChild(input);

    pressKey('ArrowRight', input);
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/en/works/gavarnie/1');

    input.remove();
  });

  afterEach(() => http.verify());
});
