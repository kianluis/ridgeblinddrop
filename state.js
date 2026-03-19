// ═══════════════════════════════════════════════════════
// RIDGE MYSTERY DROP — state.js
// State object, persistence, and pure helper functions
// ═══════════════════════════════════════════════════════

let state = {
  credits: 150,
  packagesOpened: 0,
  totalCreditsEarned: 150,
  carrier: 'usps',
  carriersOwned: ['usps'],
  collection: {},        // id -> count
  orders: [],            // { id, tier, startTime, duration, ready }
  pullHistory: [],       // { id, name, rarity }
  milestonesCompleted: [],
  milestonesToClaim: [],      // achieved but not yet claimed by player
  firstRare: false,
  firstUltra: false,
  nextOrderId: 1,
  lastIdleTick: Date.now(),
  soundEnabled: true,
  prestigeCount: 0,
  prestigeRareBonus: 0,  // additive bonus to rare rates
  bookletFilter: 'all',
  lastNewItemId: null,   // used for flip animation
  pullsSinceDoodle: 0,   // pity counter — guaranteed at 100
  newCollectionItems: [], // newly unlocked items not yet viewed in Collection tab
};

// ── Session ID ────────────────────────────────────────────
// Stored in the URL (?s=xxx) AND in localStorage so progress
// survives tab closes even when the URL is not bookmarked.

const _SESSION_STORE_KEY = 'ridgemysterydrop_session';

function getSessionId() {
  const params = new URLSearchParams(location.search);
  let sid = params.get('s');
  if (!sid) {
    // Restore from localStorage so returning visitors keep their save
    sid = localStorage.getItem(_SESSION_STORE_KEY);
  }
  if (!sid) {
    // Truly first visit — generate a new ID
    sid = Math.random().toString(36).slice(2, 8);
  }
  // Persist the session ID so future bare-URL visits find it
  try { localStorage.setItem(_SESSION_STORE_KEY, sid); } catch(e) {}
  // Always put it in the URL for shareability
  if (!params.get('s') || params.get('s') !== sid) {
    params.set('s', sid);
    history.replaceState(null, '', location.pathname + '?' + params.toString());
  }
  return sid;
}

const SESSION_ID = getSessionId();
const SAVE_KEY   = 'ridgemysterydrop_v2_' + SESSION_ID;

// ── Persistence ──────────────────────────────────────────

function saveState() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch(e){}
}

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const loaded = JSON.parse(raw);
      // Merge loaded into defaults so new keys survive upgrades
      state = Object.assign(state, loaded);
      // Ensure lastIdleTick is valid
      if (!state.lastIdleTick) state.lastIdleTick = Date.now();
      // Recalculate readiness based on real timestamps
      const now = Date.now();
      state.orders = (state.orders || []).map(o => {
        if (!o.ready && now >= o.startTime + o.duration * 1000) o.ready = true;
        return o;
      });
    }
  } catch(e) { console.warn('Save load failed', e); }
}

// ── Pure helpers ─────────────────────────────────────────

function uniqueCount() {
  return Object.values(state.collection).filter(c => c > 0).length;
}

function getTotalItems() { return COLLECTIBLES.length; }

function getCurrentCarrier() {
  return CARRIERS.find(c => c.id === state.carrier) || CARRIERS[0];
}

function getShipTime(tier) {
  const carrier = getCurrentCarrier();
  return Math.max(1, Math.round(tier.baseTime / carrier.mult));
}

function rollItem(rareboost) {
  const totalBoost = (rareboost || 0) + (state.prestigeRareBonus || 0);
  let rates = { ...BASE_RATES };
  rates.common   = Math.max(0.10, rates.common   - totalBoost * 0.75);
  rates.uncommon = Math.max(0.10, rates.uncommon - totalBoost * 0.15);
  rates.rare    += totalBoost * 0.70;
  rates.ultra   += totalBoost * 0.10;
  // Normalise
  const total = rates.common + rates.uncommon + rates.rare + rates.ultra;
  for (const k in rates) rates[k] /= total;

  const r = Math.random();
  let rarity;
  if      (r < rates.ultra)                              rarity = 'ultra';
  else if (r < rates.ultra + rates.rare)                 rarity = 'rare';
  else if (r < rates.ultra + rates.rare + rates.uncommon) rarity = 'uncommon';
  else                                                    rarity = 'common';

  // Weighted pool selection (weight field defaults to 1)
  // Mr. Doodle is pity-only (pull 101) — never enters the normal roll pool
  const pool = COLLECTIBLES.filter(c => c.rarity === rarity && c.id !== 'carryon-mr-doodle');
  const totalW = pool.reduce((sum, c) => sum + (c.weight ?? 1), 0);
  let pick = Math.random() * totalW;
  for (const c of pool) {
    pick -= (c.weight ?? 1);
    if (pick <= 0) return c;
  }
  return pool[pool.length - 1];
}

function rarityColor(r) {
  return { common:'var(--common)', uncommon:'var(--uncommon)', rare:'var(--rare)', ultra:'var(--ultra)' }[r] || 'var(--text)';
}

function rarityLabel(r) {
  return { common:'COMMON', uncommon:'UNCOMMON', rare:'RARE', ultra:'ULTRA RARE' }[r] || r;
}

function badgeClass(r) {
  return { common:'badge-common', uncommon:'badge-uncommon', rare:'badge-rare', ultra:'badge-ultra' }[r] || '';
}

// Returns "MM:SS" format for all durations
function formatTime(seconds) {
  if (seconds <= 0) return '00:00';
  const s = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
}
