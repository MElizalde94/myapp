import { useState, useEffect } from 'react';
import io from 'socket.io-client';

// ✅ Include credentials when connecting to socket
const socket = io(import.meta.env.VITE_BACKEND_URL, {
  withCredentials: true,
  transports: ['websocket', 'polling'],
});

// MychatApp now accepts an 'onBack' prop
function MychatApp({ onBack }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [room, setRoom] = useState('general');

  useEffect(() => {
    // Listener for incoming chat messages
    socket.on('message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    // Listener for historical messages when joining a room
    socket.on('historicalMessages', (msgs) => {
      setMessages(msgs);
    });

    // Cleanup function to remove event listeners when component unmounts
    return () => {
      socket.off('message');
      socket.off('historicalMessages');
    };
  }, []); // Empty dependency array means this effect runs once on mount

  useEffect(() => {
    // Join a room when the user logs in and a room is set
    if (isLoggedIn && room) {
      socket.emit('joinRoom', room);
    }
  }, [isLoggedIn, room]); // Reruns when isLoggedIn or room changes

  // Handles sending a chat message
  const handleSendMessage = (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    if (message.trim() && username && userId) {
      const msgData = {
        userId: userId,
        username: username,
        content: message,
        room: room,
      };
      socket.emit('chatMessage', msgData); // Emit the message to the server
      setMessage(''); // Clear the message input field
    }
  };

  // Handles user login
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Required for CORS to work with credentials
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Login successful:', data);
        setUsername(data.username);
        setUserId(data._id);
        setIsLoggedIn(true);
        localStorage.setItem('token', data.token); // Store token (though not used directly in this snippet)
      } else {
        console.error(data.message || 'Login failed');
        // In a real app, you'd show a user-friendly error message here (e.g., a toast or modal)
      }
    } catch (error) {
      console.error('Login error:', error);
      // In a real app, you'd show a user-friendly error message here
    }
  };

  // Handles the "Hello" button click
  const handleHelloClick = () => {
    console.log('helloo!!!'); // Log message to console instead of alert()
    // In a real app, you could show a custom modal or toast notification here
  };

  // Render login/register form if not logged in
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
            {/* Replaced Register button with Hello button */}
            <button
              type="button"
              onClick={handleHelloClick}
              className="flex-1 p-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Hello
            </button>
          </div>
          {/* Back button for login/register view, styled as an old-school button */}
          <button
            type="button"
            onClick={onBack}
            className="
              mt-4 bg-gray-700 text-green-400 px-4 py-2 rounded-md
              border-t-2 border-l-2 border-gray-600
              border-b-2 border-r-2 border-gray-900
              hover:bg-gray-600 hover:border-gray-900 hover:border-b-gray-600 hover:border-r-gray-600
              transition-all duration-100 ease-in-out
              cursor-pointer
            "
          >
            &lt;-- Back to Main
          </button>
        </form>
        {/* Under Construction message */}
        <p className="mt-4 text-sm text-gray-500">Under Construction</p>
      </div>
    );
  }

  // Render chat interface if logged in
  return (
    <div className="flex flex-col h-[80vh] border border-gray-300 p-4 rounded-lg shadow-xl max-w-4xl mx-auto my-8 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-center flex-grow">
          Welcome, {username}! (Room: {room})
        </h1>
        {/* Back button for chat view, styled as an old-school button */}
        <button
          type="button"
          onClick={onBack}
          className="
            bg-gray-700 text-green-400 px-4 py-2 rounded-md
            border-t-2 border-l-2 border-gray-600
            border-b-2 border-r-2 border-gray-900
            hover:bg-gray-600 hover:border-gray-900 hover:border-b-gray-600 hover:border-r-gray-600
            transition-all duration-100 ease-in-out
            cursor-pointer
            ml-4
          "
        >
          &lt;-- Back to Main
        </button>
      </div>
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