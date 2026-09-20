/* The one client script (DESIGN.md §7); it sets custom properties, global.css styles the lens. */

const FINE_POINTER = matchMedia('(hover: hover) and (pointer: fine)');
const REDUCED_MOTION = matchMedia('(prefers-reduced-motion: reduce)');

/** Lerp factor for the follow lag; 1 removes it. */
const FOLLOW = 0.2;

function attach(plate: HTMLElement): () => void {
  const source = plate.dataset.lens;
  if (!source) return () => {};

  let lens: HTMLDivElement | undefined;
  let rect = new DOMRect();
  let targetX = 0;
  let targetY = 0;
  let lensX = 0;
  let lensY = 0;
  let frame = 0;
  let active = false;

  // The only layout read, and never in the pointer handler.
  const step = (): void => {
    frame = 0;
    if (!lens) return;
    rect = plate.getBoundingClientRect();

    const follow = REDUCED_MOTION.matches ? 1 : FOLLOW;
    lensX += (targetX - lensX) * follow;
    lensY += (targetY - lensY) * follow;

    lens.style.setProperty('--lens-x', `${lensX}px`);
    lens.style.setProperty('--lens-y', `${lensY}px`);
    lens.style.setProperty('--lens-w', `${rect.width}px`);
    lens.style.setProperty('--lens-h', `${rect.height}px`);
    lens.style.setProperty('--lens-px', `${lensX / rect.width}`);
    lens.style.setProperty('--lens-py', `${lensY / rect.height}`);

    if (active) schedule();
  };

  const schedule = (): void => {
    frame ||= requestAnimationFrame(step);
  };

  const track = (event: PointerEvent): void => {
    targetX = event.clientX - rect.left;
    targetY = event.clientY - rect.top;
  };

  const hide = (): void => {
    active = false;
    delete plate.dataset.lensActive;
  };

  const show = (event: PointerEvent): void => {
    rect = plate.getBoundingClientRect();
    track(event);
    if (!lens) {
      lens = document.createElement('div');
      lens.className = 'loupe';
      lens.setAttribute('aria-hidden', 'true');

      const sheen = document.createElement('div');
      sheen.className = 'loupe__sheen';

      const view = document.createElement('div');
      view.className = 'loupe__view';
      // On enter, never upfront: the heaviest asset the gallery pulls.
      view.style.setProperty('--lens-image', `url("${source}")`);
      lens.append(view, sheen);
      plate.append(lens);

      const probe = new Image();
      probe.addEventListener('load', () => {
        plate.dataset.lensReady = '';
      });
      probe.src = source;

      lensX = targetX;
      lensY = targetY;
    }
    active = true;
    plate.dataset.lensActive = '';
    schedule();
  };

  plate.addEventListener('pointerenter', show);
  plate.addEventListener('pointermove', track, { passive: true });
  plate.addEventListener('pointerleave', hide);

  return hide;
}

if (FINE_POINTER.matches) {
  const dismiss = [...document.querySelectorAll<HTMLElement>('.plate[data-lens]')].map(attach);

  // Hover-only content must be dismissible (1.4.13).
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') for (const hide of dismiss) hide();
  });
}
