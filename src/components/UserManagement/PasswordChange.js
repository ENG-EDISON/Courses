import React, { useState } from 'react';
import { changePassword } from '../../api/ProfileApis';
import './PasswordChange.css';

const PasswordChange = ({ onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    old_password: false,
    new_password: false,
    confirm_password: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    if (!formData.old_password) {
      setError('Current password is required');
      return false;
    }
    if (!formData.new_password) {
      setError('New password is required');
      return false;
    }
    if (formData.new_password.length < 8) {
      setError('New password must be at least 8 characters long');
      return false;
    }
    if (formData.new_password !== formData.confirm_password) {
      setError('New passwords do not match');
      return false;
    }
    if (formData.old_password === formData.new_password) {
      setError('New password must be different from current password');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      const passwordData = {
        old_password: formData.old_password,
        new_password: formData.new_password
      };

      console.log('Changing password with data:', passwordData);

      await changePassword(passwordData);
      setSuccess('Password changed successfully!');
      
      // Reset form
      setFormData({
        old_password: '',
        new_password: '',
        confirm_password: ''
      });

      // Reset password visibility
      setShowPasswords({
        old_password: false,
        new_password: false,
        confirm_password: false
      });

      // Notify parent component after a delay
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2000);

    } catch (error) {
      console.error('Error changing password:', error);
      if (error.response?.data) {
        // Handle specific error messages from API
        const errorData = error.response.data;
        if (errorData.old_password) {
          setError(errorData.old_password[0]);
        } else if (errorData.new_password) {
          setError(errorData.new_password[0]);
        } else if (errorData.detail) {
          setError(errorData.detail);
        } else {
          setError('Failed to change password. Please try again.');
        }
      } else {
        setError('Failed to change password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="password-change">
      <div className="password-change-header">
        <h1>Change Password</h1>
        <p>Update your account password</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span className="alert-icon">✅</span>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="password-change-form">
        <div className="form-section">
          <div className="form-group password-input-group">
            <label htmlFor="old_password">Current Password *</label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords.old_password ? "text" : "password"}
                id="old_password"
                name="old_password"
                value={formData.old_password}
                onChange={handleInputChange}
                placeholder="Enter your current password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('old_password')}
              >
                {showPasswords.old_password ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="form-group password-input-group">
            <label htmlFor="new_password">New Password *</label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords.new_password ? "text" : "password"}
                id="new_password"
                name="new_password"
                value={formData.new_password}
                onChange={handleInputChange}
                placeholder="Enter your new password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('new_password')}
              >
                {showPasswords.new_password ? '🙈' : '👁️'}
              </button>
            </div>
            <small className="field-hint">
              Password must be at least 8 characters long
            </small>
          </div>

          <div className="form-group password-input-group">
            <label htmlFor="confirm_password">Confirm New Password *</label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords.confirm_password ? "text" : "password"}
                id="confirm_password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleInputChange}
                placeholder="Confirm your new password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('confirm_password')}
              >
                {showPasswords.confirm_password ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
        </div>

        <div className="password-strength">
          <div className="strength-indicator">
            <div className={`strength-bar ${formData.new_password.length >= 8 ? 'strong' : 'weak'}`}></div>
          </div>
          <div className="strength-text">
            {formData.new_password.length >= 8 ? 'Strong password' : 'Weak password'}
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner-small"></span>
                Changing Password...
              </>
            ) : (
              'Change Password'
            )}
          </button>
          <button 
            type="button" 
            className="btn-secondary"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PasswordChange;