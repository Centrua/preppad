import React from 'react';

const SquareOAuth = () => {
  const squareAppId = process.env.REACT_APP_SQUARE_APP_ID;
  const redirectUri = encodeURIComponent('http://localhost:3000/square-callback');
  const scopes = encodeURIComponent('MERCHANT_PROFILE_READ PAYMENTS_READ');

  const connectToSquare = () => {
    const authUrl = `https://connect.squareupsandbox.com/oauth2/authorize?client_id=${squareAppId}&response_type=code&scope=${scopes}&redirect_uri=${redirectUri}`;
    window.location.href = authUrl;
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl mb-4">Connect Your Square Account</h1>
      <button
        className="bg-black text-white px-4 py-2 rounded"
        onClick={connectToSquare}
      >
        Connect with Square
      </button>
    </div>
  );
};

export default SquareOAuth;
