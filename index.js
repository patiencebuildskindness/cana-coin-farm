import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { Telegraf, Markup } from 'telegraf';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { BOT_TOKEN, WEBAPP_URL, SECRET_TOKEN, PORT = 3000, SHEET_CSV_URL } = process.env;
if (!BOT_TOKEN) { console.error('❌ Missing BOT_TOKEN'); process.exit(1); }

const app = express();
const bot = new Telegraf(BOT_TOKEN);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------------- XP (in-memory) ----------------
const xpStore = new Map(); // uid -> { xp, badges:[] }
function getUserIdFromInitData(initData) {
  try {
    const url = new URL('https://x/?' + (initData || ''));
    const raw = url.searchParams.get('user');
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user?.id?.toString() || null;
  } catch { return null; }
}
app.post('/api/xp/get', (req, res) => {
  const uid = getUserIdFromInitData(req.header('X-TG-Init-Data') || req.body?.initData);
  if (!uid) return res.json({ ok:false, error:'no user' });
  const state = xpStore.get(uid) || { xp: 0, badges: [] };
  res.json({ ok:true, ...state });
});
app.post('/api/xp/inc', (req, res) => {
  const uid = getUserIdFromInitData(req.header('X-TG-Init-Data') || req.body?.initData);
  if (!uid) return res.json({ ok:false, error:'no user' });
  const state = xpStore.get(uid) || { xp: 0, badges: [] };
  state.xp += 1;
  if (state.xp >= 5 && !state.badges.includes('Mint Keeper')) state.badges.push('Mint Keeper');
  xpStore.set(uid, state);
  res.json({ ok:true, ...state });
});

// ---------------- Plants (sheet or CSV) ----------------
async function loadCatalog() {
  try {
    if (SHEET_CSV_URL) {
      const r = await fetch(SHEET_CSV_URL);
      const csvText = await r.text();
      const csvtojson = (await import('csvtojson')).default;
      return await csvtojson().fromString(csvText);
    }
    const csvtojson = (await import('csvtojson')).default;
    const csvPath = path.join(__dirname, 'data', 'game_plants.csv');
    if (!fs.existsSync(csvPath)) return [];
    return await csvtojson().fromFile(csvPath);
  } catch {
    return [];
  }
}
app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/api/init', (_req, res) => res.json({ ok: true, message: 'CANA Coin Farm live' }));
app.get('/api/plants', async (_req, res) => res.json({ ok: true, plants: await loadCatalog() }));

// ---------------- Farm (in-memory) ----------------
// Farm model per user:
// { biome: 'temperate'|'tropical'|'arid'|'wetland',
//   grid: 6, plots:[{plant_id, plantedAt, stage, wateredAt}],
//   seeds:{ [plant_id]:qty }, produce:{ [plant_id]:qty } }

const farmStore = new Map(); // uid -> farm state

const GRID_SIZE = 6;
const STAGES = 3;
const BASE_STAGE_MS = 30000;  // 30s base per stage (demo)
const BIOME_SPEED = {
  temperate: 1.0,
  tropical: 0.8,  // faster
  arid: 1.2,      // slower
  wetland: 0.9
};

function ensureFarm(uid, catalog = []) {
  let farm = farmStore.get(uid);
  if (!farm) {
    const seeds = {};
    catalog.slice(0, 8).forEach(p => {
      const id = (p.scientific_name || p.common_name || '').trim();
      if (id) seeds[id] = (seeds[id] || 0) + 3;
    });
    const plots = Array.from({ length: GRID_SIZE * GRID_SIZE }, () => ({
      plant_id: null, plantedAt: null, stage: 0, wateredAt: null
    }));
    farm = { biome: 'temperate', grid: GRID_SIZE, plots, seeds, produce: {} };
    farmStore.set(uid, farm);
  }
  return farm;
}

function plantStage(farm, plot) {
  if (!plot.plantedAt) return 0;
  const mult = BIOME_SPEED[farm.biome] ?? 1.0;
  const stageMs = BASE_STAGE_MS * mult;
  const elapsed = Date.now() - plot.plantedAt;
  return Math.min(STAGES, Math.floor(elapsed / stageMs) + 1);
}

app.post('/api/farm/setBiome', (req, res) => {
  const uid = getUserIdFromInitData(req.header('X-TG-Init-Data') || req.body?.initData);
  const { biome } = req.body || {};
  if (!uid) return res.json({ ok:false, error:'no user' });
  if (!['temperate','tropical','arid','wetland'].includes(biome)) return res.json({ ok:false, error:'bad biome' });
  const farm = ensureFarm(uid, []);
  farm.biome = biome;
  res.json({ ok:true, biome });
});

app.post('/api/farm/get', async (req, res) => {
  const uid = getUserIdFromInitData(req.header('X-TG-Init-Data') || req.body?.initData);
  if (!uid) return res.json({ ok:false, error:'no user' });
  const catalog = await loadCatalog();
  const farm = ensureFarm(uid, catalog);
  const plots = farm.plots.map(p => ({ ...p, stage: p.plant_id ? plantStage(farm, p) : 0 }));
  res.json({ ok:true, biome: farm.biome, grid: farm.grid, plots, seeds: farm.seeds, produce: farm.produce });
});

app.post('/api/farm/plant', (req, res) => {
  const uid = getUserIdFromInitData(req.header('X-TG-Init-Data') || req.body?.initData);
  const { index, plant_id } = req.body || {};
  if (!uid) return res.json({ ok:false, error:'no user' });
  const farm = farmStore.get(uid);
  if (!farm) return res.json({ ok:false, error:'farm not found' });
  if (index < 0 || index >= farm.plots.length) return res.json({ ok:false, error:'bad index' });
  if (!plant_id) return res.json({ ok:false, error:'missing plant_id' });
  if (farm.plots[index].plant_id) return res.json({ ok:false, error:'plot occupied' });
  if (!farm.seeds[plant_id] || farm.seeds[plant_id] <= 0) return res.json({ ok:false, error:'no seeds' });

  farm.seeds[plant_id] -= 1;
  farm.plots[index] = { plant_id, plantedAt: Date.now(), stage: 1, wateredAt: null };

  const state = xpStore.get(uid) || { xp:0, badges:[] };
  state.xp += 1;
  if (state.xp >= 5 && !state.badges.includes('Mint Keeper')) state.badges.push('Mint Keeper');
  xpStore.set(uid, state);

  const plots = farm.plots.map(p => ({ ...p, stage: p.plant_id ? plantStage(farm, p) : 0 }));
  res.json({ ok:true, plots, seeds: farm.seeds, xp: state.xp, badges: state.badges });
});

app.post('/api/farm/water', (req, res) => {
  const uid = getUserIdFromInitData(req.header('X-TG-Init-Data') || req.body?.initData);
  const { index } = req.body || {};
  if (!uid) return res.json({ ok:false, error:'no user' });
  const farm = farmStore.get(uid);
  if (!farm) return res.json({ ok:false, error:'farm not found' });
  const plot = farm.plots[index];
  if (!plot || !plot.plant_id) return res.json({ ok:false, error:'nothing planted' });
  // Watering speeds growth: move plantedAt 10s earlier
  plot.plantedAt -= 10000;
  plot.wateredAt = Date.now();
  const plots = farm.plots.map(p => ({ ...p, stage: p.plant_id ? plantStage(farm, p) : 0 }));
  res.json({ ok:true, plots });
});

app.post('/api/farm/harvest', (req, res) => {
  const uid = getUserIdFromInitData(req.header('X-TG-Init-Data') || req.body?.initData);
  const { index } = req.body || {};
  if (!uid) return res.json({ ok:false, error:'no user' });
  const farm = farmStore.get(uid);
  if (!farm) return res.json({ ok:false, error:'farm not found' });
  const plot = farm.plots[index];
  if (!plot || !plot.plant_id) return res.json({ ok:false, error:'nothing planted' });
  const stage = plantStage(farm, plot);
  if (stage < STAGES) return res.json({ ok:false, error:'not ready' });

  // Inventory growth: produce yield + seed return chance
  const plantId = plot.plant_id;
  const baseYield = 1;
  const wateredBonus = plot.wateredAt && (Date.now() - plot.wateredAt) < 60000 ? 1 : 0; // +1 if watered in last 60s
  const biomeBonus = (BIOME_SPEED[farm.biome] < 1.0) ? 1 : 0; // faster biomes yield +1 (tropical/wetland)
  const yieldQty = baseYield + wateredBonus + biomeBonus;

  farm.produce[plantId] = (farm.produce[plantId] || 0) + yieldQty;

  // 40% chance to get 1 seed back
  if (Math.random() < 0.4) {
    farm.seeds[plantId] = (farm.seeds[plantId] || 0) + 1;
  }

  // XP
  const state = xpStore.get(uid) || { xp:0, badges:[] };
  state.xp += 2;
  if (state.xp >= 5 && !state.badges.includes('Mint Keeper')) state.badges.push('Mint Keeper');
  xpStore.set(uid, state);

  farm.plots[index] = { plant_id: null, plantedAt: null, stage: 0, wateredAt: null };
  res.json({ ok:true, plots: farm.plots, produce: farm.produce, seeds: farm.seeds, xp: state.xp, badges: state.badges });
});

// ---------------- Webhook (optional) + Bot ----------------
if (SECRET_TOKEN) app.post(`/tg/${SECRET_TOKEN}`, (req, res) => bot.handleUpdate(req.body, res));

bot.start((ctx) => {
  const url = WEBAPP_URL || 'https://example.com';
  return ctx.reply('🌱 CANA Coin Farm: open your garden to begin.',
    Markup.inlineKeyboard([[Markup.button.webApp('🚜 Open Farm', url)]])
  );
});
bot.help((ctx) => ctx.reply('Use /start to open the mini-app.'));

app.listen(PORT, () => console.log('✅ HTTP server listening on :' + PORT));
bot.launch().then(() => console.log('🤖 Bot polling started')).catch(console.error);

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
