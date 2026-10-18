import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from './config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const screenshotsDir = path.join(__dirname, '..', 'docs', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// 1. Seed realistic sample data
console.log('Seeding demo data...');

// Ensure demo user exists
let demoUser = db.prepare('SELECT * FROM users WHERE username = ?').get('alex_morgan');
if (!demoUser) {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync('demo1234', salt);
  const res = db.prepare(`
    INSERT INTO users (name, username, email, password, avatar_url, location, dob, coins, total_coins_earned)
    VALUES (?, ?, ?, ?, ?, ?, ?, 350, 650)
  `).run(
    'Alex Morgan',
    'alex_morgan',
    'alex@swapit.dev',
    hash,
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    'Seattle, WA',
    '1996-05-14'
  );
  demoUser = db.prepare('SELECT * FROM users WHERE id = ?').get(res.lastInsertRowid);
}

// Ensure second user exists for other marketplace items
let sellerUser = db.prepare('SELECT * FROM users WHERE username = ?').get('sarah_connor');
if (!sellerUser) {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync('seller1234', salt);
  const res = db.prepare(`
    INSERT INTO users (name, username, email, password, avatar_url, location, dob, coins, total_coins_earned)
    VALUES (?, ?, ?, ?, ?, ?, ?, 500, 800)
  `).run(
    'Sarah Connor',
    'sarah_connor',
    'sarah@swapit.dev',
    hash,
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    'Portland, OR',
    '1994-08-22'
  );
  sellerUser = db.prepare('SELECT * FROM users WHERE id = ?').get(res.lastInsertRowid);
}

// Sample items
const sampleItems = [
  {
    owner_id: sellerUser.id,
    name: 'Sony WH-1000XM4 Wireless Noise-Cancelling Headphones',
    description: 'Barely used headphones with original travel case and cables. Superb sound quality with industry-leading active noise cancellation.',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
    condition: 'Used - Like New',
    value: 220,
    category: 'Electronics'
  },
  {
    owner_id: sellerUser.id,
    name: 'Vintage Leather Messenger Bag',
    description: 'Handcrafted full-grain leather laptop bag with brass hardware. Perfect for 15-inch laptops and books.',
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
    condition: 'Used - Good',
    value: 85,
    category: 'Apparel'
  },
  {
    owner_id: sellerUser.id,
    name: 'Mechanical Gaming Keyboard (Cherry MX Brown)',
    description: 'Tenkeyless RGB mechanical keyboard with PBT keycaps and braided USB-C cable.',
    image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',
    condition: 'Used - Like New',
    value: 110,
    category: 'Electronics'
  },
  {
    owner_id: sellerUser.id,
    name: 'Canon EF 50mm f/1.8 STM Lens',
    description: 'Compact portrait prime lens with gorgeous bokeh. Clean glass without scratches or fungus.',
    image_url: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800',
    condition: 'Used - Like New',
    value: 125,
    category: 'Electronics'
  },
  {
    owner_id: demoUser.id,
    name: 'Kindle Paperwhite 11th Gen (32GB)',
    description: 'Waterproof e-reader with adjustable warm light. Includes magnetic origami cover.',
    image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800',
    condition: 'Used - Like New',
    value: 95,
    category: 'Electronics'
  },
  {
    owner_id: demoUser.id,
    name: 'Patagonia Nano Puff Jacket (Men Size M)',
    description: 'Ultralight insulated jacket in Classic Navy. Windproof and water-resistant.',
    image_url: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800',
    condition: 'Used - Good',
    value: 120,
    category: 'Apparel'
  }
];

// Insert items if not already present
for (const item of sampleItems) {
  const existing = db.prepare('SELECT id FROM items WHERE name = ?').get(item.name);
  if (!existing) {
    db.prepare(`
      INSERT INTO items (owner_id, name, description, image_url, condition, value, category)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(item.owner_id, item.name, item.description, item.image_url, item.condition, item.value, item.category);
  }
}

// Seed sample swap
const headphoneItem = db.prepare("SELECT id FROM items WHERE name LIKE '%Headphones%'").get();
const kindleItem = db.prepare("SELECT id FROM items WHERE name LIKE '%Kindle%'").get();

if (headphoneItem && kindleItem) {
  const existingSwap = db.prepare("SELECT id FROM swaps WHERE proposer_item_id = ?").get(kindleItem.id);
  if (!existingSwap) {
    db.prepare(`
      INSERT INTO swaps (proposer_item_id, receiver_item_id, proposer_id, receiver_id, status, coin_difference, feedback_given)
      VALUES (?, ?, ?, ?, 'Pending', 125, 0)
    `).run(kindleItem.id, headphoneItem.id, demoUser.id, sellerUser.id);
  }
}

// Seed sample coin transactions for demoUser
const existingTx = db.prepare("SELECT id FROM coin_transactions WHERE user_id = ?").all(demoUser.id);
if (existingTx.length <= 1) {
  db.prepare(`
    INSERT INTO coin_transactions (user_id, type, description, amount, source)
    VALUES (?, 'Credit', 'Welcome Bonus Coins', 100, 'bonus')
  `).run(demoUser.id);
  db.prepare(`
    INSERT INTO coin_transactions (user_id, type, description, amount, source)
    VALUES (?, 'Credit', 'Completed Item Repair Challenge', 50, 'earned')
  `).run(demoUser.id);
  db.prepare(`
    INSERT INTO coin_transactions (user_id, type, description, amount, source)
    VALUES (?, 'Credit', 'Coin Top-up Pack', 200, 'purchased')
  `).run(demoUser.id);
}

// Generate token for demo user
const secret = process.env.JWT_SECRET || 'swapit_super_secret_key_2024';
const token = jwt.sign({ id: demoUser.id, username: demoUser.username }, secret, { expiresIn: '7d' });

console.log('Starting headless browser to capture screenshots...');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();

  // 1. Screenshot Login Page
  console.log('Capturing Login Page...');
  await page.goto('http://localhost:3000/#/login', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(screenshotsDir, '01-login.png'), fullPage: false });

  // 2. Set auth in localStorage and reload
  await page.evaluate((t) => {
    localStorage.setItem('authToken', t);
  }, token);
  await page.goto('http://localhost:3000/#/home', { waitUntil: 'networkidle0' });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  // 3. Screenshot Home Dashboard
  console.log('Capturing Home Dashboard...');
  await page.screenshot({ path: path.join(screenshotsDir, '02-home-dashboard.png'), fullPage: false });

  // 4. Screenshot Marketplace
  console.log('Capturing Marketplace...');
  await page.evaluate(() => { window.location.hash = '#/items'; });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(screenshotsDir, '03-marketplace.png'), fullPage: false });

  // 5. Screenshot Upload Item
  console.log('Capturing Upload Item...');
  await page.evaluate(() => { window.location.hash = '#/items/new'; });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(screenshotsDir, '04-upload-item.png'), fullPage: false });

  // 6. Screenshot Swaps Dashboard
  console.log('Capturing Swaps Dashboard...');
  await page.evaluate(() => { window.location.hash = '#/swaps'; });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(screenshotsDir, '05-swaps.png'), fullPage: false });

  // 7. Screenshot Wallet
  console.log('Capturing Wallet & SwapCoins...');
  await page.evaluate(() => { window.location.hash = '#/wallet'; });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(screenshotsDir, '06-wallet.png'), fullPage: false });

  // 8. Screenshot AI Repair Assistant
  console.log('Capturing AI Repair Assistant...');
  await page.evaluate(() => { window.location.hash = '#/repair-assistant'; });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(screenshotsDir, '07-repair-assistant.png'), fullPage: false });

  // 9. Screenshot Profile
  console.log('Capturing User Profile...');
  await page.evaluate(() => { window.location.hash = '#/profile'; });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(screenshotsDir, '08-profile.png'), fullPage: false });

  await browser.close();
  console.log('All screenshots captured successfully into docs/screenshots/!');
}

capture().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});
