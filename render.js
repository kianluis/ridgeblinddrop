// ═══════════════════════════════════════════════════════
// RIDGE MYSTERY DROP — render.js
// All UI rendering functions
// ═══════════════════════════════════════════════════════

let _lastRenderedCredits = null;

// ── Item icon helper ──────────────────────────────────────
// Returns an <img> when item.img is set, otherwise a fallback <div>.

function _itemIconEl(item, px) {
  if (item.img) {
    const img = document.createElement('img');
    img.src = item.img;
    img.alt = item.name.replace('\n', ' ');
    img.style.cssText = `width:${px}px;height:${px}px;object-fit:contain;border-radius:4px;`;
    return img;
  }
  const el = document.createElement('div');
  el.className = item.icon || '';
  el.style.cssText = `width:${px}px;height:${px}px;`;
  return el;
}

// ── Top Bar ──────────────────────────────────────────────

function renderTopBar() {
  const creditsEl = document.getElementById('hud-credits');
  const newVal = state.credits;
  if (_lastRenderedCredits !== null && newVal > _lastRenderedCredits) {
    creditsEl.classList.remove('credits-bump');
    void creditsEl.offsetWidth; // force reflow so animation replays
    creditsEl.classList.add('credits-bump');
  }
  _lastRenderedCredits = newVal;

  creditsEl.textContent = newVal;
  document.getElementById('hud-opened').textContent     = state.packagesOpened;
  document.getElementById('hud-collection').textContent = uniqueCount() + '/' + getTotalItems();

  const carrier = getCurrentCarrier();
  document.getElementById('stat-credits').textContent = state.credits;
  document.getElementById('stat-opened').textContent  = state.packagesOpened;
  document.getElementById('stat-unique').textContent  = uniqueCount() + '/' + getTotalItems();
  document.getElementById('stat-carrier').textContent = carrier.name;
  document.getElementById('stat-speed').textContent   = carrier.mult + 'x';

  // Prestige row
  if (state.prestigeCount > 0) {
    document.getElementById('prestige-stat-row').style.display = '';
    document.getElementById('stat-prestige').textContent = '✦' + state.prestigeCount +
      ' (+' + Math.round(state.prestigeRareBonus * 100) + '% rare)';
  } else {
    document.getElementById('prestige-stat-row').style.display = 'none';
  }

  // Mute button icon
  const muteBtn = document.getElementById('mute-btn');
  if (muteBtn) muteBtn.textContent = state.soundEnabled ? '🔊' : '🔇';
}

// ── Inline Order Panel ────────────────────────────────────

const TIER_ICONS    = { standard:'📦', express:'🚚', priority:'✈️', overnight:'🚀' };
const CARRIER_ICONS = { budget:'📦', ridgepost:'🚚', express:'✈️', sonic:'🚀' };

function renderOrderPanel() {
  // Tier cards
  const cardsEl = document.getElementById('inline-tier-cards');
  if (!cardsEl) return;
  cardsEl.innerHTML = '';
  PACKAGE_TIERS.forEach(tier => {
    const shipTime  = getShipTime(tier);
    const canAfford = state.credits >= tier.cost;
    const carrier   = getCurrentCarrier();
    const div = document.createElement('div');
    div.className = 'tier-card ' + tier.cls + (canAfford ? '' : ' cant-afford');
    div.innerHTML = `
      <div class="tier-card-name">${tier.name.toUpperCase()}</div>
      <div class="tier-card-icon">${TIER_ICONS[tier.id] || '📦'}</div>
      <div class="tier-card-time">○ ${formatTime(shipTime)}<br>via ${carrier.name}</div>
      ${tier.rareboost > 0
        ? `<div class="tier-card-boost badge-${tier.id === 'express' ? 'uncommon' : tier.id === 'priority' ? 'rare' : 'ultra'}">
             +${Math.round(tier.rareboost * 100)}% RARE BOOST
           </div>`
        : `<div class="tier-card-boost badge-common">STANDARD RATES</div>`
      }
      <button class="btn-order-card" ${canAfford ? '' : 'disabled'} onclick="placeOrder('${tier.id}')">
        ORDER
      </button>
    `;
    cardsEl.appendChild(div);
  });

  // Carrier tiles
  const shopEl = document.getElementById('inline-carrier-shop');
  if (!shopEl) return;
  shopEl.innerHTML = '';
  CARRIERS.forEach(carrier => {
    const owned     = state.carriersOwned.includes(carrier.id);
    const isActive  = state.carrier === carrier.id;
    const canAfford = state.credits >= carrier.cost;
    const div = document.createElement('div');
    div.className = 'carrier-tile' + (isActive ? ' active' : '') + (!canAfford && !owned ? ' cant-afford' : '');
    if (!isActive) {
      if (owned)            div.onclick = () => activateCarrier(carrier.id);
      else if (canAfford)   div.onclick = () => buyCarrier(carrier.id);
    }
    div.innerHTML = `
      ${isActive ? '<span class="carrier-active-badge">ACTIVE</span>' : ''}
      <div class="carrier-tile-icon">${CARRIER_ICONS[carrier.id] || '📦'}</div>
      <div class="carrier-speed">${carrier.mult}×</div>
      ${!isActive && !owned ? `<div class="carrier-price-tag">${carrier.cost} cr</div>` : ''}
      ${owned && !isActive  ? `<div class="carrier-price-tag use-tag">USE</div>` : ''}
    `;
    shopEl.appendChild(div);
  });
}

// ── Order Queue (center panel) ────────────────────────────

function renderOrderQueue() {
  const el = document.getElementById('order-queue');
  const countEl = document.getElementById('transit-count');
  if (state.orders.length === 0) {
    el.innerHTML = '<div class="no-orders">No packages in transit.<br><br>Hit PLACE ORDER to begin!</div>';
    if (countEl) countEl.textContent = '';
    return;
  }
  if (countEl) countEl.textContent = state.orders.length + ' pkg' + (state.orders.length > 1 ? 's' : '');
  el.innerHTML = '';
  const now = Date.now();
  const carrier = getCurrentCarrier();

  state.orders.forEach(order => {
    const tier     = PACKAGE_TIERS.find(t => t.id === order.tier);
    const elapsed  = (now - order.startTime) / 1000;
    const pct      = order.ready ? 100 : Math.min(100, (elapsed / order.duration) * 100);
    const remaining = order.ready ? 0 : Math.max(0, order.duration - elapsed);
    const div = document.createElement('div');
    div.className = 'order-card tier-' + order.tier + (order.ready ? ' ready' : '');
    div.innerHTML = `
      <div class="order-card-top">
        <span class="order-tier-badge ${tier.cls}">${tier.name.toUpperCase()}</span>
        <span class="order-carrier-name">via ${carrier.name}</span>
      </div>
      <div class="order-progress-bar">
        <div class="order-progress-fill" style="width:${pct}%"></div>
      </div>
      ${order.ready
        ? `<div class="order-ready-label">► READY TO OPEN ◄</div>
           <button class="btn-open" onclick="openPackage(${order.id})">OPEN PACKAGE</button>`
        : `<div class="order-timer">Arriving in ${formatTime(remaining)}</div>`
      }
    `;
    el.appendChild(div);
  });
}

// ── Pull History ──────────────────────────────────────────

function renderPullHistory() {
  const el = document.getElementById('pull-history');
  el.innerHTML = '';
  const recent = state.pullHistory.slice(-8).reverse();
  for (let i = 0; i < 8; i++) {
    const div = document.createElement('div');
    if (i < recent.length) {
      const entry = recent[i];
      div.className = 'pull-entry pull-entry--clickable rarity-' + entry.rarity;
      div.onclick = () => showItemDetail(entry.id);
      div.innerHTML = `
        <div class="pull-name pull-name--link">${entry.name.replace('\n', ' ')}</div>
        <div class="pull-rarity-label">(${rarityLabel(entry.rarity).charAt(0) + rarityLabel(entry.rarity).slice(1).toLowerCase()})</div>`;
    } else {
      div.className = 'pull-entry pull-entry--empty';
    }
    el.appendChild(div);
  }
}

// ── Collector's Booklet ───────────────────────────────────

function renderBooklet() {
  const el = document.getElementById('booklet-content');
  const uniqueC = uniqueCount();
  const total   = getTotalItems();
  const pct     = total > 0 ? Math.round((uniqueC / total) * 100) : 0;

  document.getElementById('booklet-pct').textContent            = pct + '%';
  document.getElementById('booklet-progress-fill').style.width  = pct + '%';

  // Update active filter button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    const f = btn.getAttribute('onclick').match(/'([^']+)'/)[1];
    btn.classList.toggle('active', f === state.bookletFilter);
  });

  el.innerHTML = '';
  const rarities = ['common', 'uncommon', 'rare', 'ultra'];
  const labels   = { common:'COMMON', uncommon:'UNCOMMON', rare:'RARE', ultra:'ULTRA RARE' };
  const filter   = state.bookletFilter;

  rarities.forEach(rarity => {
    if (filter !== 'all' && filter !== rarity) return;
    const items = COLLECTIBLES.filter(c => c.rarity === rarity);

    const title = document.createElement('div');
    title.className = 'booklet-section-title';
    title.style.color = rarityColor(rarity);
    const collected = items.filter(i => state.collection[i.id] > 0).length;
    title.innerHTML = `▸ ${labels[rarity]} <span style="color:var(--text-dim);font-size:5px">${collected}/${items.length}</span>`;
    el.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'booklet-grid';

    items.forEach(item => {
      const count     = state.collection[item.id] || 0;
      const collected = count > 0;
      const isNewly   = item.id === state.lastNewItemId;

      const card = document.createElement('div');
      card.className = 'booklet-card rarity-' + rarity + ' ' +
        (collected ? 'collected' : 'uncollected') +
        (isNewly   ? ' newly-collected' : '');

      const iconWrap = document.createElement('div');
      iconWrap.className = 'item-icon';
      iconWrap.appendChild(_itemIconEl(item, 32));

      card.appendChild(iconWrap);
      card.innerHTML += `
        <div class="item-name">${collected ? item.name.replace('\n', '<br>') : '???'}</div>
        <span class="rarity-badge ${badgeClass(rarity)}">${labels[rarity]}</span>
        ${collected ? `<div class="pull-count">×${count}</div>` : ''}
      `;
      // Re-insert icon (innerHTML clobbers it)
      card.insertBefore(iconWrap, card.firstChild);

      grid.appendChild(card);
    });

    el.appendChild(grid);
  });

  // Prestige area
  renderPrestigeArea();
}

// ── Prestige Area ─────────────────────────────────────────

function renderPrestigeArea() {
  const area = document.getElementById('prestige-area');
  if (!area) return;
  const complete = uniqueCount() >= getTotalItems();
  area.style.display = complete ? '' : 'none';
  if (!complete) return;

  const info = document.getElementById('prestige-info');
  if (state.prestigeCount > 0) {
    info.textContent = `Prestige ✦${state.prestigeCount} active — +${Math.round(state.prestigeRareBonus * 100)}% rare rate bonus`;
  } else {
    info.textContent = '';
  }
}

// ── Milestones ───────────────────────────────────────────

function renderMilestones() {
  const el = document.getElementById('milestones-list');
  el.innerHTML = '';
  MILESTONES.forEach(ms => {
    const done    = state.milestonesCompleted.includes(ms.id);
    const pending = !done && state.milestonesToClaim.includes(ms.id);
    const div = document.createElement('div');
    div.className = 'milestone-card' + (done ? ' done' : '') + (pending ? ' claimable' : '');
    div.innerHTML = `
      <div class="ms-trophy-icon trophy-slot ${done ? 'trophy-' + ms.trophy : pending ? 'trophy-pending' : 'trophy-empty'}">
        <div class="trophy-r">R</div>
        <div class="trophy-stand"></div>
      </div>
      <div class="ms-info">
        <div class="ms-name">${ms.name}</div>
        <div class="ms-desc">${ms.desc}</div>
      </div>
      <div class="ms-right">
        <div class="ms-reward">+${ms.reward} cr</div>
        ${pending
          ? `<button class="btn-claim-milestone" onclick="claimMilestone('${ms.id}')">CLAIM</button>`
          : `<div class="ms-status">${done ? '✓ DONE' : 'PENDING'}</div>`
        }
      </div>
    `;
    el.appendChild(div);
  });
}

function updateMissionsTabBadge() {
  const badge = document.getElementById('missions-tab-badge');
  if (badge) badge.style.display = (state.milestonesToClaim || []).length > 0 ? '' : 'none';
}

// ── Day / Night Warehouse ─────────────────────────────────

function updateDayNight() {
  const hour = new Date().getHours() + new Date().getMinutes() / 60;
  const scene = document.getElementById('warehouse-scene');
  if (!scene) return;

  let skyTop, skyBot, lightColor, lightGlow, nightMode = false;

  if (hour >= 5 && hour < 8) {         // Dawn — soft rose-gold morning light
    skyTop = '#d4a060'; skyBot = '#a87040';
    lightColor = '#ffd090'; lightGlow = 'rgba(255,190,100,0.55)';
  } else if (hour >= 8 && hour < 17) { // Day — warm honey interior
    skyTop = '#d4a868'; skyBot = '#b87840';
    lightColor = '#ffe8a0'; lightGlow = 'rgba(255,220,120,0.50)';
  } else if (hour >= 17 && hour < 20) { // Dusk — deep amber warmth
    skyTop = '#b86830'; skyBot = '#904a18';
    lightColor = '#ffb060'; lightGlow = 'rgba(255,160,70,0.65)';
  } else {                              // Night — cozy lamp glow
    skyTop = '#6a3c18'; skyBot = '#3e2008';
    lightColor = '#ffb880'; lightGlow = 'rgba(255,170,100,0.65)';
    nightMode = true;
  }

  scene.style.background = `linear-gradient(180deg, ${skyTop} 60%, ${skyBot} 100%)`;
  document.querySelectorAll('.wh-light').forEach(l => {
    l.style.background  = lightColor;
    l.style.boxShadow   = `0 0 16px 6px ${lightGlow}`;
  });

  const stars = document.getElementById('wh-stars');
  if (stars) stars.style.display = nightMode ? 'block' : 'none';
}

// ── Toast ─────────────────────────────────────────────────

function showToast(title, body) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<div class="toast-title">${title}</div>
    <div class="toast-body">${(body || '').replace(/\n/g, '<br>')}</div>`;
  container.appendChild(toast);
  setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3200);
}

// ── Idle credit float ─────────────────────────────────────

function showIdleFloat(amount) {
  const ref = document.getElementById('hud-credits');
  if (!ref) return;
  const rect = ref.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'idle-float';
  el.style.left = (rect.left - 24) + 'px';
  el.style.top  = (rect.top  + window.scrollY - 4) + 'px';
  el.textContent = '+' + amount + ' idle';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1700);
}

// ── Item Detail Overlay ───────────────────────────────────

function showItemDetail(id) {
  const item = COLLECTIBLES.find(c => c.id === id);
  if (!item) return;
  const count = state.collection[id] || 0;
  const labels = { common:'COMMON', uncommon:'UNCOMMON', rare:'RARE', ultra:'ULTRA RARE' };

  const iconWrap = document.getElementById('item-detail-icon-wrap');
  iconWrap.innerHTML = '';
  iconWrap.appendChild(_itemIconEl(item, 64));

  document.getElementById('item-detail-name').textContent = item.name.replace('\n', ' ');
  document.getElementById('item-detail-name').style.color = rarityColor(item.rarity);
  document.getElementById('item-detail-rarity').innerHTML =
    `<span class="rarity-badge ${badgeClass(item.rarity)}">${labels[item.rarity]}</span>`;
  const countEl = document.getElementById('item-detail-count');
  countEl.textContent = count > 0 ? '×' + count + ' owned' : 'Not yet collected';
  countEl.style.color = count > 0 ? 'var(--text-dim)' : 'var(--text-dim)';

  const box = document.getElementById('item-detail-box');
  box.style.borderColor = rarityColor(item.rarity);
  box.style.boxShadow   = `0 0 24px ${rarityColor(item.rarity)}55`;

  document.getElementById('item-detail-overlay').style.display = 'flex';
}

function closeItemDetail() {
  document.getElementById('item-detail-overlay').style.display = 'none';
}

// ── Pixel-art avatars ─────────────────────────────────────

// 8×8 grids: 0=transparent, 1=skin, 2=hair, 3=eye/mouth, 4=hat/accent
const _AVATAR_GRIDS = [
  // 0: round face, dark bob hair
  [[0,0,2,2,2,2,0,0],[0,2,2,2,2,2,2,0],[0,1,1,1,1,1,1,0],
   [0,1,3,1,1,3,1,0],[0,1,1,1,1,1,1,0],[0,1,0,3,3,0,1,0],
   [0,1,1,1,1,1,1,0],[0,0,2,2,2,2,0,0]],
  // 1: wavy longer hair
  [[0,2,2,2,2,2,2,0],[2,2,2,2,2,2,2,2],[2,1,1,1,1,1,1,2],
   [2,1,3,1,1,3,1,2],[2,1,1,1,1,1,1,2],[2,1,3,3,3,3,1,2],
   [2,2,1,1,1,1,2,2],[0,2,2,2,2,2,2,0]],
  // 2: cap / bucket hat
  [[4,4,4,4,4,4,4,4],[0,4,4,4,4,4,4,0],[0,1,1,1,1,1,1,0],
   [0,1,3,1,1,3,1,0],[0,1,1,1,1,1,1,0],[0,1,3,3,3,3,1,0],
   [0,1,1,1,1,1,1,0],[0,0,1,1,1,1,0,0]],
  // 3: glasses + neat hair
  [[0,0,2,2,2,2,0,0],[0,2,2,2,2,2,2,0],[0,1,1,1,1,1,1,0],
   [0,4,3,4,4,3,4,0],[0,1,1,1,1,1,1,0],[0,1,3,3,3,3,1,0],
   [0,1,1,1,1,1,1,0],[0,0,2,2,2,2,0,0]],
  // 4: beard + short hair
  [[0,0,2,2,2,2,0,0],[0,2,1,1,1,1,2,0],[0,1,1,1,1,1,1,0],
   [0,1,3,1,1,3,1,0],[0,1,1,1,1,1,1,0],[0,2,2,2,2,2,2,0],
   [0,2,2,2,2,2,2,0],[0,0,2,2,2,2,0,0]],
  // 5: big curly / afro hair
  [[2,2,2,2,2,2,2,2],[2,2,2,2,2,2,2,2],[2,1,1,1,1,1,1,2],
   [2,1,3,1,1,3,1,2],[2,1,1,1,1,1,1,2],[2,1,3,3,3,3,1,2],
   [2,2,1,1,1,1,2,2],[2,2,2,2,2,2,2,2]],
];

const _AVATAR_PALETTES = [
  { skin:'#f5c5a3', hair:'#3d1f00', eye:'#1a0a00', hat:'#1a5080' },
  { skin:'#ffe0c8', hair:'#c06828', eye:'#2a1008', hat:'#c06828' },
  { skin:'#e0a878', hair:'#1a0f00', eye:'#100600', hat:'#8b1e1e' },
  { skin:'#c87848', hair:'#1a0a00', eye:'#100600', hat:'#7030a0' },
  { skin:'#ffe8d0', hair:'#4a3020', eye:'#1a0a00', hat:'#4a3020' },
  { skin:'#d09060', hair:'#1a0a00', eye:'#100600', hat:'#1a5030' },
];

function _makeAvatarDataURL(avatarIndex) {
  const p    = _AVATAR_PALETTES[avatarIndex % _AVATAR_PALETTES.length];
  const grid = _AVATAR_GRIDS[avatarIndex % _AVATAR_GRIDS.length];
  const PX   = 4;
  const cvs  = document.createElement('canvas');
  cvs.width  = cvs.height = 8 * PX;
  const ctx  = cvs.getContext('2d');
  const cmap = { 0:null, 1:p.skin, 2:p.hair, 3:p.eye, 4:p.hat };
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const col = cmap[grid[r][c]];
      if (!col) continue;
      ctx.fillStyle = col;
      ctx.fillRect(c * PX, r * PX, PX, PX);
    }
  }
  return cvs.toDataURL();
}

// ── Testimonials ──────────────────────────────────────────

const _RARITY_COLORS = { common:'#7a6a5a', uncommon:'#2e7a3a', rare:'#2a5fa8', ultra:'#7040b8' };

function renderTestimonials() {
  const track = document.getElementById('testimonials-track');
  if (!track) return;

  // Double the list so the CSS marquee loops seamlessly
  const entries = [...TESTIMONIALS, ...TESTIMONIALS];
  track.innerHTML = '';

  entries.forEach(t => {
    const item       = COLLECTIBLES.find(c => c.id === t.item);
    const rarity     = item ? item.rarity : 'common';
    const rimColor   = _RARITY_COLORS[rarity];
    const starsHTML  = '★'.repeat(t.stars) + '<span class="test-star-empty">' +
                       '★'.repeat(5 - t.stars) + '</span>';
    const avatarURL  = _makeAvatarDataURL(t.avatar);

    const card = document.createElement('div');
    card.className = 'test-card';
    card.innerHTML = `
      <div class="test-card-top">
        <img class="test-avatar" src="${avatarURL}" alt="">
        <div class="test-customer-info">
          <div class="test-customer-name">${t.name}</div>
          <div class="test-customer-loc">${t.location}</div>
          <div class="test-stars">${starsHTML}</div>
        </div>
      </div>
      <div class="test-text">"${t.text}"</div>
      ${item ? `
        <div class="test-item-badge" style="border-color:${rimColor};color:${rimColor};">
          <img class="test-item-img" src="${item.img}" alt="">
          <span class="test-item-name">${item.name.replace('\n', ' ')}</span>
        </div>
        <div class="test-verified">✓ VERIFIED PURCHASE</div>
      ` : ''}
    `;
    track.appendChild(card);
  });
}

// ── Trophy Shelf ──────────────────────────────────────────

function renderTrophyShelf() {
  const shelf = document.getElementById('trophy-shelf');
  if (!shelf) return;
  shelf.innerHTML = '';
  MILESTONES.forEach(ms => {
    const earned  = state.milestonesCompleted.includes(ms.id);
    const pending = !earned && (state.milestonesToClaim || []).includes(ms.id);
    const cls = earned ? 'trophy-' + ms.trophy : pending ? 'trophy-pending' : 'trophy-empty';
    const slot = document.createElement('div');
    slot.className = 'trophy-slot ' + cls;
    slot.title = earned ? ms.name + ' — ' + ms.desc : pending ? ms.name + ' — READY TO CLAIM!' : '???';
    slot.innerHTML = `<div class="trophy-r">R</div><div class="trophy-stand"></div>`;
    shelf.appendChild(slot);
  });
}

// ── Render All ────────────────────────────────────────────

function renderAll() {
  renderTopBar();
  renderOrderQueue();
  renderOrderPanel();
  renderPullHistory();
  renderTrophyShelf();
}
