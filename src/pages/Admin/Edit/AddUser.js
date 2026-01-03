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
      
      const response = await createUser(userData);
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
    <div className="add-user-um-edit-form-overlay" onClick={onCancel}>
      <div 
        className={`add-user-um-edit-form ${success ? 'add-user-um-form-success' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="add-user-modal-header">
          <h3>Add New User</h3>
        </div>
        
        {error && (
          <div className="add-user-um-error-message">
            <div className="add-user-error-content">
              <strong>Error Details:</strong>
              <div className="add-user-error-message-text">{error}</div>
            </div>
            <button 
              type="button"
              onClick={() => setError("")} 
              className="add-user-um-close-error"
              title="Close error message"
              aria-label="Close error message"
            >
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="add-user-form">
          <div className="add-user-um-form-sections-container">
            
            {/* Basic Information */}
            <div className="add-user-um-form-section">
              <h4>Basic Information</h4>
              <div className="add-user-um-form-grid">
                
                <div className="add-user-um-form-group">
                  <label>
                    Username <span className="add-user-field-required">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder="Enter username"
                    disabled={loading}
                    aria-required="true"
                    autoComplete="username"
                    className="add-user-form-input"
                  />
                  <small className="add-user-field-hint">Unique identifier</small>
                </div>
                
                <div className="add-user-um-form-group">
                  <label>
                    Email <span className="add-user-field-required">*</span>
                  </label>
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
                    className="add-user-form-input"
                  />
                  <small className="add-user-field-hint">Required for communication</small>
                </div>

                <div className="add-user-um-form-group">
                  <label>
                    User Type <span className="add-user-field-required">*</span>
                  </label>
                  <select
                    name="user_type"
                    value={formData.user_type}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    aria-required="true"
                    className="add-user-form-select"
                  >
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                  </select>
                </div>

                <div className="add-user-um-form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="First name"
                    disabled={loading}
                    autoComplete="given-name"
                    className="add-user-form-input"
                  />
                </div>
                
                <div className="add-user-um-form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Last name"
                    disabled={loading}
                    autoComplete="family-name"
                    className="add-user-form-input"
                  />
                </div>

                <div className="add-user-um-form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="+1234567890"
                    disabled={loading}
                    autoComplete="tel"
                    className="add-user-form-input"
                  />
                  <small className="add-user-field-hint">International format</small>
                </div>

                <div className="add-user-um-form-group add-user-full-width">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    disabled={loading}
                    max={new Date().toISOString().split('T')[0]}
                    className="add-user-form-input"
                  />
                </div>
              </div>
            </div>

            {/* Instructor-specific fields */}
            {formData.user_type === 'instructor' && (
              <div className="add-user-um-form-section">
                <h4>Instructor Information</h4>
                <div className="add-user-um-form-group add-user-full-width">
                  <label>Professional Bio</label>
                  <textarea
                    name="instructor_bio"
                    value={formData.instructor_bio}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Teaching experience, qualifications, expertise..."
                    disabled={loading}
                    maxLength={300}
                    className="add-user-form-textarea"
                  />
                  <div className="add-user-char-count">
                    {formData.instructor_bio.length}/300 characters
                  </div>
                </div>
              </div>
            )}

            {/* Security Section */}
            <div className="add-user-um-form-section">
              <h4>Security & Authentication</h4>
              <div className="add-user-um-form-grid">
                
                <div className="add-user-um-form-group">
                  <label>
                    Password <span className="add-user-field-required">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter password"
                    minLength="8"
                    disabled={loading}
                    aria-required="true"
                    autoComplete="new-password"
                    className="add-user-form-input"
                  />
                  <small className="add-user-field-hint">Min 8 characters</small>
                </div>
                
                <div className="add-user-um-form-group">
                  <label>
                    Confirm <span className="add-user-field-required">*</span>
                  </label>
                  <input
                    type="password"
                    name="password2"
                    value={formData.password2}
                    onChange={handleChange}
                    required
                    placeholder="Confirm password"
                    minLength="8"
                    disabled={loading}
                    aria-required="true"
                    autoComplete="new-password"
                    className="add-user-form-input"
                  />
                  <small className="add-user-field-hint">Must match</small>
                </div>

                <div className="add-user-um-form-group">
                  {/* Empty column for alignment */}
                </div>

                {/* Email verification checkbox */}
                <div className="add-user-um-form-group add-user-full-width">
                  <div className="add-user-um-checkbox-group compact">
                    <label className="add-user-um-checkbox-label">
                      <input
                        type="checkbox"
                        name="email_verified"
                        checked={formData.email_verified}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      <span>Mark Email as Verified</span>
                    </label>
                    <small className="add-user-um-checkbox-description">
                      User can login immediately without email verification
                    </small>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Permissions Section */}
            <div className="add-user-um-form-section">
              <h4>Administrative Permissions</h4>
              
              <div className="add-user-permissions-grid">
                <div className="add-user-um-checkbox-group compact">
                  <label className="add-user-um-checkbox-label">
                    <input
                      type="checkbox"
                      name="is_staff"
                      checked={formData.is_staff}
                      onChange={handleChange}
                      disabled={loading || formData.is_superuser}
                    />
                    <span>Staff Member Access</span>
                  </label>
                  <small className="add-user-um-checkbox-description">
                    Access to admin dashboard with content management
                  </small>
                </div>

                <div className="add-user-um-checkbox-group compact">
                  <label className="add-user-um-checkbox-label">
                    <input
                      type="checkbox"
                      name="is_superuser"
                      checked={formData.is_superuser}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <span>Super Administrator</span>
                  </label>
                  <small className="add-user-um-checkbox-description">
                    Full system access with all permissions
                  </small>
                </div>

                {formData.is_superuser && (
                  <div className="add-user-warning-message">
                    <div className="add-user-um-info-message">
                      <strong>⚠️ Note:</strong> Super Admin has complete system access
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="add-user-um-form-actions">
            <button 
              type="button"
              onClick={onCancel} 
              className="add-user-um-btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="add-user-um-btn-primary" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="add-user-loading-spinner"></span>
                  Creating...
                </>
              ) : (
                "Create User"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;