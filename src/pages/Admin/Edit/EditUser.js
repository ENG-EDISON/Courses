import React, { useState, useEffect } from "react";
import { updateUser, deactivateUser, activateUser } from "../../../api/UsersApi";
import "../css/EditUser.css";

const EditUser = ({ user, onSave, onCancel, onStatusChange }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    user_type: "student",
    phone_number: "",
    bio: "",
    is_staff: false,
    is_superuser: false,
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        user_type: user.user_type || "student",
        phone_number: user.phone_number || "",
        bio: user.bio || "",
        is_staff: user.is_staff || false,
        is_superuser: user.is_superuser || false,
        is_active: user.is_active !== false,
      });
    }
  }, [user]);

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

    if (!user || !user.id) {
      const errorMsg = `Cannot update user: User ID is ${user?.id}`;
      setError(errorMsg);
      return;
    }

    setLoading(true);
    try {
      const updatedData = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        user_type: formData.user_type,
        phone_number: formData.phone_number,
        bio: formData.bio,
        is_staff: formData.is_staff,
        is_superuser: formData.is_superuser,
        is_active: formData.is_active,
      };

      Object.keys(updatedData).forEach(key => {
        if (updatedData[key] === "" || updatedData[key] === null) {
          delete updatedData[key];
        }
      });

      const response = await updateUser(user.id, updatedData);
      
      if (onSave) {
        onSave(user.id, response.data);
      }
      
    } catch (err) {
      console.error("❌ [EditUser] Error updating user:", err);
      
      let errorMessage = "Unknown error occurred";
      
      if (err.response?.status === 403) {
        errorMessage = "Permission denied. You need admin privileges to update users.";
      } else if (err.response?.status === 404) {
        errorMessage = `User with ID ${user.id} not found.`;
      } else if (err.response?.data) {
        if (err.response.data.detail) {
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
      
      setError(`Failed to update user: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!user?.id) return;
    
    setStatusLoading(true);
    try {
      if (formData.is_active) {
        await deactivateUser(user.id);
        setFormData(prev => ({ ...prev, is_active: false }));
        if (onStatusChange) {
          onStatusChange(user.id, false);
        }
      } else {
        await activateUser(user.id);
        setFormData(prev => ({ ...prev, is_active: true }));
        if (onStatusChange) {
          onStatusChange(user.id, true);
        }
      }
      
    } catch (err) {
      console.error("❌ [EditUser] Error changing user status:", err);
      setError(`Failed to change user status: ${err.response?.data?.detail || err.message}`);
    } finally {
      setStatusLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  if (!user.id) {
    return (
      <div className="edit-user-um-edit-form-overlay">
        <div className="edit-user-um-edit-form">
          <div className="edit-user-um-error-message">
            <strong>Error:</strong> Cannot edit user - User ID is missing or undefined
            <button type="button" onClick={onCancel} className="edit-user-um-close-error">
              ×
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-user-um-edit-form-overlay" onClick={onCancel}>
      <div className="edit-user-um-edit-form" onClick={(e) => e.stopPropagation()}>
        <h3>
          Edit User: {user.username} 
          <span className={`edit-user-um-status-badge ${formData.is_active ? 'edit-user-active' : 'edit-user-inactive'}`}>
            {formData.is_active ? 'Active' : 'Inactive'}
          </span>
        </h3>
        
        {error && (
          <div className="edit-user-um-error-message">
            <div className="edit-user-error-content">
              <strong>Update Error:</strong>
              <div className="edit-user-error-message-text">{error}</div>
            </div>
            <button type="button" onClick={() => setError("")} className="edit-user-um-close-error">
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="edit-user-um-form-sections-container">
            {/* Basic Information - 3 Column Layout */}
            <div className="edit-user-um-form-section">
              <h4>Basic Information</h4>
              <div className="edit-user-um-form-grid">
                {/* Row 1 */}
                <div className="edit-user-um-form-group">
                  <label>Username <span className="edit-user-field-required">*</span></label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
                
                <div className="edit-user-um-form-group">
                  <label>Email <span className="edit-user-field-required">*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="edit-user-um-form-group">
                  <label>User Type <span className="edit-user-field-required">*</span></label>
                  <select
                    name="user_type"
                    value={formData.user_type}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  >
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* Row 2 */}
                <div className="edit-user-um-form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                
                <div className="edit-user-um-form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div className="edit-user-um-form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                {/* Row 3 - Bio spans all 3 columns */}
                <div className="edit-user-um-form-group edit-user-full-width">
                  <label>Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="3"
                    disabled={loading}
                    placeholder="Enter user bio..."
                  />
                </div>
              </div>
            </div>

            {/* Admin Permissions Section - 3 Column Layout */}
            <div className="edit-user-um-admin-permissions">
              <h4>Administrative Permissions</h4>
              <div className="edit-user-um-form-grid">
                <div className="edit-user-um-form-group">
                  <label className="edit-user-um-checkbox-label">
                    <input
                      type="checkbox"
                      name="is_staff"
                      checked={formData.is_staff}
                      onChange={handleChange}
                      disabled={loading || formData.is_superuser}
                    />
                    <span>Staff Member</span>
                  </label>
                  <small className="edit-user-um-checkbox-description">
                    Access to admin dashboard
                  </small>
                </div>

                <div className="edit-user-um-form-group">
                  <label className="edit-user-um-checkbox-label">
                    <input
                      type="checkbox"
                      name="is_superuser"
                      checked={formData.is_superuser}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <span>Super Admin</span>
                  </label>
                  <small className="edit-user-um-checkbox-description">
                    Full system access
                  </small>
                </div>

                <div className="edit-user-um-form-group">
                  <label className="edit-user-um-checkbox-label">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <span>Active Status</span>
                  </label>
                  <small className="edit-user-um-checkbox-description">
                    User can login
                  </small>
                </div>

                {/* Status Toggle Button - Full Width */}
                <div className="edit-user-um-form-group edit-user-full-width">
                  <div className="edit-user-um-status-actions">
                    <button
                      type="button"
                      onClick={handleStatusToggle}
                      disabled={statusLoading || loading}
                      className={`edit-user-um-status-btn ${formData.is_active ? 'edit-user-deactivate' : 'edit-user-activate'}`}
                    >
                      {statusLoading ? (
                        <>
                          <span className="edit-user-loading-spinner"></span>
                          Processing...
                        </>
                      ) : formData.is_active ? (
                        "Deactivate User"
                      ) : (
                        "Activate User"
                      )}
                    </button>
                    <small className="edit-user-um-status-hint">
                      {formData.is_active 
                        ? 'User can currently login and use the system' 
                        : 'User cannot login or access the system'
                      }
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="edit-user-um-form-actions">
            <button type="submit" className="edit-user-um-btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="edit-user-loading-spinner"></span>
                  Saving Changes...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
            <button type="button" onClick={onCancel} className="edit-user-um-btn-secondary" disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;