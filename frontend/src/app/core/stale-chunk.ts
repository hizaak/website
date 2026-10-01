import { NavigationError } from '@angular/router';

// Pages are loaded on demand, from files whose names change with every
// deploy. A tab opened before a deploy still asks for the old names, which
// no longer exist: the navigation then fails. Loading the requested address
// from scratch picks up the new version.
export function reloadOnStaleChunk(error: NavigationError): void {
  const message = String((error.error as Error | undefined)?.message ?? error.error);

  if (
    typeof location !== 'undefined' &&
    /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(message)
  ) {
    location.assign(error.url);
  }
}
