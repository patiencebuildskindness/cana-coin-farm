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

// ---------------- XP (in-memory, alpha) ----------------
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

// ---------------- Plants API (sheet or CSV) ----------------
app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/api/init', (_req, res) => res.json({ ok: true, message: 'CANA Coin Farm live' }));

app.get('/api/plants', async (_req, res) => {
  try {
    if (SHEET_CSV_URL) {
      const r = await fetch(SHEET_CSV_URL);
      if (!r.ok) throw new Error('Sheet fetch failed');
      const csvText = await r.text();
      const csvtojson = (await import('csvtojson')).default;
      const plants = await csvtojson().fromString(csvText);
      return res.json({ ok: true, plants });
    }
    const csvtojson = (await import('csvtojson')).default;
    const csvPath = path.join(__dirname, 'data', 'game_plants.csv');
    if (!fs.existsSync(csvPath)) return res.json({ ok: true, plants: [] });
    const plants = await csvtojson().fromFile(csvPath);
    return res.json({ ok: true, plants });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok:false, error:'Failed to load plants' });
  }
});

// ---------------- Farm state (in-memory) ----------------
// Model: per-user farm with plots, seeds inventory
// plot = { plant_id:null|string, plantedAt:null|number(ms), stage:0..3, wateredAt:null|number }
// growth: 3 stages, 30s per stage (configurable)
const farmStore = new Map(); // uid -> { plots:[], seeds:{[plant_id]:qty} }

const GRID_SIZE = 6;             // 6x6 grid
const STAGES = 3;                // seedling -> mid -> mature
const STAGE_MS = 30000;          // 30s per stage (demo speed)

function ensureFarm(uid, plantCatalog = []) {
  let farm = farmStore.get(uid);
  if (!farm) {
    // seed with 8 random seeds from catalog (or first 8)
    const seeds = {};
    (plantCatalog.slice(0, 8)).forEach(p => {
      const id = (p.scientific_name || p.common_name || '').trim();
      if (id) seeds[id] = 3; // 3 seeds each
    });
    const plots = Array.from({ length: GRID_SIZE * GRID_SIZE }, () => ({
      plant_id: null, plantedAt: null, stage: 0, wateredAt: null
    }));
    farm = { plots, seeds };
    farmStore.set(uid, farm);
  }
  return farm;
}

function currentStage(plot) {
  if (!plot.plantedAt) return 0;
  const elapsed = Date.now() - plot.plantedAt;
  const stage = Math.min(STAGES, Math.floor(elapsed / STAGE_MS) + 1);
  return stage; // 1..3 mature at 3
}

app.post('/api/farm/get', async (req, res) => {
  const uid = getUserIdFromInitData(req.header('X-TG-Init-Data') || req.body?.initData);
  if (!uid) return res.json({ ok:false, error:'no user' });
  // Load catalog (for seeding inventory if needed)
  let catalog = [];
  try {
    if (SHEET_CSV_URL) {
      const r = await fetch(SHEET_CSV_URL);
      const csvText = await r.text();
      const csvtojson = (await import('csvtojson')).default;
      catalog = await csvtojson().fromString(csvText);
    } else {
      const csvtojson = (await import('csvtojson')).default;
      const csvPath = path.join(__dirname, 'data', 'game_plants.csv');
      if (fs.existsSync(csvPath)) catalog = await csvtojson().fromFile(csvPath);
    }
  } catch {}
  const farm = ensureFarm(uid, catalog);
  // update dynamic stages
  const plots = farm.plots.map(p => ({ ...p, stage: p.plant_id ? currentStage(p) : 0 }));
  res.json({ ok:true, grid: GRID_SIZE, plots, seeds: farm.seeds });
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
  // small XP for planting
  const state = xpStore.get(uid) || { xp:0, badges:[] };
  state.xp += 1;
  if (state.xp >= 5 && !state.badges.includes('Mint Keeper')) state.badges.push('Mint Keeper');
  xpStore.set(uid, state);
  res.json({ ok:true, plots: farm.plots.map(p => ({ ...p, stage: p.plant_id ? currentStage(p) : 0 })), seeds: farm.seeds, xp: state.xp, badges: state.badges });
});

app.post('/api/farm/water', (req, res) => {
  const uid = getUserIdFromInitData(req.header('X-TG-Init-Data') || req.body?.initData);
  const { index } = req.body || {};
  if (!uid) return res.json({ ok:false, error:'no user' });
  const farm = farmStore.get(uid);
  if (!farm) return res.json({ ok:false, error:'farm not found' });
  const plot = farm.plots[index];
  if (!plot || !plot.plant_id) return res.json({ ok:false, error:'nothing planted' });
  // watering: bring plantedAt earlier by 10s (speed up growth)
  plot.plantedAt -= 10000;
  plot.wateredAt = Date.now();
  res.json({ ok:true, plots: farm.plots.map(p => ({ ...p, stage: p.plant_id ? currentStage(p) : 0 })) });
});

app.post('/api/farm/harvest', (req, res) => {
  const uid = getUserIdFromInitData(req.header('X-TG-Init-Data') || req.body?.initData);
  const { index } = req.body || {};
  if (!uid) return res.json({ ok:false, error:'no user' });
  const farm = farmStore.get(uid);
  if (!farm) return res.json({ ok:false, error:'farm not found' });
  const plot = farm.plots[index];
  if (!plot || !plot.plant_id) return res.json({ ok:false, error:'nothing planted' });
  if (currentStage(plot) < STAGES) return res.json({ ok:false, error:'not ready' });
  // grant XP for harvest, then clear plot
  const state = xpStore.get(uid) || { xp:0, badges:[] };
  state.xp += 2; // harvest worth more
  if (state.xp >= 5 && !state.badges.includes('Mint Keeper')) state.badges.push('Mint Keeper');
  xpStore.set(uid, state);
  farm.plots[index] = { plant_id: null, plantedAt: null, stage: 0, wateredAt: null };
  res.json({ ok:true, plots: farm.plots, xp: state.xp, badges: state.badges });
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
