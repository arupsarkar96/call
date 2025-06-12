import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { randomUUID } from 'crypto';

// Extend WebSocket to store ID and current room
interface Client extends WebSocket {
    id: string;
    room?: string;
}

// Define expected message format
interface SignalingMessage {
    event: string;
    data: any;
}

// Room => Set of connected clients
const rooms: Map<string, Set<Client>> = new Map();

// Create HTTP and WebSocket servers
const httpServer = createServer();
const wss = new WebSocketServer({ server: httpServer });

wss.on('connection', (ws: WebSocket) => {
    const client = ws as Client;
    client.id = randomUUID();

    console.log(`🔌 Client connected: ${client.id}`);

    ws.on('message', (raw) => {
        let msg: SignalingMessage;
        try {
            msg = JSON.parse(raw.toString());
        } catch {
            console.error('❌ Invalid message format');
            return;
        }

        const { event, data } = msg;

        switch (event) {
            case 'join':
                handleJoin(client, data.room);
                break;

            case 'offer':
            case 'answer':
            case 'candidate':
            case 'accept':
            case 'reject':
            case 'end':
                if (!client.room) return;
                broadcastToRoom(client, event, { ...data, sender: client.id });
                break;

            default:
                console.warn(`⚠️ Unknown event: ${event}`);
        }
    });

    ws.on('close', () => {
        console.log(`❎ Client disconnected: ${client.id}`);
        if (client.room && rooms.has(client.room)) {
            rooms.get(client.room)!.delete(client);
            if (rooms.get(client.room)!.size === 0) {
                rooms.delete(client.room);
            } else {
                broadcastToRoom(client, 'left', { sender: client.id });
            }
        }
    });
});

// --- Room management and signaling logic ---
function handleJoin(client: Client, room: string) {
    // Leave previous room if needed
    if (client.room) {
        const oldRoom = rooms.get(client.room);
        oldRoom?.delete(client);
    }

    client.room = room;
    if (!rooms.has(room)) rooms.set(room, new Set());
    rooms.get(room)!.add(client);

    console.log(`🏠 Client ${client.id} joined room ${room}`);
    broadcastToRoom(client, 'joined', { sender: client.id });
}

function broadcastToRoom(sender: Client, event: string, data: any) {
    const roomClients = rooms.get(sender.room!);
    if (!roomClients) return;

    for (const client of roomClients) {
        if (client !== sender && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ event, data }));
        }
    }
}

// --- Start Server ---
const PORT = 8083;
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 WebRTC signaling server running on port ${PORT}`);
});
