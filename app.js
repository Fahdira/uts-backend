require('dotenv').config();
const express = require('express');
const pool = require('./db');

const app = express();
const PORT = 3000;

const s3UrlPrefix = `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/`;

app.get('/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
    const products = result.rows.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: s3UrlPrefix + product.image_key
    }));
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/product/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).send('Product not found');

    const product = result.rows[0];
    res.json({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: s3UrlPrefix + product.image_key
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.listen(PORT, () => {
  console.log(`Backend API running at http://localhost:${PORT}`);
});
