import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ onLogin }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isGuest, setIsGuest] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    if (userId) {
      onLogin(userId);
      navigate('/layout-form'); // Redirect to home page
    } else {
      alert('User ID is required');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Login</h2>

        {/* User ID */}
        <div className="mb-4">
          <label className="block text-gray-700">User ID</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-1"
          />
        </div>

        {/* Password (optional for guests) */}
        {!isGuest && (
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mt-1"
            />
          </div>
        )}

        {/* Guest Login Toggle */}
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={isGuest}
            onChange={() => setIsGuest(!isGuest)}
            className="mr-2"
          />
          <span>Login as Guest</span>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white p-2 rounded-lg"
        >
          {isGuest ? 'Login as Guest' : 'Login'}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
