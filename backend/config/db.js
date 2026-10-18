import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'swapit.db');
const db = Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT DEFAULT '',
    password TEXT NOT NULL,
    avatar_url TEXT DEFAULT '',
    location TEXT DEFAULT '',
    dob TEXT DEFAULT '',
    coins INTEGER DEFAULT 100,
    total_coins_earned INTEGER DEFAULT 100,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    condition TEXT DEFAULT 'Used - Good' CHECK(condition IN ('New','Used - Like New','Used - Good','Used - Fair')),
    value INTEGER DEFAULT 0,
    category TEXT DEFAULT 'Other' CHECK(category IN ('Electronics','Apparel','Furniture','Collectibles','Other')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS swaps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    proposer_item_id INTEGER NOT NULL,
    receiver_item_id INTEGER NOT NULL,
    proposer_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending','Accepted','Completed','Rejected')),
    coin_difference INTEGER DEFAULT 0,
    feedback_given INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proposer_item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (proposer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS coin_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('Credit','Debit')),
    description TEXT,
    amount INTEGER NOT NULL,
    source TEXT DEFAULT 'earned' CHECK(source IN ('earned','purchased','bonus','swap')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expiry_date DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

export default db;
