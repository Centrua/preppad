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
      navigate('/square-oauth')
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
      fetch(`${process.env.REACT_APP_API_BASE_URL}/square/oauth-callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, businessId }),
      })
        .then((res) => res.json())
        .then((data) => {
          navigate('/square-oauth');
        })
        .catch((err) => {
          console.error('Error exchanging code:', err);
        });
    }
  }, [searchParams, navigate]);
};

export default SquareCallback;
