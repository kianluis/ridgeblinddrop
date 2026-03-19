// ═══════════════════════════════════════════════════════
// RIDGE MYSTERY DROP — store.js
// Warehouse cosmetics store: rendering, buy/equip, apply
// ═══════════════════════════════════════════════════════

// ── Color lookup tables ───────────────────────────────────

const WALL_THEMES = {
  'wall-blue':   'linear-gradient(180deg, #5a7090 0%, #406080 55%, #28405a 100%)',
  'wall-green':  'linear-gradient(180deg, #4a7048 0%, #346034 55%, #204820 100%)',
  'wall-gray':   'linear-gradient(180deg, #686870 0%, #505058 55%, #38383e 100%)',
  'wall-dark':   'linear-gradient(180deg, #1e1e2e 0%, #14141e 55%, #0a0a12 100%)',
  'wall-purple': 'linear-gradient(180deg, #5a3a7a 0%, #42286a 55%, #2a1648 100%)',
};

const CAT_COLORS = {
  'cat-gray':  { main: '#808090', shadow: '#606070' },
  'cat-black': { main: '#252530', shadow: '#111118' },
  'cat-cream': { main: '#d4b88a', shadow: '#b09060' },
  'cat-white': { main: '#e8e0d0', shadow: '#c0b898' },
};

const SHIRT_COLORS = {
  'shirt-blue':   { main: '#2255aa', shadow: '#1a3d80' },
  'shirt-green':  { main: '#226633', shadow: '#1a4d26' },
  'shirt-black':  { main: '#222233', shadow: '#111120' },
  'shirt-orange': { main: '#cc6622', shadow: '#a04a16' },
};

const STORE_CAT_LABELS = {
  wall:    'WALL COLOR',
  cat:     'CAT COLOR',
  shirt:   "SEAN'S SHIRT",
  props:   'PROPS',
  workers: 'WORKERS',
};

// ── Rendering ─────────────────────────────────────────────

function renderStore() {
  const el = document.getElementById('store-content');
  if (!el) return;

  const owned  = state.roomOwned  || [];
  const color  = state.roomColor  || {};
  let html = '';

  for (const cat of ['wall', 'cat', 'shirt', 'props', 'workers']) {
    const items = STORE_ITEMS.filter(i => i.cat === cat);
    html += `<div class="store-section">
      <div class="store-section-title">${STORE_CAT_LABELS[cat]}</div>
      <div class="store-grid">`;

    for (const item of items) {
      const isOwned    = owned.includes(item.id);
      const isColorCat = cat !== 'props' && cat !== 'workers';
      const isEquipped = isColorCat
        ? color[cat] === item.id
        : isOwned; // props/workers active as soon as owned

      const canAfford = state.credits >= item.cost;

      let btn;
      if (isEquipped && !isColorCat) {
        btn = `<button class="btn-store btn-store-equipped" disabled>ACTIVE</button>`;
      } else if (isEquipped) {
        btn = `<button class="btn-store btn-store-equipped" onclick="storeEquip('${item.id}')">EQUIPPED ✓</button>`;
      } else if (isOwned) {
        btn = `<button class="btn-store btn-store-equip" onclick="storeEquip('${item.id}')">EQUIP</button>`;
      } else {
        btn = `<button class="btn-store btn-store-buy${canAfford ? '' : ' cant-afford'}"
          ${canAfford ? '' : 'disabled'} onclick="storeBuy('${item.id}')">
          BUY · ${item.cost}cr</button>`;
      }

      html += `<div class="store-tile${isEquipped ? ' store-equipped' : ''}">
        <div class="store-tile-preview">${storePreview(item)}</div>
        <div class="store-tile-name">${item.name}</div>
        <div class="store-tile-desc">${item.desc}</div>
        ${btn}
      </div>`;
    }

    html += `</div></div>`;
  }

  el.innerHTML = html;
}

function storePreview(item) {
  if (item.cat === 'wall') {
    const grad = WALL_THEMES[item.id] || 'linear-gradient(180deg,#888,#444)';
    return `<div class="preview-swatch preview-wall" style="background:${grad}"></div>`;
  }
  if (item.cat === 'cat') {
    const c = CAT_COLORS[item.id] || { main: '#c87840', shadow: '#a05e28' };
    return `<div class="preview-swatch preview-cat" style="background:${c.main};box-shadow:inset -3px -3px 0 ${c.shadow}"></div>`;
  }
  if (item.cat === 'shirt') {
    const c = SHIRT_COLORS[item.id] || { main: '#cc2222', shadow: '#991818' };
    return `<div class="preview-swatch preview-shirt" style="background:${c.main};box-shadow:inset -3px -3px 0 ${c.shadow}"></div>`;
  }
  if (item.cat === 'props') {
    const icons = {
      'prop-succulent': '▲', 'prop-plant': '✿',
      'prop-painting': '▣',  'prop-desk': '▬', 'prop-chair': '⊓',
    };
    return `<div class="preview-icon">${icons[item.id] || '◆'}</div>`;
  }
  if (item.cat === 'workers') {
    const label = item.id === 'worker-daniel' ? 'D' : 'A';
    const col   = item.id === 'worker-daniel' ? '#2255aa' : '#226633';
    return `<div class="preview-icon preview-worker" style="background:${col}">${label}</div>`;
  }
  return '';
}

// ── Actions ───────────────────────────────────────────────

function storeBuy(itemId) {
  const item = STORE_ITEMS.find(i => i.id === itemId);
  if (!item || state.credits < item.cost) return;
  if (!state.roomOwned) state.roomOwned = [];
  if (!state.roomColor) state.roomColor = {};

  state.credits -= item.cost;
  state.roomOwned.push(itemId);

  // Auto-equip color swaps on first purchase
  const isColorCat = item.cat !== 'props' && item.cat !== 'workers';
  if (isColorCat) state.roomColor[item.cat] = itemId;

  saveState();
  applyCosmetics();
  renderStore();
  renderTopBar();
  playSound('order');
}

function storeEquip(itemId) {
  const item = STORE_ITEMS.find(i => i.id === itemId);
  if (!item) return;
  if (!state.roomColor) state.roomColor = {};

  // Toggle: clicking an already-equipped color resets to default
  if (state.roomColor[item.cat] === itemId) {
    delete state.roomColor[item.cat];
  } else {
    state.roomColor[item.cat] = itemId;
  }

  saveState();
  applyCosmetics();
  renderStore();
}

// ── Apply cosmetics to scene ──────────────────────────────

function applyCosmetics() {
  const scene = document.getElementById('warehouse-scene');
  if (!scene) return;

  const owned = state.roomOwned || [];
  const color = state.roomColor || {};

  // Wall theme
  Object.keys(WALL_THEMES).forEach(c => scene.classList.remove(c));
  if (color.wall) scene.classList.add(color.wall);

  // Cat color (CSS vars on #wh-cat)
  const cat = document.getElementById('wh-cat');
  if (cat) {
    const c = CAT_COLORS[color.cat] || { main: '#c87840', shadow: '#a05e28' };
    cat.style.setProperty('--cat-color',  c.main);
    cat.style.setProperty('--cat-shadow', c.shadow);
  }

  // Sean's shirt (CSS vars on #worker)
  const worker = document.getElementById('worker');
  if (worker) {
    const c = SHIRT_COLORS[color.shirt] || { main: '#cc2222', shadow: '#991818' };
    worker.style.setProperty('--shirt-color',  c.main);
    worker.style.setProperty('--shirt-shadow', c.shadow);
  }

  // Props — visible when owned
  ['prop-succulent', 'prop-plant', 'prop-painting', 'prop-desk', 'prop-chair'].forEach(id => {
    const el = document.getElementById('wh-' + id);
    if (el) el.style.display = owned.includes(id) ? '' : 'none';
  });

  // Workers — visible when owned
  ['worker-daniel', 'worker-austin'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = owned.includes(id) ? '' : 'none';
  });
}
