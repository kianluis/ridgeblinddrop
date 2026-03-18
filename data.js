// ═══════════════════════════════════════════════════════
// RIDGE MYSTERY DROP — data.js
// Game constants: tiers, carriers, items, milestones
// ═══════════════════════════════════════════════════════

const PACKAGE_TIERS = [
  { id:'standard',  name:'Standard',  cost:20,  baseTime:60,  rareboost:0,    cls:'tier-standard'  },
  { id:'express',   name:'Express',   cost:50,  baseTime:30,  rareboost:0.10, cls:'tier-express'   },
  { id:'priority',  name:'Priority',  cost:100, baseTime:15,  rareboost:0.25, cls:'tier-priority'  },
  { id:'overnight', name:'Overnight', cost:200, baseTime:5,   rareboost:0.50, cls:'tier-overnight' },
];

const CARRIERS = [
  { id:'budget',    name:'Budget Courier', cost:0,    mult:1.0, desc:'Default carrier. Gets the job done. Eventually.' },
  { id:'ridgepost', name:'RidgePost',      cost:150,  mult:1.5, desc:'1.5× speed. Our own postal service, naturally.' },
  { id:'express',   name:'ExpressRidge',   cost:400,  mult:2.5, desc:'2.5× speed. The van drives itself, allegedly.' },
  { id:'sonic',     name:'SonicRidge',     cost:1000, mult:5.0, desc:'5× speed. We have no idea how this works.' },
];

const COLLECTIBLES = [
  // ── COMMON ──────────────────────────────────────────────
  { id:'wallet-royalblack',     name:'Ridge Wallet\n(Royal Black)',          rarity:'common',   credits:5,
    img:'https://ridge.com/cdn/shop/files/RoyalBlack-Wallet-RenderFront-frontinjector_2000x.jpg?v=1755644905' },
  { id:'wallet-gunmetal',       name:'Ridge Wallet\n(Gunmetal)',             rarity:'common',   credits:5,
    img:'https://cdn.shopify.com/s/files/1/0613/6213/files/Gunmetal-Wallet-RenderFront-frontinjector.jpg?v=1754349883' },
  { id:'wallet-alpinavy',       name:'Ridge Wallet\n(Alpine Navy)',          rarity:'common',   credits:5,
    img:'https://cdn.shopify.com/s/files/1/0613/6213/files/AlpineNavy-Wallet-RenderFront.jpg?v=1750456189' },
  { id:'keycase-24kgold',       name:'Ridge Keycase\n(24K Gold)',            rarity:'common',   credits:5,
    img:'https://cdn.shopify.com/s/files/1/0613/6213/files/KEYCASENEW_24KaratGold.jpg?v=1724362041' },
  { id:'keycase-forgedfetti',   name:'Ridge Keycase\n(Forgedfetti)',         rarity:'common',   credits:5,
    img:'https://cdn.shopify.com/s/files/1/0613/6213/files/Forgedfetti-Keycase-RenderFront.jpg?v=1770820461' },
  // ── UNCOMMON ────────────────────────────────────────────
  { id:'wallet-rodeored-outlaw',name:'Ridge Wallet\n(Rodeo Red Outlaw)',     rarity:'uncommon', credits:15,
    img:'https://cdn.shopify.com/s/files/1/0613/6213/files/Rodeo-Red-Outlaw-Wallet-RenderFront_1.jpg?v=1758803084' },
  { id:'power-bank-hyperlime',  name:'Ridge Power Bank\n(Hyper Lime)',       rarity:'uncommon', credits:15,
    img:'https://cdn.shopify.com/s/files/1/0613/6213/files/MagneticPowerbank-HyperLime-RenderFront_562f9f7d-4956-433a-ad56-b516017335af.jpg?v=1773779063' },
  { id:'wallet-kintsugi-white', name:'Ridge Wallet\n(Kintsugi White)',       rarity:'uncommon', credits:15,
    img:'https://cdn.shopify.com/s/files/1/0613/6213/files/Kintsugi-White-Wallet-RenderFront_328ef15b-c349-4cff-a225-b1936b904668.jpg?v=1743008936' },
  { id:'ring-carbon-fiber',     name:'Ridge Ring\n(8mm Carbon Fiber)',       rarity:'uncommon', credits:15,
    img:'https://ridge.com/cdn/shop/files/RTCF9_MAIN_2000x.jpg?v=1686238534' },
  { id:'tracker-card',          name:'Ridge\nTracker Cards',                 rarity:'uncommon', credits:15,
    img:'https://ridge.com/cdn/shop/files/TrackerCard-THUMBNAIL_4ea6a171-cbc5-46b3-aed5-8c0c3a54b586_2000x.jpg?v=1761926203' },
  // ── RARE ────────────────────────────────────────────────
  { id:'wallet-sakura',         name:'Ridge Wallet\n(Sakura)',               rarity:'rare',     credits:40,
    img:'https://ridge.com/cdn/shop/files/Sakura-Wallet-RenderFront_2000x.jpg?v=1769560389' },
  { id:'commuter-backpack-lav', name:'Ridge Commuter\nBackpack (Lavender)',  rarity:'rare',     credits:40,
    img:'https://cdn.shopify.com/s/files/1/0613/6213/files/Travel-Commuter_Lavender-1.jpg?v=1762362349' },
  { id:'magsafe-wallet-gt',     name:'Ridge MagSafe\nWallet (GT)',           rarity:'rare',     credits:40,
    img:'https://cdn.shopify.com/s/files/1/0613/6213/files/GTMagsafe-Wallet-RenderFront.jpg?v=1748308248' },
  { id:'wallet-gold-horizon',   name:'Ridge Wallet\n(Gold Horizon)',         rarity:'rare',     credits:40,
    img:'https://cdn.shopify.com/s/files/1/0613/6213/files/GoldHorizon-Wallet-RenderFront.jpg?v=1767875579' },
  // ── ULTRA RARE ──────────────────────────────────────────
  { id:'wallet-iridescent',     name:'Ridge Wallet\n(Iridescent)',           rarity:'ultra',    credits:150,
    img:'https://cdn.shopify.com/s/files/1/0613/6213/files/Iridescence-Wallet-RenderFront.jpg?v=1770820026' },
  { id:'carryon-mr-doodle',     name:'Ridge Carry On\n(Mr. Doodle)',         rarity:'ultra',    credits:150,
    img:'https://ridge.com/cdn/shop/files/MrDoodle_CarryOn_THUMB_01_f8d3286f-c8b4-486c-862b-7140129d3e13_2000x.jpg?v=1764150871' },
  { id:'wallet-mkbhd-vapor',    name:'Ridge Wallet\n(MKBHD Vapor)',          rarity:'ultra',    credits:300,
    img:'https://ridge.com/cdn/shop/files/MKBHDVapor-Wallet-RenderFront_7c649890-2065-4e4d-9b87-8cbf4df7c5e1_2000x.jpg?v=1767831553', special:'2xcredits' },
];

const BASE_RATES = { common:0.60, uncommon:0.25, rare:0.12, ultra:0.03 };

const MILESTONES = [
  { id:'first-drop',    name:'First Drop!',    desc:'Open your first package',            req:s=>s.packagesOpened>=1,        reward:25  },
  { id:'collector',     name:'Collector',      desc:'Collect 5 unique items',             req:()=>uniqueCount()>=5,          reward:50  },
  { id:'dedicated',     name:'Dedicated',      desc:'Open 10 packages',                   req:s=>s.packagesOpened>=10,       reward:75  },
  { id:'rare-hunter',   name:'Rare Hunter',    desc:'Pull your first Rare item',          req:s=>s.firstRare,                reward:100 },
  { id:'ultra-lucky',   name:'Ultra Lucky',    desc:'Pull your first Ultra Rare item',    req:s=>s.firstUltra,               reward:250 },
  { id:'completionist', name:'Completionist',  desc:'Collect all '+COLLECTIBLES.length+' items', req:()=>uniqueCount()>=COLLECTIBLES.length, reward:500 },
  { id:'high-roller',   name:'High Roller',    desc:'Open 50 packages',                   req:s=>s.packagesOpened>=50,       reward:200 },
  { id:'loaded',        name:'Loaded',         desc:'Accumulate 1000 total credits',      req:s=>s.totalCreditsEarned>=1000, reward:150 },
];
