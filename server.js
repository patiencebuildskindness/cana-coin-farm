import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

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
    
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      plant_id INTEGER,
      quantity INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (plant_id) REFERENCES plants(id)
    );
  `);
  
  // Add some default plants
  const count = await db.get('SELECT COUNT(*) as count FROM plants');
  if (count.count === 0) {
    await db.exec(`
      INSERT INTO plants (name, growth_time, base_price, rarity) VALUES
      ('Aloe Vera', 30, 15, 'common'),
      ('Chamomile', 45, 20, 'common'),
      ('Lavender', 60, 25, 'uncommon'),
      ('Ginseng', 180, 100, 'rare'),
      ('Ashwagandha', 120, 50, 'uncommon');
    `);
  }
  
  // Create default user if none exists
  const userCount = await db.get('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    await db.run('INSERT INTO users (username) VALUES (?)', 'player1');
  }
  
  console.log('✅ Database initialized');
}

// API Routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'CANA Coin Farm API is working!', version: '1.0.0' });
});

app.get('/api/plants', async (req, res) => {
  const plants = await db.all('SELECT * FROM plants ORDER BY name');
  res.json(plants);
});

app.get('/api/user/:id', async (req, res) => {
  const user = await db.get('SELECT * FROM users WHERE id = ?', req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
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
  
  // Check if user has enough coins
  const user = await db.get('SELECT * FROM users WHERE id = ?', userId);
  const plant = await db.get('SELECT * FROM plants WHERE id = ?', plantId);
  
  if (!user || !plant) {
    return res.json({ success: false, message: 'Invalid user or plant' });
  }
  
  if (user.coins < plant.base_price) {
    return res.json({ success: false, message: 'Not enough coins!' });
  }
  
  // Plant the crop
  const readyTime = new Date(Date.now() + plant.growth_time * 60000);
  await db.run(`
    INSERT INTO user_crops (user_id, plant_id, plot_id, ready_at)
    VALUES (?, ?, ?, ?)
  `, userId, plantId, plotId, readyTime.toISOString());
  
  // Deduct coins
  await db.run('UPDATE users SET coins = coins - ? WHERE id = ?', plant.base_price, userId);
  
  res.json({ 
    success: true, 
    message: `${plant.name} planted! Ready in ${plant.growth_time} minutes.` 
  });
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
    return res.json({ success: false, message: 'No crop to harvest!' });
  }
  
  const now = new Date();
  const readyTime = new Date(crop.ready_at);
  
  if (now < readyTime) {
    const minutesLeft = Math.ceil((readyTime - now) / 60000);
    return res.json({ success: false, message: `Not ready! ${minutesLeft} minutes remaining.` });
  }
  
  // Calculate reward
  const reward = crop.base_price * 2;
  
  // Update crop status
  await db.run('UPDATE user_crops SET status = "harvested" WHERE id = ?', crop.id);
  
  // Give coins and XP
  await db.run(`
    UPDATE users 
    SET coins = coins + ?, experience = experience + 10 
    WHERE id = ?
  `, reward, userId);
  
  res.json({ 
    success: true, 
    message: `Harvested ${crop.name}! +${reward} coins, +10 XP` 
  });
});

// Start server
async function start() {
  console.log('🌱 Starting CANA Coin Farm...');
  
  await initDatabase();
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log('🌐 Open your browser to http://localhost:3000');
  });
}

start().catch(console.error);
