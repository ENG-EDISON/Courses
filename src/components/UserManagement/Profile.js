import { useEffect, useState } from "react";
import { getMyProfile } from "../../api/ProfileApis";
import ProfileUpdate from "./ProfileUpdate";
import PasswordChange from "./PasswordChange";
import Footer from "../../components/common/Footer"; // Import Footer
import "./Profile.css";

function Profile() {
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                setError("");
                const response = await getMyProfile();
                setProfile(response.data);
                console.log("response",response.data)
            } catch (error) {
                setError('Failed to load profile. Please try again.');
                console.error('Profile fetch error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // Function to refresh profile data after update
    const handleProfileUpdated = async () => {
        try {
            const response = await getMyProfile();
            setProfile(response.data);
            setIsEditing(false);
        } catch (error) {
            console.error('Error refreshing profile:', error);
        }
    };

    // Function to handle edit button click
    const handleEditProfile = () => {
        setIsEditing(true);
    };

    // Function to handle cancel edit
    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    // Function to handle password change button click
    const handlePasswordChange = () => {
        setIsChangingPassword(true);
    };

    // Function to handle password change success
    const handlePasswordChangeSuccess = () => {
        setIsChangingPassword(false);
    };

    // Function to handle password change cancel
    const handlePasswordChangeCancel = () => {
        setIsChangingPassword(false);
    };

    if (isLoading) {
        return (
            <div className="profile-page">
                <div className="profile-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-page">
                <div className="profile-error">
                    <div className="error-icon">⚠️</div>
                    <h2>Unable to Load Profile</h2>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()} className="retry-btn">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Show ProfileUpdate component when in edit mode
    if (isEditing) {
        return (
            <div className="profile-page">
                <div className="profile-container">
                    <ProfileUpdate 
                        onProfileUpdated={handleProfileUpdated}
                        onCancel={handleCancelEdit}
                    />
                </div>
                <Footer />
            </div>
        );
    }

    // Show PasswordChange component when changing password
    if (isChangingPassword) {
        return (
            <div className="profile-page">
                <div className="profile-container">
                    <PasswordChange 
                        onSuccess={handlePasswordChangeSuccess}
                        onCancel={handlePasswordChangeCancel}
                    />
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-header">
                    <h1 className="profile-title">User Profile</h1>
                    <p className="profile-subtitle">Manage your account information and preferences</p>
                </div>

                <div className="profile-content">
                    <div className="profile-card">
                        <div className="profile-avatar-section">
                            <div className="profile-avatar">
                                {profile.profile_picture ? (
                                    <img 
                                        src={profile.profile_picture} 
                                        alt={`${profile.username}'s profile`}
                                        onError={(e) => {
                                            // Fallback if image fails to load
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div className={`avatar-placeholder ${profile.profile_picture ? 'hidden' : ''}`}>
                                    {profile.first_name ? profile.first_name.charAt(0).toUpperCase() : profile.username.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <div className="profile-badge">
                                <span className={`badge ${profile.user_type}`}>
                                    {profile.user_type_display}
                                </span>
                                {profile.email_verified && (
                                    <span className="badge verified">Verified</span>
                                )}
                            </div>
                        </div>

                        <div className="profile-info-grid">
                            <div className="info-section">
                                <h3 className="section-title">Personal Information</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <label>Username</label>
                                        <p>{profile.username}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>Email Address</label>
                                        <p>{profile.email}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>First Name</label>
                                        <p>{profile.first_name || "Not provided"}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>Last Name</label>
                                        <p>{profile.last_name || "Not provided"}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>Phone Number</label>
                                        <p>{profile.phone_number || "Not provided"}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>Date of Birth</label>
                                        <p>{profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : "Not provided"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="info-section">
                                <h3 className="section-title">Account Statistics</h3>
                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <div className="stat-value">{profile.enrolled_courses_count}</div>
                                        <div className="stat-label">Enrolled Courses</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-value">{profile.completed_courses_count}</div>
                                        <div className="stat-label">Completed Courses</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-value">{profile.average_progress}%</div>
                                        <div className="stat-label">Average Progress</div>
                                    </div>
                                    {profile.user_type === "instructor" && (
                                        <>
                                            <div className="stat-card">
                                                <div className="stat-value">{profile.instructor_rating}</div>
                                                <div className="stat-label">Instructor Rating</div>
                                            </div>
                                            <div className="stat-card">
                                                <div className="stat-value">{profile.total_students}</div>
                                                <div className="stat-label">Total Students</div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {profile.bio && (
                                <div className="info-section">
                                    <h3 className="section-title">Bio</h3>
                                    <div className="bio-content">
                                        <p>{profile.bio}</p>
                                    </div>
                                </div>
                            )}

                            {profile.user_type === "instructor" && profile.instructor_bio && (
                                <div className="info-section">
                                    <h3 className="section-title">Instructor Bio</h3>
                                    <div className="bio-content">
                                        <p>{profile.instructor_bio}</p>
                                    </div>
                                </div>
                            )}

                            <div className="info-section">
                                <h3 className="section-title">Account Details</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <label>Member Since</label>
                                        <p>{new Date(profile.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>Last Updated</label>
                                        <p>{new Date(profile.updated_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>Email Verification</label>
                                        <p className={profile.email_verified ? "status-verified" : "status-pending"}>
                                            {profile.email_verified ? "Verified" : "Pending"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="profile-actions">
                            <button className="btn-primary" onClick={handleEditProfile}>
                                Edit Profile
                            </button>
                            <button className="btn-secondary" onClick={handlePasswordChange}>
                                Change Password
                            </button>
                            <button className="btn-outline">Account Settings</button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Footer added here */}
            <Footer />
        </div>
    );
}

export default Profile;