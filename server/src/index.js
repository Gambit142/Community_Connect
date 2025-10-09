require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

const app = express();
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(require('cors')());

app.use((req, res, next) => {
  res.header('Content-Type', 'application/json');
  next();
});

app.get('/', (req, res) => {
  res.send(JSON.stringify({ message: 'API is running...' }));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));