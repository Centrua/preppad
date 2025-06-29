import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

const SquareOAuth = () => {
  const [connected, setConnected] = useState(null); // null means loading
  const squareAppId = process.env.REACT_APP_SQUARE_APP_ID;
  const redirectUri = encodeURIComponent('http://localhost:3000/square-callback');
  const scopes = encodeURIComponent('MERCHANT_PROFILE_READ PAYMENTS_READ');

useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    setConnected(false);
    return;
  }

  try {
    jwtDecode(token);
  } catch (e) {
    console.error('Failed to decode token:', e);
    setConnected(false);
    return;
  }

  fetch(`${process.env.REACT_APP_API_BASE_URL}/business/square-connection`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(res => {
      if (!res.ok) throw new Error('Unauthorized or error');
      return res.json();
    })
    .then(data => setConnected(data.connected))
    .catch(() => setConnected(false));
}, []);


  const connectToSquare = () => {
    const authUrl = `https://connect.squareupsandbox.com/oauth2/authorize?client_id=${squareAppId}&response_type=code&scope=${scopes}&redirect_uri=${redirectUri}`;
    window.location.href = authUrl;
  };

  if (connected === null) {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl mb-4">Connect Your Square Account</h1>
      {connected ? (
        <p>You have already connected your Square account.</p>
      ) : (
        <button
          className="bg-black text-white px-4 py-2 rounded"
          onClick={connectToSquare}
        >
          Connect with Square
        </button>
      )}
    </div>
  );
};

export default SquareOAuth;
