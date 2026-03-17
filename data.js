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

const ICON_MAP = {
  'wallet-black':    'icon-wallet',
  'wallet-gunmetal': 'icon-wallet',
  'wallet-titanium': 'icon-wallet',
  'keycase-black':   'icon-keycase',
  'phone-case':      'icon-phone',
  'wallet-carbon':   'icon-carbon',
  'wallet-gold':     'icon-gold',
  'travel-wallet':   'icon-travel',
  'keycase-titanium':'icon-keycase',
  'ridge-pen':       'icon-pen',
  'power-bank':      'icon-powerbank',
  'wallet-damascus': 'icon-damascus',
  'ridge-backpack':  'icon-backpack',
  'ridge-sling':     'icon-sling',
  'commuter-bag':    'icon-commuter',
  'wallet-stealth':  'icon-stealth',
  'collab-wallet':   'icon-collab',
  'mystery-box-meta':'icon-mystery',
};

const COLLECTIBLES = [
  // ── COMMON ──────────────────────────────────────────────
  { id:'wallet-black',    name:'Ridge Wallet\n(Black)',     rarity:'common',   credits:5,   icon:'icon-wallet'    },
  { id:'wallet-gunmetal', name:'Ridge Wallet\n(Gunmetal)',  rarity:'common',   credits:5,   icon:'icon-wallet'    },
  { id:'wallet-titanium', name:'Ridge Wallet\n(Titanium)',  rarity:'common',   credits:5,   icon:'icon-wallet'    },
  { id:'keycase-black',   name:'Ridge Keycase\n(Black)',    rarity:'common',   credits:5,   icon:'icon-keycase'   },
  { id:'phone-case',      name:'Ridge Phone\nCase',         rarity:'common',   credits:5,   icon:'icon-phone'     },
  // ── UNCOMMON ────────────────────────────────────────────
  { id:'wallet-carbon',   name:'Ridge Wallet\n(Carbon)',    rarity:'uncommon', credits:15,  icon:'icon-carbon'    },
  { id:'wallet-gold',     name:'Ridge Wallet\n(Gold)',      rarity:'uncommon', credits:15,  icon:'icon-gold'      },
  { id:'travel-wallet',   name:'Ridge Travel\nWallet',      rarity:'uncommon', credits:15,  icon:'icon-travel'    },
  { id:'keycase-titanium',name:'Ridge Keycase\n(Titanium)', rarity:'uncommon', credits:15,  icon:'icon-keycase'   },
  { id:'ridge-pen',       name:'Ridge Pen',                 rarity:'uncommon', credits:15,  icon:'icon-pen'       },
  { id:'power-bank',      name:'Ridge Power\nBank',         rarity:'uncommon', credits:15,  icon:'icon-powerbank' },
  // ── RARE ────────────────────────────────────────────────
  { id:'wallet-damascus', name:'Ridge Wallet\n(Damascus)',  rarity:'rare',     credits:40,  icon:'icon-damascus'  },
  { id:'ridge-backpack',  name:'Ridge Backpack',            rarity:'rare',     credits:40,  icon:'icon-backpack'  },
  { id:'ridge-sling',     name:'Ridge Sling Bag',           rarity:'rare',     credits:40,  icon:'icon-sling'     },
  { id:'commuter-bag',    name:'Ridge Commuter\nBag',       rarity:'rare',     credits:40,  icon:'icon-commuter'  },
  // ── ULTRA RARE ──────────────────────────────────────────
  { id:'wallet-stealth',  name:'Ridge Wallet\n(Stealth)',   rarity:'ultra',    credits:150, icon:'icon-stealth'   },
  { id:'collab-wallet',   name:'Limited Edition\nCollab',   rarity:'ultra',    credits:150, icon:'icon-collab'    },
  { id:'mystery-box-meta',name:'Ridge Mystery\nBox',        rarity:'ultra',    credits:300, icon:'icon-mystery',  special:'2xcredits' },
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
