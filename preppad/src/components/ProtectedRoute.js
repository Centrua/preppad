import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function ProtectedRoute({ children }) {
  
  const token = localStorage.getItem('token');

  if (!token || isTokenExpired(token)) {
    localStorage.removeItem("token");
    return <Navigate to="/sign-in" replace />;
  }

  return children;
}


export function isTokenExpired(token) {
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return true;

    const now = Date.now() / 1000; // current time in seconds
    return decoded.exp < now;
  } catch (e) {
    return true; // invalid token
  }
}