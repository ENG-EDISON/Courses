import React, { useState } from "react";
import { createUser } from "../../../api/UsersApi";
import "../css/AddUser.css";

const AddUser = ({ onUserAdded, onCancel }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    user_type: "student",
    phone_number: "",
    date_of_birth: "",
    first_name: "",
    last_name: "",
    instructor_bio: "",
    email_verified: false,
    is_staff: false,
    is_superuser: false,
    password: "",
    password2: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (formData.password !== formData.password2) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (!formData.username.trim()) {
      setError("Username is required");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    try {
      const userData = {
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        user_type: formData.user_type,
        phone_number: formData.phone_number?.trim() || null,
        date_of_birth: formData.date_of_birth || null,
        first_name: formData.first_name?.trim() || "",
        last_name: formData.last_name?.trim() || "",
        instructor_bio: formData.instructor_bio?.trim() || "",
        email_verified: formData.email_verified,
        is_staff: formData.is_staff,
        is_superuser: formData.is_superuser,
        password: formData.password,
        password2: formData.password2
      };

      Object.keys(userData).forEach(key => {
        if (userData[key] === "" || userData[key] === null) {
          if (!['password2', 'first_name', 'last_name'].includes(key)) {
            delete userData[key];
          }
        }
      });

      console.log("🔍 [AddUser] Sending user data to API:", userData);
      
      const response = await createUser(userData);
      
      console.log("✅ [AddUser] User created successfully!");
      
      setSuccess(true);
      
      setFormData({
        username: "",
        email: "",
        user_type: "student",
        phone_number: "",
        date_of_birth: "",
        first_name: "",
        last_name: "",
        instructor_bio: "",
        email_verified: false,
        is_staff: false,
        is_superuser: false,
        password: "",
        password2: ""
      });

      setTimeout(() => {
        if (onUserAdded) {
          onUserAdded(response.data);
        }
      }, 500);
      
    } catch (err) {
      console.error("❌ [AddUser] Error creating user:", err);
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApiError = (err) => {
    let errorMessage = "An unexpected error occurred while creating the user";

    if (err.response?.data) {
      const errorData = err.response.data;
      
      const fieldErrors = [];
      
      if (errorData.username) fieldErrors.push(`Username: ${formatError(errorData.username)}`);
      if (errorData.email) fieldErrors.push(`Email: ${formatError(errorData.email)}`);
      if (errorData.password) fieldErrors.push(`Password: ${formatError(errorData.password)}`);
      if (errorData.password2) fieldErrors.push(`Password Confirmation: ${formatError(errorData.password2)}`);
      if (errorData.user_type) fieldErrors.push(`User Type: ${formatError(errorData.user_type)}`);
      
      if (fieldErrors.length > 0) {
        errorMessage = `Validation errors:\n• ${fieldErrors.join('\n• ')}`;
      } else if (errorData.detail) {
        errorMessage = errorData.detail;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else {
        errorMessage = `Server validation failed: ${JSON.stringify(errorData, null, 2)}`;
      }
    } else if (err.message) {
      errorMessage = `Network error: ${err.message}`;
    }

    setError(errorMessage);
  };

  const formatError = (error) => {
    if (Array.isArray(error)) {
      return error.join(', ');
    }
    return String(error);
  };

  return (
    <div className="um-edit-form-overlay" onClick={onCancel}>
      <div 
        className={`um-edit-form ${success ? 'um-form-success' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Add New User</h3>
        
        {error && (
          <div className="um-error-message">
            <div className="error-content">
              <strong>Error Details:</strong>
              <div className="error-message-text">{error}</div>
            </div>
            <button 
              type="button"
              onClick={() => setError("")} 
              className="um-close-error"
              title="Close error message"
              aria-label="Close error message"
            >
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="um-form-sections-container">
            {/* Basic Information - 3 Column Layout */}
            <div className="um-form-section">
              <h4>Basic Information</h4>
              <div className="um-form-grid">
                {/* Column 1 */}
                <div className="um-form-group half-width">
                  <label>Username <span className="field-required" aria-hidden="true"></span></label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder="Enter unique username"
                    disabled={loading}
                    aria-required="true"
                    autoComplete="username"
                  />
                  <small className="field-hint">Required. Must be unique.</small>
                </div>
                
                {/* Column 2 */}
                <div className="um-form-group half-width">
                  <label>Email <span className="field-required" aria-hidden="true"></span></label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="user@example.com"
                    disabled={loading}
                    aria-required="true"
                    autoComplete="email"
                  />
                  <small className="field-hint">Required for communication.</small>
                </div>

                {/* Column 3 */}
                <div className="um-form-group half-width">
                  <label>User Type <span className="field-required" aria-hidden="true"></span></label>
                  <select
                    name="user_type"
                    value={formData.user_type}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    aria-required="true"
                  >
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                  </select>
                </div>

                {/* Column 1 */}
                <div className="um-form-group half-width">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    disabled={loading}
                    autoComplete="given-name"
                  />
                </div>
                
                {/* Column 2 */}
                <div className="um-form-group half-width">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    disabled={loading}
                    autoComplete="family-name"
                  />
                </div>

                {/* Column 3 */}
                <div className="um-form-group half-width">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    disabled={loading}
                    autoComplete="tel"
                  />
                  <small className="field-hint">International format</small>
                </div>

                {/* Full width for date of birth */}
                <div className="um-form-group full-width">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    disabled={loading}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>

            {/* Instructor-specific fields */}
            {formData.user_type === 'instructor' && (
              <div className="um-form-section">
                <h4>Instructor Information</h4>
                <div className="um-form-group full-width">
                  <label>Professional Bio</label>
                  <textarea
                    name="instructor_bio"
                    value={formData.instructor_bio}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Describe your teaching experience, qualifications, areas of expertise, and professional background..."
                    disabled={loading}
                    maxLength={500}
                  />
                  <small className="field-hint">
                    {formData.instructor_bio.length}/500 characters. This will be visible to students.
                  </small>
                </div>
              </div>
            )}

            {/* Security Section - 3 Column Layout */}
            <div className="um-form-section">
              <h4>Security & Authentication</h4>
              <div className="um-form-grid">
                {/* Column 1 */}
                <div className="um-form-group half-width">
                  <label>Password <span className="field-required" aria-hidden="true"></span></label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter secure password"
                    minLength="8"
                    disabled={loading}
                    aria-required="true"
                    autoComplete="new-password"
                  />
                  <small className="field-hint">Min 8 characters</small>
                </div>
                
                {/* Column 2 */}
                <div className="um-form-group half-width">
                  <label>Confirm Password <span className="field-required" aria-hidden="true"></span></label>
                  <input
                    type="password"
                    name="password2"
                    value={formData.password2}
                    onChange={handleChange}
                    required
                    placeholder="Re-enter password"
                    minLength="8"
                    disabled={loading}
                    aria-required="true"
                    autoComplete="new-password"
                  />
                  <small className="field-hint">Must match exactly</small>
                </div>

                {/* Column 3 - Empty for balance or could add another field */}
                <div className="um-form-group half-width">
                  {/* Optional: Add password strength indicator here */}
                </div>

                {/* Full width for checkbox */}
                <div className="um-form-group full-width">
                  <div className="um-checkbox-group">
                    <label className="um-checkbox-label">
                      <input
                        type="checkbox"
                        name="email_verified"
                        checked={formData.email_verified}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      <span>Mark Email as Verified</span>
                    </label>
                    <small className="um-checkbox-description">
                      Bypass email verification process. User can login immediately.
                    </small>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Permissions Section */}
            <div className="um-form-section um-admin-permissions">
              <h4>Administrative Permissions</h4>
              
              <div className="um-form-grid">
                <div className="um-form-group full-width">
                  <div className="um-checkbox-group">
                    <label className="um-checkbox-label">
                      <input
                        type="checkbox"
                        name="is_staff"
                        checked={formData.is_staff}
                        onChange={handleChange}
                        disabled={loading || formData.is_superuser}
                      />
                      <span>Staff Member Access</span>
                    </label>
                    <small className="um-checkbox-description">
                      Grants access to admin dashboard with content management capabilities.
                    </small>
                  </div>
                </div>

                <div className="um-form-group full-width">
                  <div className="um-checkbox-group">
                    <label className="um-checkbox-label">
                      <input
                        type="checkbox"
                        name="is_superuser"
                        checked={formData.is_superuser}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      <span>Super Administrator</span>
                    </label>
                    <small className="um-checkbox-description">
                      Full system access with all permissions. Includes all staff privileges.
                    </small>
                  </div>
                </div>

                {formData.is_superuser && (
                  <div className="um-form-group full-width">
                    <div className="um-info-message">
                      <strong>⚠️ Important Note:</strong> Super Administrator role provides complete system access.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="um-form-actions">
            <button 
              type="button"
              onClick={onCancel} 
              className="um-btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="um-btn-primary" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Creating User Account...
                </>
              ) : (
                "Create User Account"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;