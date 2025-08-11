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

// Health & init
app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/api/init', (_req, res) => res.json({ ok: true, message: 'CANA Coin Farm live' }));

// Plants API: Google Sheet CSV if provided; else local CSV
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
    res.status(500).json({ ok: false, error: 'Failed to load plants' });
  }
});

// Optional webhook endpoint (you’re on polling now; this can stay)
if (SECRET_TOKEN) {
  app.post(`/tg/${SECRET_TOKEN}`, (req, res) => bot.handleUpdate(req.body, res));
}

// Bot
bot.start((ctx) => {
  const url = WEBAPP_URL || 'https://example.com';
  return ctx.reply(
    '🌱 CANA Coin Farm: open your garden to begin.',
    Markup.inlineKeyboard([[Markup.button.webApp('🚜 Open Farm', url)]])
  );
});
bot.help((ctx) => ctx.reply('Use /start to open the mini-app.'));

// Start server + polling
app.listen(PORT, () => console.log('✅ HTTP server listening on :' + PORT));
bot.launch().then(() => console.log('🤖 Bot polling started')).catch(console.error);

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
