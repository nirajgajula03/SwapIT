import db from '../config/db.js';

const formatItem = (row) => ({
  id: String(row.id),
  name: row.name,
  description: row.description || '',
  imageUrl: row.image_url || '',
  condition: row.condition || 'Used - Good',
  value: Number(row.value) || 0,
  category: row.category || 'Other',
  listedDate: row.created_at ? row.created_at.split(' ')[0] : new Date().toISOString().split('T')[0],
  owner: {
    username: row.owner_username || '',
    avatarUrl: row.owner_avatar_url || ''
  },
  distance: row.distance !== undefined ? Number(row.distance) : ((Number(row.id) * 3) % 15 + 1)
});

export const getMarketplaceItems = async (req, res) => {
  try {
    const rows = db.prepare(
      `SELECT i.*, u.username as owner_username, u.avatar_url as owner_avatar_url
       FROM items i
       JOIN users u ON i.owner_id = u.id
       WHERE i.owner_id != ?
       ORDER BY i.created_at DESC`
    ).all(req.user.id);

    return res.json(rows.map(formatItem));
  } catch (error) {
    console.error('Error in getMarketplaceItems:', error);
    return res.status(500).json({ message: 'Internal server error fetching marketplace items.' });
  }
};

export const getMyItems = async (req, res) => {
  try {
    const rows = db.prepare(
      `SELECT i.*, u.username as owner_username, u.avatar_url as owner_avatar_url
       FROM items i
       JOIN users u ON i.owner_id = u.id
       WHERE i.owner_id = ?
       ORDER BY i.created_at DESC`
    ).all(req.user.id);

    return res.json(rows.map(formatItem));
  } catch (error) {
    console.error('Error in getMyItems:', error);
    return res.status(500).json({ message: 'Internal server error fetching your items.' });
  }
};

export const addItem = async (req, res) => {
  try {
    const { name, description, imageUrl, condition, value, category } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Item name is required.' });
    }

    const img = imageUrl || req.body.image_url || '';
    const cond = condition || 'Used - Good';
    const val = Number(value) || 0;
    const cat = category || 'Other';

    const result = db.prepare(
      `INSERT INTO items (owner_id, name, description, image_url, condition, value, category)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(req.user.id, name, description || '', img, cond, val, cat);

    const row = db.prepare(
      `SELECT i.*, u.username as owner_username, u.avatar_url as owner_avatar_url
       FROM items i
       JOIN users u ON i.owner_id = u.id
       WHERE i.id = ?`
    ).get(result.lastInsertRowid);

    if (!row) {
      return res.status(500).json({ message: 'Failed to retrieve created item.' });
    }

    return res.status(201).json(formatItem(row));
  } catch (error) {
    console.error('Error in addItem:', error);
    return res.status(500).json({ message: 'Internal server error adding item.' });
  }
};

export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const current = db.prepare('SELECT * FROM items WHERE id = ?').get(id);

    if (!current) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    if (current.owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this item.' });
    }

    const name = req.body.name !== undefined ? req.body.name : current.name;
    const description = req.body.description !== undefined ? req.body.description : current.description;
    const imageUrl = req.body.imageUrl !== undefined
      ? req.body.imageUrl
      : (req.body.image_url !== undefined ? req.body.image_url : current.image_url);
    const condition = req.body.condition !== undefined ? req.body.condition : current.condition;
    const value = req.body.value !== undefined ? Number(req.body.value) : current.value;
    const category = req.body.category !== undefined ? req.body.category : current.category;

    db.prepare(
      `UPDATE items SET name = ?, description = ?, image_url = ?, condition = ?, value = ?, category = ? WHERE id = ?`
    ).run(name, description, imageUrl, condition, value, category, id);

    const row = db.prepare(
      `SELECT i.*, u.username as owner_username, u.avatar_url as owner_avatar_url
       FROM items i
       JOIN users u ON i.owner_id = u.id
       WHERE i.id = ?`
    ).get(id);

    return res.json(formatItem(row));
  } catch (error) {
    console.error('Error in updateItem:', error);
    return res.status(500).json({ message: 'Internal server error updating item.' });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = db.prepare('SELECT * FROM items WHERE id = ?').get(id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    if (item.owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this item.' });
    }

    db.prepare('DELETE FROM items WHERE id = ?').run(id);
    return res.json({ message: 'Item deleted successfully.' });
  } catch (error) {
    console.error('Error in deleteItem:', error);
    return res.status(500).json({ message: 'Internal server error deleting item.' });
  }
};
