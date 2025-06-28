import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AddItem from './add-item/AddItem';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './dashboard/Dashboard';
import './index.css';
import SquareCallback from './profile/SquareCallback';
import SquareOAuth from './profile/SquareOAuth';
import reportWebVitals from './reportWebVitals';
import SignIn from './sign-in/SignIn';
import SignUp from './sign-up/SignUp';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<SignIn />}>
      </Route>
      <Route path="/sign-in" element={<SignIn />}>
      </Route>
      <Route path="/sign-up" element={<SignUp />}>
      </Route>
      <Route path="/add-item" element={<AddItem />}>
      </Route>
      <Route
        path="/square-oauth"
        element={
          <ProtectedRoute>
            <SquareOAuth />
          </ProtectedRoute>
        }
      />
      <Route
        path="/square-callback"
        element={
          <ProtectedRoute>
            <SquareCallback />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
