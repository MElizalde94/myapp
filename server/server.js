const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Import your Mongoose models
const users = require('./models/User'); // Assuming you'll need this for sender info if populating
const Message = require('./models/Message'); // <<< NEW: Import Message model

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new socketIo.Server(server, {
    cors: {
        origin: [
            'http://frontend:80',
            'http://localhost:80',
            'http://localhost:5175',
            'http://localhost:4173',
            'http://localhost',
            'http://35.238.181.235'
        ],
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Middleware for Express routes (this is separate from Socket.IO's CORS)
app.use(cors({
    origin: [
        'http://frontend:80',
        'http://localhost:80',
        'http://localhost:5175',
        'http://localhost:4173',
        'http://localhost',
        'http://35.238.181.235'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected!'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.get('/', (req, res) => {
    res.send('Chat App Backend is running!');
});

// --- Socket.IO Logic ---
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // When a user joins a specific chat room
    socket.on('joinRoom', async (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room: ${roomId}`);

        try {
            // Fetch previous messages for this room and send them to the joining user
            // We'll sort by timestamp to get them in order
            // .populate('sender', 'username') will replace the sender ID with the user's username
            const historicalMessages = await Message.find({ room: roomId })
                                                    .sort({ timestamp: 1 }) // Sort by oldest to newest
                                                    .limit(50) // Limit to last 50 messages
                                                    .populate('sender', 'username'); // Populate sender's username

            socket.emit('historicalMessages', historicalMessages.map(msg => ({
                sender: msg.sender.username, // Send username
                content: msg.content,
                room: msg.room,
                timestamp: msg.timestamp.toISOString()
            })));

        } catch (error) {
            console.error('Error fetching historical messages:', error);
        }
    });

    // When a user sends a chat message
    socket.on('chatMessage', async (msg) => {
        // msg is expected to have: { userId, username, content, room }
        console.log(`Message from ${msg.username} in room ${msg.room}: ${msg.content}`);

        try {
            // Create a new message document
            const newMessage = new Message({
                sender: msg.userId, // Use the actual MongoDB ObjectId for the sender
                room: msg.room,
                content: msg.content,
                timestamp: new Date() // Automatically set by default, but explicitly here for clarity
            });

            // Save the message to the database
            await newMessage.save();
            console.log('Message saved to DB:', newMessage);

            // Fetch the populated sender username for broadcasting
            const populatedMessage = await newMessage.populate('sender', 'username');

            // Broadcast the message to all clients in the same room, including the sender's username
            io.to(msg.room).emit('message', {
                sender: populatedMessage.sender.username, // Send the username back to client
                content: populatedMessage.content,
                room: populatedMessage.room,
                timestamp: populatedMessage.timestamp.toISOString(), // Ensure consistent format
            });

        } catch (error) {
            console.error('Error saving message to DB:', error);
            // Optionally, emit an error back to the sender
            socket.emit('messageError', 'Failed to send message.');
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Start the server
const PORT = process.env.PORT || 5005; // Changed to 5001 to avoid conflicts if 5000 is used by other services
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});