import { useState } from "react";
import { login } from "../../api/AuthApi";
import "./Login.css";
import Footer from "../common/Footer";

function EnterpriseLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Load remembered username on component mount
  useState(() => {
    const rememberedUsername = localStorage.getItem('rememberedUsername');
    if (rememberedUsername) {
      setUsername(rememberedUsername);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const credentials = {
        username: username,
        password: password
      };

      const response = await login(credentials);      
      
      // Handle tokens based on remember me choice
      if (response.data.access && response.data.refresh) {
        if (rememberMe) {
          // Store tokens in localStorage (persists after browser close)
          localStorage.setItem('access_token', response.data.access);
          localStorage.setItem('refresh_token', response.data.refresh);
          // Remember username for next time
          localStorage.setItem('rememberedUsername', username);
        } else {
          // Store tokens in sessionStorage (clears when browser closes)
          sessionStorage.setItem('access_token', response.data.access);
          sessionStorage.setItem('refresh_token', response.data.refresh);
          // Clear remembered username if not checked
          localStorage.removeItem('rememberedUsername');
        }
      
        // Redirect to dashboard
        window.location.href = '/';
      } else {
        throw new Error('No tokens received from server');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      
      setError(
        error.response?.data?.detail || 
        error.response?.data?.message || 
        error.response?.data?.non_field_errors?.[0] ||
        "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
    // If unchecking, immediately clear the remembered username
    if (!e.target.checked) {
      localStorage.removeItem('rememberedUsername');
    }
  };

  return (
    <div className="enterprise-wrapper">
      <div className="enterprise-login">
        <div className="login-container">
          <div className="login-left">
            <div className="enterprise-header">
              <div className="enterprise-logo">
                <div className="logo-icon">H</div>
                <span className="logo-text">Hayducate</span>
              </div>
              <div className="enterprise-badge">Enterprise</div>
            </div>
            
            <div className="login-content">
              <div className="welcome-section">
                <h1>Welcome back</h1>
                <p>Sign in to your account</p>
              </div>

              {error && (
                <div className="enterprise-error">
                  <div className="error-icon">⚠️</div>
                  <div className="error-content">
                    <span className="error-title">Authentication failed</span>
                    <span className="error-message">{error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleLogin} className="enterprise-form">
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                    className={error ? "input-error" : ""}
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className={error ? "input-error" : ""}
                  />
                </div>

                <div className="form-options">
                  <label className="remember-me">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={handleRememberMeChange}
                      disabled={isLoading}
                    />
                    <span>Remember me</span>
                  </label>
                  <a href="/forgot-password" className="forgot-link">Forgot password?</a>
                </div>

                <button 
                  type="submit" 
                  className="btn-enterprise"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="loading-spinner"></div>
                      Signing in...
                    </>
                  ) : (
                    "Sign in to account"
                  )}
                </button>
              </form>

              <div className="enterprise-footer">
                <span>Don't have an account?</span>
                <a href="/signup" className="enterprise-link">Sign Up</a>
              </div>
            </div>
          </div>

          <div className="login-right">
            <div className="enterprise-sidepanel">
              <div className="sidepanel-content">
                <div className="feature-badge">Premium Learning</div>
                <h2>Advance Your Skills</h2>
                <p>Access 1000+ courses, hands-on projects, and career-focused learning paths to boost your career.</p>
                <div className="features-list">
                  <div className="feature-item">
                    <span className="feature-icon">⚡</span>
                    <span>Self-paced learning</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🛠️</span>
                    <span>Hands-on projects</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🎯</span>
                    <span>Career-focused courses</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}

export default EnterpriseLogin;