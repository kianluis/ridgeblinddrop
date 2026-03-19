// ═══════════════════════════════════════════════════════
// RIDGE MYSTERY DROP — store.js
// Warehouse cosmetics store: rendering, buy/equip, apply
// ═══════════════════════════════════════════════════════

// ── Color lookup tables ───────────────────────────────────

const WALL_THEMES = {
  'wall-gunmetal': 'linear-gradient(180deg, #6a6a72 0%, #4e4e58 55%, #36363e 100%)',
  'wall-navy':     'linear-gradient(180deg, #2a4878 0%, #1a3460 55%, #0e2042 100%)',
  'wall-olive':    'linear-gradient(180deg, #586432 0%, #424c24 55%, #2c3418 100%)',
  'wall-orange':   'linear-gradient(180deg, #c05a22 0%, #9a4014 55%, #6a2808 100%)',
  'wall-lime':        'linear-gradient(180deg, #8ec018 0%, #6a9a0e 55%, #486c06 100%)',
  'wall-iridescent':  'linear-gradient(180deg, #7a3a9a 0%, #5a2882 55%, #3a186a 100%)',
};

const CAT_COLORS = {
  'cat-orange': { main: '#d46a0a', shadow: '#a84808' },
  'cat-white':  { main: '#e8e0d0', shadow: '#c0b898' },
  'cat-black':  { main: '#252530', shadow: '#111118' },
  'cat-tabby':  {
    main: '#909090', shadow: '#606060',
    bodyBg: 'repeating-linear-gradient(0deg,#909090 0px,#909090 3px,#383838 3px,#383838 5px)',
    headBg: 'repeating-linear-gradient(0deg,#909090 0px,#909090 3px,#383838 3px,#383838 5px)',
  },
  'cat-calico': {
    main: '#e8d8c0', shadow: '#c0a878',
    bodyBg: 'linear-gradient(90deg,#e8d8c0 0%,#e8d8c0 36%,#c85820 36%,#c85820 64%,#1e1e28 64%,#1e1e28 100%)',
    headBg: 'linear-gradient(90deg,#1e1e28 0%,#1e1e28 28%,#e8d8c0 28%,#e8d8c0 100%)',
  },
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
      'prop-storage': '▤', 'prop-window': '▢',
      'prop-clock': '⊙', 'prop-board': '⊞',
    };
    return `<div class="preview-icon">${icons[item.id] || '◆'}</div>`;
  }
  if (item.cat === 'workers') {
    const label = item.id === 'worker-daniel' ? 'D' : 'A';
    const col   = item.id === 'worker-daniel' ? '#7a28b8' : '#c8a818';
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

  // Wall theme — clear inline style first so CSS class can win over updateDayNight()
  Object.keys(WALL_THEMES).forEach(c => scene.classList.remove(c));
  if (color.wall) {
    scene.style.background = ''; // let the CSS class take over
    scene.classList.add(color.wall);
  } else {
    updateDayNight(); // restore time-based gradient when no theme equipped
  }

  // Cat color (CSS vars on #wh-cat)
  const cat = document.getElementById('wh-cat');
  if (cat) {
    const c = CAT_COLORS[color.cat] || { main: '#c87840', shadow: '#a05e28' };
    cat.style.setProperty('--cat-color',  c.main);
    cat.style.setProperty('--cat-shadow', c.shadow);
    if (c.bodyBg) {
      cat.style.setProperty('--cat-body-bg', c.bodyBg);
      cat.style.setProperty('--cat-head-bg', c.headBg || c.bodyBg);
    } else {
      cat.style.removeProperty('--cat-body-bg');
      cat.style.removeProperty('--cat-head-bg');
    }
  }

  // Sean's shirt (CSS vars on #worker)
  const worker = document.getElementById('worker');
  if (worker) {
    const c = SHIRT_COLORS[color.shirt] || { main: '#cc2222', shadow: '#991818' };
    worker.style.setProperty('--shirt-color',  c.main);
    worker.style.setProperty('--shirt-shadow', c.shadow);
  }

  // Props — visible when owned
  ['prop-succulent', 'prop-plant', 'prop-painting', 'prop-desk', 'prop-chair', 'prop-storage', 'prop-window', 'prop-clock', 'prop-board'].forEach(id => {
    const el = document.getElementById('wh-' + id);
    if (el) el.style.display = owned.includes(id) ? '' : 'none';
  });

  // Tidy storage — hide scattered floor boxes when owned
  const tidyOwned = owned.includes('prop-storage');
  document.querySelectorAll('#warehouse-scene .floor-box').forEach(el => {
    el.style.display = tidyOwned ? 'none' : '';
  });

  // Workers — visible when owned
  ['worker-daniel', 'worker-austin'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = owned.includes(id) ? '' : 'none';
  });
}
