/** Disable pinch / double-tap zoom on phones (viewport alone is ignored by some browsers). */
export function lockMobileZoom() {
  if (typeof document === 'undefined') return;

  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute(
      'content',
      'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, interactive-widget=resizes-content',
    );
  }

  const blockMultiTouch = (event: TouchEvent) => {
    if (event.touches.length > 1) event.preventDefault();
  };

  document.addEventListener('touchmove', blockMultiTouch, { passive: false });
  document.addEventListener('touchstart', blockMultiTouch, { passive: false });

  for (const type of ['gesturestart', 'gesturechange', 'gestureend'] as const) {
    document.addEventListener(type, (event) => event.preventDefault(), {
      passive: false,
    });
  }

  document.addEventListener(
    'wheel',
    (event) => {
      if (event.ctrlKey) event.preventDefault();
    },
    { passive: false },
  );

  // Last-resort: if scale somehow changes, snap visual viewport back.
  const vv = window.visualViewport;
  if (vv) {
    const reset = () => {
      if (Math.abs(vv.scale - 1) > 0.01) {
        viewport?.setAttribute(
          'content',
          'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, interactive-widget=resizes-content',
        );
      }
    };
    vv.addEventListener('resize', reset);
    vv.addEventListener('scroll', reset);
  }
}
