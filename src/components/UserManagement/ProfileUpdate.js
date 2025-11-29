import React, { useState, useEffect } from 'react';
import { getMyProfile, updateProfile } from '../../api/ProfileApis';
import './ProfileUpdate.css';

const ProfileUpdate = ({ onProfileUpdated, onCancel }) => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState('');
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    date_of_birth: '',
    bio: '',
    instructor_bio: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await getMyProfile();
      setProfile(response.data);
      
      // Initialize form data with current profile values
      setFormData({
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        phone_number: response.data.phone_number || '',
        date_of_birth: response.data.date_of_birth ? response.data.date_of_birth.split('T')[0] : '',
        bio: response.data.bio || '',
        instructor_bio: response.data.instructor_bio || ''
      });

      // Set profile picture preview
      if (response.data.profile_picture) {
        setProfilePicturePreview(response.data.profile_picture);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPEG, PNG, etc.)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setProfilePicture(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setError(''); // Clear any previous errors
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    setProfilePicturePreview('');
    // Note: You might want to add an API call to remove the profile picture from the server
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      setError('');
      setSuccess('');

      // Prepare data for API
      const updateData = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        const value = formData[key] === '' ? null : formData[key];
        if (value !== null) {
          updateData.append(key, value);
        }
      });

      // Add profile picture if selected
      if (profilePicture) {
        updateData.append('profile_picture', profilePicture);
      }
      const response = await updateProfile(updateData);
      setProfile(response.data);
      setSuccess('Profile updated successfully!');
      
      // Notify parent component
      if (onProfileUpdated) {
        onProfileUpdated();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  if (isLoading) {
    return (
      <div className="profile-update-loading">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-update">
      <div className="profile-update-header">
        <h1>Update Profile</h1>
        <p>Edit your personal information and profile picture</p>
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

      <form onSubmit={handleSubmit} className="profile-update-form">
        {/* Profile Picture Section */}
        <div className="form-section">
          <h3>Profile Picture</h3>
          <div className="profile-picture-section">
            <div className="profile-picture-preview">
              {profilePicturePreview ? (
                <img 
                  src={profilePicturePreview} 
                  alt="Profile preview" 
                  className="profile-picture-img"
                />
              ) : (
                <div className="profile-picture-placeholder">
                  {profile?.first_name ? profile.first_name.charAt(0).toUpperCase() : profile?.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="profile-picture-actions">
              <div className="file-input-group">
                <label htmlFor="profile-picture" className="file-input-label">
                  <span className="file-input-text">
                    {profilePicture ? 'Change Picture' : 'Upload Picture'}
                  </span>
                  <input
                    type="file"
                    id="profile-picture"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="file-input"
                  />
                </label>
                <small className="file-hint">
                  JPEG, PNG (Max 5MB)
                </small>
              </div>
              
              {(profilePicturePreview || profile?.profile_picture) && (
                <button 
                  type="button" 
                  className="btn-remove-picture"
                  onClick={removeProfilePicture}
                >
                  Remove Picture
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Personal Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">First Name</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                placeholder="Enter your first name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name">Last Name</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone_number">Phone Number</label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="date_of_birth">Date of Birth</label>
              <input
                type="date"
                id="date_of_birth"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Bio Information</h3>
          
          <div className="form-group">
            <label htmlFor="bio">Personal Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows="4"
              placeholder="Tell us about yourself..."
            />
            <small className="field-hint">This will be visible on your public profile</small>
          </div>

          {profile?.user_type === 'instructor' && (
            <div className="form-group">
              <label htmlFor="instructor_bio">Instructor Bio</label>
              <textarea
                id="instructor_bio"
                name="instructor_bio"
                value={formData.instructor_bio}
                onChange={handleInputChange}
                rows="4"
                placeholder="Tell students about your teaching experience and expertise..."
              />
              <small className="field-hint">This will be displayed on your course pages</small>
            </div>
          )}
        </div>

        <div className="form-section">
          <h3>Account Information</h3>
          <div className="readonly-info">
            <div className="info-item">
              <label>Username</label>
              <p>{profile?.username}</p>
            </div>
            <div className="info-item">
              <label>Email</label>
              <p>{profile?.email}</p>
            </div>
            <div className="info-item">
              <label>User Type</label>
              <p>{profile?.user_type_display}</p>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-primary"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span className="loading-spinner-small"></span>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
          <button 
            type="button" 
            className="btn-secondary"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileUpdate;