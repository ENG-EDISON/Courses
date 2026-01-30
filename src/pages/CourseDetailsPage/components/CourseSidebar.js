// components/course/CourseSidebar.js
import { useState, useRef, useEffect } from 'react';
import "../css/courseSideBar.css"

function CourseSidebar({ course }) {
    const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const shareMenuRef = useRef(null);

    const courseUrl = typeof window !== 'undefined' ? window.location.href : '';
    const courseTitle = course.title || 'Check out this course';
    const courseDescription = course.description || 'An amazing course I found';
    // Close share menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
                setIsShareMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleShareClick = () => {
        setIsShareMenuOpen(!isShareMenuOpen);
    };

    const handleCopyLink = async () => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(courseUrl);
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = courseUrl;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }

            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);

            // Close menu after copy
            setTimeout(() => setIsShareMenuOpen(false), 500);

        } catch (error) {
            console.error('Failed to copy:', error);
            alert('Unable to copy link. Please copy the URL manually.');
        }
    };

    const handleSocialShare = (platform) => {
        let shareUrl = '';
        const encodedUrl = encodeURIComponent(courseUrl);
        const encodedTitle = encodeURIComponent(courseTitle);
        const encodedDescription = encodeURIComponent(courseDescription);

        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
                break;
            case 'whatsapp':
                shareUrl = `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`;
                break;
            case 'telegram':
                shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
                break;
            case 'email':
                shareUrl = `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`;
                break;
            default:
                return;
        }

        window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
        setIsShareMenuOpen(false);
    };

    // Use native Web Share API if available on mobile
    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: courseTitle,
                    text: courseDescription,
                    url: courseUrl,
                });
                setIsShareMenuOpen(false);
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Error sharing:', error);
                }
            }
        } else {
            // Fallback to custom share menu
            handleShareClick();
        }
    };

    return (
        <div className="c-s-b-container">
            {/* Instructor Card */}
            <div className="c-s-b-card">
                <div className="c-s-b-card-header">
                    <h3>Instructor</h3>
                </div>
                <div className="c-s-b-instructor-info">
                    <div className="c-s-b-instructor-avatar">
                        <i className="fas fa-user-tie"></i>
                    </div>
                    <div className="c-s-b-instructor-details">
                        <h4>{course.instructor_name || 'Instructor'}</h4>
                        <div className="c-s-b-instructor-stats">
                            <div className="c-s-b-instructor-stat">
                                <strong>{course.instructor?.total_students || 0}</strong>
                                <span>Students</span>
                            </div>
                            <div className="c-s-b-instructor-stat">
                                <strong>{course.instructor?.instructor_rating || '5.0'}</strong>
                                <span>Rating</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Stats */}
            <div className="c-s-b-card">
                <div className="c-s-b-card-header">
                    <h3>Course Statistics</h3>
                </div>
                <div className="c-s-b-stats-grid">
                    <div className="c-s-b-stat-item">
                        <div className="c-s-b-stat-icon">
                            <i className="fas fa-users"></i>
                        </div>
                        <div className="c-s-b-stat-info">
                            <div className="c-s-b-stat-value">{course.enrolled_count || 0}</div>
                            <div className="c-s-b-stat-label">Enrolled</div>
                        </div>
                    </div>
                    <div className="c-s-b-stat-item">
                        <div className="c-s-b-stat-icon">
                            <i className="fas fa-star"></i>
                        </div>
                        <div className="c-s-b-stat-info">
                            <div className="c-s-b-stat-value">{course.course_rating || '0.0'}</div>
                            <div className="c-s-b-stat-label">Rating</div>
                        </div>
                    </div>
                    <div className="c-s-b-stat-item">
                        <div className="c-s-b-stat-icon">
                            <i className="fas fa-comments"></i>
                        </div>
                        <div className="c-s-b-stat-info">
                            <div className="c-s-b-stat-value">{course.course_reviews || 0}</div>
                            <div className="c-s-b-stat-label">Reviews</div>
                        </div>
                    </div>
                    <div className="c-s-b-stat-item">
                        <div className="c-s-b-stat-icon">
                            <i className="fas fa-calendar"></i>
                        </div>
                        <div className="c-s-b-stat-info">
                            <div className="c-s-b-stat-value">
                                {course.published_year || 'N/A'}
                            </div>
                            <div className="c-s-b-stat-label">Published</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Actions */}
            <div className="c-s-b-card">
                <div className="c-s-b-action-buttons">
                    {/* Share Button with Menu */}
                    <div className="c-s-b-share-container" ref={shareMenuRef}>
                        <button
                            className={`c-s-b-action-btn ${isShareMenuOpen ? 'active' : ''}`}
                            onClick={handleNativeShare}
                        >
                            <i className="fas fa-share-alt"></i>
                            Share Course
                        </button>

                        {/* Custom Share Menu (shown when native share is not available) */}
                        {!navigator.share && isShareMenuOpen && (
                            <div className="c-s-b-share-menu">
                                <div className="c-s-b-share-header">
                                    <h4>Share this course</h4>
                                    <button
                                        className="c-s-b-close-menu"
                                        onClick={() => setIsShareMenuOpen(false)}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>

                                <div className="c-s-b-share-options">
                                    <button
                                        className="c-s-b-share-option"
                                        onClick={() => handleSocialShare('facebook')}
                                    >
                                        <div className="c-s-b-share-icon facebook">
                                            <i className="fab fa-facebook-f"></i>
                                        </div>
                                        <span>Facebook</span>
                                    </button>

                                    <button
                                        className="c-s-b-share-option"
                                        onClick={() => handleSocialShare('twitter')}
                                    >
                                        <div className="c-s-b-share-icon twitter">
                                            <i className="fab fa-twitter"></i>
                                        </div>
                                        <span>Twitter</span>
                                    </button>

                                    <button
                                        className="c-s-b-share-option"
                                        onClick={() => handleSocialShare('linkedin')}
                                    >
                                        <div className="c-s-b-share-icon linkedin">
                                            <i className="fab fa-linkedin-in"></i>
                                        </div>
                                        <span>LinkedIn</span>
                                    </button>

                                    <button
                                        className="c-s-b-share-option"
                                        onClick={() => handleSocialShare('whatsapp')}
                                    >
                                        <div className="c-s-b-share-icon whatsapp">
                                            <i className="fab fa-whatsapp"></i>
                                        </div>
                                        <span>WhatsApp</span>
                                    </button>

                                    <button
                                        className="c-s-b-share-option"
                                        onClick={() => handleSocialShare('telegram')}
                                    >
                                        <div className="c-s-b-share-icon telegram">
                                            <i className="fab fa-telegram"></i>
                                        </div>
                                        <span>Telegram</span>
                                    </button>

                                    <button
                                        className="c-s-b-share-option"
                                        onClick={() => handleSocialShare('email')}
                                    >
                                        <div className="c-s-b-share-icon email">
                                            <i className="fas fa-envelope"></i>
                                        </div>
                                        <span>Email</span>
                                    </button>
                                </div>

                                <div className="c-s-b-copy-link-section">
                                    <div className="c-s-b-url-preview">
                                        <input
                                            type="text"
                                            value={courseUrl}
                                            readOnly
                                            className="c-s-b-url-input"
                                        />
                                    </div>
                                    <button
                                        className={`c-s-b-copy-link-btn ${isCopied ? 'copied' : ''}`}
                                        onClick={handleCopyLink}
                                    >
                                        <i className={`fas ${isCopied ? 'fa-check' : 'fa-copy'}`}></i>
                                        {isCopied ? 'Copied!' : 'Copy Link'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CourseSidebar;