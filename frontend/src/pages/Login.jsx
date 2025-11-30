/**
 * Login Page - Modern Split Glass Design
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { post } from '../api';
import '../styles.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await post('/auth/login', {
        username: formData.username,
        password: formData.password,
      });

      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        navigate('/chat');
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        
        {/* Left Side: Branding */}
        <div className="split-left">
          <div className="logo-container-img">
            <img src="/Z.png" alt="Z Messenger Logo" className="app-logo" />
          </div>
          <h2 className="brand-title">Z Messenger</h2>
          <p className="brand-subtitle">Connect, Chat, Collaborate</p>
        </div>

        {/* Right Side: Form */}
        <div className="split-right">
          <h1>Welcome Back</h1>
          <p>Please enter your details to sign in</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Enter your username"
                />
                <i className="fas fa-user input-icon"></i>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                />
                <i 
                  className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} input-icon clickable`}
                  onClick={() => setShowPassword(!showPassword)}
                ></i>
              </div>
            </div>

            <div className="options-row">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-password">Forgot Password?</a>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn-primary" disabled={loading} aria-label={loading ? 'Logging in' : 'Login'}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="auth-link">
              Don't have an account? <Link to="/register">Sign up free</Link>
            </div>

            <div className="footer-text">
              <p>Sponsored by The Soul Group</p>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Login;
