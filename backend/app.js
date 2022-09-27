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
const FileUpload = require('./models/fileUpload');
const fs = require('fs/promises');
const fsDefault = require('fs');
const uuid = require('uuid');
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
    maxAge: 24 * 60 * 60 * 1000
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
app.use(helmet({
  crossOriginEmbedderPolicy: false
}));
app.use(helmet.contentSecurityPolicy({
  directives: {
    scriptSrc: ["'self'", 'https://hcaptcha.com', 'https://*.hcaptcha.com', "'unsafe-inline'"],
    frameSrc: ["'self'", 'https://hcaptcha.com', 'https://*.hcaptcha.com'],
    styleSrc: ["'self'", 'https://hcaptcha.com', 'https://*.hcaptcha.com', "'unsafe-inline'"],
    connectSrc: ["'self'", 'https://hcaptcha.com', 'https://*.hcaptcha.com'],
    imgSrc: ["'self'", 'blob:', 'data:'],
    mediaSrc: ["'self'", 'blob:']
  }
}));
app.use(express.static(process.env.NODE_ENV == 'production' ? 'public/dist' : 'public', {
  etag: false
}));
app.use(cors);
app.use(passport.initialize());
app.use(passport.session());

if(process.env.NODE_ENV == 'production') {
  app.get('/', (_, res) => {
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
  
  socket.on('disconnect', async () => {
    const author = socket.request.user.id, uploads = socket.request.session.passport.user.uploads ?? [];
    for(const uuid of uploads) {
      const path = `./public/usersFiles/${uuid}.encrypted`;
      if(fsDefault.existsSync(path)) fsDefault.unlinkSync(path);
    }
    await FileUpload.deleteMany({ author, finished: false });
    delete socket.request.session.passport.user.uploads;
  });

  socket.on('createFilesUpload', async (filesLength, cb) => {
    const author = socket.request.user.id;
    const uploads = Array.from({ length: filesLength }, () => ({ fileUUID: uuid.v4(), author }));
    await FileUpload.insertMany(uploads);
    const uuids = uploads.map(({ fileUUID }) => fileUUID);
    socket.request.session.passport.user.uploads = uuids;
    cb(uuids);
  });

  socket.on('getChunks', async (uuid, cb) => {
    if(!fsDefault.existsSync(`./public/usersFiles/${uuid}.encrypted`)) {
      await File.deleteOne({ uuid });
      return cb(404);
    }
    const CHUNK_SIZE = (1024 * 512) + 28;
    let encryptedFile = new Uint8Array(await fs.readFile(`./public/usersFiles/${uuid}.encrypted`));
    let { chunks, fileName, fileType, message: messageId } = await File.findOne({ uuid });
    const [doubledChunks] = chunks;
    
    const [chunkSize, doubledChunksLength] = doubledChunks.split('-');
    
    chunks = Array.from({ length: doubledChunksLength }, () => parseInt(chunkSize)).concat(chunks.slice(1, chunks.length));
    
    let offset = 0;
    const chunksLength = encryptedFile.length / CHUNK_SIZE;
    
    for(let i = 0; i < chunks.length; i++) {
      let chunk = encryptedFile.slice(offset, offset + chunks[i]);
      let iv = chunk.slice(0, 12);
      let encrypted = chunk.slice(12, chunk.length);
      const sequenceNumber = offset / CHUNK_SIZE;
      const isFileLowerThanChunk = encryptedFile.length < CHUNK_SIZE;
      const percentage = isFileLowerThanChunk ? 100 : ((sequenceNumber / chunksLength.toFixed(0)) * 100).toFixed(0);
      const finished = isFileLowerThanChunk ? true : i + 1 == chunks.length;
      const obj = { iv, encrypted, finished, uuid, percentage, messageId: messageId.toString() };
      if(finished) {
        obj.fileName = fileName;
        obj.fileType = fileType;
        socket.emit('chunk', obj);
        await new Promise(resolve => {
          socket.onAny((eventName, file) => {
            if(eventName == 'done' && file == uuid) resolve();
          });
        });
        cb();
      } else {
        socket.emit('chunk', obj);
        await new Promise(resolve => {
          socket.onAny((eventName, file) => {
            if(eventName == 'done' && file == uuid) resolve();
          });
        });
        offset += chunks[i];
      }
    }
  });

  socket.on('uploadChunk', async ({ fileUUID, percentage, encryptedChunk }, cb) => {
    const author = socket.request.user.id;
    if(percentage == 100) {
      await fs.appendFile(`./public/usersFiles/${fileUUID}.encrypted`, encryptedChunk, { encoding: 'utf-8' });
      await FileUpload.deleteOne({ fileUUID, author });
      return cb();
    }
    await fs.appendFile(`./public/usersFiles/${fileUUID}.encrypted`, encryptedChunk, { encoding: 'utf-8' });
    await FileUpload.deleteOne({ fileUUID, author });
    cb();
  });

  socket.on('newMessage', async ({ message, edited, files, fileDescriptions }, cb) => {
    if(!message?.trim()) return cb();
    const { id, username, createdAt: userCreatedAt } = socket.request.user;
    const { id: messageId, content, createdAt } = await Message.create({ filesCount: files.length, fileDescriptions, content: message, author: id });

    const author = { id, username, createdAt: userCreatedAt };

    if(files.length) {
      socket.request.session.passport.user.uploads = [];
      files = files.map(file => ({ ...file, author: id, message: messageId }));
      await File.insertMany(files);
      await FileUpload.deleteMany({ author: id });
    }
    
    const msg = { id: messageId, edited, content, fileDescriptions, author, files, filesCount: files.length, createdAt };
    socket.to(id).emit('newMessage', msg);
    cb(msg);
  });

  socket.on('editedMessage', ({ id, newContent }) => {
    socket.to(socket.request.user.id).emit('editedMessage', { id, newContent });
  });

  socket.on('removeMessage', id => {
    socket.to(socket.request.user.id).emit('removeMessage', id);
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