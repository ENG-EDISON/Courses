import React, { useState } from "react";
import { createUser } from "../../api/UsersApi";
import "./css/AddUser.css"; // Import the separated CSS

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.password2) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    try {
      const userData = {
        username: formData.username,
        email: formData.email,
        user_type: formData.user_type,
        phone_number: formData.phone_number,
        date_of_birth: formData.date_of_birth || null,
        first_name: formData.first_name,
        last_name: formData.last_name,
        instructor_bio: formData.instructor_bio,
        email_verified: formData.email_verified,
        is_staff: formData.is_staff,
        is_superuser: formData.is_superuser,
        password: formData.password,
        password2: formData.password2
      };

      // Remove empty fields but keep required ones
      Object.keys(userData).forEach(key => {
        if (userData[key] === "" || userData[key] === null) {
          if (key !== 'password2') {
            delete userData[key];
          }
        }
      });

      console.log("🔍 [AddUser] Sending user data to API:", userData);
      
      const response = await createUser(userData);
      
      console.log("✅ [AddUser] User created successfully!");
      
      if (onUserAdded) {
        onUserAdded(response.data);
      }
      
      // Reset form on success
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
      
    } catch (err) {
      console.error("❌ [AddUser] Error creating user:", err);
      
      let errorMessage = "Unknown error occurred";
      
      if (err.response?.data) {
        if (err.response.data.password2) {
          errorMessage = `Password confirmation: ${Array.isArray(err.response.data.password2) ? err.response.data.password2.join(', ') : err.response.data.password2}`;
        } else if (err.response.data.password) {
          errorMessage = `Password: ${Array.isArray(err.response.data.password) ? err.response.data.password.join(', ') : err.response.data.password}`;
        } else if (err.response.data.username) {
          errorMessage = `Username: ${Array.isArray(err.response.data.username) ? err.response.data.username.join(', ') : err.response.data.username}`;
        } else if (err.response.data.email) {
          errorMessage = `Email: ${Array.isArray(err.response.data.email) ? err.response.data.email.join(', ') : err.response.data.email}`;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else {
          const errorDetails = Object.entries(err.response.data)
            .map(([field, errors]) => {
              const errorText = Array.isArray(errors) ? errors.join(', ') : String(errors);
              return `${field}: ${errorText}`;
            })
            .join('; ');
          errorMessage = `Validation errors: ${errorDetails}`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(`Failed to create user: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="um-edit-form-overlay">
      <div className="um-edit-form">
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
              title="Close error"
            >
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="um-form-section">
            <h4>Basic Information</h4>
            <div className="um-form-row">
              <div className="um-form-group">
                <label>Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Enter username"
                  disabled={loading}
                />
              </div>
              
              <div className="um-form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter email address"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="um-form-row">
              <div className="um-form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  disabled={loading}
                />
              </div>
              
              <div className="um-form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="um-form-row">
              <div className="um-form-group">
                <label>User Type *</label>
                <select
                  name="user_type"
                  value={formData.user_type}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                </select>
              </div>
              
              <div className="um-form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="+1234567890"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="um-form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          {/* Instructor-specific fields */}
          {formData.user_type === 'instructor' && (
            <div className="um-form-section">
              <h4>Instructor Information</h4>
              <div className="um-form-group">
                <label>Instructor Bio</label>
                <textarea
                  name="instructor_bio"
                  value={formData.instructor_bio}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Tell us about your teaching experience, qualifications, and expertise..."
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Security Section */}
          <div className="um-form-section">
            <h4>Security</h4>
            <div className="um-form-row">
              <div className="um-form-group">
                <label>Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter password (min 8 characters)"
                  minLength="8"
                  disabled={loading}
                />
                <small className="field-hint">Must be at least 8 characters long</small>
              </div>
              
              <div className="um-form-group">
                <label>Confirm Password *</label>
                <input
                  type="password"
                  name="password2"
                  value={formData.password2}
                  onChange={handleChange}
                  required
                  placeholder="Confirm password"
                  minLength="8"
                  disabled={loading}
                />
                <small className="field-hint">Re-enter the same password</small>
              </div>
            </div>

            <div className="um-form-group">
              <label className="um-checkbox-label">
                <input
                  type="checkbox"
                  name="email_verified"
                  checked={formData.email_verified}
                  onChange={handleChange}
                  disabled={loading}
                />
                <span>Email Verified</span>
              </label>
              <small className="um-checkbox-description">
                Mark this if the user's email address has been verified
              </small>
            </div>
          </div>

          {/* Admin Permissions Section */}
          <div className="um-form-section um-admin-permissions">
            <h4>Admin Permissions</h4>
            
            <div className="um-form-group">
              <label className="um-checkbox-label">
                <input
                  type="checkbox"
                  name="is_staff"
                  checked={formData.is_staff}
                  onChange={handleChange}
                  disabled={loading}
                />
                <span>Staff Member</span>
              </label>
              <small className="um-checkbox-description">
                Can access the admin site and manage content. Staff members have limited administrative privileges.
              </small>
            </div>

            <div className="um-form-group">
              <label className="um-checkbox-label">
                <input
                  type="checkbox"
                  name="is_superuser"
                  checked={formData.is_superuser}
                  onChange={handleChange}
                  disabled={loading}
                />
                <span>Super Admin</span>
              </label>
              <small className="um-checkbox-description">
                Has all permissions without explicitly assigning them. Super admins have full system access.
              </small>
            </div>

            {formData.is_superuser && (
              <div className="um-info-message">
                <strong>Note:</strong> Super Admin automatically includes Staff access and all permissions.
              </div>
            )}
          </div>

          <div className="um-form-actions">
            <button 
              type="submit" 
              className="um-btn-primary" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Creating User...
                </>
              ) : (
                "Create User"
              )}
            </button>
            <button 
              type="button"
              onClick={onCancel} 
              className="um-btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;