import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import './index.css';
import reportWebVitals from './reportWebVitals';

// Auth & Protected components
import ProtectedRoute from './components/ProtectedRoute';
import SignIn from './sign-in/SignIn';
import SignUp from './sign-up/SignUp';

// Layout & OAuth
import Dashboard from './dashboard/Dashboard';
import SquareCallback from './profile/SquareCallback';
import SquareOAuth from './profile/SquareOAuth';

// Pages for each menu route
import IntegrationsPage from './pages/IntegrationsPage';
import InventoryPage from './pages/InventoryPage';
import LandingPage from './pages/LandingPage';
import PendingPurchasesPage from './pages/PendingPurchasesPage';
import RecipesPage from './pages/RecipesPage';
import ReportsPage from './pages/ReportsPage';
import ShoppingListPage from './pages/ShoppingListPage';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
    <Routes>
      {/* Root route loads Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Public Routes */}
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <InventoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shopping-list"
        element={
          <ProtectedRoute>
            <ShoppingListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pending-purchases"
        element={
          <ProtectedRoute>
            <PendingPurchasesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recipes"
        element={
          <ProtectedRoute>
            <RecipesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/integrations"
        element={
          <ProtectedRoute>
            <IntegrationsPage />
          </ProtectedRoute>
        }
      />
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
    </Routes>
  </BrowserRouter>
);

reportWebVitals();
