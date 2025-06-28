import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const SquareCallback = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      fetch(`${process.env.REACT_APP_API_BASE_URL}/square/oauth-callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log('Received access token:', data);
        })
        .catch((err) => {
          console.error('Error exchanging code:', err);
        });
    }
  }, [searchParams]);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Connecting to Square...</h2>
    </div>
  );
};

export default SquareCallback;
