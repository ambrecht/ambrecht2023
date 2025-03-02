import { NextResponse } from 'next/server';
import { Server } from 'socket.io';

export const config = {
  runtime: 'nodejs', // Sicherstellen, dass die Node.js-Laufzeit verwendet wird
};

export default function handler(req: Request) {
  // Prüfen, ob bereits ein Socket-Server existiert
  // @ts-ignore
  if ((global as any).socketServer) {
    console.log('Socket.IO läuft bereits');
  } else {
    console.log('Initialisiere Socket.IO');
    // @ts-ignore
    const io = new Server((req as any).socket.server, {
      cors: {
        origin: '*', // Passen Sie dies ggf. an
        methods: ['GET', 'POST'],
      },
    });
    // Speichern Sie die Instanz global, damit nicht bei jedem Request ein neuer Socket-Server gestartet wird
    // @ts-ignore
    (global as any).socketServer = io;

    io.on('connection', (socket) => {
      console.log('Neuer Client verbunden:', socket.id);

      // Beispiel: Empfang einer "typing"-Nachricht vom Client
      socket.on('typing', (data) => {
        console.log('Empfangen von', socket.id, ':', data.text);
        // Hier können Sie den Text in Redis speichern oder weitere Prüfungen vornehmen
        socket.broadcast.emit('update', { text: data.text });
      });
    });
  }
  return NextResponse.json({ message: 'Socket.IO initialisiert' });
}
