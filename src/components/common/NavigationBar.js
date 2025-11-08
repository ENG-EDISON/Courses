import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import "../../static/NavigationBar.css";
import { getMyProfile } from "../../api/ProfileApis";

function NavigationBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      const accessToken = localStorage.getItem('access_token');

      if (!accessToken) {
        if (isMounted) {
          setIsLoggedIn(false);
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await getMyProfile();

        if (isMounted) {
          if (response.status === 200) {
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
          }
        }
      } catch (error) {
        if (isMounted) {
          setIsLoggedIn(false);
          if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            sessionStorage.removeItem('access_token');
            sessionStorage.removeItem('refresh_token');
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    setIsLoggedIn(false);
    setProfileDropdownOpen(false);
    window.location.href = '/';
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  if (isLoading) {
    return (
      <nav className="navbar">
        <div className="nav-left">
          <Link to="/" className="company-name">Hayducate</Link>
        </div>
        <div style={{ color: '#666', fontSize: '14px' }}>
          Loading...
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="company-name">Hayducate</Link>
      </div>

      <ul className={`nav-list ${menuOpen ? "active" : ""}`}>
        <li className="nav-item">
          <Link to="/all-courses">Courses</Link>
        </li>
        {isLoggedIn ? (
          <>
            <li className="nav-item">
              <Link to="/enrolled-courses">My Courses</Link>
            </li>
            <li className="nav-item">
              <Link to="/course-editor/">Instructor View</Link>
            </li>
            <li className="nav-item profile-dropdown-container" ref={dropdownRef}>
              <button 
                className="profile-dropdown-toggle"
                onClick={toggleProfileDropdown}
                aria-expanded={profileDropdownOpen}
              >
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>
              {profileDropdownOpen && (
                <div className="profile-dropdown-menu">
                  <Link 
                    to="/profile" 
                    className="dropdown-item"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Profile
                  </Link>
                  <Link 
                    to="/settings" 
                    className="dropdown-item"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    Settings
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button 
                    onClick={handleLogout}
                    className="dropdown-item logout-item"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16,17 21,12 16,7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </li>
          </>
        ) : (
          <>
            <li className="nav-item">
              <Link to="/login">Login</Link>
            </li>
            <li className="nav-item signup">
              <Link to="/signup">Sign Up</Link>
            </li>
          </>
        )}
      </ul>

      {/* Mobile menu button */}
      <div className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)}>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>
    </nav>
  );
}

export default NavigationBar;