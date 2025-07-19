require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const User = require('./models/User');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

app.post('/api/signup', upload.single('pic'), async (req, res) => {
  const { name, age, lang, latitude, longitude } = req.body;
  const pic = req.file ? `/uploads/${req.file.filename}` : '';
  const user = new User({ name, age, lang, pic, latitude, longitude });
  await user.save();
  res.json(user);
});

app.get('/api/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.post('/api/match', async (req, res) => {
  const { userId, targetId, action } = req.body;
  const user = await User.findById(userId);
  const target = await User.findById(targetId);
  if (action === 'like') {
    user.likes.push(targetId);
    await user.save();
    if (target.likes.includes(userId)) {
      user.matches.push(targetId);
      target.matches.push(userId);
      await user.save();
      await target.save();
      return res.json({ match: true });
    }
  }
  res.json({ match: false });
});

app.get('/api/messages/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;
  const messages = await Message.find({
    $or: [
      { from: user1, to: user2 },
      { from: user2, to: user1 }
    ]
  });
  res.json(messages);
});

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    socket.join(userId);
  });
  socket.on('message', async (data) => {
    const { from, to, text } = data;
    const msg = new Message({ from, to, text });
    await msg.save();
    io.to(to).emit('message', msg);
    io.to(from).emit('message', msg);
  });
});

server.listen(4000, () => console.log('Backend running on port 4000'));
