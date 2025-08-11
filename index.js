import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Telegraf, Markup } from 'telegraf';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { BOT_TOKEN, WEBAPP_URL, SECRET_TOKEN, PORT = 3000 } = process.env;

if (!BOT_TOKEN) {
  console.error("❌ Missing BOT_TOKEN in environment");
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
const app = express();

// Static site
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simple API
app.get('/api/init', (_req, res) => {
  res.json({ ok: true, message: 'CANA Coin Farm mini-app is live.' });
});
app.get('/health', (_req, res) => res.json({ ok: true }));

// Webhook optional
if (SECRET_TOKEN) {
  app.post(`/tg/${SECRET_TOKEN}`, (req, res) => bot.handleUpdate(req.body, res));
}

// Telegram bot start
bot.start((ctx) => {
  const url = WEBAPP_URL || 'https://example.com';
  return ctx.reply(
    '🌱 Welcome to CANA Coin Farm!\nLearn, grow, and earn by exploring medicinal plants.',
    Markup.inlineKeyboard([[Markup.button.webApp('🚜 Open Farm', url)]])
  );
});

bot.help((ctx) => ctx.reply('Use /start to open the CANA Coin Farm mini-app.'));

// Start server and polling
app.listen(PORT, () => console.log('✅ HTTP server listening on :' + PORT));
bot.launch().then(() => console.log('🤖 Bot polling started')).catch(err => console.error(err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
