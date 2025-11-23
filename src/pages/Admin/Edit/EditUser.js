import React, { useState, useEffect } from "react";
import { updateUser } from "../../../api/UsersApi";

const EditUser = ({ user, onSave, onCancel }) => {
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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Initialize form when user prop changes
  useEffect(() => {
    console.log("🔍 [EditUser] Component mounted with user:", user);
    console.log("🔍 [EditUser] User ID:", user?.id);
    
    if (user) {
      console.log("🔍 [EditUser] Initializing form with user data:", user);
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
      });
    }
  }, [user]);

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

    // Validate that user ID exists
    if (!user || !user.id) {
      const errorMsg = `Cannot update user: User ID is ${user?.id}`;
      console.error("❌ [EditUser]", errorMsg);
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
      };

      // Remove empty fields
      Object.keys(updatedData).forEach(key => {
        if (updatedData[key] === "" || updatedData[key] === null) {
          delete updatedData[key];
        }
      });

      console.log("🔍 [EditUser] Sending update data to API:", updatedData);
      console.log("🔍 [EditUser] Updating user ID:", user.id);
      console.log("🔍 [EditUser] API endpoint will be: PATCH /api/user/", user.id, "/");
      
      const response = await updateUser(user.id, updatedData);
      
      console.log("✅ [EditUser] API Response:", response);
      console.log("✅ [EditUser] Response data:", response.data);
      console.log("✅ [EditUser] Response status:", response.status);
      
      // Call the callback to notify parent
      if (onSave) {
        console.log("🔍 [EditUser] Calling onSave callback with:", user.id, response.data);
        onSave(user.id, response.data);
      }
      
      console.log("✅ [EditUser] User updated successfully!");
      
    } catch (err) {
      console.error("❌ [EditUser] Error updating user:", err);
      console.error("❌ [EditUser] Error response:", err.response);
      console.error("❌ [EditUser] Error data:", err.response?.data);
      console.error("❌ [EditUser] Error status:", err.response?.status);
      console.error("❌ [EditUser] Error config:", err.config);
      console.error("❌ [EditUser] Error URL:", err.config?.url);
      
      let errorMessage = "Unknown error occurred";
      
      if (err.response?.status === 404) {
        errorMessage = `User with ID ${user.id} not found at ${err.config?.url}. Please check if the user exists and you have permission to update it.`;
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

  if (!user) {
    console.log("❌ [EditUser] No user provided to edit");
    return null;
  }

  if (!user.id) {
    console.log("❌ [EditUser] User object missing ID:", user);
    return (
      <div className="um-edit-form-overlay">
        <div className="um-edit-form">
          <div className="um-error-message">
            <strong>Error:</strong> Cannot edit user - User ID is missing or undefined
            <div>User object: {JSON.stringify(user)}</div>
            <button 
              type="button"
              onClick={onCancel} 
              className="um-close-error"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="um-edit-form-overlay">
      <div className="um-edit-form">
        <h3>Edit User: {user.username} (ID: {user.id})</h3>
        
        {error && (
          <div className="um-error-message">
            <div className="error-content">
              <strong>Update Error:</strong>
              <div className="error-message-text">{error}</div>
              <div className="error-debug-info">
                <small>Attempting to update User ID: {user.id}</small>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setError("")} 
              className="um-close-error"
            >
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="um-form-group">
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div className="um-form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="um-form-row">
            <div className="um-form-group">
              <label>First Name:</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            
            <div className="um-form-group">
              <label>Last Name:</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="um-form-group">
            <label>User Type:</label>
            <select
              name="user_type"
              value={formData.user_type}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
            </select>
          </div>

          <div className="um-form-group">
            <label>Phone Number:</label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="um-form-group">
            <label>Bio:</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="3"
              disabled={loading}
            />
          </div>

          {/* Admin Permissions Section */}
          <div className="um-admin-permissions">
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
                Can access the admin site and manage content
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
                Has all permissions without explicitly assigning them
              </small>
            </div>
          </div>

          <div className="um-form-actions">
            <button type="submit" className="um-btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" onClick={onCancel} className="um-btn-secondary" disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;