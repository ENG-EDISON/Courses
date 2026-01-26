import { useState } from "react";
import { login } from "../../api/AuthApi";
import "./Login.css";
import Footer from "../common/Footer";
import NavigationBar from "../common/NavigationBar";
import stm32Image from "./stm32.jpg"; // or from relative path

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

      // Determine error type with specific messages
      let errorMessage;

      if (!navigator.onLine) {
        errorMessage = "No internet connection. Please check your network.";
      } else if (error.response === undefined) {
        // Network error or server not responding
        errorMessage = "Cannot connect to server. Please try again later.";
      } else if (error.response?.status === 401) {
        // Unauthorized - credentials issue
        errorMessage = error.response?.data?.detail ||
          error.response?.data?.message ||
          error.response?.data?.non_field_errors?.[0] ||
          "Invalid username or password.";
      } else if (error.response?.status === 404) {
        errorMessage = "Login service unavailable. Please contact support.";
      } else if (error.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      } else {
        // Generic fallback
        errorMessage = "Login failed. Please try again.";
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <NavigationBar />
      <div className="enterprise-wrapper">
        <div className="enterprise-login">
          <div className="login-container">
            {/* Left Side - Form Section */}
            <div className="login-left">
              <div className="form-container">
                {/* Clean Header */}
                <div className="form-header">
                  <div className="header-main">
                    <h1>Welcome back</h1>
                    <p>Sign in to your Hayducate account</p>
                  </div>
                </div>

                {error && (
                  <div className="error-message">
                    <div className="error-icon">⚠️</div>
                    <div className="error-content">
                      <span className="error-title">Authentication failed</span>
                      <span className="error-message-text">{error}</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleLogin} className="login-form">
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
                      <input type="checkbox" />
                      <span>Remember me</span>
                    </label>
                    <a href="/forgot-password" className="forgot-link">Forgot password?</a>
                  </div>

                  <button
                    type="submit"
                    className="login-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="loading-spinner"></div>
                        Signing in...
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </button>
                </form>

                <div className="form-footer">
                  <span>Don't have an account?</span>
                  <a href="/signup" className="signup-link">Create account</a>
                </div>
              </div>
            </div>

            {/* Right Side - Hero Section with Image */}
            <div className="login-right">
              <div className="hero-section">
                <div className="hero-image">
                  <img src={stm32Image} alt="Online Learning" />
                  <div className="hero-overlay">
                    <div className="hero-content">
                      <div className="brand-logo">
                        <div className="logo-icon">H</div>
                        <span className="logo-text">Hayducate</span>
                      </div>
                      <h1>Learn Without Limits</h1>
                      <p>Start, switch, or advance your career with hands-on projects and career-focused learning paths.</p>
                      <div className="hero-features">
                        <div className="hero-feature">
                          <span>Self-paced learning</span>
                        </div>
                        <div className="hero-feature">
                          <span>Hands-on projects</span>
                        </div>
                        <div className="hero-feature">
                          <span>Career-focused courses</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}

export default EnterpriseLogin;