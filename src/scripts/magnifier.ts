/* The one client script (DESIGN.md §7); it sets custom properties, global.css styles the lens. */

const FINE_POINTER = matchMedia('(hover: hover) and (pointer: fine)');
const REDUCED_MOTION = matchMedia('(prefers-reduced-motion: reduce)');

/** Lerp factor for the follow lag; 1 removes it. */
const FOLLOW = 0.2;
/** A finger held still this long means "look". */
const HOLD = 300;

type Point = Pick<Touch, 'clientX' | 'clientY'>;

function attach(plate: HTMLElement): () => void {
  const source = plate.dataset.lens;
  if (!source) return () => {};

  const touch = !FINE_POINTER.matches;
  let lens: HTMLDivElement | undefined;
  let rect = new DOMRect();
  let start!: Point;
  let targetX = 0;
  let targetY = 0;
  let lensX = 0;
  let lensY = 0;
  let frame = 0;
  let hold = 0;
  let active = false;

  const set = (name: string, value: number | string, unit = 'px'): void =>
    lens?.style.setProperty(`--lens-${name}`, value + unit);

  // The only layout read, and never in an input handler.
  const step = (): void => {
    frame = 0;
    if (!lens) return;
    rect = plate.getBoundingClientRect();

    const follow = touch || REDUCED_MOTION.matches ? 1 : FOLLOW;
    lensX += (targetX - lensX) * follow;
    lensY += (targetY - lensY) * follow;

    set('x', lensX + (touch ? rect.left : 0));
    set('y', lensY + (touch ? rect.top : 0));
    set('w', rect.width);
    set('h', rect.height);
    set('px', lensX / rect.width, '');
    set('py', lensY / rect.height, '');

    if (active) schedule();
  };

  const schedule = (): void => {
    frame ||= requestAnimationFrame(step);
  };

  const track = (point: Point): void => {
    targetX = point.clientX - rect.left;
    targetY = point.clientY - rect.top;
  };

  const hide = (): void => {
    clearTimeout(hold);
    active = false;
    delete lens?.dataset.active;
  };

  const show = (point: Point): void => {
    rect = plate.getBoundingClientRect();
    track(point);
    if (!lens) {
      lens = Object.assign(document.createElement('div'), {
        className: 'loupe',
        ariaHidden: 'true',
        innerHTML: '<div class="loupe__view"></div><div class="loupe__sheen"></div>',
      });
      // On engage, never upfront: the heaviest asset the gallery pulls.
      set('image', `url("${source}")`, '');
      // A touch lens is drawn outside the plate's clip.
      (touch ? document.body : plate).append(lens);

      Object.assign(new Image(), {
        onload: () => lens?.setAttribute('data-ready', ''),
        src: source,
      });

      lensX = targetX;
      lensY = targetY;
    }
    active = true;
    lens.dataset.active = '';
    schedule();
  };

  if (!touch) {
    plate.addEventListener('pointerenter', show);
    plate.addEventListener('pointermove', track, { passive: true });
    plate.addEventListener('pointerleave', hide);
    return hide;
  }

  plate.dataset.lensTouch = '';
  plate.addEventListener(
    'touchstart',
    ({ touches }) => {
      hide();
      start = touches[0]!;
      if (!touches[1]) hold = window.setTimeout(show, HOLD, start);
    },
    { passive: true },
  );
  // Only a cancelable touchmove can refuse a pan; a handler property is non-passive.
  plate.ontouchmove = (event) => {
    const [point, second] = event.touches;
    if (active && event.cancelable && !second) {
      event.preventDefault();
      track(point!);
    } else if (
      active ||
      Math.hypot(point!.clientX - start.clientX, point!.clientY - start.clientY) > 8
    ) {
      hide();
    }
  };
  // A hold is a look: no menu, no click. CSS refuses the drag.
  const keep = (event: Event): void => {
    if (active) event.preventDefault();
  };
  plate.oncontextmenu = keep;
  plate.ontouchend = plate.ontouchcancel = (event) => {
    keep(event);
    hide();
  };

  return hide;
}

const dismiss = [...document.querySelectorAll<HTMLElement>('.plate[data-lens]')].map(attach);

// Content on hover or hold must be dismissible (1.4.13).
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') for (const hide of dismiss) hide();
});
