import '@testing-library/jest-dom/vitest';

/**
 * jsdom does not implement IntersectionObserver, and framer-motion's `whileInView` throws without
 * it. This is an environment gap, not behaviour under test — the stub reports nothing as
 * intersecting, so `whileInView` animations simply never fire while the elements still render.
 */
if (typeof globalThis.IntersectionObserver === 'undefined') {
  class IntersectionObserverStub implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin: string = '';
    readonly thresholds: ReadonlyArray<number> = [];
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }
  globalThis.IntersectionObserver =
    IntersectionObserverStub as unknown as typeof IntersectionObserver;
}

/** jsdom implements no layout, so `scrollIntoView` is missing. Same class of gap as above. */
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function scrollIntoViewStub() {};
}
