import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
    // options
});





io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // When a user joins a room
    socket.on('join', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room ${room}`);
        // Notify other users in the room
        socket.to(room).emit('user-joined', socket.id);
    });

    // When a user On a active call
    socket.on('call_ongoing', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} ON a CALL joined room ${room}`);
        // Notify other users in the room
        socket.to(room).emit('call_ongoing', socket.id);
    });


    // When a user On a active call
    socket.on('missed', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} ON missed call room ${room}`);
        // Notify other users in the room
        socket.to(room).emit('missed', socket.id);
    });

    // When a user joins a room
    socket.on('ringing', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} RINGING joined room ${room}`);
        // Notify other users in the room
        socket.to(room).emit('ringing', socket.id);
    });

    // When a user sends an offer
    socket.on('offer', (data) => {
        const { room, sdp } = data;
        console.log(`Offer from ${socket.id} in room ${room}`);
        socket.to(room).emit('offer', { sdp, sender: socket.id });
    });

    // Reject call
    socket.on('reject', (data) => {
        const { room } = data;
        console.log(`Reject from ${socket.id} in room ${room}`);
        socket.to(room).emit('reject');
    });

    // Accept call
    socket.on('accept', (data) => {
        const { room } = data;
        console.log(`Accept from ${socket.id} in room ${room}`);
        socket.to(room).emit('accept');
    });

    // End call
    socket.on('end', (data) => {
        const { room } = data;
        console.log(`End from ${socket.id} in room ${room}`);
        socket.to(room).emit('end');
    });

    // When a user sends an answer
    socket.on('answer', (data) => {
        const { room, sdp } = data;
        console.log(`Answer from ${socket.id} in room ${room}`);
        socket.to(room).emit('answer', { sdp, sender: socket.id });
    });

    // When a user sends an ICE candidate
    socket.on('candidate', (data) => {
        const { room, candidate } = data;
        console.log(`ICE candidate from ${socket.id} in room ${room}`);
        socket.to(room).emit('candidate', { candidate, sender: socket.id });
    });

    // When a user disconnects
    socket.on('disconnect', () => {
        console.log(`User ${socket.id} disconnected`);
    });

});


httpServer.listen(8083, '0.0.0.0', () => {
    console.log("CALL", 8083)
});