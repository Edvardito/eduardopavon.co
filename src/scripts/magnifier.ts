/* The one client script (DESIGN.md §7); global.css styles its output. */

const REDUCED_MOTION = matchMedia('(prefers-reduced-motion: reduce)');

const FOLLOW_LERP = 0.2;
const HOLD_MS = 300;

let touch = false;

const use = (finger: boolean): void => {
  for (const hide of dismiss) hide();
  touch = finger;
  document.documentElement.dataset.input = touch ? 'touch' : 'cursor';
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

  const track = (point: MouseEvent): void => {
    targetX = point.clientX - rect.left;
    targetY = point.clientY - rect.top;
    schedule();
  };

  const hide = (): void => {
    clearTimeout(hold);
    active = false;
    delete lens?.dataset.active;
  };

  const show = (point: MouseEvent): void => {
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

  plate.onpointerenter = (event) => {
    if (event.pointerType != 'touch') {
      use(false);
      show(event);
    }
  };
  plate.onpointermove = track;
  plate.onpointerleave = () => touch || hide();

  plate.onpointerdown = (event) => {
    if (event.pointerType == 'touch') {
      use(true);
      if (event.isPrimary) hold = window.setTimeout(show, HOLD_MS, event);
    }
  };
  // Only a cancelable touchmove refuses a pan; a handler property is non-passive.
  plate.ontouchmove = (event) => {
    if (active && event.cancelable && !event.touches[1]) event.preventDefault();
  };
  // Lifted, or the browser took it for a pan or pinch.
  plate.onpointercancel = plate.ontouchend = hide;

  return hide;
}

const dismiss = [...document.querySelectorAll<HTMLElement>('.plate[data-lens]')].map(attach);

// Now the page is scripted, the strip may move.
use(false);

// Dismissible hover and hold content (1.4.13).
document.onkeydown = (event) => {
  if (event.key === 'Escape') use(touch);
};

// A held finger looks or pauses: no menu, no click; touch :active comes late.
let pressed = 0;
const press = (event: Event): void => {
  const on = (event.target as Element).closest('.plate, .plate-strip');
  const start = event.type == 'touchstart';
  if (start) pressed = event.timeStamp;
  else if (on?.hasAttribute('data-held') && event.timeStamp - pressed > HOLD_MS)
    event.preventDefault();
  if (event.type != 'contextmenu') on?.toggleAttribute('data-held', start);
};
document.addEventListener('touchstart', press, { passive: true });
document.oncontextmenu = document.ontouchend = document.ontouchcancel = press;
