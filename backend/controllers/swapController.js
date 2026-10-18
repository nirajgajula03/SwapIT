import db from '../config/db.js';

const SWAP_QUERY = `
  SELECT
    s.id, s.proposer_id, s.receiver_id, s.proposer_item_id, s.receiver_item_id,
    s.status, s.coin_difference, s.feedback_given, s.created_at,
    pu.username as proposer_username, pu.avatar_url as proposer_avatar_url,
    ru.username as receiver_username, ru.avatar_url as receiver_avatar_url,
    pi.name as pi_name, pi.description as pi_description, pi.image_url as pi_image_url,
    pi.condition as pi_condition, pi.value as pi_value, pi.category as pi_category, pi.created_at as pi_created_at,
    ri.name as ri_name, ri.description as ri_description, ri.image_url as ri_image_url,
    ri.condition as ri_condition, ri.value as ri_value, ri.category as ri_category, ri.created_at as ri_created_at
  FROM swaps s
  JOIN users pu ON s.proposer_id = pu.id
  JOIN users ru ON s.receiver_id = ru.id
  JOIN items pi ON s.proposer_item_id = pi.id
  JOIN items ri ON s.receiver_item_id = ri.id
`;

const formatSwap = (row, currentUserId) => {
  const proposerItem = {
    id: String(row.proposer_item_id),
    name: row.pi_name,
    description: row.pi_description || '',
    imageUrl: row.pi_image_url || '',
    condition: row.pi_condition || 'Used - Good',
    value: Number(row.pi_value) || 0,
    category: row.pi_category || 'Other',
    listedDate: row.pi_created_at ? row.pi_created_at.split(' ')[0] : '',
    owner: {
      username: row.proposer_username || '',
      avatarUrl: row.proposer_avatar_url || ''
    },
    distance: 5
  };

  const receiverItem = {
    id: String(row.receiver_item_id),
    name: row.ri_name,
    description: row.ri_description || '',
    imageUrl: row.ri_image_url || '',
    condition: row.ri_condition || 'Used - Good',
    value: Number(row.ri_value) || 0,
    category: row.ri_category || 'Other',
    listedDate: row.ri_created_at ? row.ri_created_at.split(' ')[0] : '',
    owner: {
      username: row.receiver_username || '',
      avatarUrl: row.receiver_avatar_url || ''
    },
    distance: 5
  };

  const isProposer = Number(row.proposer_id) === Number(currentUserId);
  const userItem = isProposer ? proposerItem : receiverItem;
  const otherUserItem = isProposer ? receiverItem : proposerItem;

  return {
    id: String(row.id),
    userItem,
    otherUserItem,
    proposerUsername: row.proposer_username,
    status: row.status,
    date: row.created_at ? row.created_at.split(' ')[0] : new Date().toISOString().split('T')[0],
    feedbackGiven: Boolean(row.feedback_given),
    coinDifference: Number(row.coin_difference) || 0
  };
};

const fetchSwapById = (swapId, currentUserId) => {
  const row = db.prepare(`${SWAP_QUERY} WHERE s.id = ?`).get(swapId);
  if (!row) return null;
  return formatSwap(row, currentUserId);
};

export const getSwaps = async (req, res) => {
  try {
    const rows = db.prepare(
      `${SWAP_QUERY} WHERE s.proposer_id = ? OR s.receiver_id = ? ORDER BY s.created_at DESC`
    ).all(req.user.id, req.user.id);

    return res.json(rows.map((row) => formatSwap(row, req.user.id)));
  } catch (error) {
    console.error('Error in getSwaps:', error);
    return res.status(500).json({ message: 'Internal server error fetching swaps.' });
  }
};

export const proposeSwap = async (req, res) => {
  try {
    const { userItemId, otherUserItemId, coinDifference } = req.body;

    if (!userItemId || !otherUserItemId) {
      return res.status(400).json({ message: 'Both userItemId and otherUserItemId are required.' });
    }

    const myItem = db.prepare('SELECT * FROM items WHERE id = ?').get(userItemId);
    if (!myItem) {
      return res.status(404).json({ message: 'Your proposed item was not found.' });
    }
    if (myItem.owner_id !== req.user.id) {
      return res.status(403).json({ message: 'You do not own the item you are offering.' });
    }

    const otherItem = db.prepare('SELECT * FROM items WHERE id = ?').get(otherUserItemId);
    if (!otherItem) {
      return res.status(404).json({ message: 'The requested item was not found.' });
    }
    if (otherItem.owner_id === req.user.id) {
      return res.status(400).json({ message: 'Cannot propose a swap for your own item.' });
    }

    const receiverId = otherItem.owner_id;
    const diff = Number(coinDifference) || 0;

    const result = db.prepare(
      `INSERT INTO swaps (proposer_item_id, receiver_item_id, proposer_id, receiver_id, status, coin_difference)
       VALUES (?, ?, ?, ?, 'Pending', ?)`
    ).run(userItemId, otherUserItemId, req.user.id, receiverId, diff);

    const swap = fetchSwapById(result.lastInsertRowid, req.user.id);
    return res.status(201).json(swap);
  } catch (error) {
    console.error('Error in proposeSwap:', error);
    return res.status(500).json({ message: 'Internal server error proposing swap.' });
  }
};

export const respondToSwap = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    if (!action || !['accept', 'reject'].includes(action.toLowerCase())) {
      return res.status(400).json({ message: 'Invalid action. Must be "accept" or "reject".' });
    }

    const swap = db.prepare('SELECT * FROM swaps WHERE id = ?').get(id);
    if (!swap) {
      return res.status(404).json({ message: 'Swap not found.' });
    }

    if (swap.receiver_id !== req.user.id) {
      return res.status(403).json({ message: 'Only the recipient can respond to this swap proposal.' });
    }

    if (swap.status !== 'Pending') {
      return res.status(400).json({ message: 'This swap has already been resolved.' });
    }

    const normalizedAction = action.toLowerCase();

    if (normalizedAction === 'accept') {
      const diff = Number(swap.coin_difference) || 0;

      // Use a transaction for atomicity
      const acceptSwap = db.transaction(() => {
        if (diff > 0) {
          const proposer = db.prepare('SELECT coins FROM users WHERE id = ?').get(swap.proposer_id);
          if (!proposer || proposer.coins < diff) {
            throw new Error('Proposer does not have enough SwapCoins to complete the swap.');
          }

          db.prepare('UPDATE users SET coins = coins - ? WHERE id = ?').run(diff, swap.proposer_id);
          db.prepare('UPDATE users SET coins = coins + ?, total_coins_earned = total_coins_earned + ? WHERE id = ?').run(diff, diff, swap.receiver_id);

          db.prepare(
            `INSERT INTO coin_transactions (user_id, type, description, amount, source)
             VALUES (?, 'Debit', 'Swap difference payment', ?, 'swap')`
          ).run(swap.proposer_id, diff);
          db.prepare(
            `INSERT INTO coin_transactions (user_id, type, description, amount, source)
             VALUES (?, 'Credit', 'Swap difference payment received', ?, 'swap')`
          ).run(swap.receiver_id, diff);
        } else if (diff < 0) {
          const absDiff = Math.abs(diff);
          const receiver = db.prepare('SELECT coins FROM users WHERE id = ?').get(swap.receiver_id);
          if (!receiver || receiver.coins < absDiff) {
            throw new Error('You do not have enough SwapCoins to accept this swap.');
          }

          db.prepare('UPDATE users SET coins = coins - ? WHERE id = ?').run(absDiff, swap.receiver_id);
          db.prepare('UPDATE users SET coins = coins + ?, total_coins_earned = total_coins_earned + ? WHERE id = ?').run(absDiff, absDiff, swap.proposer_id);

          db.prepare(
            `INSERT INTO coin_transactions (user_id, type, description, amount, source)
             VALUES (?, 'Debit', 'Swap difference payment', ?, 'swap')`
          ).run(swap.receiver_id, absDiff);
          db.prepare(
            `INSERT INTO coin_transactions (user_id, type, description, amount, source)
             VALUES (?, 'Credit', 'Swap difference payment received', ?, 'swap')`
          ).run(swap.proposer_id, absDiff);
        }

        // Transfer ownership of items
        db.prepare('UPDATE items SET owner_id = ? WHERE id = ?').run(swap.receiver_id, swap.proposer_item_id);
        db.prepare('UPDATE items SET owner_id = ? WHERE id = ?').run(swap.proposer_id, swap.receiver_item_id);

        db.prepare('UPDATE swaps SET status = \'Completed\' WHERE id = ?').run(id);
      });

      try {
        acceptSwap();
      } catch (txError) {
        return res.status(400).json({ message: txError.message });
      }
    } else {
      db.prepare('UPDATE swaps SET status = \'Rejected\' WHERE id = ?').run(id);
    }

    const updatedSwap = fetchSwapById(id, req.user.id);
    return res.json(updatedSwap);
  } catch (error) {
    console.error('Error in respondToSwap:', error);
    return res.status(500).json({ message: 'Internal server error responding to swap.' });
  }
};
