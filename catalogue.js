/* Catalogue + saved picks.

   Picks live in localStorage, so there's no account and no server: they stay
   in this browser on this device. Clearing site data loses them, which is why
   the enquiry step copies the list out as text rather than relying on it. */

const DESIGNS = [
  { id:'crimson', price:1450,    name:'Sacred Heart',    img:'images/crimson.jpg',
    shape:'Almond', length:'Long',
    note:'Oxblood and silver chrome, with a sculpted heart and a little cross.' },

  { id:'strawberry', price:1100, name:'Strawberry Milk', img:'images/strawberry.jpg',
    shape:'Almond', length:'Short',
    note:'Milky pink, tiny strawberries, gingham tips and a 3D bow.' },

  { id:'tidepool', price:1250,   name:'Tidepool',        img:'images/tidepool.jpg',
    shape:'Almond', length:'Medium',
    note:'Pearl chrome over rockpool black, with a hand-sculpted starfish.' },

  { id:'moonlight', price:950,  name:'Moonlit',         img:'images/moonlight.jpg',
    shape:'Almond', length:'Short',
    note:'Sheer nude with a silver crescent curling around each tip.' },

  { id:'graphite', price:1050,   name:'Graphite',        img:'images/graphite.jpg',
    shape:'Almond', length:'Medium',
    note:'Smoked grey with a liquid chrome rim. Quiet until it catches light.' },

  { id:'tortoise', price:1550,   name:'Tortoiseshell',   img:'images/tortoise.jpg',
    shape:'Stiletto', length:'Long',
    note:'Amber and gold marbling with a sculpted flower and beaded band.' },

  { id:'starlet', price:1200,    name:'Starlet',         img:'images/starlet.jpg',
    shape:'Almond', length:'Medium',
    note:'Deep cherry, cow print and raised stars. Loud on purpose.' },

  { id:'selene', price:1600,     name:'Selene',          img:'images/selene.jpg',
    shape:'Almond', length:'Long',
    note:'Lilac chrome with suns, moons and domed silver studs.' }
];

const STORAGE_KEY = 'pip-saved-v1';
const CURRENCY = '₹';   // change this and the price values if she prices in another currency
const INSTAGRAM = 'https://ig.me/m/pip._.nails';  // opens a DM; use instagram.com/pip._.nails for the profile instead

const money = n => CURRENCY + n.toLocaleString('en-IN');

let filters = { length: 'all', shape: 'all' };

const grid       = document.querySelector('[data-grid]');
const filterBar  = document.querySelector('[data-filters]');
const resultEl   = document.querySelector('[data-result-count]');
const totalEl    = document.querySelector('[data-total]');
const countEl    = document.querySelector('[data-count]');
const drawer     = document.querySelector('[data-drawer]');
const scrim      = document.querySelector('[data-scrim]');
const drawerBody = document.querySelector('[data-drawer-body]');
const drawerFoot = document.querySelector('[data-drawer-foot]');
const openBtn    = document.querySelector('[data-open-drawer]');
const toastEl    = document.querySelector('[data-toast]');

/* ── storage ───────────────────────────────────────────────
   Every read and write is guarded: private browsing and a full
   quota both throw, and neither should take the page down. */
function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const ids = raw ? JSON.parse(raw) : [];
    // drop anything that no longer exists in the catalogue
    return Array.isArray(ids) ? ids.filter(id => DESIGNS.some(d => d.id === id)) : [];
  } catch {
    return [];
  }
}

function persist(ids) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    return true;
  } catch {
    return false;
  }
}

let saved = loadSaved();
let warnedAboutStorage = false;

/* ── toast ─────────────────────────────────────────────── */
let toastTimer;
function toast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
}

/* ── cards ─────────────────────────────────────────────── */
const heartSVG =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-9.3A4 4 0 0 1 12 8a4 4 0 0 1 7 2.7C19 15.6 12 20 12 20Z"/></svg>';

function visibleDesigns() {
  return DESIGNS.filter(d =>
    (filters.length === 'all' || d.length === filters.length) &&
    (filters.shape  === 'all' || d.shape  === filters.shape));
}

function buildGrid() {
  const shown = visibleDesigns();

  resultEl.textContent = shown.length === DESIGNS.length
    ? `${DESIGNS.length} sets`
    : `${shown.length} of ${DESIGNS.length} sets`;

  if (!shown.length) {
    grid.innerHTML = '<li class="no-match">No sets match that combination yet.</li>';
    return;
  }

  grid.innerHTML = '';
  shown.forEach(design => {
    const li = document.createElement('li');
    li.className = 'card';
    li.innerHTML = `
      <div class="polaroid">
        <div class="shot-wrap">
          <img class="shot" src="${design.img}" alt="${design.name}: ${design.note}" loading="lazy">
          <span class="tag">${money(design.price)}</span>
        </div>
        <div class="lip">
          <span class="setname">${design.name}</span>
          <button class="heart" data-id="${design.id}" aria-pressed="false"
                  aria-label="Save ${design.name}">${heartSVG}</button>
        </div>
      </div>
      <p class="detail"><strong>${design.shape} · ${design.length}</strong>${design.note}</p>`;
    grid.appendChild(li);
  });
}

/* chips: one active value per group, "all" clears that group */
filterBar.addEventListener('click', e => {
  const chip = e.target.closest('.chip');
  if (!chip) return;

  const group = chip.closest('.filter-group').dataset.group;
  filters[group] = chip.dataset.value;

  chip.closest('.filter-group').querySelectorAll('.chip').forEach(c =>
    c.setAttribute('aria-pressed', String(c === chip)));

  buildGrid();
  syncHearts();
});

function syncHearts() {
  document.querySelectorAll('.heart').forEach(btn => {
    const on = saved.includes(btn.dataset.id);
    btn.setAttribute('aria-pressed', String(on));
    const design = DESIGNS.find(d => d.id === btn.dataset.id);
    btn.setAttribute('aria-label', `${on ? 'Remove' : 'Save'} ${design.name}`);
  });
  countEl.textContent = String(saved.length);
}

function toggle(id) {
  saved = saved.includes(id) ? saved.filter(x => x !== id) : [...saved, id];

  if (!persist(saved) && !warnedAboutStorage) {
    warnedAboutStorage = true;
    toast("Your picks won't survive a refresh in this browser");
  }
  syncHearts();
  if (!drawer.hidden) renderDrawer();
}

grid.addEventListener('click', e => {
  const btn = e.target.closest('.heart');
  if (btn) toggle(btn.dataset.id);
});

/* ── drawer ────────────────────────────────────────────── */
function renderDrawer() {
  const picks = saved.map(id => DESIGNS.find(d => d.id === id));

  if (!picks.length) {
    drawerBody.innerHTML =
      '<p class="empty">Nothing saved yet.<br>Tap the heart on any set you like.</p>';
    drawerFoot.hidden = true;
    return;
  }

  drawerBody.innerHTML = picks.map(d => `
    <div class="saved-row">
      <img src="${d.img}" alt="">
      <div class="meta">
        <b>${d.name}</b>
        <span>${d.shape} · ${d.length}</span>
      </div>
      <span class="price">${money(d.price)}</span>
      <button class="icon-btn" data-remove="${d.id}" aria-label="Remove ${d.name}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
    </div>`).join('');
  totalEl.textContent = money(picks.reduce((sum, d) => sum + d.price, 0));
  drawerFoot.hidden = false;
}

function openDrawer() {
  renderDrawer();
  drawer.hidden = false;
  scrim.hidden = false;
  openBtn.setAttribute('aria-expanded', 'true');
  drawer.querySelector('[data-close-drawer]').focus();
}

function closeDrawer() {
  drawer.hidden = true;
  scrim.hidden = true;
  openBtn.setAttribute('aria-expanded', 'false');
  openBtn.focus();
}

openBtn.addEventListener('click', openDrawer);
scrim.addEventListener('click', closeDrawer);
document.querySelector('[data-close-drawer]').addEventListener('click', closeDrawer);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !drawer.hidden) closeDrawer();
});

drawerBody.addEventListener('click', e => {
  const btn = e.target.closest('[data-remove]');
  if (btn) toggle(btn.dataset.remove);
});

document.querySelector('[data-clear]').addEventListener('click', () => {
  saved = [];
  persist(saved);
  syncHearts();
  renderDrawer();
});

/* ── enquiry ───────────────────────────────────────────── */
/* Copy, then open her DMs.

   Order matters: the window must be opened in the same synchronous turn as the
   click, or the browser has already ended the user-activation window and blocks
   it as a popup. So we fire the clipboard write without awaiting it, open
   straight away, and report the copy result when the promise settles. */
function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  // fallback for http:// and older browsers
  return new Promise((resolve, reject) => {
    const scratch = document.createElement('textarea');
    scratch.value = text;
    scratch.setAttribute('readonly', '');
    scratch.style.cssText = 'position:fixed;top:-1000px;opacity:0';
    document.body.appendChild(scratch);
    scratch.select();
    const ok = document.execCommand('copy');
    scratch.remove();
    ok ? resolve() : reject(new Error('copy refused'));
  });
}

document.querySelector('[data-enquire]').addEventListener('click', () => {
  const names = saved.map(id => DESIGNS.find(d => d.id === id))
                     .map(d => `\u2022 ${d.name} \u2014 ${d.shape}, ${d.length} \u2014 ${money(d.price)}`)
                     .join('\n');
  const message = `Hi! I'd love to ask about these sets:\n${names}`;

  const copying = copyText(message);          // started, deliberately not awaited
  window.open(INSTAGRAM, '_blank', 'noopener'); // same turn as the click

  copying
    .then(() => toast('List copied \u2014 paste it into the message'))
    .catch(() => toast('Copy did not work here, so note the names down'));
});

/* ── go ────────────────────────────────────────────────── */
buildGrid();
syncHearts();
