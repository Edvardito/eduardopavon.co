/* The one client script (DESIGN.md §7); it sets custom properties, global.css styles the lens. */

const TOUCH = !matchMedia('(hover: hover) and (pointer: fine)').matches;
const REDUCED_MOTION = matchMedia('(prefers-reduced-motion: reduce)');

const FOLLOW_LERP = 0.2;
const HOLD_MS = 300;

type Point = Pick<Touch, 'clientX' | 'clientY'>;

function attach(plate: HTMLElement): () => void {
  const source = plate.dataset.lens;
  if (!source) return () => {};

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

  const step = (): void => {
    frame = 0;
    if (!lens) return;
    rect = plate.getBoundingClientRect();

    const follow = TOUCH || REDUCED_MOTION.matches ? 1 : FOLLOW_LERP;
    lensX += (targetX - lensX) * follow;
    lensY += (targetY - lensY) * follow;

    set('x', lensX + (TOUCH ? rect.left : 0));
    set('y', lensY + (TOUCH ? rect.top : 0));
    set('w', rect.width);
    set('h', rect.height);
    set('px', lensX / rect.width, '');
    set('py', lensY / rect.height, '');

    if (active && !TOUCH) schedule();
  };

  const schedule = (): void => {
    frame ||= requestAnimationFrame(step);
  };

  const track = (point: Point): void => {
    targetX = point.clientX - rect.left;
    targetY = point.clientY - rect.top;
    schedule();
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
      (TOUCH ? document.body : plate).append(lens);

      Object.assign(new Image(), {
        onload: () => (lens!.dataset.ready = ''),
        src: source,
      });

      lensX = targetX;
      lensY = targetY;
    }
    active = true;
    lens.dataset.active = '';
    schedule();
  };

  if (!TOUCH) {
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
      if (!touches[1]) hold = window.setTimeout(show, HOLD_MS, start);
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
