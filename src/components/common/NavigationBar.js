import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import "./NavigationBar.css";
import { getMyProfile } from "../../api/ProfileApis";
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"></link>

function NavigationBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close profile dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      
      // Close mobile menu when clicking outside
      if (mobileMenuRef.current && 
          !mobileMenuRef.current.contains(event.target) &&
          !event.target.closest('.mobile-menu')) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setMenuOpen(false);
      setProfileDropdownOpen(false);
    };

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
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
            setUser(response.data);
          } else {
            setIsLoggedIn(false);
            setUser(null);
          }
        }
      } catch (error) {
        if (isMounted) {
          setIsLoggedIn(false);
          setUser(null);
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

  // ✅ Check if user is an instructor (based on user_type_display)
  const isInstructor = user?.user_type_display === 'Instructor';
  // ✅ Check if user is an admin
  const isAdmin = user?.is_admin === true;

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    setIsLoggedIn(false);
    setUser(null);
    setProfileDropdownOpen(false);
    setMenuOpen(false);
    window.location.href = '/';
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleNavLinkClick = () => {
    setMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  // Don't show anything while loading
  if (isLoading) {
    return (
      <nav className="navbar">
        <div className="nav-left">
          <Link to="/" className="company-name">Hayducate</Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="company-name">Hayducate</Link>
      </div>

      {/* Mobile menu button */}
      <div 
        className={`mobile-menu ${menuOpen ? "active" : ""}`} 
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>

      {/* Navigation links */}
      <div 
        ref={mobileMenuRef}
        className={`nav-menu-container ${menuOpen ? "active" : ""}`}
      >
        <ul className={`nav-list ${menuOpen ? "active" : ""}`}>
          <li className="nav-item">
            <Link to="/all-courses" onClick={handleNavLinkClick}>Courses</Link>
          </li>
          {isLoggedIn ? (
            <>
              <li className="nav-item">
                <Link to="/enrolled-courses" onClick={handleNavLinkClick}>My Courses</Link>
              </li>
              
              {/* ✅ Show Admin link if user is admin */}
              {isAdmin && (
                <li className="nav-item">
                  <Link to="/admin" onClick={handleNavLinkClick} className="admin-link">
                    <i className="fas fa-crown admin-icon"></i>
                    Admin
                  </Link>
                </li>
              )}

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
                  {/* ✅ Show instructor badge if user is instructor */}
                  {isInstructor && <span className="instructor-badge">Instructor</span>}
                  {/* ✅ Show admin badge if user is admin */}
                  {isAdmin && <span className="admin-badge">Admin</span>}
                </button>
                {profileDropdownOpen && (
                  <div className="profile-dropdown-menu">
                    {/* ✅ Show user role in profile dropdown */}
                    <div className="user-role-info">
                      {isAdmin && isInstructor && (
                        <div className="multiple-roles">
                          <span className="role-badge admin-role">Administrator</span>
                          <span className="role-badge instructor-role">Instructor</span>
                        </div>
                      )}
                      {isAdmin && !isInstructor && <span className="role-badge admin-role">Administrator</span>}
                      {isInstructor && !isAdmin && <span className="role-badge instructor-role">Instructor</span>}
                    </div>
                    
                    <Link 
                      to="/profile" 
                      className="dropdown-item"
                      onClick={handleNavLinkClick}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      Profile
                      {/* ✅ Show both indicators if user has both roles */}
                      {isAdmin && isInstructor && (
                        <>
                          <span className="role-indicator">👑</span>
                          <span className="role-indicator">📚</span>
                        </>
                      )}
                      {isAdmin && !isInstructor && <span className="role-indicator">👑</span>}
                      {isInstructor && !isAdmin && <span className="role-indicator">📚</span>}
                    </Link>
                    
                    {/* ✅ Show Course Editor link if user is instructor (including admin instructors) */}
                    {isInstructor && (
                      <>
                        <div className="dropdown-divider"></div>
                        <Link 
                          to="/course-editor" 
                          className="dropdown-item instructor-item"
                          onClick={handleNavLinkClick}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 19l7-7 3 3-7 7-3-3z" />
                            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                            <path d="M2 2l7.586 7.586" />
                            <circle cx="11" cy="11" r="2" />
                          </svg>
                          Course Editor
                        </Link>
                      </>
                    )}
                    
                    {/* ✅ Show admin-specific links in dropdown if user is admin */}
                    {isAdmin && (
                      <li className="nav-item">
                        <Link to="/admin" onClick={handleNavLinkClick} className="admin-link">
                          <i className="fas fa-crown admin-icon"></i>
                          Admin
                        </Link>
                      </li>
                    )}
                    
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
                <Link to="/login" onClick={handleNavLinkClick}>Login</Link>
              </li>
              {/* <li className="nav-item signup">
                <Link to="/signup" onClick={handleNavLinkClick}>Sign Up</Link>
              </li> */}
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default NavigationBar;