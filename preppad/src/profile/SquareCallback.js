import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const SquareCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth Error:', error);
      navigate('/square-oauth');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No JWT token found in localStorage');
      return;
    }

    let businessId;
    try {
      const decoded = jwtDecode(token);
      businessId = decoded.businessId;
    } catch (err) {
      console.error('Failed to decode token:', err);
      return;
    }

    if (code && businessId) {
      // Step 1: Exchange code for tokens
      fetch(`${process.env.REACT_APP_API_BASE_URL}/oauth/square-callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, businessId }),
      })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to exchange Square OAuth code');
          return res.json();
        })
        .then(() => {
          // Step 2: Sync inventory
          return fetch(`${process.env.REACT_APP_API_BASE_URL}/inventory/sync`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
        })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to sync inventory');
          return res.json();
        })
        .then((data) => {
          navigate('/square-oauth');
        })
        .catch((err) => {
          console.error('Error during OAuth or sync:', err);
          navigate('/square-oauth');
        });
    }
  }, [searchParams, navigate]);

  return <p>Connecting to Square...</p>;
};

export default SquareCallback;
