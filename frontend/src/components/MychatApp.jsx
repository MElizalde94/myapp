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
  const [userSetOnBackend, setUserSetOnBackend] = useState(false);

  // Effect for setting up Socket.IO listeners (runs once on mount)
  useEffect(() => {
    socket.on('message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    socket.on('historicalMessages', (msgs) => {
      setMessages(msgs);
    });

    socket.on('usersOnline', (users) => {
      console.log('Frontend: Received online users:', users);
      setOnlineUsers(users);
    });

    socket.on('authRequired', (msg) => {
        console.error("Frontend: Backend requires authentication:", msg);
        // If backend says auth is required, force client-side logout
        handleLogout(false); // Call handleLogout without navigating back immediately
        alert(msg + " Please log in again.");
    });

    // Cleanup function to remove event listeners when component unmounts
    return () => {
      socket.off('message');
      socket.off('historicalMessages');
      socket.off('usersOnline');
      socket.off('authRequired');
    };
  }, []);

  // NEW EFFECT: Attempt to re-authenticate user from localStorage on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    const storedUsername = localStorage.getItem('username');

    if (storedToken && storedUserId && storedUsername && !isLoggedIn) {
      console.log('Frontend: Found stored credentials, attempting to re-login...');
      // Re-hydrate state from local storage
      setUsername(storedUsername);
      setUserId(storedUserId);
      setIsLoggedIn(true);
      // Reset userSetOnBackend to false so the setUserInfo effect triggers
      setUserSetOnBackend(false);
      // Note: We don't need to call handleLogin here, as setting isLoggedIn will trigger
      // the setUserInfo and joinRoom effects.
    }
  }, []); // Empty dependency array means this runs only once on initial mount

  // Effect for emitting user info to the backend and waiting for acknowledgment
  useEffect(() => {
    if (isLoggedIn && userId && username && !userSetOnBackend) {
      console.log('Frontend: Emitting setUserInfo to backend...');
      socket.emit('setUserInfo', { userId, username }, (response) => {
        if (response.status === 'ok') {
          console.log('Frontend: setUserInfo acknowledged by backend.');
          setUserSetOnBackend(true);
        } else {
          console.error('Frontend: setUserInfo failed:', response.message);
          alert(`Failed to set user info on chat server: ${response.message}`);
          // If setting user info fails, it's safer to log out
          handleLogout(false); // Log out without navigating back immediately
        }
      });
    }
  }, [isLoggedIn, userId, username, userSetOnBackend]);

  // Effect for joining a room (runs only after user info is confirmed on backend)
  useEffect(() => {
    if (isLoggedIn && room && userSetOnBackend) {
      console.log(`Frontend: User ${username} (ID: ${userId}) joining room: ${room}`);
      socket.emit('joinRoom', room);
    }
  }, [isLoggedIn, room, username, userId, userSetOnBackend]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && username && userId) {
      const msgData = {
        content: message,
        room: room,
      };
      socket.emit('chatMessage', msgData);
      setMessage('');
    } else {
        console.warn('Frontend: Cannot send message. Missing content, username, or userId.');
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
        credentials: 'include',
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Login successful:', data);
        setUsername(data.username);
        setUserId(data._id);
        setIsLoggedIn(true);
        setUserSetOnBackend(false); // Reset to trigger setUserInfo effect
        // Store credentials in localStorage for persistence
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data._id);
        localStorage.setItem('username', data.username);
      } else {
        alert(data.message || 'Login failed');
        console.error('Login failed:', data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Login network error:', error);
      alert('Login failed due to network error.');
    }
  };

  // Modified handleLogout to accept an optional 'navigateBack' parameter
  const handleLogout = (navigateBack = true) => {
    console.log('Frontend: Logging out user...');
    socket.emit('logout'); // Notify the backend
    
    // Clear all local state
    setIsLoggedIn(false);
    setUsername('');
    setUserId('');
    setUserSetOnBackend(false);
    setMessages([]);
    setOnlineUsers([]);
    setRoom('general'); // Reset to default room
    
    // Clean up stored credentials
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');

    if (navigateBack) {
      onBack(); // Only navigate back if explicitly requested (e.g., by button click)
    }
  };

  const handleHelloClick = () => {
    console.log('helloo!!!');
  };

  if (!isLoggedIn) {
    return (
      <div className="p-5 border border-gray-300 rounded-lg w-72 mx-auto mt-12 text-center shadow-lg bg-white"> {/* Added bg-white for consistency */}
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
              onClick={handleHelloClick}
              className="flex-1 p-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Hello
            </button>
          </div>
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
        <p className="mt-4 text-sm text-gray-500">Under Construction</p>
      </div>
    );
  }

  return (
    // Main container with gray-200 background
    <div className="flex h-[80vh] max-w-6xl mx-auto my-8 bg-white border border-gray-300 rounded-lg shadow-xl">
      {/* Chat Area (Main Content) */}
      <div className="flex flex-col flex-grow p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-center flex-grow">
            Welcome, {username}! (Room: {room})
          </h1>
          <div className="flex gap-2">
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
              "
            >
              &lt;-- Back
            </button>
            <button
              type="button"
              onClick={() => handleLogout(true)} // Pass true to navigate back on button click
              className="
                bg-red-700 text-white px-4 py-2 rounded-md
                border-t-2 border-l-2 border-red-600
                border-b-2 border-r-2 border-red-900
                hover:bg-red-600 hover:border-red-900 hover:border-b-red-600 hover:border-r-red-600
                transition-all duration-100 ease-in-out
                cursor-pointer
              "
            >
              Logout
            </button>
          </div>
        </div>
        <div className="flex-grow overflow-y-auto border-b border-gray-200 pb-2 mb-4 text-left space-y-2">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center">No messages yet. Start chatting!</p>
          ) : (
            messages.map((msg, index) => (
              <div
                key={msg._id || index}
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

      <div className="w-64 bg-gray-50 border-l border-gray-200 p-4 flex flex-col">
        <h2 className="text-xl font-semibold mb-4 text-center">Online Users ({onlineUsers.length})</h2>
        <ul className="flex-grow overflow-y-auto space-y-2">
          {onlineUsers.length > 0 ? (
            onlineUsers.map((user) => (
              <li
                key={user.userId}
                className={`p-2 rounded-md ${
                  user.username === username ? 'bg-green-200 font-bold' : 'bg-white shadow-sm'
                } flex items-center gap-2`}
              >
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