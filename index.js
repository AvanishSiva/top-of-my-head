require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT;
const cors = require('cors');

const { Pool } = require('pg');
app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.send("🧠 MyMind backend is running");
});

const userRouters = require('./routes/users');
const memoriesRouters = require('./routes/memories');

app.use('/api/users', userRouters);
app.use('/api/memories', memoriesRouters);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});