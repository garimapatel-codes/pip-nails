/* Hero carousel — nail sets orbit a centre point, one in front.
   Content lives here so the artist's sets stay in one editable place. */

const SETS = [
  {
    name: 'Tidepool',
    bg: '#fbf2ce',            // pale lemon
    word: '#cba95a',
    accent: '#3e5f70',
    blurb: 'Pearl chrome over rockpool black, with a hand-sculpted starfish.',
    spec: '10 nails · almond · medium'
  },
  {
    name: 'Spectre',
    bg: '#f2de9a',            // deeper butter, so the cream nails keep their edge
    word: '#bd9a42',
    accent: '#3a332a',
    blurb: 'Bone cream and hand-inked spirals. A very small ghost lives on the thumb.',
    spec: '10 nails · almond · medium'
  },
  {
    name: 'Selene',
    bg: '#f8efc2',            // primrose
    word: '#c6ab55',
    accent: '#6e5a90',
    blurb: 'Lilac chrome, domed studs, and a moon that catches the light as you move.',
    spec: '10 nails · almond · long'
  }
];

const AUTOPLAY_MS = 6500;
const SWIPE_PX = 45;

const stage   = document.querySelector('[data-stage]');
const slides  = [...document.querySelectorAll('[data-slide]')];
const dotsBox = document.querySelector('[data-dots]');
const nameEl  = document.querySelector('[data-setname]');
const blurbEl = document.querySelector('[data-blurb]');
const specEl  = document.querySelector('[data-spec]');

const calmed = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let index = 0;
let timer = null;

/* dots */
const dots = SETS.map((set, i) => {
  const b = document.createElement('button');
  b.className = 'dot-btn';
  b.type = 'button';
  b.setAttribute('role', 'tab');
  b.setAttribute('aria-label', set.name);
  b.addEventListener('click', () => { go(i); restart(); });
  dotsBox.appendChild(b);
  return b;
});

/* Position each slide relative to the front one, wrapping both ways.

   With three slides filling three positions, every step forces one slide to
   wrap from the far left to the far right (or back). Animating that makes it
   streak across the stage. So when a slide wraps, we cut its transition for a
   single frame and let it jump — it's dim and blurred at the back, so the
   jump is invisible while the streak was not. */
function place() {
  const n = slides.length;
  slides.forEach((slide, i) => {
    let offset = i - index;
    if (offset >  Math.floor(n / 2)) offset -= n;
    if (offset < -Math.floor(n / 2)) offset += n;

    const previous = slide.dataset.pos === undefined ? offset : Number(slide.dataset.pos);
    const wrapped = Math.abs(offset - previous) > 1;

    if (wrapped) {
      slide.classList.add('no-anim');
      slide.dataset.pos = String(offset);
      void slide.offsetWidth;          // force the jump to land before animating again
      slide.classList.remove('no-anim');
    } else {
      slide.dataset.pos = String(offset);
    }

    slide.setAttribute('aria-hidden', offset === 0 ? 'false' : 'true');
  });
}

/* swap the text with a short fade so it doesn't snap */
function swapText(set) {
  const parts = [nameEl, blurbEl, specEl];
  parts.forEach(el => el.classList.add('is-out'));

  window.setTimeout(() => {
    nameEl.textContent  = set.name;
    blurbEl.textContent = set.blurb;
    specEl.textContent  = set.spec;
    parts.forEach(el => el.classList.remove('is-out'));
  }, calmed ? 0 : 480);
}

function go(next) {
  index = (next + SETS.length) % SETS.length;
  const set = SETS[index];

  const root = document.documentElement.style;
  root.setProperty('--bg', set.bg);
  root.setProperty('--word', set.word);
  root.setProperty('--accent', set.accent);
  root.setProperty('--accent-dim', set.accent + '29');

  place();
  swapText(set);
  dots.forEach((d, i) => d.setAttribute('aria-selected', String(i === index)));
}

const next = () => go(index + 1);
const prev = () => go(index - 1);

/* autoplay — off entirely for anyone who asked for less motion */
function start() {
  if (calmed) return;
  timer = window.setInterval(next, AUTOPLAY_MS);
}
function stop() {
  window.clearInterval(timer);
  timer = null;
}
function restart() { stop(); start(); }

/* controls */
document.querySelector('[data-next]').addEventListener('click', () => { next(); restart(); });
document.querySelector('[data-prev]').addEventListener('click', () => { prev(); restart(); });

stage.addEventListener('mouseenter', stop);
stage.addEventListener('mouseleave', start);
stage.addEventListener('focusin', stop);
stage.addEventListener('focusout', start);

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') { next(); restart(); }
  if (e.key === 'ArrowLeft')  { prev(); restart(); }
});

/* swipe */
let startX = null;
stage.addEventListener('pointerdown', e => { startX = e.clientX; stop(); });
stage.addEventListener('pointerup', e => {
  if (startX === null) return;
  const moved = e.clientX - startX;
  if (Math.abs(moved) > SWIPE_PX) (moved < 0 ? next : prev)();
  startX = null;
  start();
});
stage.addEventListener('pointercancel', () => { startX = null; start(); });

/* pause when the tab is hidden, so it isn't spinning to nobody */
document.addEventListener('visibilitychange', () => {
  document.hidden ? stop() : start();
});

go(0);
start();
