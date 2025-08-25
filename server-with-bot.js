import express from 'express';
import { Telegraf } from 'telegraf';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Telegram Bot
const bot = new Telegraf(process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE');

let db;

// Initialize database
async function initDatabase() {
  db = await open({
    filename: './game.db',
    driver: sqlite3.Database
  });
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id TEXT UNIQUE,
      username TEXT UNIQUE NOT NULL,
      coins INTEGER DEFAULT 100,
      gems INTEGER DEFAULT 5,
      experience INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      energy INTEGER DEFAULT 100,
      max_energy INTEGER DEFAULT 100,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS plants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      growth_time INTEGER DEFAULT 60,
      base_price INTEGER DEFAULT 10,
      rarity TEXT DEFAULT 'common'
    );
    
    CREATE TABLE IF NOT EXISTS user_crops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      plant_id INTEGER NOT NULL,
      plot_id INTEGER NOT NULL,
      planted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ready_at DATETIME,
      status TEXT DEFAULT 'growing',
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (plant_id) REFERENCES plants(id)
    );
  `);
  
  // Add default plants
  const count = await db.get('SELECT COUNT(*) as count FROM plants');
  if (count.count === 0) {
    await db.exec(`
      INSERT INTO plants (name, growth_time, base_price, rarity) VALUES
      ('Aloe Vera', 1, 15, 'common'),
      ('Chamomile', 2, 20, 'common'),
      ('Lavender', 3, 25, 'uncommon'),
      ('Ginseng', 5, 100, 'rare'),
      ('Ashwagandha', 4, 50, 'uncommon');
    `);
  }
  
  // Create default user
  const userCount = await db.get('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    await db.run('INSERT INTO users (username) VALUES (?)', 'player1');
  }
  
  console.log('✅ Database initialized');
}

// Helper functions
async function getUserByTelegramId(telegramId) {
  return await db.get('SELECT * FROM users WHERE telegram_id = ?', telegramId);
}

async function createUser(username, telegramId) {
  try {
    const result = await db.run(
      'INSERT INTO users (username, telegram_id) VALUES (?, ?)',
      username, telegramId
    );
    return result.lastID;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

// Telegram Bot Commands
bot.start(async (ctx) => {
  const telegramId = ctx.from.id.toString();
  const username = ctx.from.username || `player_${ctx.from.id}`;
  
  let user = await getUserByTelegramId(telegramId);
  if (!user) {
    const userId = await createUser(username, telegramId);
    user = await db.get('SELECT * FROM users WHERE id = ?', userId);
  }
  
  await ctx.reply(
    `🌿 Welcome to CANA Coin Farm! 🌿\n\n` +
    `You have ${user.coins} coins and ${user.energy} energy.\n\n` +
    `Commands:\n` +
    `/farm - View your farm\n` +
    `/plant - Plant crops\n` +
    `/harvest - Harvest ready crops\n` +
    `/stats - View your stats\n` +
    `/help - Show commands`
  );
});

bot.command('farm', async (ctx) => {
  const user = await getUserByTelegramId(ctx.from.id.toString());
  if (!user) return ctx.reply('Please /start first!');
  
  const crops = await db.all(`
    SELECT c.*, p.name as plant_name, p.growth_time 
    FROM user_crops c 
    JOIN plants p ON c.plant_id = p.id
    WHERE c.user_id = ? AND c.status = 'growing'
  `, user.id);
  
  let farmView = '🏡 YOUR FARM 🏡\n\n';
  
  for (let i = 1; i <= 6; i++) {
    const crop = crops.find(c => c.plot_id === i);
    
    if (crop) {
      const now = new Date();
      const ready = new Date(crop.ready_at);
      const isReady = now >= ready;
      const timeLeft = Math.ceil((ready - now) / 60000);
      
      farmView += `Plot ${i}: ${crop.plant_name} ${isReady ? '✅ READY!' : `⏰ ${timeLeft}min`}\n`;
    } else {
      farmView += `Plot ${i}: 🌱 Empty\n`;
    }
  }
  
  farmView += `\n💰 Coins: ${user.coins}\n`;
  farmView += `⚡ Energy: ${user.energy}/${user.max_energy}`;
  
  await ctx.reply(farmView);
});

bot.command('plant', async (ctx) => {
  const user = await getUserByTelegramId(ctx.from.id.toString());
  if (!user) return ctx.reply('Please /start first!');
  
  const plants = await db.all('SELECT * FROM plants ORDER BY base_price');
  
  let plantList = '🌱 Available Plants:\n\n';
  plants.forEach((p, i) => {
    plantList += `${i+1}. ${p.name} - ${p.base_price} coins (${p.growth_time}min)\n`;
  });
  
  plantList += '\nUse: /plant [number] [plot]\nExample: /plant 1 3';
  
  await ctx.reply(plantList);
});

bot.command('harvest', async (ctx) => {
  const user = await getUserByTelegramId(ctx.from.id.toString());
  if (!user) return ctx.reply('Please /start first!');
  
  const crops = await db.all(`
    SELECT c.*, p.name, p.base_price 
    FROM user_crops c 
    JOIN plants p ON c.plant_id = p.id
    WHERE c.user_id = ? AND c.status = 'growing' AND datetime(c.ready_at) <= datetime('now')
  `, user.id);
  
  if (crops.length === 0) {
    return ctx.reply('No crops ready to harvest! Check /farm');
  }
  
  let totalCoins = 0;
  for (const crop of crops) {
    const reward = crop.base_price * 2;
    totalCoins += reward;
    
    await db.run('UPDATE user_crops SET status = "harvested" WHERE id = ?', crop.id);
  }
  
  await db.run('UPDATE users SET coins = coins + ? WHERE id = ?', totalCoins, user.id);
  
  await ctx.reply(`🌾 Harvested ${crops.length} crops!\n💰 Earned: ${totalCoins} coins`);
});

bot.command('stats', async (ctx) => {
  const user = await getUserByTelegramId(ctx.from.id.toString());
  if (!user) return ctx.reply('Please /start first!');
  
  await ctx.reply(
    `📊 YOUR STATS 📊\n\n` +
    `👤 Player: ${user.username}\n` +
    `💰 Coins: ${user.coins}\n` +
    `💎 Gems: ${user.gems}\n` +
    `⭐ Level: ${user.level}\n` +
    `✨ XP: ${user.experience}\n` +
    `⚡ Energy: ${user.energy}/${user.max_energy}`
  );
});

// API Routes (for web interface)
app.get('/api/test', (req, res) => {
  res.json({ message: 'API working!' });
});

app.get('/api/plants', async (req, res) => {
  const plants = await db.all('SELECT * FROM plants');
  res.json(plants);
});

app.get('/api/user/:id', async (req, res) => {
  const user = await db.get('SELECT * FROM users WHERE id = ?', req.params.id);
  res.json(user);
});

app.get('/api/user/:id/farm', async (req, res) => {
  const crops = await db.all(`
    SELECT c.*, p.name as plant_name, p.growth_time 
    FROM user_crops c 
    JOIN plants p ON c.plant_id = p.id
    WHERE c.user_id = ? AND c.status = 'growing'
  `, req.params.id);
  
  res.json({ crops });
});

app.post('/api/plant', async (req, res) => {
  const { userId, plantId, plotId } = req.body;
  
  const user = await db.get('SELECT * FROM users WHERE id = ?', userId);
  const plant = await db.get('SELECT * FROM plants WHERE id = ?', plantId);
  
  if (user.coins < plant.base_price) {
    return res.json({ success: false, message: 'Not enough coins!' });
  }
  
  const readyTime = new Date(Date.now() + plant.growth_time * 60000);
  
  await db.run(`
    INSERT INTO user_crops (user_id, plant_id, plot_id, ready_at)
    VALUES (?, ?, ?, ?)
  `, userId, plantId, plotId, readyTime.toISOString());
  
  await db.run('UPDATE users SET coins = coins - ? WHERE id = ?', plant.base_price, userId);
  
  res.json({ success: true, message: `${plant.name} planted!` });
});

app.post('/api/harvest', async (req, res) => {
  const { userId, plotId } = req.body;
  
  const crop = await db.get(`
    SELECT c.*, p.name, p.base_price 
    FROM user_crops c 
    JOIN plants p ON c.plant_id = p.id
    WHERE c.user_id = ? AND c.plot_id = ? AND c.status = 'growing'
  `, userId, plotId);
  
  if (!crop) {
    return res.json({ success: false, message: 'No crop here!' });
  }
  
  const now = new Date();
  const ready = new Date(crop.ready_at);
  
  if (now < ready) {
    return res.json({ success: false, message: 'Not ready yet!' });
  }
  
  const reward = crop.base_price * 2;
  
  await db.run('UPDATE user_crops SET status = "harvested" WHERE id = ?', crop.id);
  await db.run('UPDATE users SET coins = coins + ? WHERE id = ?', reward, userId);
  
  res.json({ success: true, message: `Harvested! +${reward} coins` });
});

// Start everything
async function start() {
  console.log('🌱 Starting CANA Coin Farm...');
  
  await initDatabase();
  
  // Start Express server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
  
  // Start Telegram bot
  bot.launch();
  console.log('✅ Telegram bot started');
  
  // Graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

start().catch(console.error);
