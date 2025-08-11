import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Telegraf, Markup } from 'telegraf';
import fs from 'fs';
import csv from 'csvtojson';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { BOT_TOKEN, WEBAPP_URL, SECRET_TOKEN, PORT = 3000 } = process.env;
if (!BOT_TOKEN) { console.error("❌ Missing BOT_TOKEN"); process.exit(1); }

const bot = new Telegraf(BOT_TOKEN);
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Health
app.get('/health', (_req,res)=>res.json({ok:true}));

// Init
app.get('/api/init', (_req,res)=>res.json({ok:true,message:'CANA Coin Farm live'}));

// Plants API (reads CSV from /data/game_plants.csv)
app.get('/api/plants', async (_req, res) => {
  try {
    const csvPath = path.join(__dirname, 'data', 'game_plants.csv');
    if (!fs.existsSync(csvPath)) return res.json({ ok: true, plants: [] });
    const plants = await csv().fromFile(csvPath);
    res.json({ ok: true, plants });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok:false, error:'Failed to load plants' });
  }
});

// Webhook optional
if (SECRET_TOKEN) {
  app.post(`/tg/${SECRET_TOKEN}`, (req, res) => bot.handleUpdate(req.body, res));
}

// Bot
bot.start((ctx)=>{
  const url = WEBAPP_URL || 'https://example.com';
  return ctx.reply('🌱 CANA Coin Farm: open your garden to begin.',
    Markup.inlineKeyboard([[Markup.button.webApp('🚜 Open Farm', url)]]));
});
bot.help((ctx)=>ctx.reply('Use /start to open the mini-app.'));

// Start
app.listen(PORT, ()=>console.log('✅ HTTP on :' + PORT));
bot.launch().then(()=>console.log('🤖 Bot polling started')).catch(console.error);

// Graceful
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
