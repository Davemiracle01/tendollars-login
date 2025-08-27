const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simple login API
app.post('/api/login', (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ error: 'Phone and password required' });
  }

  // Read users from database.json
  fs.readFile(path.join(__dirname, 'public', 'database.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading database.json:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    let users;
    try {
      users = JSON.parse(data).users;
    } catch {
      return res.status(500).json({ error: 'Corrupted user data' });
    }

    const user = users.find(u => u.phone === phone);
    if (!user) {
      return res.status(401).json({ error: 'Unregistered phone number' });
    }
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Successful login (in real apps, generate token/session)
    res.json({ message: 'Login successful' });
  });
});

// Fallback for SPA / static files
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
