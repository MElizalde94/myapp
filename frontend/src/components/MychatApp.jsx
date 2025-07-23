import { useState, useEffect } from 'react';
import io from 'socket.io-client';

// ✅ Include credentials when connecting to socket
const socket = io(import.meta.env.VITE_BACKEND_URL, {
  withCredentials: true,
  transports: ['websocket', 'polling'],
});

function MychatApp() { // Renamed from App to MychatApp
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [room, setRoom] = useState('general');

  useEffect(() => {
    socket.on('message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    socket.on('historicalMessages', (msgs) => {
      setMessages(msgs);
    });

    return () => {
      socket.off('message');
      socket.off('historicalMessages');
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn && room) {
      socket.emit('joinRoom', room);
    }
  }, [isLoggedIn, room]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && username && userId) {
      const msgData = {
        userId: userId,
        username: username,
        content: message,
        room: room,
      };
      socket.emit('chatMessage', msgData);
      setMessage('');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // ✅ Required for CORS to work with credentials
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Login successful:', data);
        setUsername(data.username);
        setUserId(data._id);
        setIsLoggedIn(true);
        localStorage.setItem('token', data.token);
      } else {
        // Using a custom message box instead of alert()
        console.error(data.message || 'Login failed');
        // You might want to implement a custom modal or toast notification here
      }
    } catch (error) {
      console.error('Login error:', error);
      // Using a custom message box instead of alert()
      // You might want to implement a custom modal or toast notification here
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // ✅ Required here too
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Registration successful:', data);
        // Using a custom message box instead of alert()
        // You might want to implement a custom modal or toast notification here
      } else {
        // Using a custom message box instead of alert()
        console.error(data.message || 'Registration failed');
        // You might want to implement a custom modal or toast notification here
      }
    } catch (error) {
      console.error('Registration error:', error);
      // Using a custom message box instead of alert()
      // You might want to implement a custom modal or toast notification here
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="p-5 border border-gray-300 rounded-lg w-72 mx-auto mt-12 text-center shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Login / Register</h2>
        <form onSubmit={handleLogin} className="flex flex-col space-y-3">
          <input
            type="text"
            placeholder="Username"
            value={loginUsername}
            onChange={(e) => setLoginUsername(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex justify-between space-x-2">
            <button
              type="submit"
              className="flex-1 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Login
            </button>
            <button
              type="button"
              onClick={handleRegister}
              className="flex-1 p-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[80vh] border border-gray-300 p-4 rounded-lg shadow-xl max-w-4xl mx-auto my-8 bg-white">
      <h1 className="text-3xl font-bold mb-4 text-center">
        Welcome, {username}! (Room: {room})
      </h1>
      <div className="flex-grow overflow-y-auto border-b border-gray-200 pb-2 mb-4 text-left space-y-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 rounded-lg ${
              msg.sender === username
                ? 'bg-blue-100 ml-auto text-right'
                : 'bg-gray-100 mr-auto text-left'
            }`}
          >
            <strong className="mr-1">{msg.sender}:</strong> {msg.content}{' '}
            <small className="text-gray-500 text-xs ml-2">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </small>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          required
          className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default MychatApp;