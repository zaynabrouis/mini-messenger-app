/**
 * App Component
 * Main application component with routing
 * Handles navigation between Login, Register, and Chat pages
 */

import PropTypes from 'prop-types';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import './styles.css';

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" replace />;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Public Route Component
 * Redirects to chat if user is already authenticated
 */
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/chat" replace /> : children;
};

PublicRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

const App = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
