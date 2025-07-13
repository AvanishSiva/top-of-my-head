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


module.exports = router;