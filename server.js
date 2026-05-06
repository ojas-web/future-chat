// ======================================
// FUTURE CHAT APP - FINAL FIXED VERSION
// ======================================

const express = require('express');

const bodyParser = require('body-parser');
const session = require('express-session');

const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'chatapp',
  password: 'Ntpc@2018',
  port: 5432
});

const app = express();
const PORT = process.env.PORT || 3000;

// ======================================
// MIDDLEWARE
// ======================================

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ======================================
// SESSION
// ======================================

app.use(session({
    secret: 'futurechatsecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        secure: false
    }
}));

// ======================================
// DATABASE
// ======================================





});

// ======================================
// LOGIN CHECK
// ======================================

function isLoggedIn(req,res,next){

    if(req.session.user){

        next();

    }else{

        res.redirect('/');

    }

}

// ======================================
// HOME PAGE
// ======================================

app.get('/',(req,res)=>{

if(req.session.user){

return res.redirect('/chat');

}

res.send(`

<!DOCTYPE html>
<html>

<head>

<title>Future Chat</title>

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<style>

*{
margin:0;
padding:0;
box-sizing:border-box;
font-family:Arial;
}

body{
background:linear-gradient(135deg,#020617,#0f172a,#312e81);
height:100vh;
display:flex;
justify-content:center;
align-items:center;
color:white;
}

.container{
width:420px;
background:rgba(255,255,255,0.08);
padding:40px;
border-radius:25px;
backdrop-filter:blur(15px);
box-shadow:0 0 40px rgba(0,255,255,0.2);
}

h1{
text-align:center;
margin-bottom:25px;
font-size:42px;
background:linear-gradient(to right,cyan,purple);
-webkit-background-clip:text;
-webkit-text-fill-color:transparent;
}

input{
width:100%;
padding:15px;
margin:12px 0;
border:none;
border-radius:15px;
background:rgba(255,255,255,0.15);
color:white;
font-size:16px;
}

button{
width:100%;
padding:15px;
margin-top:10px;
border:none;
border-radius:15px;
background:cyan;
font-size:18px;
font-weight:bold;
cursor:pointer;
transition:0.3s;
}

button:hover{
transform:scale(1.05);
background:white;
}

</style>

</head>

<body>

<div class="container">

<h1>
🚀 Future Chat
</h1>

<form action="/login" method="POST">

<input
type="text"
name="username"
placeholder="Username"
required
>

<input
type="password"
name="password"
placeholder="Password"
required
>

<button type="submit">
Login
</button>

</form>

<form action="/register" method="POST">

<input
type="text"
name="username"
placeholder="Create Username"
required
>

<input
type="password"
name="password"
placeholder="Create Password"
required
>

<button type="submit">
Register
</button>

</form>

</div>

</body>
</html>

`);

});

// ======================================
// REGISTER
// ======================================

app.post('/register', async (req, res) => {

const { username, password } = req.body;

const hashed = await bcrypt.hash(password, 10);

try {
  await pool.query(
    'INSERT INTO users(username, password) VALUES($1, $2)',
    [username, hashed]
  );

  console.log("User created:", username);
  res.redirect('/');

} catch (err) {
  console.log("DB ERROR:", err.message);
  res.send("User already exists or DB error");
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

  const match = await bcrypt.compare(password, user.password);

  if (match) {
    req.session.user = username;
    res.redirect('/chat');
  } else {
    res.send("Wrong password");
  }

} catch (err) {
  console.log(err.message);
  res.send("Server error");
}

});

// ======================================
// CHAT PAGE
// ======================================

app.get('/chat', isLoggedIn, async (req, res) => {

const user = req.session.user;

try {

const usersResult = await pool.query(
  'SELECT username FROM users WHERE username != $1',
  [user]
);

const messagesResult = await pool.query(
  'SELECT * FROM messages ORDER BY id ASC'
);

const users = usersResult.rows;
const messages = messagesResult.rows;

let usersHtml = '';

users.forEach(u => {

const userMessages = messages.filter(m =>
  (m.sender === user && m.receiver === u.username) ||
  (m.sender === u.username && m.receiver === user)
);

let chats = '';

userMessages.forEach(m => {
  chats += `
  <div class="msg">
    <b>${m.sender}</b> ➜ <b>${m.receiver}</b><br><br>
    ${m.message}
    <div class="time">${m.time}</div>
  </div>
  `;
});

usersHtml += `
<div class="user-section">

<button class="toggle-btn" onclick="toggleChat('${u.username}')">
${u.username}
</button>

<div class="chat-panel" id="chat-${u.username}" style="display:none;">
${chats}

<form action="/send" method="POST">
  <input type="hidden" name="receiver" value="${u.username}">
  <textarea name="message" required></textarea>
  <button type="submit">Send 🚀</button>
</form>

</div>
</div>
`;

});

res.send(`YOUR_HTML_HERE_REMAIN_UNCHANGED_EXCEPT_SCRIPT`);

} catch (err) {
console.log(err.message);
res.send("Server error");
}

});

res.send(`

<!DOCTYPE html>
<html>

<head>

<title>Future Chat</title>

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<style>
.delete-btn{

background:red;
color:white;
padding:8px 15px;
margin-top:10px;
border:none;
border-radius:10px;
cursor:pointer;
font-size:14px;
width:auto;

}

.delete-btn:hover{

background:darkred;

}
*{
margin:0;
padding:0;
box-sizing:border-box;
font-family:Arial;
}

body{
background:linear-gradient(135deg,#020617,#111827,#312e81);
color:white;
padding:20px;
}

h1{
text-align:center;
margin-bottom:20px;
font-size:45px;
background:linear-gradient(to right,cyan,purple);
-webkit-background-clip:text;
-webkit-text-fill-color:transparent;
}

.chat-box{
max-width:900px;
margin:auto;
background:rgba(255,255,255,0.08);
padding:25px;
border-radius:25px;
backdrop-filter:blur(10px);
box-shadow:0 0 30px rgba(0,255,255,0.2);
}

.top{
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:20px;
}

.logout{
background:red;
color:white;
padding:10px 20px;
width:auto;
}

.user-section{
margin-bottom:20px;
}

.toggle-btn{
width:100%;
padding:15px;
border:none;
border-radius:15px;
background:cyan;
font-size:18px;
font-weight:bold;
cursor:pointer;
transition:0.3s;
}

.toggle-btn:hover{
transform:scale(1.03);
background:white;
}

.chat-panel{
margin-top:10px;
padding:15px;
border-radius:15px;
background:rgba(255,255,255,0.08);
}

.msg{
background:rgba(255,255,255,0.1);
padding:15px;
border-radius:15px;
margin-top:10px;
line-height:1.5;
}

.time{
font-size:12px;
margin-top:5px;
color:#ccc;
}

textarea{
width:100%;
height:100px;
padding:15px;
margin-top:15px;
border:none;
border-radius:15px;
background:rgba(255,255,255,0.12);
color:white;
resize:none;
font-size:16px;
}

button{
margin-top:10px;
padding:15px;
border:none;
border-radius:15px;
background:cyan;
font-size:18px;
font-weight:bold;
cursor:pointer;
transition:0.3s;
}

button:hover{
transform:scale(1.03);
background:white;
}

</style>

</head>

<body>

<h1>
💬 Future Chat System
</h1>

<div class="chat-box">

<div class="top">

<h2>
Welcome ${user}
</h2>

<form action="/logout" method="GET">

<button class="logout">
Logout
</button>

</form>

</div>

${usersHtml}

</div>

<script>

// ======================================
// CHAT OPEN/CLOSE
// ======================================

let openChats = {};

function toggleChat(username) {
  const panel = document.getElementById('chat-' + username);
  if (!panel) return;

  panel.style.display =
    panel.style.display === 'block' ? 'none' : 'block';
}


// ======================================
// SAVE CHAT STATE
// ======================================

function saveState(){

const opened=[];

for(let user in openChats){

if(openChats[user]){

opened.push(user);

}

}

sessionStorage.setItem(
'openedChats',
JSON.stringify(opened)
);

}

// ======================================
// RESTORE CHAT STATE
// ======================================

window.addEventListener(
'load',
()=>{

const saved=
JSON.parse(
sessionStorage.getItem(
'openedChats'
)
)||[];

saved.forEach(username=>{

const panel=
document.getElementById(
'chat-'+username
);

if(panel){

panel.style.display='block';

openChats[username]=true;

}

});

// RESTORE TEXT

document.querySelectorAll('textarea')
.forEach(t=>{

const savedText =
sessionStorage.getItem(
'draft-' + t.parentElement.querySelector('input[name="receiver"]').value
);

if(savedText){

t.value = savedText;

}

});

// RESTORE SCROLL

const scrollPos =
sessionStorage.getItem(
'scrollPosition'
);

if(scrollPos){

window.scrollTo(
0,
parseInt(scrollPos)
);

}

}
);

// ======================================
// SAVE DRAFT
// ======================================

document.querySelectorAll('textarea')
.forEach(t=>{

t.addEventListener(
'input',
()=>{

const receiver =
t.parentElement.querySelector(
'input[name="receiver"]'
).value;

sessionStorage.setItem(
'draft-' + receiver,
t.value
);

// ======================================
// CLEAR TEXT AFTER SEND
// ======================================

document.querySelectorAll("textarea").forEach(t => {
  t.addEventListener("input", () => {
    const receiver = t.parentElement.querySelector("input[name='receiver']").value;
    sessionStorage.setItem("draft-" + receiver, t.value);
  });
});

});
}
);



// ======================================
// SAVE SCROLL
// ======================================

function saveScroll(){

sessionStorage.setItem(
'scrollPosition',
window.scrollY
);

}

window.addEventListener(
'scroll',
saveScroll
);

window.addEventListener(
'beforeunload',
saveScroll
);

// ======================================
// SAVE BEFORE SEND
// ======================================

document.querySelectorAll('form')
.forEach(form=>{

form.addEventListener(
'submit',
()=>{

saveScroll();

saveState();

}
);

});

// ======================================
// SMART AUTO REFRESH
// ======================================

let typing=false;

document.querySelectorAll('textarea')
.forEach(t=>{

t.addEventListener(
'focus',
()=>{

typing=true;

}
);

t.addEventListener(
'blur',
()=>{

typing=false;

}
);

});



</script>

</body>
</html>

`);

}

);

}

);

});

// ======================================
// SEND MESSAGE
// ======================================

app.post('/send',isLoggedIn,(req,res)=>{

const sender=req.session.user;

const { receiver,message } = req.body;

const time=
new Date().toLocaleString();

db.run(
'INSERT INTO messages(sender,receiver,message,time) VALUES(?,?,?,?)',
[sender,receiver,message,time],

()=>{

res.redirect('/chat');

}

);

});

// ======================================
// DELETE MESSAGE
// ======================================

app.post('/delete-message',isLoggedIn,(req,res)=>{

const user = req.session.user;

const { id } = req.body;

db.run(

'DELETE FROM messages WHERE id=? AND sender=?',

[id,user],

()=>{

res.redirect('/chat');

}

);

});
// ======================================
// LOGOUT
// ======================================

app.get('/logout',(req,res)=>{

req.session.destroy();

res.redirect('/');

});

// ======================================
// START SERVER
// ======================================

app.listen(PORT,()=>{

console.log(
'🚀 Server running on http://localhost:3000'
);

});

/*

======================================

INSTALL

======================================

npm init -y

npm install express sqlite3 body-parser express-session bcrypt connect-sqlite3

======================================

RUN

======================================

node server.js

======================================

OPEN

======================================

http://localhost:3000

======================================

*/
