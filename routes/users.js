require('dotenv').config();

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

router.use(express.json());


//Get all users
router.get('/', async (req, res) => {
  try{
    const result = await pool.query('SELECT * from users;');
    res.json(result.rows);
  }catch(err){
    console.error(err);
    res.status(500).send('DataBase Error');
  }
});

router.post('/', async (req, res) => {
  try {

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const result = await pool.query(
      'INSERT INTO users (email) VALUES ($1) RETURNING *;',
      [email]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      res.status(409).json({ error: 'Email already exists' });
    } else {
      res.status(500).send('Database Error');
    }
  }
});

router.put('/:id', async (req, res) => {
  try {

    const { id } = req.params;

    const fields = req.body;

    const setClauses = [];
    const values = [];
    let idx = 1;

    for(const [key, value] of Object.entries(fields)){
        setClauses.push(`${key} = $${idx}`);
        values.push(value);
        idx++;
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ error: 'No fields provided for update' });
    }
    values.push(id);

    const query = `
      UPDATE users
      SET ${setClauses.join(', ')}
      WHERE id = $${idx}
      RETURNING *;
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).send('Database Error');
  }
});


module.exports = router;