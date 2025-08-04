const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Import your Mongoose models
const User = require('./models/User'); // Corrected import name
const Message = require('./models/Message');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Define your allowed origins (centralized for both Express and Socket.IO CORS)
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173', // Primary frontend URL from .env or default
    'http://frontend:80', // Example for Docker/production environment
    'http://localhost:80', // Common local development port
    'http://localhost:5175', // Another potential frontend dev port
    'http://localhost:4173', // Another potential frontend dev port you mentioned
    'http://localhost', // Fallback for various local setups
    'http://35.238.181.235' // Example for a deployed IP
];

// Socket.IO CORS Configuration
const io = new socketIo.Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true // Crucial for sending cookies/headers from client
    }
});

// Express CORS Middleware Configuration
app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'], // Essential if you're sending tokens
    credentials: true, // IMPORTANT: Add credentials to Express CORS if you're using cookies/auth headers
}));
app.use(express.json()); // For parsing JSON request bodies

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected!'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth')); // Authentication routes
app.get('/', (req, res) => {
    res.send('Chat App Backend is running!'); // Basic health check route
});

// --- Socket.IO Logic ---

// Store active users: Map socket.id to user data (userId, username, currentRoom)
// This map holds the server's current understanding of who is connected and where.
const usersOnline = new Map();

// Helper function to emit the updated online users list for a specific room
const emitOnlineUsers = (targetRoomId) => {
    if (!targetRoomId) {
        console.warn("[Socket.IO] Attempted to emit online users without a targetRoomId.");
        return;
    }

    // Filter users that are currently in the target room and have a valid username
    const activeUsersInRoom = Array.from(usersOnline.values())
        .filter(user => user.currentRoom === targetRoomId && user.username)
        .map(user => ({ userId: user.userId, username: user.username })); // Only send necessary data

    // Emit the list to all sockets in that specific room
    io.to(targetRoomId).emit('usersOnline', activeUsersInRoom);
    console.log(`[Socket.IO] Emitting online users for room '${targetRoomId}': ${activeUsersInRoom.length} users`);
};


io.on('connection', (socket) => {
    console.log(`[Socket.IO] A user connected: ${socket.id}`);

    // Frontend emits this after successful HTTP login to associate user data with the socket.
    // The 'callback' function allows the frontend to know when the server has processed this.
    socket.on('setUserInfo', ({ userId, username }, callback) => {
        if (!userId || !username) {
            console.warn(`[Socket.IO] setUserInfo: Missing userId or username for socket ${socket.id}`);
            if (typeof callback === 'function') {
                callback({ status: 'error', message: 'Missing user ID or username.' });
            }
            return;
        }

        // Store or update the user's details with their socket.id
        // currentRoom is initially null as they haven't joined a chat room yet.
        usersOnline.set(socket.id, { userId, username, currentRoom: null });
        console.log(`[Socket.IO] User info set for socket ${socket.id}: ${username}`);

        // Call the callback to acknowledge success back to the client
        if (typeof callback === 'function') {
            callback({ status: 'ok' });
        }
    });


    // When a user joins a specific chat room
    socket.on('joinRoom', async (roomId) => {
        const user = usersOnline.get(socket.id);

        // Security check: Ensure user info is set before allowing them to join a room
        if (!user || !user.userId) {
            console.warn(`[Socket.IO] Attempted to join room '${roomId}' but user info not set for socket ${socket.id}. Disconnecting.`);
            // Inform the client that authentication is required
            socket.emit('authRequired', 'Please log in to join a room.');
            socket.disconnect(true); // Force disconnect to prevent unauthorized access
            return;
        }

        // If the user was in a previous room, make them leave it
        const previousRoom = user.currentRoom;
        if (previousRoom && previousRoom !== roomId) {
            socket.leave(previousRoom);
            console.log(`[Socket.IO] User ${user.username} left room: ${previousRoom}`);
            // Update online users for the room they just left
            emitOnlineUsers(previousRoom);
        }

        socket.join(roomId); // Add the socket to the new room
        user.currentRoom = roomId; // Update the user's current room in our tracking map
        usersOnline.set(socket.id, user); // Save the updated user object back to the map
        console.log(`[Socket.IO] User ${user.username} joined room: ${roomId}`);

        // Fetch previous messages for this room and send them to the joining user
        try {
            const historicalMessages = await Message.find({ room: roomId })
                                                    .sort({ timestamp: 1 }) // Sort by oldest to newest
                                                    .limit(50) // Limit to last 50 messages
                                                    .populate('sender', 'username'); // Populate sender's username from User model

            socket.emit('historicalMessages', historicalMessages.map(msg => ({
                _id: msg._id, // Include _id for better React keys
                sender: msg.sender ? msg.sender.username : 'Unknown', // Handle potential missing sender gracefully
                content: msg.content,
                room: msg.room,
                timestamp: msg.timestamp.toISOString() // Ensure consistent date format
            })));
        } catch (error) {
            console.error('[Socket.IO Error] Error fetching historical messages:', error);
            // Optionally, emit an error back to the client
            socket.emit('messageError', 'Failed to load historical messages.');
        }

        // Emit the updated online users list for the specific room the user just joined
        emitOnlineUsers(roomId);
    });

    // When a user sends a chat message
    socket.on('chatMessage', async (msg) => {
        // Expected msg from frontend: { content, room }
        console.log(`[Socket.IO] Received chatMessage from client (${socket.id}):`, msg);

        const senderInfo = usersOnline.get(socket.id);

        // Validate that senderInfo exists and they are in the correct room (security/integrity check)
        if (!senderInfo || !senderInfo.userId || senderInfo.currentRoom !== msg.room) {
            console.warn(`[Socket.IO] Unauthorized/Invalid message from ${socket.id}. User info missing or room mismatch.`);
            socket.emit('messageError', 'Failed to send message: Not authenticated or in wrong room.');
            return;
        }

        try {
            // Create a new message document using the sender's ID from our tracking map
            const newMessage = new Message({
                sender: senderInfo.userId,
                room: msg.room,
                content: msg.content,
                timestamp: new Date() // Set current timestamp
            });

            // Save the message to the database
            const savedMessage = await newMessage.save();
            console.log('[Socket.IO] Message saved to DB:', savedMessage._id);

            // Prepare the message for broadcasting (use username from senderInfo, not re-populate)
            const messageToBroadcast = {
                _id: savedMessage._id, // Pass _id for React keys
                sender: senderInfo.username, // Use the username we stored for this socket
                content: savedMessage.content,
                room: savedMessage.room,
                timestamp: savedMessage.timestamp.toISOString(),
            };

            // Broadcast the message to all clients in the same room
            io.to(msg.room).emit('message', messageToBroadcast);
            console.log(`[Socket.IO] Message broadcasted to room ${msg.room}: ${messageToBroadcast.content}`);

        } catch (error) {
            console.error('[Socket.IO Error] Error saving message to DB or broadcasting:', error);
            socket.emit('messageError', 'Failed to send message due to server error.');
        }
    });

    // NEW: Handle a specific 'logout' event from the client
    socket.on('logout', () => {
        console.log(`[Socket.IO] User explicitly logged out from socket: ${socket.id}`);
        // The cleanup logic is identical to a normal disconnect.
        const userLoggedOut = usersOnline.get(socket.id);
        if (userLoggedOut) {
            const roomToUpdate = userLoggedOut.currentRoom;
            usersOnline.delete(socket.id);
            console.log(`[Socket.IO] Removed ${userLoggedOut.username} from online users.`);
            // Inform others in the room that this user has left
            if (roomToUpdate) {
                emitOnlineUsers(roomToUpdate);
            }
        }
    });

    // When a user disconnects from the socket
    socket.on('disconnect', () => {
        console.log(`[Socket.IO] User disconnected: ${socket.id}`);
        const userDisconnected = usersOnline.get(socket.id); // Get user info before deleting
        if (userDisconnected) {
            usersOnline.delete(socket.id); // Remove user from tracking map
            console.log(`[Socket.IO] Removed ${userDisconnected.username || 'unknown'} (socket: ${socket.id}) from online users.`);
            // If the user was in a room, update the online list for that room
            if (userDisconnected.currentRoom) {
                emitOnlineUsers(userDisconnected.currentRoom);
            }
        }
    });
});

// Start the server
const PORT = process.env.PORT || 5005; // Using 5005 as a default
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});