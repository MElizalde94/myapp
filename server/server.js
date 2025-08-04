const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Import your Mongoose models
const User = require('./models/User');
const Message = require('./models/Message');

dotenv.config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://frontend:80',
    'http://localhost:80',
    'http://localhost:5175',
    'http://localhost:4173',
    'http://localhost',
    'http://35.238.181.235'
];

const io = new socketIo.Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected!'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', require('./routes/auth'));
app.get('/', (req, res) => {
    res.send('Chat App Backend is running!');
});

const usersOnline = new Map();

const emitOnlineUsers = (targetRoomId) => {
    if (!targetRoomId) {
        console.warn("[Socket.IO] Attempted to emit online users without a targetRoomId.");
        return;
    }
    const activeUsersInRoom = Array.from(usersOnline.values())
        .filter(user => user.currentRoom === targetRoomId && user.username)
        .map(user => ({ userId: user.userId, username: user.username }));
    io.to(targetRoomId).emit('usersOnline', activeUsersInRoom);
    console.log(`[Socket.IO] Emitting online users for room '${targetRoomId}': ${activeUsersInRoom.length} users`);
};

// --- NEW: Hardcoded list of user IDs authorized for the 'dev-team' room ---
// In a real application, this would be fetched from a database.
const authorizedDevTeamUserIds = [
    '67881a3ee83d2132a2441b17', // Replace with an actual user ID from your MongoDB
    '688b6cc36d6a6ffa0fdcc4f4 '  // Replace with another authorized user ID
];

io.on('connection', (socket) => {
    console.log(`[Socket.IO] A user connected: ${socket.id}`);

    socket.on('setUserInfo', ({ userId, username }, callback) => {
        if (!userId || !username) {
            console.warn(`[Socket.IO] setUserInfo: Missing userId or username for socket ${socket.id}`);
            if (typeof callback === 'function') {
                callback({ status: 'error', message: 'Missing user ID or username.' });
            }
            return;
        }
        usersOnline.set(socket.id, { userId, username, currentRoom: null });
        console.log(`[Socket.IO] User info set for socket ${socket.id}: ${username}`);
        if (typeof callback === 'function') {
            callback({ status: 'ok' });
        }
    });

    socket.on('joinRoom', async (roomId) => {
        const user = usersOnline.get(socket.id);

        if (!user || !user.userId) {
            console.warn(`[Socket.IO] Attempted to join room '${roomId}' but user info not set for socket ${socket.id}. Disconnecting.`);
            socket.emit('authRequired', 'Please log in to join a room.');
            socket.disconnect(true);
            return;
        }

        // --- NEW: Authorization check for the private room ---
        if (roomId === 'dev-team') {
            if (!authorizedDevTeamUserIds.includes(user.userId)) {
                console.warn(`[Socket.IO] User ${user.username} (ID: ${user.userId}) attempted unauthorized access to 'dev-team' room.`);
                socket.emit('unauthorized', 'You do not have permission to join this room.');
                return; // Do not proceed with joining the room
            }
        }
        // --- END NEW LOGIC ---

        const previousRoom = user.currentRoom;
        if (previousRoom && previousRoom !== roomId) {
            socket.leave(previousRoom);
            console.log(`[Socket.IO] User ${user.username} left room: ${previousRoom}`);
            emitOnlineUsers(previousRoom);
        }

        socket.join(roomId);
        user.currentRoom = roomId;
        usersOnline.set(socket.id, user);
        console.log(`[Socket.IO] User ${user.username} joined room: ${roomId}`);
        try {
            const historicalMessages = await Message.find({ room: roomId })
                                                    .sort({ timestamp: 1 })
                                                    .limit(50)
                                                    .populate('sender', 'username');
            socket.emit('historicalMessages', historicalMessages.map(msg => ({
                _id: msg._id,
                sender: msg.sender ? msg.sender.username : 'Unknown',
                content: msg.content,
                room: msg.room,
                timestamp: msg.timestamp.toISOString()
            })));
        } catch (error) {
            console.error('[Socket.IO Error] Error fetching historical messages:', error);
            socket.emit('messageError', 'Failed to load historical messages.');
        }
        emitOnlineUsers(roomId);
    });

    socket.on('chatMessage', async (msg) => {
        console.log(`[Socket.IO] Received chatMessage from client (${socket.id}):`, msg);
        const senderInfo = usersOnline.get(socket.id);
        if (!senderInfo || !senderInfo.userId || senderInfo.currentRoom !== msg.room) {
            console.warn(`[Socket.IO] Unauthorized/Invalid message from ${socket.id}. User info missing or room mismatch.`);
            socket.emit('messageError', 'Failed to send message: Not authenticated or in wrong room.');
            return;
        }
        try {
            const newMessage = new Message({
                sender: senderInfo.userId,
                room: msg.room,
                content: msg.content,
                timestamp: new Date()
            });
            const savedMessage = await newMessage.save();
            console.log('[Socket.IO] Message saved to DB:', savedMessage._id);
            const messageToBroadcast = {
                _id: savedMessage._id,
                sender: senderInfo.username,
                content: savedMessage.content,
                room: savedMessage.room,
                timestamp: savedMessage.timestamp.toISOString(),
            };
            io.to(msg.room).emit('message', messageToBroadcast);
            console.log(`[Socket.IO] Message broadcasted to room ${msg.room}: ${messageToBroadcast.content}`);
        } catch (error) {
            console.error('[Socket.IO Error] Error saving message to DB or broadcasting:', error);
            socket.emit('messageError', 'Failed to send message due to server error.');
        }
    });

    socket.on('logout', () => {
        console.log(`[Socket.IO] User explicitly logged out from socket: ${socket.id}`);
        const userLoggedOut = usersOnline.get(socket.id);
        if (userLoggedOut) {
            const roomToUpdate = userLoggedOut.currentRoom;
            usersOnline.delete(socket.id);
            console.log(`[Socket.IO] Removed ${userLoggedOut.username} from online users.`);
            if (roomToUpdate) {
                emitOnlineUsers(roomToUpdate);
            }
        }
    });

    socket.on('disconnect', () => {
        console.log(`[Socket.IO] User disconnected: ${socket.id}`);
        const userDisconnected = usersOnline.get(socket.id);
        if (userDisconnected) {
            usersOnline.delete(socket.id);
            console.log(`[Socket.IO] Removed ${userDisconnected.username || 'unknown'} (socket: ${socket.id}) from online users.`);
            if (userDisconnected.currentRoom) {
                emitOnlineUsers(userDisconnected.currentRoom);
            }
        }
    });
});

const PORT = process.env.PORT || 5005;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});