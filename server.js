// ============================================
// CANA TELEGRAM WEB APP - IMMERSIVE GAME
// ============================================
// Save this as: server-telegram-app.js

import express from 'express';
import { Telegraf } from 'telegraf';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// CRITICAL: Serve the Telegram Web App
app.use(express.static('public'));

// Telegram Bot with Web App support
const bot = new Telegraf(process.env.BOT_TOKEN);

let db;

// ============================================
// GOOGLE SHEETS INTEGRATION
// ============================================
async function syncGoogleSheets() {
  const SHEET_ID = process.env.GOOGLE_SHEET_ID || '1g-psLHLZRXagO0CgAzcpwp_kLObyLkOs2xG_QijKsUI';
  const API_KEY = process.env.GOOGLE_API_KEY || 'YOUR_API_KEY';
  
  // Public sheet URL (if sheet is public)
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Plants!A1:Z500?key=${API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.values) {
      const headers = data.values[0];
      const plants = data.values.slice(1);
      
      for (const row of plants) {
        const plant = {};
        headers.forEach((header, index) => {
          plant[header] = row[index] || '';
        });
        
        // Insert into database
        await db.run(`
          INSERT OR REPLACE INTO plants (
            common_name, scientific_name, family, traditional_uses,
            growth_time, base_price, rarity, indigenous_wisdom,
            clinical_data, preparation_method
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, plant.common_name, plant.scientific_name, plant.family,
           plant.traditional_uses, 60, 10, plant.rarity || 'common',
           plant.indigenous_wisdom, plant.clinical_data, plant.preparation);
      }
      
      console.log(`✅ Synced ${plants.length} plants from Google Sheets`);
    }
  } catch (error) {
    console.error('Google Sheets sync error:', error);
  }
}

// ============================================
// ENHANCED DATABASE FOR MASSIVE GAME
// ============================================
async function initDatabase() {
  db = await open({
    filename: './game.db',
    driver: sqlite3.Database
  });
  
  await db.exec(`
    -- Enhanced users with Telegram Web App data
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id TEXT UNIQUE,
      username TEXT,
      first_name TEXT,
      last_name TEXT,
      photo_url TEXT,
      coins INTEGER DEFAULT 1000,
      gems INTEGER DEFAULT 10,
      experience INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      play_time INTEGER DEFAULT 0,
      last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
      energy INTEGER DEFAULT 100,
      max_energy INTEGER DEFAULT 100,
      land_owned INTEGER DEFAULT 1,
      total_harvests INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    -- 400+ plants from Google Sheets
    CREATE TABLE IF NOT EXISTS plants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      common_name TEXT NOT NULL,
      scientific_name TEXT,
      family TEXT,
      traditional_uses TEXT,
      indigenous_wisdom TEXT,
      clinical_data TEXT,
      preparation_method TEXT,
      growth_time INTEGER DEFAULT 60,
      base_price INTEGER DEFAULT 10,
      rarity TEXT DEFAULT 'common',
      unlock_level INTEGER DEFAULT 1,
      biome TEXT,
      image_url TEXT
    );
    
    -- World map with regions
    CREATE TABLE IF NOT EXISTS world_regions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      biome TEXT,
      climate TEXT,
      unlock_level INTEGER DEFAULT 1,
      bonus_plants TEXT,
      coordinates TEXT,
      owned_by INTEGER,
      price INTEGER DEFAULT 1000,
      FOREIGN KEY (owned_by) REFERENCES users(id)
    );
    
    -- Quests for hours of gameplay
    CREATE TABLE IF NOT EXISTS quests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      type TEXT,
      requirements TEXT,
      rewards TEXT,
      xp_reward INTEGER DEFAULT 100,
      coin_reward INTEGER DEFAULT 50,
      gem_reward INTEGER DEFAULT 0,
      repeatable BOOLEAN DEFAULT 0,
      cooldown INTEGER DEFAULT 0
    );
    
    -- Player inventory with stacking
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      item_type TEXT,
      item_id INTEGER,
      quantity INTEGER DEFAULT 1,
      quality INTEGER DEFAULT 1,
      obtained_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    
    -- Skills system
    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      skill_name TEXT NOT NULL,
      level INTEGER DEFAULT 1,
      experience INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, skill_name)
    );
    
    -- Achievements
    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      points INTEGER DEFAULT 10,
      requirement_type TEXT,
      requirement_value INTEGER
    );
    
    -- User achievements
    CREATE TABLE IF NOT EXISTS user_achievements (
      user_id INTEGER NOT NULL,
      achievement_id INTEGER NOT NULL,
      earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, achievement_id)
    );
    
    -- Crafting recipes
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT,
      ingredients TEXT,
      result_item TEXT,
      result_quantity INTEGER DEFAULT 1,
      unlock_level INTEGER DEFAULT 1,
      skill_required TEXT,
      skill_level INTEGER DEFAULT 1
    );
    
    -- Player farms with multiple plots
    CREATE TABLE IF NOT EXISTS farms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      region_id INTEGER,
      plot_number INTEGER,
      plant_id INTEGER,
      planted_at DATETIME,
      ready_at DATETIME,
      health INTEGER DEFAULT 100,
      fertilized BOOLEAN DEFAULT 0,
      watered_last DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (region_id) REFERENCES world_regions(id),
      FOREIGN KEY (plant_id) REFERENCES plants(id)
    );
  `);
  
  // Create initial world regions
  await createWorldRegions();
  
  // Create quests
  await createQuests();
  
  // Create achievements
  await createAchievements();
  
  // Sync with Google Sheets
  await syncGoogleSheets();
  
  console.log('✅ Database initialized with massive content');
}

// Create world regions for exploration
async function createWorldRegions() {
  const regions = [
    { name: 'Amazon Rainforest', biome: 'tropical', climate: 'humid', level: 1, price: 0 },
    { name: 'Himalayan Foothills', biome: 'mountain', climate: 'cold', level: 5, price: 5000 },
    { name: 'African Savanna', biome: 'savanna', climate: 'dry', level: 10, price: 10000 },
    { name: 'Mediterranean Coast', biome: 'mediterranean', climate: 'mild', level: 15, price: 20000 },
    { name: 'Siberian Tundra', biome: 'tundra', climate: 'arctic', level: 20, price: 50000 },
    { name: 'Australian Outback', biome: 'desert', climate: 'arid', level: 25, price: 75000 },
    { name: 'Japanese Islands', biome: 'temperate', climate: 'seasonal', level: 30, price: 100000 },
    { name: 'Pacific Islands', biome: 'island', climate: 'tropical', level: 35, price: 150000 },
    { name: 'Nordic Forests', biome: 'boreal', climate: 'cold', level: 40, price: 200000 },
    { name: 'Andean Highlands', biome: 'highland', climate: 'alpine', level: 45, price: 300000 }
  ];
  
  for (const region of regions) {
    await db.run(`
      INSERT OR IGNORE INTO world_regions (name, biome, climate, unlock_level, price)
      VALUES (?, ?, ?, ?, ?)
    `, region.name, region.biome, region.climate, region.level, region.price);
  }
}

// Create engaging quests
async function createQuests() {
  const quests = [
    // Tutorial quests
    { name: 'First Seeds', desc: 'Plant your first medicinal herb', type: 'plant', req: 1, coins: 100, xp: 50 },
    { name: 'Harvest Moon', desc: 'Harvest 5 plants', type: 'harvest', req: 5, coins: 200, xp: 100 },
    { name: 'Green Thumb', desc: 'Reach farming level 5', type: 'skill', req: 5, coins: 500, xp: 250 },
    
    // Daily quests
    { name: 'Daily Harvest', desc: 'Harvest 20 plants today', type: 'daily_harvest', req: 20, coins: 300, xp: 150, repeat: true },
    { name: 'Herbalist', desc: 'Craft 5 herbal remedies', type: 'craft', req: 5, coins: 400, xp: 200, repeat: true },
    
    // Story quests
    { name: 'The Healer\'s Path', desc: 'Learn about 10 medicinal plants', type: 'learn', req: 10, coins: 1000, xp: 500, gems: 5 },
    { name: 'Indigenous Wisdom', desc: 'Unlock indigenous knowledge for 5 plants', type: 'wisdom', req: 5, coins: 2000, xp: 1000, gems: 10 },
    { name: 'Continental Explorer', desc: 'Unlock 3 different regions', type: 'explore', req: 3, coins: 5000, xp: 2000, gems: 20 },
    
    // Epic quests
    { name: 'Master Botanist', desc: 'Collect 100 different plant species', type: 'collect', req: 100, coins: 50000, xp: 10000, gems: 100 },
    { name: 'Ecological Hero', desc: 'Plant 1000 trees', type: 'plant', req: 1000, coins: 100000, xp: 25000, gems: 250 }
  ];
  
  for (const quest of quests) {
    await db.run(`
      INSERT OR IGNORE INTO quests (name, description, type, requirements, coin_reward, xp_reward, gem_reward, repeatable)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, quest.name, quest.desc, quest.type, quest.req, quest.coins, quest.xp, quest.gems || 0, quest.repeat || 0);
  }
}

// Create achievements for long-term goals
async function createAchievements() {
  const achievements = [
    { name: 'Seedling', desc: 'Plant your first seed', type: 'plant_count', value: 1, points: 10 },
    { name: 'Gardener', desc: 'Plant 100 seeds', type: 'plant_count', value: 100, points: 50 },
    { name: 'Farmer', desc: 'Plant 1000 seeds', type: 'plant_count', value: 1000, points: 100 },
    { name: 'Wealthy', desc: 'Earn 10,000 coins', type: 'coins_earned', value: 10000, points: 75 },
    { name: 'Millionaire', desc: 'Earn 1,000,000 coins', type: 'coins_earned', value: 1000000, points: 500 },
    { name: 'Collector', desc: 'Collect 50 different plants', type: 'species_collected', value: 50, points: 200 },
    { name: 'Explorer', desc: 'Unlock all regions', type: 'regions_unlocked', value: 10, points: 300 },
    { name: 'Wise One', desc: 'Learn 100 indigenous wisdom entries', type: 'wisdom_learned', value: 100, points: 400 },
    { name: 'Dedicated', desc: 'Play for 30 days', type: 'days_played', value: 30, points: 250 },
    { name: 'Legend', desc: 'Reach level 100', type: 'level', value: 100, points: 1000 }
  ];
  
  for (const ach of achievements) {
    await db.run(`
      INSERT OR IGNORE INTO achievements (name, description, requirement_type, requirement_value, points)
      VALUES (?, ?, ?, ?, ?)
    `, ach.name, ach.desc, ach.type, ach.value, ach.points);
  }
}

// ============================================
// TELEGRAM WEB APP ENDPOINTS
// ============================================

// Telegram Web App authentication
app.post('/api/telegram/auth', async (req, res) => {
  const { initData } = req.body;
  
  // Parse Telegram init data
  const urlParams = new URLSearchParams(initData);
  const user = JSON.parse(urlParams.get('user'));
  
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Create or update user
  let dbUser = await db.get('SELECT * FROM users WHERE telegram_id = ?', user.id.toString());
  
  if (!dbUser) {
    // New user - give bonus rewards!
    await db.run(`
      INSERT INTO users (telegram_id, username, first_name, last_name, photo_url, coins, gems)
      VALUES (?, ?, ?, ?, ?, 1000, 10)
    `, user.id, user.username, user.first_name, user.last_name, user.photo_url);
    
    dbUser = await db.get('SELECT * FROM users WHERE telegram_id = ?', user.id.toString());
    
    // Create starting farm plots
    for (let i = 1; i <= 9; i++) {
      await db.run(`
        INSERT INTO farms (user_id, region_id, plot_number)
        VALUES (?, 1, ?)
      `, dbUser.id, i);
    }
  } else {
    // Update last active
    await db.run('UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = ?', dbUser.id);
  }
  
  res.json({
    success: true,
    user: dbUser,
    newPlayer: !dbUser
  });
});

// Get game state
app.get('/api/game/state/:userId', async (req, res) => {
  const userId = req.params.userId;
  
  const user = await db.get('SELECT * FROM users WHERE id = ?', userId);
  const farms = await db.all(`
    SELECT f.*, p.common_name, p.growth_time, p.base_price, r.name as region_name
    FROM farms f
    LEFT JOIN plants p ON f.plant_id = p.id
    LEFT JOIN world_regions r ON f.region_id = r.id
    WHERE f.user_id = ?
  `, userId);
  
  const inventory = await db.all(`
    SELECT i.*, p.common_name 
    FROM inventory i
    LEFT JOIN plants p ON i.item_id = p.id
    WHERE i.user_id = ?
  `, userId);
  
  const skills = await db.all('SELECT * FROM skills WHERE user_id = ?', userId);
  const quests = await db.all('SELECT * FROM quests WHERE repeatable = 1 OR id NOT IN (SELECT quest_id FROM user_quests WHERE user_id = ?)', userId);
  const regions = await db.all('SELECT * FROM world_regions');
  
  res.json({
    user,
    farms,
    inventory,
    skills,
    quests,
    regions,
    serverTime: new Date()
  });
});

// Plant action
app.post('/api/game/plant', async (req, res) => {
  const { userId, plantId, plotId } = req.body;
  
  // Get plant info
  const plant = await db.get('SELECT * FROM plants WHERE id = ?', plantId);
  const user = await db.get('SELECT * FROM users WHERE id = ?', userId);
  
  if (user.coins < plant.base_price) {
    return res.json({ success: false, message: 'Not enough coins!' });
  }
  
  // Plant it
  const readyTime = new Date(Date.now() + plant.growth_time * 1000); // Using seconds for faster testing
  
  await db.run(`
    UPDATE farms 
    SET plant_id = ?, planted_at = CURRENT_TIMESTAMP, ready_at = ?, health = 100
    WHERE user_id = ? AND plot_number = ?
  `, plantId, readyTime.toISOString(), userId, plotId);
  
  // Deduct coins
  await db.run('UPDATE users SET coins = coins - ? WHERE id = ?', plant.base_price, userId);
  
  // Add XP
  await db.run('UPDATE users SET experience = experience + 5 WHERE id = ?', userId);
  
  // Update farming skill
  await db.run(`
    INSERT INTO skills (user_id, skill_name, experience)
    VALUES (?, 'farming', 10)
    ON CONFLICT(user_id, skill_name) 
    DO UPDATE SET experience = experience + 10
  `, userId);
  
  res.json({ 
    success: true, 
    message: `${plant.common_name} planted!`,
    readyAt: readyTime
  });
});

// Harvest action
app.post('/api/game/harvest', async (req, res) => {
  const { userId, plotId } = req.body;
  
  const farm = await db.get(`
    SELECT f.*, p.common_name, p.base_price 
    FROM farms f
    JOIN plants p ON f.plant_id = p.id
    WHERE f.user_id = ? AND f.plot_number = ?
  `, userId, plotId);
  
  if (!farm || !farm.plant_id) {
    return res.json({ success: false, message: 'Nothing to harvest!' });
  }
  
  const now = new Date();
  const ready = new Date(farm.ready_at);
  
  if (now < ready) {
    return res.json({ success: false, message: 'Not ready yet!' });
  }
  
  // Calculate rewards (with quality bonus)
  const qualityBonus = 1 + (Math.random() * 0.5); // 1x to 1.5x
  const coins = Math.floor(farm.base_price * 3 * qualityBonus);
  const xp = 20;
  
  // Give rewards
  await db.run('UPDATE users SET coins = coins + ?, experience = experience + ?, total_harvests = total_harvests + 1 WHERE id = ?', 
    coins, xp, userId);
  
  // Add to inventory
  await db.run(`
    INSERT INTO inventory (user_id, item_type, item_id, quantity)
    VALUES (?, 'plant', ?, 1)
    ON CONFLICT DO UPDATE SET quantity = quantity + 1
  `, userId, farm.plant_id);
  
  // Clear plot
  await db.run(`
    UPDATE farms 
    SET plant_id = NULL, planted_at = NULL, ready_at = NULL, health = 100
    WHERE user_id = ? AND plot_number = ?
  `, userId, plotId);
  
  // Check for level up
  const user = await db.get('SELECT * FROM users WHERE id = ?', userId);
  const newLevel = Math.floor(user.experience / 100) + 1;
  if (newLevel > user.level) {
    await db.run('UPDATE users SET level = ? WHERE id = ?', newLevel, userId);
    return res.json({
      success: true,
      message: `Harvested ${farm.common_name}! +${coins} coins! LEVEL UP! Now level ${newLevel}!`,
      coins,
      xp,
      levelUp: true,
      newLevel
    });
  }
  
  res.json({
    success: true,
    message: `Harvested ${farm.common_name}! +${coins} coins, +${xp} XP`,
    coins,
    xp
  });
});

// Get plant library (from Google Sheets data)
app.get('/api/plants/library', async (req, res) => {
  const plants = await db.all(`
    SELECT * FROM plants 
    ORDER BY common_name 
    LIMIT 100
  `);
  res.json(plants);
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
  const leaders = await db.all(`
    SELECT username, level, experience, coins, total_harvests 
    FROM users 
    ORDER BY level DESC, experience DESC 
    LIMIT 50
  `);
  res.json(leaders);
});

// ============================================
// TELEGRAM BOT COMMANDS (Simple)
// ============================================
bot.command('start', async (ctx) => {
  const webAppUrl = `https://${process.env.RENDER_EXTERNAL_HOSTNAME || 'localhost:3000'}`;
  
  await ctx.reply(
    '🌿 Welcome to CANA Coin Farm! 🌿\n\n' +
    'Click the button below to play the game:',
    {
      reply_markup: {
        inline_keyboard: [[
          { text: '🎮 Play Game', web_app: { url: webAppUrl } }
        ]]
      }
    }
  );
});

// ============================================
// START SERVER
// ============================================
async function start() {
  console.log('🌱 Starting CANA Telegram Web App...');
  
  await initDatabase();
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 Web App URL: https://${process.env.RENDER_EXTERNAL_HOSTNAME || 'localhost:' + PORT}`);
  });
  
  // Set webhook for production
  if (process.env.NODE_ENV === 'production' && process.env.RENDER_EXTERNAL_HOSTNAME) {
    const webhookUrl = `https://${process.env.RENDER_EXTERNAL_HOSTNAME}/webhook`;
    await bot.telegram.setWebhook(webhookUrl);
    app.use('/webhook', bot.webhookCallback('/webhook'));
    console.log('✅ Webhook set for Telegram bot');
  } else {
    bot.launch();
    console.log('✅ Bot running in polling mode');
  }
  
  // Graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

start().catch(console.error);
