import { useEffect } from 'react';

/**
 * Lock background scroll on `<html>` and `<body>` while a modal is open.
 *
 * Uses reference counting so that nested modals (e.g. `AddProductModal`
 * containing `BarcodeScannerModal`) don't accidentally unlock the page
 * when the inner one closes — we only restore scrolling when the *last*
 * lock is released.
 *
 * On iOS Safari the soft keyboard makes the layout viewport rubber-band
 * unless the page is explicitly locked. This is what fixes the "page
 * scrolls under the modal when I tap an input on my phone" bug.
 */
let lockCount = 0;
let savedHtmlOverflow = '';
let savedBodyOverflow = '';

function applyLock() {
  if (typeof document === 'undefined') return;
  if (lockCount === 0) {
    savedHtmlOverflow = document.documentElement.style.overflow;
    savedBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }
  lockCount += 1;
}

function releaseLock() {
  if (typeof document === 'undefined') return;
  if (lockCount === 0) return;
  lockCount -= 1;
  if (lockCount === 0) {
    document.documentElement.style.overflow = savedHtmlOverflow;
    document.body.style.overflow = savedBodyOverflow;
  }
}

export function useBodyScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    applyLock();
    return releaseLock;
  }, [active]);
}
