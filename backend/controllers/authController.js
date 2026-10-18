import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

const getBadge = (coins) => {
  if (coins < 100) return 'Bronze';
  if (coins < 500) return 'Silver';
  if (coins < 1000) return 'Gold';
  return 'Platinum';
};

const buildUserProfile = (userId) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user) return null;

  const itemsCount = db.prepare('SELECT COUNT(*) as count FROM items WHERE owner_id = ?').get(userId);
  const swapsCount = db.prepare(
    'SELECT COUNT(*) as count FROM swaps WHERE (proposer_id = ? OR receiver_id = ?) AND status IN (\'Accepted\', \'Completed\')'
  ).get(userId, userId);

  const coins = Number(user.coins) || 0;
  const memberSince = user.created_at ? user.created_at.split(' ')[0] : '';

  return {
    id: user.id,
    name: user.name || '',
    username: user.username,
    email: user.email || '',
    avatarUrl: user.avatar_url || '',
    location: user.location || '',
    memberSince,
    coins,
    itemsListed: Number(itemsCount?.count) || 0,
    swapsCompleted: Number(swapsCount?.count) || 0,
    dob: user.dob || '',
    badge: getBadge(coins),
    totalCoinsEarned: Number(user.total_coins_earned) || 0
  };
};

export const signup = async (req, res) => {
  try {
    const { name, username, password, dob, avatarUrl, location, email } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({ message: 'Name, username, and password are required.' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existing) {
      return res.status(400).json({ message: 'Username is already taken.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = db.prepare(
      `INSERT INTO users (name, username, email, password, avatar_url, location, dob, coins, total_coins_earned)
       VALUES (?, ?, ?, ?, ?, ?, ?, 100, 100)`
    ).run(name, username, email || '', hashedPassword, avatarUrl || '', location || '', dob || '');

    const userId = result.lastInsertRowid;

    // Welcome bonus transaction
    db.prepare(
      `INSERT INTO coin_transactions (user_id, type, description, amount, source)
       VALUES (?, 'Credit', 'Welcome Bonus', 100, 'bonus')`
    ).run(userId);

    const secret = process.env.JWT_SECRET || 'swapit_super_secret_key_2024';
    const token = jwt.sign({ id: Number(userId), username }, secret, { expiresIn: '7d' });

    const userProfile = buildUserProfile(Number(userId));

    return res.status(201).json({
      token,
      user: userProfile,
      message: 'User registered successfully.'
    });
  } catch (error) {
    console.error('Error in signup:', error);
    return res.status(500).json({ message: 'Internal server error during registration.' });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password.' });
    }

    const secret = process.env.JWT_SECRET || 'swapit_super_secret_key_2024';
    const token = jwt.sign({ id: user.id, username: user.username }, secret, { expiresIn: '7d' });

    const userProfile = buildUserProfile(user.id);

    return res.json({
      token,
      user: userProfile,
      message: 'Login successful.'
    });
  } catch (error) {
    console.error('Error in login:', error);
    return res.status(500).json({ message: 'Internal server error during login.' });
  }
};

export const getMe = async (req, res) => {
  try {
    const profile = buildUserProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.json(profile);
  } catch (error) {
    console.error('Error in getMe:', error);
    return res.status(500).json({ message: 'Internal server error fetching user profile.' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const name = req.body.name !== undefined ? req.body.name : user.name;
    const email = req.body.email !== undefined ? req.body.email : user.email;
    const avatarUrl = req.body.avatarUrl !== undefined
      ? req.body.avatarUrl
      : (req.body.avatar_url !== undefined ? req.body.avatar_url : user.avatar_url);
    const location = req.body.location !== undefined ? req.body.location : user.location;
    const dob = req.body.dob !== undefined ? req.body.dob : user.dob;

    db.prepare(
      `UPDATE users SET name = ?, email = ?, avatar_url = ?, location = ?, dob = ? WHERE id = ?`
    ).run(name, email, avatarUrl, location, dob, req.user.id);

    const updatedProfile = buildUserProfile(req.user.id);
    return res.json(updatedProfile);
  } catch (error) {
    console.error('Error in updateUser:', error);
    return res.status(500).json({ message: 'Internal server error updating user profile.' });
  }
};

export const addCoins = async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Valid coin amount is required.' });
    }

    db.prepare(
      `UPDATE users SET coins = coins + ?, total_coins_earned = total_coins_earned + ? WHERE id = ?`
    ).run(amount, amount, req.user.id);

    db.prepare(
      `INSERT INTO coin_transactions (user_id, type, description, amount, source)
       VALUES (?, 'Credit', 'Purchased Coins', ?, 'purchased')`
    ).run(req.user.id, amount);

    const updatedProfile = buildUserProfile(req.user.id);
    return res.json(updatedProfile);
  } catch (error) {
    console.error('Error in addCoins:', error);
    return res.status(500).json({ message: 'Internal server error adding coins.' });
  }
};
