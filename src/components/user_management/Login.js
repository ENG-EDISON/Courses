import { useState } from "react";
import { login } from "../../api/AuthApi";
import "./Login.css";
import Footer from "../common/Footer";

function EnterpriseLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
      // Store tokens in localStorage
      if (response.data.access && response.data.refresh) {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
      
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

  return (
    <div>
    <div className="enterprise-login">
      <div className="login-container">
        <div className="login-left">
          <div className="logo">
            <h2>CoursePro</h2>
          </div>
          
          <div className="header">
            <h1>Enterprise Login</h1>
            <p>Access your company's learning dashboard</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
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
              />
            </div>

            <button 
              type="submit" 
              className="btn-login"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="footer-links">
            <a href="/forgot-password">Forgot password?</a>
            <a href="/signup">SignUp</a>
          </div>
        </div>

        <div className="login-right">
          <img src="/api/placeholder/500/400" alt="Course Platform" />
        </div>
      </div>
    </div>
    <Footer/>
    </div>
  );
}

export default EnterpriseLogin;