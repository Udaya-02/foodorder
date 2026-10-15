const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const PORT = 3000;

// Change these values to match your local MySQL setup.
const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'food_ordering'
};

let pool;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

async function startServer() {
  try {
    pool = mysql.createPool({ ...DB_CONFIG, waitForConnections: true, connectionLimit: 10 });
    await pool.query('SELECT 1');
    console.log('Connected to MySQL database food_ordering');
    app.listen(PORT, () => console.log(`Open http://localhost:${PORT}`));
  } catch (err) {
    console.error('Could not connect to MySQL:', err.message);
    console.error('Check the password in app.js and make sure database.sql was executed.');
  }
}

// READ: get all menu items
app.get('/api/food', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM food_items ORDER BY food_id DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'Could not load food items.' }); }
});

// READ: get one item
app.get('/api/food/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM food_items WHERE food_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Food item not found.' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: 'Could not load that item.' }); }
});

// CREATE: add a food item (useful for assignment/admin testing)
app.post('/api/food', async (req, res) => {
  const { food_name, category, price, description, availability } = req.body;
  if (!food_name || !category || price === undefined || Number(price) < 0) {
    return res.status(400).json({ error: 'Enter a food name, category, and valid price.' });
  }
  try {
    const [result] = await pool.execute(
      'INSERT INTO food_items (food_name, category, price, description, availability) VALUES (?, ?, ?, ?, ?)',
      [food_name, category, Number(price), description || '', availability === false || availability === 'false' ? 0 : 1]
    );
    res.status(201).json({ message: 'Food item added.', food_id: result.insertId });
  } catch (err) { res.status(500).json({ error: 'Could not add food item.' }); }
});

// Customer checkout demo: validates cart items against current database prices.
// This starter version confirms the order on screen; it does not store orders or process payments.
app.post('/api/checkout', async (req, res) => {
  const items = req.body.items;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Your cart is empty.' });
  }
  try {
    const ids = [...new Set(items.map(item => Number(item.food_id)).filter(id => Number.isInteger(id) && id > 0))];
    if (!ids.length) return res.status(400).json({ error: 'Cart items are invalid.' });
    const [foods] = await pool.query(
      `SELECT food_id, food_name, price, availability FROM food_items WHERE food_id IN (${ids.map(() => '?').join(',')})`,
      ids
    );
    const byId = new Map(foods.map(food => [food.food_id, food]));
    const orderItems = [];
    for (const item of items) {
      const food = byId.get(Number(item.food_id));
      const quantity = Math.max(1, Math.min(99, Number.parseInt(item.quantity, 10) || 1));
      if (!food || !food.availability) continue;
      orderItems.push({
        food_id: food.food_id, food_name: food.food_name,
        price: Number(food.price), quantity, subtotal: Number(food.price) * quantity
      });
    }
    if (!orderItems.length) return res.status(400).json({ error: 'No available items found in your cart.' });
    const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    res.json({ message: 'Order placed successfully!', orderItems, total });
  } catch (err) { res.status(500).json({ error: 'Could not place order.' }); }
});

 // UPDATE: edit an existing food item
app.put('/api/food/:id', async (req, res) => {
  const { food_name, category, price, description, availability } = req.body;
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid food ID.' });
  }

  if (!food_name || !category || price === undefined ||
      price === '' || !Number.isFinite(Number(price)) ||
      Number(price) < 0) {
    return res.status(400).json({
      error: 'Enter a valid food name, category, and price.'
    });
  }

  try {
    const [result] = await pool.execute(
      `UPDATE food_items
       SET food_name = ?, category = ?, price = ?,
           description = ?, availability = ?
       WHERE food_id = ?`,
      [
        food_name,
        category,
        Number(price),
        description || '',
        availability === false || availability === 'false' ? 0 : 1,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Food item not found.' });
    }

    res.json({ message: 'Food item updated successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update food item.' });
  }
});

// DELETE: remove a food item
app.delete('/api/food/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid food ID.' });
  }

  try {
    const [result] = await pool.execute(
      'DELETE FROM food_items WHERE food_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Food item not found.' });
    }

    res.json({ message: 'Food item deleted successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete food item.' });
  }
});

startServer();
