# CANA Coin Farm — Telegram Bot + Mini-App Starter

This package gives you a working Telegram bot for `@canacoinfarmbot` and a mini-app UI that opens inside Telegram.

## Quick Deploy (Render)
1. Unzip files
2. Duplicate `.env.example` → `.env`
3. Paste your BotFather token for `@canacoinfarmbot`
4. Deploy on Render
   - Build: npm install
   - Start: npm start
   - Env vars: BOT_TOKEN, SECRET_TOKEN (random string), leave WEBAPP_URL empty
5. After first deploy, copy the public URL and set as WEBAPP_URL, then redeploy
6. DM /start to @canacoinfarmbot → tap "🚜 Open Farm"

