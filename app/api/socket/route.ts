import { NextResponse } from 'next/server';
import { Server } from 'socket.io';

export const runtime = 'nodejs';

export function GET(req: Request) {
  // Prüfen, ob bereits ein Socket.IO-Server existiert
  // @ts-ignore
  if ((global as any).socketServer) {
    console.log('Socket.IO läuft bereits');
  } else {
    console.log('Initialisiere Socket.IO');
    // @ts-ignore
    const io = new Server((req as any).socket.server, {
      cors: {
        origin: 'https://www.ambrecht.de', // Produktion: Ihre Domain
        methods: ['GET', 'POST'],
      },
    });
    // Speichern der Instanz in einer globalen Variable, damit nicht bei jedem Request ein neuer Socket-Server gestartet wird
    // @ts-ignore
    (global as any).socketServer = io;

    io.on('connection', (socket) => {
      console.log('Neuer Client verbunden:', socket.id);

      // Beispiel: Empfang einer "typing"-Nachricht vom Client
      socket.on('typing', (data) => {
        console.log('Empfangen von', socket.id, ':', data.text);
        // Senden des Updates an alle anderen Clients
        socket.broadcast.emit('update', { text: data.text });
      });
    });
  }
  return NextResponse.json({ message: 'Socket.IO initialisiert' });
}
