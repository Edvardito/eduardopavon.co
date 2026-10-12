/* The one client script (DESIGN.md §7); global.css styles its output. */

const REDUCED_MOTION = matchMedia('(prefers-reduced-motion: reduce)');

const FOLLOW_LERP = 0.2;
const HOLD_MS = 300;

type Point = Touch | MouseEvent;

// The input in use picks the lens, never the device.
let touch = false;

const use = (finger: boolean): void => {
  for (const hide of dismiss) hide();
  document.documentElement.toggleAttribute('data-lens-touch', (touch = finger));
};

function attach(plate: HTMLElement): () => void {
  const source = plate.dataset.lens!;
  let lens: HTMLDivElement | undefined;
  let rect = new DOMRect();
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
    rect = plate.getBoundingClientRect();

    const follow = touch || REDUCED_MOTION.matches ? 1 : FOLLOW_LERP;
    lensX += (targetX - lensX) * follow;
    lensY += (targetY - lensY) * follow;

    set('x', lensX + (touch ? rect.left : 0));
    set('y', lensY + (touch ? rect.top : 0));
    set('w', rect.width);
    set('h', rect.height);
    set('px', lensX / rect.width, '');
    set('py', lensY / rect.height, '');

    if (active && !touch) schedule();
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
      // On engage, never upfront: the gallery's heaviest asset.
      set('image', `url("${source}")`, '');
      Object.assign(new Image(), {
        onload: () => (lens!.dataset.ready = ''),
        src: source,
      });
    }
    // A touch lens sits outside the plate's clip.
    const parent = touch ? document.body : plate;
    if (lens.parentNode != parent) {
      parent.append(lens);
      lensX = targetX;
      lensY = targetY;
    }
    active = true;
    lens.dataset.active = '';
    schedule();
  };

  // A mouse or pen hovers; a finger holds.
  plate.onpointerenter = (event) => {
    if (event.pointerType != 'touch') {
      use(false);
      show(event);
    }
  };
  plate.onpointermove = track;
  plate.onpointerleave = () => touch || hide();

  plate.addEventListener(
    'touchstart',
    ({ touches }) => {
      use(true);
      if (!touches[1]) hold = window.setTimeout(show, HOLD_MS, touches[0]);
    },
    { passive: true },
  );
  // Only a cancelable touchmove refuses a pan; a handler property is non-passive.
  plate.ontouchmove = (event) => {
    if (active && event.cancelable && !event.touches[1]) event.preventDefault();
  };
  // The browser took it for a pan or pinch.
  plate.onpointercancel = hide;
  // A hold is a look: no menu, no click. CSS refuses the drag.
  plate.oncontextmenu = plate.ontouchend = (event: Event) => {
    if (active && touch) event.preventDefault();
    if (event.type == 'touchend') hide();
  };

  return hide;
}

const dismiss = [...document.querySelectorAll<HTMLElement>('.plate[data-lens]')].map(attach);

// Hover and hold content is dismissible (1.4.13).
document.onkeydown = (event) => {
  if (event.key === 'Escape') use(touch);
};

// Touch :active is late or never, so a held strip is marked.
const press = ({ target, touches }: TouchEvent): void => {
  (target as Element).closest('.plate-strip')?.toggleAttribute('data-held', !!touches[0]);
};
document.addEventListener('touchstart', press, { passive: true });
document.ontouchend = press;
