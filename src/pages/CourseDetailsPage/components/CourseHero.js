// src/pages/CourseDetailsPage/components/CourseHero.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useState, useEffect, useCallback } from 'react';
import "../css/CourseHero.css"
import { EnrollToCourse, checkEnrollment } from '../../../api/EnrollmentApis';

function CourseHero({ course, skipEnrollmentCheck = false }) {
    const isFree = parseFloat(course.price) === 0;
    const navigate = useNavigate();
    const { isLoggedIn, user, isLoading: authLoading } = useAuth();
    
    // State for enrollment checking
    const [enrollmentData, setEnrollmentData] = useState(null);
    const [enrollmentLoading, setEnrollmentLoading] = useState(!skipEnrollmentCheck);
    const [enrollmentError, setEnrollmentError] = useState(null);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [enrollSuccess, setEnrollSuccess] = useState(false);

    // CHECK ENROLLMENT STATUS ON COMPONENT MOUNT
    useEffect(() => {
        if (skipEnrollmentCheck) {
            setEnrollmentLoading(false);
            return;
        }

        const checkUserEnrollment = async () => {
            if (isLoggedIn && course?.id) {
                try {
                    setEnrollmentLoading(true);
                    setEnrollmentError(null);
                    const response = await checkEnrollment(course.id);
                    setEnrollmentData(response.data);
                } catch (error) {
                    console.error('Error checking enrollment:', error);
                    setEnrollmentError('Failed to check enrollment status');
                    setEnrollmentData(null);
                } finally {
                    setEnrollmentLoading(false);
                }
            } else {
                setEnrollmentLoading(false);
            }
        };

        if (!authLoading) {
            checkUserEnrollment();
        }
    }, [isLoggedIn, course?.id, authLoading, skipEnrollmentCheck]);

    const isEnrolled = enrollmentData?.is_enrolled || false;

    // Smooth redirect function
    const smoothRedirect = useCallback((path) => {
        setIsRedirecting(true);
        setTimeout(() => {
            navigate(path);
        }, 400);
    }, [navigate]);

    // Handle successful enrollment
    useEffect(() => {
        if (enrollSuccess && course?.id) {
            const timer = setTimeout(() => {
                smoothRedirect(`/course-content/${course.id}`);
            }, 1200);
            
            return () => clearTimeout(timer);
        }
    }, [enrollSuccess, course?.id, smoothRedirect]);

    const renderPricing = () => {
        if (isFree) {
            return <span className="coursehero-free-price">Free</span>;
        }
        return <span className="coursehero-current-price">${course.price}</span>;
    };

    const handleEnroll = async () => {
        if (isEnrolled) {
            smoothRedirect(`/course-content/${course.id}`);
            return;
        }

        if (!isLoggedIn) {
            localStorage.setItem('enrollment_redirect', JSON.stringify({
                courseId: course.id,
                courseTitle: course.title,
                isFree: isFree,
                timestamp: new Date().getTime()
            }));
            smoothRedirect('/login');
            return;
        }

        if (isFree) {
            try {
                setEnrollmentLoading(true);
                const response = await EnrollToCourse(course.id);
                if (response.data.success) {
                    localStorage.removeItem('enrollment_redirect');
                    setEnrollmentData({
                        is_enrolled: true,
                        enrollment_id: response.data.enrollment_id,
                        enrolled_at: new Date().toISOString()
                    });
                    setEnrollSuccess(true);
                    setEnrollmentLoading(false);
                }
            } catch (error) {
                setEnrollmentLoading(false);
                if (error.response?.data?.message === "You are already enrolled in this course") {
                    setEnrollmentData({
                        is_enrolled: true,
                        enrollment_id: null,
                        enrolled_at: new Date().toISOString()
                    });
                    smoothRedirect(`/course-content/${course.id}`);
                } else {
                    alert('Enrollment failed. Please try again.');
                    console.error('Enrollment error:', error);
                }
            }
        } else {
            smoothRedirect(`/course/${course.id}/contact-admin`);
        }
    };

    // Determine button text and behavior
    const getButtonConfig = () => {
        if (isRedirecting) {
            return {
                text: 'Redirecting...',
                className: 'coursehero-redirecting-btn',
                disabled: true,
                icon: 'fas fa-spinner fa-spin'
            };
        }

        if (enrollSuccess) {
            return {
                text: 'Enrollment Successful!',
                className: 'coursehero-success-btn',
                disabled: true,
                icon: 'fas fa-check-circle'
            };
        }

        if (authLoading || enrollmentLoading) {
            return {
                text: 'Checking...',
                className: 'coursehero-loading-btn',
                disabled: true,
                icon: 'fas fa-spinner fa-spin'
            };
        }

        if (isEnrolled) {
            return {
                text: 'Continue Learning',
                className: 'coursehero-continue-btn',
                disabled: false,
                icon: 'fas fa-play-circle'
            };
        }

        if (isFree) {
            return {
                text: 'Enroll for Free',
                className: 'coursehero-free-btn',
                disabled: false,
                icon: 'fas fa-arrow-right'
            };
        }

        return {
            text: 'Purchase Course',
            className: 'coursehero-paid-btn',
            disabled: false,
            icon: 'fas fa-shopping-cart'
        };
    };

    const buttonConfig = getButtonConfig();

    if (authLoading) {
        return (
            <div className="coursehero-compact-hero">
                <div className="coursehero-hero-content">
                    <div className="coursehero-loading">
                        <div className="coursehero-loading-spinner"></div>
                        <p>Checking authentication...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`coursehero-compact-hero ${isRedirecting ? 'coursehero-redirecting' : ''} ${enrollSuccess ? 'coursehero-success' : ''}`}>
            <div className="coursehero-hero-content">
                <div className="coursehero-breadcrumb">
                    <Link to="/all-courses" className="coursehero-back-link">
                        <i className="fas fa-arrow-left"></i>
                        All Courses
                    </Link>
                    <span className="coursehero-breadcrumb-divider">/</span>
                    <span className="coursehero-category">{course.category || 'Development'}</span>
                </div>

                <div className="coursehero-main-content">
                    <div className="coursehero-text-content">
                        <h1 className="coursehero-title">{course.title}</h1>
                        <p className="coursehero-description">{course.short_description}</p>

                        <div className="coursehero-meta-info">
                            <div className="coursehero-meta-item">
                                <i className="fas fa-signal"></i>
                                <span>{course.level ? course.level.charAt(0).toUpperCase() + course.level.slice(1) : 'Beginner'}</span>
                            </div>
                            <div className="coursehero-meta-item">
                                <i className="fas fa-clock"></i>
                                <span>{course.duration_hours || '0'}h</span>
                            </div>
                            <div className="coursehero-meta-item">
                                <i className="fas fa-play-circle"></i>
                                <span>{course.total_lessons || '0'} lessons</span>
                            </div>
                            {course.certificate_available && (
                                <div className="coursehero-meta-item">
                                    <i className="fas fa-award"></i>
                                    <span>Certificate</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="coursehero-action-card">
                        {enrollSuccess && (
                            <div className="coursehero-success-message">
                                <i className="fas fa-check-circle"></i>
                                <div className="coursehero-success-content">
                                    <h4>Enrollment Successful!</h4>
                                    <p>Redirecting you to the course...</p>
                                </div>
                            </div>
                        )}

                        <div className="coursehero-pricing-section">
                            {renderPricing()}
                        </div>

                        <button
                            className={`coursehero-enroll-btn ${buttonConfig.className}`}
                            onClick={handleEnroll}
                            disabled={buttonConfig.disabled}
                        >
                            {buttonConfig.text}
                            <i className={buttonConfig.icon}></i>
                        </button>

                        {/* Course features */}
                        <div className="coursehero-features">
                            <div className="coursehero-feature">
                                <i className="fas fa-check"></i>
                                <span>Lifetime Access</span>
                            </div>
                            <div className="coursehero-feature">
                                <i className="fas fa-check"></i>
                                <span>Project Files</span>
                            </div>
                            <div className="coursehero-feature">
                                <i className="fas fa-check"></i>
                                <span>Certificate of Completion</span>
                            </div>
                            {isFree && (
                                <div className="coursehero-feature coursehero-feature-highlight">
                                    <i className="fas fa-check"></i>
                                    <span>Free Forever</span>
                                </div>
                            )}
                            {course.certificate_available && (
                                <div className="coursehero-feature coursehero-feature-highlight">
                                    <i className="fas fa-award"></i>
                                    <span>Certificate Available</span>
                                </div>
                            )}
                        </div>

                        {isLoggedIn && !skipEnrollmentCheck && (
                            <div className="coursehero-enrollment-status">
                                {enrollmentLoading ? (
                                    <div className="coursehero-status-loading">
                                        <i className="fas fa-spinner fa-spin"></i>
                                        <span>Checking enrollment status...</span>
                                    </div>
                                ) : enrollmentError ? (
                                    <div className="coursehero-status-error">
                                        <i className="fas fa-exclamation-triangle"></i>
                                        <span>{enrollmentError}</span>
                                    </div>
                                ) : isEnrolled ? (
                                    <div className="coursehero-status-enrolled">
                                        <i className="fas fa-check-circle"></i>
                                        <span>You're enrolled in this course</span>
                                    </div>
                                ) : (
                                    <div className="coursehero-status-not-enrolled">
                                        <i className="fas fa-info-circle"></i>
                                        <span>You're not enrolled yet</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="coursehero-auth-info">
                            {!isLoggedIn ? (
                                <div className="coursehero-auth-notice">
                                    <i className="fas fa-info-circle"></i>
                                    <span>Login to enroll in this course</span>
                                </div>
                            ) : (
                                <div className="coursehero-user-info">
                                    <i className="fas fa-user-check"></i>
                                    <span>Logged in as {user?.username}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CourseHero;