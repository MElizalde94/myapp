import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  withCredentials: true,
  transports: ['websocket', 'polling'],
});

function MychatApp({ onBack }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [room, setRoom] = useState('general');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [userSetOnBackend, setUserSetOnBackend] = useState(false); // NEW STATE: Tracks if user info is sent & acknowledged by backend

  useEffect(() => {
    // Listener for incoming chat messages
    socket.on('message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    // Listener for historical messages when joining a room
    socket.on('historicalMessages', (msgs) => {
      setMessages(msgs);
    });

    // NEW: Listener for the online users list from the server
    socket.on('usersOnline', (users) => {
      console.log('Frontend: Received online users:', users); // Debug log
      setOnlineUsers(users);
    });

    // NEW: Listener for authentication required messages from backend
    socket.on('authRequired', (msg) => {
        console.error("Frontend: Backend requires authentication:", msg);
        // Reset login state if backend indicates authentication is missing
        setIsLoggedIn(false);
        setUserId('');
        setUsername('');
        setUserSetOnBackend(false); // Reset this flag too
        alert(msg + " Please log in again."); // User-friendly alert
    });

    // Cleanup function to remove event listeners when component unmounts
    return () => {
      socket.off('message');
      socket.off('historicalMessages');
      socket.off('usersOnline'); // Cleanup the new listener
      socket.off('authRequired'); // Cleanup authRequired listener
    };
  }, []); // Empty dependency array means this effect runs once on mount

  // NEW useEffect: Emit user info to the backend after successful login, and wait for acknowledgment
  useEffect(() => {
    // Only emit if logged in, user details are available, and info hasn't been set on backend yet
    if (isLoggedIn && userId && username && !userSetOnBackend) {
      console.log('Frontend: Emitting setUserInfo to backend...');
      socket.emit('setUserInfo', { userId, username }, (response) => {
        if (response.status === 'ok') {
          console.log('Frontend: setUserInfo acknowledged by backend.');
          setUserSetOnBackend(true); // Mark as set successfully
        } else {
          console.error('Frontend: setUserInfo failed:', response.message);
          // Handle error, e.g., show an error message, or try again
          alert(`Failed to set user info on chat server: ${response.message}`);
          // You might choose to log out or prevent joining a room if this fails critically
        }
      });
    }
  }, [isLoggedIn, userId, username, userSetOnBackend]); // Dependencies for this effect

  // Join a room ONLY AFTER user is logged in, a room is set, AND user info is confirmed on backend
  useEffect(() => {
    if (isLoggedIn && room && userSetOnBackend) { // ADDED userSetOnBackend condition
      console.log(`Frontend: User ${username} (ID: ${userId}) joining room: ${room}`);
      socket.emit('joinRoom', room);
    }
  }, [isLoggedIn, room, username, userId, userSetOnBackend]); // Reruns when these change

  // Handles sending a chat message
  const handleSendMessage = (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    if (message.trim() && username && userId) { // Ensure all necessary data is present
      const msgData = {
        // userId and username are not sent here; backend uses its stored info for the socket.
        content: message,
        room: room,
      };
      socket.emit('chatMessage', msgData); // Emit the message to the server
      setMessage(''); // Clear the message input field
    } else {
        console.warn('Frontend: Cannot send message. Missing content, username, or userId.');
        // Optionally provide user feedback: alert('Please type a message and ensure you are logged in.');
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
        credentials: 'include', // Required for CORS to work with cookies/credentials
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Login successful:', data);
        setUsername(data.username);
        setUserId(data._id);
        setIsLoggedIn(true);
        // IMPORTANT: Reset userSetOnBackend to false so the setUserInfo useEffect triggers for the new login
        setUserSetOnBackend(false);
        localStorage.setItem('token', data.token); // Store token (for protecting API calls if you add them later)
      } else {
        alert(data.message || 'Login failed');
        console.error('Login failed:', data.message || 'Unknown error');
        // In a real app, you'd show a user-friendly error message here (e.g., a toast or modal)
      }
    } catch (error) {
      console.error('Login network error:', error);
      alert('Login failed due to network error.');
      // In a real app, you'd show a user-friendly error message here
    }
  };

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
            <button
              type="button"
              onClick={handleHelloClick} // Using the handleHelloClick for the "Hello" button
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
        </form> {/* ✅ Corrected: The closing form tag was missing here */}
        {/* Under Construction message */}
        <p className="mt-4 text-sm text-gray-500">Under Construction</p>
      </div>
    );
  }

  // Render chat interface if logged in
  return (
    // Updated container to use flex layout for chat and user list
    <div className="flex h-[80vh] max-w-6xl mx-auto my-8 bg-white border border-gray-300 rounded-lg shadow-xl">
      {/* Chat Area (Main Content) */}
      <div className="flex flex-col flex-grow p-4">
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
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center">No messages yet. Start chatting!</p>
          ) : (
            messages.map((msg, index) => (
              <div
                key={msg._id || index} // Use msg._id for a stable key, fallback to index
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
            ))
          )}
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

      {/* Online Users List */}
      <div className="w-64 bg-gray-50 border-l border-gray-200 p-4 flex flex-col">
        <h2 className="text-xl font-semibold mb-4 text-center">Online Users ({onlineUsers.length})</h2>
        <ul className="flex-grow overflow-y-auto space-y-2">
          {onlineUsers.length > 0 ? (
            onlineUsers.map((user) => (
              <li
                key={user.userId} // Use userId as the key for uniqueness
                className={`p-2 rounded-md ${
                  user.username === username ? 'bg-green-200 font-bold' : 'bg-white shadow-sm'
                } flex items-center gap-2`}
              >
                {/* Simple online indicator dot with pulse animation */}
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                {user.username}
              </li>
            ))
          ) : (
            <p className="text-gray-500 text-sm text-center">No other users online.</p>
          )}
        </ul>
      </div>
    </div>
  );
}

export default MychatApp;