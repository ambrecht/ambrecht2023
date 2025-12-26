// server.js
import http from 'http';
import { Server } from 'socket.io';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    // Handle Next.js requests
    handle(req, res);
  });

  const io = new Server(server, {
    cors: {
      origin: 'https://www.ambrecht.de', // Replace with your production domain
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Neuer Client verbunden:', socket.id);

    socket.on('typing', (data) => {
      console.log('Empfangen von', socket.id, ':', data.text);
      socket.broadcast.emit('update', { text: data.text });
    });
  });

  server.listen(3000, () => {
    console.log('Server läuft auf http://localhost:3000');
  });
});
