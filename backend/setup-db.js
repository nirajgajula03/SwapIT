import mysql from 'mysql2/promise';
import 'dotenv/config';

async function setupDatabase() {
  let connection;

  try {
    const host = process.env.DB_HOST || 'localhost';
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
    const dbName = process.env.DB_NAME || 'swapit';

    console.log(`[setup-db] Connecting to MySQL server at ${host}:${port} as ${user}...`);

    connection = await mysql.createConnection({
      host,
      user,
      password,
      port,
      multipleStatements: true
    });

    console.log('[setup-db] Connected to MySQL. Ensuring database exists...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.query(`USE \`${dbName}\`;`);

    console.log('[setup-db] Creating table: users...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) DEFAULT '',
        password VARCHAR(255) NOT NULL,
        avatar_url TEXT DEFAULT '',
        location VARCHAR(255) DEFAULT '',
        dob VARCHAR(50) DEFAULT '',
        coins INT DEFAULT 100,
        total_coins_earned INT DEFAULT 100,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('[setup-db] Creating table: items...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        owner_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        image_url TEXT,
        \`condition\` ENUM('New','Used - Like New','Used - Good','Used - Fair') DEFAULT 'Used - Good',
        value INT DEFAULT 0,
        category ENUM('Electronics','Apparel','Furniture','Collectibles','Other') DEFAULT 'Other',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    console.log('[setup-db] Creating table: swaps...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS swaps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        proposer_item_id INT NOT NULL,
        receiver_item_id INT NOT NULL,
        proposer_id INT NOT NULL,
        receiver_id INT NOT NULL,
        status ENUM('Pending','Accepted','Completed','Rejected') DEFAULT 'Pending',
        coin_difference INT DEFAULT 0,
        feedback_given BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (proposer_item_id) REFERENCES items(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_item_id) REFERENCES items(id) ON DELETE CASCADE,
        FOREIGN KEY (proposer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    console.log('[setup-db] Creating table: coin_transactions...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS coin_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type ENUM('Credit','Debit') NOT NULL,
        description VARCHAR(255),
        amount INT NOT NULL,
        source ENUM('earned','purchased','bonus','swap') DEFAULT 'earned',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expiry_date TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    console.log('[setup-db] SUCCESS: Database and all tables set up successfully!');
  } catch (error) {
    console.error('[setup-db] FAILURE: An error occurred while setting up the database:');
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('[setup-db] MySQL connection closed.');
    }
  }
}

setupDatabase();
