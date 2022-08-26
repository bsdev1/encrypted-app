if(process.env.NODE_ENV != 'production') require('dotenv').config();

const { mongoUrl, frontendUrl, sessionSecret } = process.env;

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: frontendUrl,
    credentials: true
  },
  maxHttpBufferSize: 1e8
});
const helmet = require('helmet');
const cors = require('cors')({ origin: frontendUrl, credentials: true });
const Store = require('connect-mongo');
const session = require('express-session');
const passport = require('passport');
const { passportAuth } = require('./utils/auth');
const Message = require('./models/message');
const File = require('./models/file');
const fs = require('fs/promises');
const history = require('connect-history-api-fallback');

passportAuth(passport);

// Middlewares

const sessionMiddleware = session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  store: new Store({ mongoUrl }),
  cookie: {
    maxAge: 60 * 60 * 1000
  }
});

if(process.env.NODE_ENV == 'production') {
  app.use(history({
    rewrites: [
      {
        from: /^\/api\/.*$/,
        to: context => context.parsedUrl.path
      }
    ]
  }));
}
app.use(sessionMiddleware);
app.use(express.json());
app.use(express.static(process.env.NODE_ENV == 'production' ? 'public/dist' : 'public'));
app.use(helmet());
app.use(cors);
app.use(passport.initialize());
app.use(passport.session());

if(process.env.NODE_ENV == 'production') {
  app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });
}

// Routes
const indexRouter = require('./routes');
app.use('/api', indexRouter);

const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

io.use((socket, next) => socket.request.user ? next() : next(new Error('Unauthorized')));

io.on('connection', socket => {
  socket.on('connectUser', () => {
    socket.join(socket.request.user.id);
  });

  socket.on('upload', async (message, encryptedFiles, cb) => {
    const author = socket.request.user.id;
    for(const { uuid, encrypted_content } of encryptedFiles) await fs.writeFile(`./public/usersFiles/${uuid}.encrypted`, encrypted_content);
    encryptedFiles.forEach(file => delete file.encrypted_content);
    encryptedFiles = encryptedFiles.map(encryptedFile => ({ ...encryptedFile, author, message }));
    await File.insertMany(encryptedFiles);
    cb();
  });

  socket.on('newMessage', async ({ message, files }, cb) => {
    if(!message?.trim()) return cb();
    const { id, username, createdAt: userCreatedAt } = socket.request.user;
    const fileDescriptions = files.map(({ fileName, fileType, fileSize }) => ({ fileName, fileType, fileSize }));
    const { id: messageId, content, createdAt } = await Message.create({ filesCount: files.length, fileDescriptions, content: message, author: id });

    const author = { id, username, createdAt: userCreatedAt };

    const msg = { id: messageId, content, fileDescriptions: [], author, files, filesCount: files.length, createdAt };
    socket.to(socket.request.user.id).emit('newMessage', msg);
    cb(msg);
  });

  const session = socket.request.session;
  session.socketId = socket.id;
  session.save();
});

const PORT = process.env.PORT || 1000;
server.listen(PORT, async () => {
  await mongoose.connect(mongoUrl);
  console.log(`App running at http://localhost:${PORT}.`);
});