// ═══════════════════════════════════════════════════════
// RIDGE MYSTERY DROP — data.js
// Game constants: tiers, carriers, items, milestones
// ═══════════════════════════════════════════════════════

const PACKAGE_TIERS = [
  { id:'standard',  name:'Standard',  cost:20,  baseCredits:10, baseTime:40,  rareboost:0,    cls:'tier-standard',
    baseRates: { common:0.82, uncommon:0.15, rare:0.025, ultra:0.005 } },
  { id:'express',   name:'Express',   cost:30,  baseCredits:15, baseTime:30,  rareboost:0.10, cls:'tier-express'   },
  { id:'priority',  name:'Priority',  cost:50,  baseCredits:25, baseTime:15,  rareboost:0.25, cls:'tier-priority'  },
  { id:'overnight', name:'Overnight', cost:100, baseCredits:50, baseTime:5,   rareboost:0.50, cls:'tier-overnight',
    baseRates: { common:0, uncommon:0.55, rare:0.35, ultra:0.10 } },
];

const CARRIERS = [
  { id:'usps',  name:'USPS',  cost:0,    mult:1.0, desc:'Default carrier. Gets the job done. Eventually.' },
  { id:'ups',   name:'UPS',   cost:75,   mult:1.5, desc:'1.5× speed. Brown never looked so fast.' },
  { id:'fedex', name:'FedEx', cost:190,  mult:2.5, desc:'2.5× speed. When it absolutely has to be there.' },
  { id:'dhl',   name:'DHL',   cost:650,  mult:5.0, desc:'5× speed. International speed, delivered.' },
];

const COLLECTIBLES = [
  // ── COMMON ──────────────────────────────────────────────
  { id:'wallet-royalblack',     name:'Ridge Wallet\n(Royal Black)',          rarity:'common',   credits:12,
    img:'https://ridge.com/cdn/shop/files/RoyalBlack-Wallet-RenderFront-frontinjector_2000x.jpg?v=1755644905' },
  { id:'wallet-gunmetal',       name:'Ridge Wallet\n(Gunmetal)',             rarity:'common',   credits:12,
    img:'https://cdn.shopify.com/s/files/1/0613/6213/files/Gunmetal-Wallet-RenderFront-frontinjector.jpg?v=1754349883' },
  { id:'wallet-alpinavy',       name:'Ridge Wallet\n(Alpine Navy)',          rarity:'common',   credits:12,
    img:'https://cdn.shopify.com/s/files/1/0613/6213/files/AlpineNavy-Wallet-RenderFront.jpg?v=1750456189' },
  { id:'keycase-24kgold',       name:'Ridge Keycase\n(24K Gold)',            rarity:'common',   credits:12,
    img:'https://cdn.shopify.com/s/files/1/0613/6213/files/KEYCASENEW_24KaratGold.jpg?v=1724362041' },
  { id:'keycase-forgedfetti',   name:'Ridge Keycase\n(Forgedfetti)',         rarity:'common',   credits:12,
    img:'https://cdn.shopify.com/s/files/1/0613/6213/files/Forgedfetti-Keycase-RenderFront.jpg?v=1770820461' },
  // ── UNCOMMON ────────────────────────────────────────────
  { id:'wallet-rodeored-outlaw',name:'Ridge Wallet\n(Rodeo Red Outlaw)',     rarity:'uncommon', credits:28,
    img:'https://cdn.shopify.com/s/files/1/0613/6213/files/Rodeo-Red-Outlaw-Wallet-RenderFront_1.jpg?v=1758803084' },
  { id:'power-bank-hyperlime',  name:'Ridge Power Bank\n(Hyper Lime)',       rarity:'uncommon', credits:28,
    img:'https://cdn.shopify.com/s/files/1/0613/6213/files/MagneticPowerbank-HyperLime-RenderFront_562f9f7d-4956-433a-ad56-b516017335af.jpg?v=1773779063' },
  { id:'wallet-kintsugi-white', name:'Ridge Wallet\n(Kintsugi White)',       rarity:'uncommon', credits:28,
    img:'https://cdn.shopify.com/s/files/1/0613/6213/files/Kintsugi-White-Wallet-RenderFront_328ef15b-c349-4cff-a225-b1936b904668.jpg?v=1743008936' },
  { id:'ring-carbon-fiber',     name:'Ridge Ring\n(8mm Carbon Fiber)',       rarity:'uncommon', credits:28,
    img:'https://ridge.com/cdn/shop/files/RTCF9_MAIN_2000x.jpg?v=1686238534' },
  { id:'tracker-card',          name:'Ridge\nTracker Cards',                 rarity:'uncommon', credits:28,
    img:'https://ridge.com/cdn/shop/files/TrackerCard-THUMBNAIL_4ea6a171-cbc5-46b3-aed5-8c0c3a54b586_2000x.jpg?v=1761926203' },
  // ── RARE ────────────────────────────────────────────────
  { id:'wallet-sakura',         name:'Ridge Wallet\n(Sakura)',               rarity:'rare',     credits:65,
    img:'https://ridge.com/cdn/shop/files/Sakura-Wallet-RenderFront_2000x.jpg?v=1769560389' },
  { id:'commuter-backpack-lav', name:'Ridge Commuter\nBackpack (Lavender)',  rarity:'rare',     credits:65,
    img:'https://cdn.shopify.com/s/files/1/0613/6213/files/Travel-Commuter_Lavender-1.jpg?v=1762362349' },
  { id:'magsafe-wallet-gt',     name:'Ridge MagSafe\nWallet (GT)',           rarity:'rare',     credits:65,
    img:'https://cdn.shopify.com/s/files/1/0613/6213/files/GTMagsafe-Wallet-RenderFront.jpg?v=1748308248' },
  { id:'wallet-gold-horizon',   name:'Ridge Wallet\n(Gold Horizon)',         rarity:'rare',     credits:65,
    img:'https://cdn.shopify.com/s/files/1/0613/6213/files/GoldHorizon-Wallet-RenderFront.jpg?v=1767875579' },
  // ── ULTRA RARE ──────────────────────────────────────────
  { id:'wallet-iridescent',     name:'Ridge Wallet\n(Iridescent)',           rarity:'ultra',    credits:180,
    img:'https://cdn.shopify.com/s/files/1/0613/6213/files/Iridescence-Wallet-RenderFront.jpg?v=1770820026' },
  { id:'carryon-mr-doodle',     name:'Ridge Carry On\n(Mr. Doodle)',         rarity:'ultra',    credits:180, weight:0.4,
    img:'https://ridge.com/cdn/shop/files/MrDoodle_CarryOn_THUMB_01_f8d3286f-c8b4-486c-862b-7140129d3e13_2000x.jpg?v=1764150871' },
  { id:'wallet-mkbhd-vapor',    name:'Ridge Wallet\n(MKBHD Vapor)',          rarity:'ultra',    credits:300,
    img:'https://ridge.com/cdn/shop/files/MKBHDVapor-Wallet-RenderFront_7c649890-2065-4e4d-9b87-8cbf4df7c5e1_2000x.jpg?v=1767831553', special:'2xcredits' },
];

const BASE_RATES = { common:0.60, uncommon:0.25, rare:0.12, ultra:0.03 };

// ── Testimonials ─────────────────────────────────────────
const TESTIMONIALS = [
  { name:'Tyler M.',    location:'Austin, TX',        stars:5, avatar:0,
    text:"Pulled the MKBHD Vapor on my third pack. My coworkers won't stop staring.",
    item:'wallet-mkbhd-vapor' },
  { name:'Priya S.',    location:'Seattle, WA',       stars:5, avatar:1,
    text:"The Sakura wallet arrived and I actually screamed. Absolutely gorgeous.",
    item:'wallet-sakura' },
  { name:'Marcus T.',   location:'Chicago, IL',       stars:5, avatar:2,
    text:"Iridescent edition is like holding a galaxy. 10/10 no notes whatsoever.",
    item:'wallet-iridescent' },
  { name:'Jess K.',     location:'Nashville, TN',     stars:5, avatar:3,
    text:"Got the Mr. Doodle carry-on as an ultra rare. Jaws dropped at the airport.",
    item:'carryon-mr-doodle' },
  { name:'Devon R.',    location:'Portland, OR',      stars:5, avatar:4,
    text:"Gold Horizon wallet is the most beautiful thing I own. Not an exaggeration.",
    item:'wallet-gold-horizon' },
  { name:'Aisha W.',    location:'Atlanta, GA',       stars:5, avatar:5,
    text:"GT MagSafe snapped onto my phone and I keep staring at it during meetings.",
    item:'magsafe-wallet-gt' },
  { name:'Sam L.',      location:'Denver, CO',        stars:5, avatar:0,
    text:"Hyper Lime power bank got me through a 14-hour flight. Neon AND functional.",
    item:'power-bank-hyperlime' },
  { name:'Kaito N.',    location:'San Francisco, CA', stars:4, avatar:3,
    text:"Carbon fiber ring fits perfectly. Already gotten 5 compliments this week.",
    item:'ring-carbon-fiber' },
  { name:'Brittany F.', location:'Miami, FL',         stars:5, avatar:1,
    text:"Rodeo Red Outlaw showed up and the name is 100% accurate. Wild finish.",
    item:'wallet-rodeored-outlaw' },
  { name:'Omar J.',     location:'New York, NY',      stars:5, avatar:2,
    text:"Kintsugi White looks like modern art. Opened 6 packs to get it. Worth it.",
    item:'wallet-kintsugi-white' },
  { name:'Rachel T.',   location:'Phoenix, AZ',       stars:5, avatar:5,
    text:"Lavender commuter backpack?? I didn't expect to cry at a package opening.",
    item:'commuter-backpack-lav' },
  { name:'Luke C.',     location:'Boston, MA',        stars:4, avatar:4,
    text:"Royal Black is a daily carry classic. Clean, minimal, elite. Just get it.",
    item:'wallet-royalblack' },
];

const MILESTONES = [
  // ── Bronze ──────────────────────────────────────────────
  { id:'first-drop',    name:'First Drop!',      desc:'Open your first package',                  req:s=>s.packagesOpened>=1,                                                 reward:25,   trophy:'bronze'     },
  { id:'collector',     name:'Collector',        desc:'Collect 5 unique items',                   req:()=>uniqueCount()>=5,                                                   reward:50,   trophy:'bronze'     },
  // ── No trophy — credit top-ups to keep the loop going ───
  { id:'quick-start',   name:'Quick Start',      desc:'Open 5 packages',                          req:s=>s.packagesOpened>=5,                                                 reward:30                        },
  { id:'on-a-roll',     name:'On a Roll',        desc:'Open 25 packages',                         req:s=>s.packagesOpened>=25,                                                reward:60                        },
  { id:'thirty-deep',   name:'Thirty Deep',      desc:'Open 30 packages',                         req:s=>s.packagesOpened>=30,                                                reward:75                        },
  { id:'fifty-club',    name:'Fifty Club',       desc:'Open 50 packages',                         req:s=>s.packagesOpened>=50,                                                reward:100                       },
  { id:'credit-stash',  name:'Credit Stash',     desc:'Earn 500 total credits',                   req:s=>s.totalCreditsEarned>=500,                                           reward:40                        },
  { id:'big-baller',    name:'Big Baller',       desc:'Earn 2,500 total credits',                 req:s=>s.totalCreditsEarned>=2500,                                          reward:150                       },
  // ── Silver ──────────────────────────────────────────────
  { id:'dedicated',     name:'Dedicated',        desc:'Open 10 packages',                         req:s=>s.packagesOpened>=10,                                                reward:75,   trophy:'silver'     },
  { id:'rare-hunter',   name:'Rare Hunter',      desc:'Pull your first Rare item',                req:s=>s.firstRare,                                                         reward:100,  trophy:'silver'     },
  { id:'half-set',      name:'Half Set',         desc:'Collect 9 unique items',                   req:()=>uniqueCount()>=9,                                                   reward:80,   trophy:'silver'     },
  { id:'loaded',        name:'Loaded',           desc:'Earn 1,000 total credits',                 req:s=>s.totalCreditsEarned>=1000,                                          reward:150,  trophy:'silver'     },
  // ── Gold ────────────────────────────────────────────────
  { id:'high-roller',   name:'High Roller',      desc:'Open 75 packages',                         req:s=>s.packagesOpened>=75,                                                reward:200,  trophy:'gold'       },
  { id:'ultra-lucky',   name:'Ultra Lucky',      desc:'Pull your first Ultra Rare item',          req:s=>s.firstUltra,                                                        reward:250,  trophy:'gold'       },
  { id:'almost-there',  name:'Almost There',     desc:'Collect 15 unique items',                  req:()=>uniqueCount()>=15,                                                  reward:150,  trophy:'gold'       },
  { id:'century',       name:'Century',          desc:'Open 100 packages',                        req:s=>s.packagesOpened>=100,                                               reward:300,  trophy:'gold'       },
  // ── Platinum ────────────────────────────────────────────
  { id:'completionist', name:'Completionist',    desc:'Collect all '+COLLECTIBLES.length+' items',req:()=>uniqueCount()>=COLLECTIBLES.length,                                 reward:500,  trophy:'platinum'   },
  { id:'ultra-hunter',  name:'Ultra Hunter',     desc:'Pull 3 Ultra Rare items',                  req:s=>(s.pullHistory||[]).filter(p=>p.rarity==='ultra').length>=3,          reward:350,  trophy:'platinum'   },
  // ── Diamond ─────────────────────────────────────────────
  { id:'obsessed',      name:'Obsessed',         desc:'Open 200 packages',                        req:s=>s.packagesOpened>=200,                                               reward:600,  trophy:'diamond'    },
  { id:'credit-king',   name:'Credit King',      desc:'Earn 10,000 total credits',                req:s=>s.totalCreditsEarned>=10000,                                         reward:500,  trophy:'diamond'    },
  { id:'ultra-devotee', name:'Ultra Devotee',    desc:'Pull 5 Ultra Rare items',                  req:s=>(s.pullHistory||[]).filter(p=>p.rarity==='ultra').length>=5,          reward:750,  trophy:'diamond'    },
  // ── Iridescent ──────────────────────────────────────────
  { id:'ridge-fanatic', name:'Ridge Fanatic',    desc:'Open 500 packages',                        req:s=>s.packagesOpened>=500,                                               reward:1000, trophy:'iridescent' },
  { id:'rainbow-chaser',name:'Rainbow Chaser',   desc:'Pull every Ultra Rare item at least once', req:s=>COLLECTIBLES.filter(c=>c.rarity==='ultra').every(c=>(s.collection[c.id]||0)>0), reward:1500, trophy:'iridescent' },
];

// ── Warehouse Store ───────────────────────────────────────
const STORE_ITEMS = [
  // Wall colors
  { id:'wall-blue',          cat:'wall',    name:'Slate',          desc:'Cool factory slate',       cost: 150 },
  { id:'wall-green',         cat:'wall',    name:'Forest',         desc:'Deep warehouse green',     cost: 150 },
  { id:'wall-gray',          cat:'wall',    name:'Concrete',       desc:'Urban concrete vibes',     cost: 150 },
  { id:'wall-dark',          cat:'wall',    name:'Midnight',       desc:'Late-night shift energy',  cost: 200 },
  { id:'wall-purple',        cat:'wall',    name:'Cosmic',         desc:'Out-of-this-world shift',  cost: 200 },
  // Cat colors
  { id:'cat-gray',           cat:'cat',     name:'Gray',           desc:'Classic gray coat',        cost:  50 },
  { id:'cat-black',          cat:'cat',     name:'Black',          desc:'Mysterious & stealthy',    cost:  50 },
  { id:'cat-cream',          cat:'cat',     name:'Cream',          desc:'Warm vanilla fluff',       cost:  75 },
  { id:'cat-white',          cat:'cat',     name:'White',          desc:'Pure snow coat',           cost:  75 },
  // Sean shirt colors
  { id:'shirt-blue',         cat:'shirt',   name:'Navy',           desc:"Sean went corporate",      cost:  75 },
  { id:'shirt-green',        cat:'shirt',   name:'Forest',         desc:'Earthy green energy',      cost:  75 },
  { id:'shirt-black',        cat:'shirt',   name:'Black',          desc:'Looking very serious',     cost:  75 },
  { id:'shirt-orange',       cat:'shirt',   name:'Orange',         desc:'Bold warehouse look',      cost:  75 },
  // Props
  { id:'prop-succulent',     cat:'props',   name:'Succulent',      desc:'A tiny desk plant',        cost: 100 },
  { id:'prop-plant',         cat:'props',   name:'Tall Plant',     desc:'Adds life to the scene',   cost: 150 },
  { id:'prop-painting',      cat:'props',   name:'Wallet Painting',desc:'Ridge art for the crew',   cost: 200 },
  { id:'prop-desk',          cat:'props',   name:'Desk',           desc:'A proper workspace',       cost: 250 },
  { id:'prop-chair',         cat:'props',   name:'Chair',          desc:'Sit down and relax',       cost: 200 },
  { id:'prop-storage',       cat:'props',   name:'Tidy Storage',   desc:'No more floor chaos',      cost: 300 },
  { id:'prop-window',        cat:'props',   name:'Window',         desc:'A view to the outside',    cost: 250 },
  { id:'prop-clock',         cat:'props',   name:'Wall Clock',     desc:'Know what shift it is',    cost: 100 },
  { id:'prop-board',         cat:'props',   name:'Notice Board',   desc:'Crew announcements',       cost: 120 },
  // Workers
  { id:'worker-daniel',      cat:'workers', name:'Daniel',         desc:'New hire, very eager',     cost: 350 },
  { id:'worker-austin',      cat:'workers', name:'Austin',         desc:'The reliable one',         cost: 400 },
];
