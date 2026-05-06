// ======================================
// FUTURE CHAT APP - CLEAN WORKING VERSION
// ======================================

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// ======================================
// DATABASE (POSTGRES ONLY)
// ======================================
pool.connect()
  .then(() => console.log("DB connected"))
  .catch(err => console.log("DB ERROR:", err.message));


const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'chatapp',
  password: 'Ntpc@2018',
  port: 5432
});

// ======================================
// MIDDLEWARE
// ======================================

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  secret: 'futurechatsecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true
  }
}));

// ======================================
// AUTH MIDDLEWARE
// ======================================

function isLoggedIn(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/');
}

// ======================================
// HOME PAGE
// ======================================

app.get('/', (req, res) => {
  if (req.session.user) return res.redirect('/chat');

  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>Future Chat</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body>
    <h1>Login</h1>

    <form method="POST" action="/login">
      <input name="username" placeholder="Username" required />
      <input name="password" type="password" placeholder="Password" required />
      <button>Login</button>
    </form>

    <h1>Register</h1>

    <form method="POST" action="/register">
      <input name="username" placeholder="Username" required />
      <input name="password" type="password" placeholder="Password" required />
      <button>Register</button>
    </form>

  </body>
  </html>
  `);
});

// ======================================
// REGISTER
// ======================================

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO users(username, password) VALUES($1,$2)',
      [username, hashed]
    );

    res.redirect('/');
  } catch (err) {
    console.log(err.message);
    res.send("User already exists or error");
  }
});

// ======================================
// LOGIN
// ======================================

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username=$1',
      [username]
    );

    const user = result.rows[0];
    if (!user) return res.send("User not found");

    const ok = await bcrypt.compare(password, user.password);

    if (ok) {
      req.session.user = username;
      res.redirect('/chat');
    } else {
      res.send("Wrong password");
    }

  } catch (err) {
    console.log(err.message);
    console.log(err);
res.send(err.message);
  }
});

// ======================================
// CHAT PAGE
// ======================================

app.get('/chat', isLoggedIn, async (req, res) => {
  const user = req.session.user;

  try {
    const usersRes = await pool.query(
      'SELECT username FROM users WHERE username != $1',
      [user]
    );

    const msgRes = await pool.query(
      'SELECT * FROM messages ORDER BY id ASC'
    );

    const users = usersRes.rows;
    const messages = msgRes.rows;

    let usersHtml = '';

    users.forEach(u => {

      const chat = messages.filter(m =>
        (m.sender === user && m.receiver === u.username) ||
        (m.sender === u.username && m.receiver === user)
      );

      let chatHtml = '';

      chat.forEach(m => {
        chatHtml += `
          <div>
            <b>${m.sender}</b>: ${m.message}
            <small>${m.time}</small>
          </div>
        `;
      });

      usersHtml += `
        <div style="margin:10px;padding:10px;border:1px solid #ccc;">
          <button onclick="toggleChat('${u.username}')">
            ${u.username}
          </button>

          <div id="chat-${u.username}" style="display:none;">
            ${chatHtml}

            <form method="POST" action="/send">
              <input type="hidden" name="receiver" value="${u.username}">
              <input name="message" placeholder="Type..." required />
              <button>Send</button>
            </form>
          </div>
        </div>
      `;
    });

    res.send(`
    <html>
    <body>

      <h2>Welcome ${user}</h2>
      <a href="/logout">Logout</a>

      ${usersHtml}

      <script>
        function toggleChat(user) {
          const el = document.getElementById('chat-' + user);
          if (!el) return;
          el.style.display = (el.style.display === 'none' || el.style.display === '')
            ? 'block'
            : 'none';
        }
      </script>

    </body>
    </html>
    `);

  } catch (err) {
    console.log(err.message);
    res.send("Error loading chat");
  }
});

// ======================================
// SEND MESSAGE
// ======================================

app.post('/send', isLoggedIn, async (req, res) => {
  const sender = req.session.user;
  const { receiver, message } = req.body;

  const time = new Date().toLocaleString();

  await pool.query(
    'INSERT INTO messages(sender, receiver, message, time) VALUES($1,$2,$3,$4)',
    [sender, receiver, message, time]
  );

  res.redirect('/chat');
});

// ======================================
// LOGOUT
// ======================================

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// ======================================
// START SERVER
// ======================================

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
