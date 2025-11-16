import { Link } from 'react-router-dom';
import "../css/CourseHero.css"

function CourseHero({ course }) {
    const renderPricing = () => {
        const regularPrice = parseFloat(course.price);
        const discountPrice = parseFloat(course.discount_price);
        const hasValidDiscount = discountPrice && discountPrice < regularPrice;

        if (hasValidDiscount) {
            return (
                <div className="coursehero-discount-price-group">
                    <span className="coursehero-original-price">${course.price}</span>
                    <span className="coursehero-current-price">${course.discount_price}</span>
                    <span className="coursehero-discount-tag">
                        <i className="fas fa-bolt"></i>
                        Save {Math.round(((regularPrice - discountPrice) / regularPrice) * 100)}%
                    </span>
                </div>
            );
        }
        return <span className="coursehero-current-price">${course.price}</span>;
    };

    return (
        <div className="coursehero-enterprise-hero">
            <div className="coursehero-hero-background">
                <div className="coursehero-gradient-overlay"></div>
                <div className="coursehero-floating-shapes">
                    <div className="coursehero-shape coursehero-shape-1"></div>
                    <div className="coursehero-shape coursehero-shape-2"></div>
                    <div className="coursehero-shape coursehero-shape-3"></div>
                </div>
            </div>
            
            <div className="coursehero-hero-content">
                <div className="coursehero-course-breadcrumb">
                    <Link to="/all-courses" className="coursehero-breadcrumb-link">
                        <i className="fas fa-arrow-left"></i>
                        Back to Courses
                    </Link>
                    <span className="coursehero-breadcrumb-divider">/</span>
                    <span className="coursehero-breadcrumb-category">{course.category || 'Development'}</span>
                    <span className="coursehero-breadcrumb-divider">/</span>
                    <span className="coursehero-current-course">{course.title}</span>
                </div>

                <div className="coursehero-hero-main">
                    <div className="coursehero-hero-text">
                        <div className="coursehero-title-section">
                            <div className="coursehero-course-badge">
                                <i className="fas fa-star"></i>
                                Featured Course
                            </div>
                            <h1 className="coursehero-course-title">{course.title}</h1>
                            <p className="coursehero-course-subtitle">{course.short_description}</p>
                        </div>

                        <div className="coursehero-hero-meta-grid">
                            <div className="coursehero-meta-card">
                                <div className="coursehero-meta-icon">
                                    <i className="fas fa-signal"></i>
                                </div>
                                <div className="coursehero-meta-content">
                                    <span className="coursehero-meta-label">Level</span>
                                    <span className="coursehero-meta-value coursehero-level-badge">
                                        {course.level ? course.level.charAt(0).toUpperCase() + course.level.slice(1) : 'Beginner'}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="coursehero-meta-card">
                                <div className="coursehero-meta-icon">
                                    <i className="fas fa-clock"></i>
                                </div>
                                <div className="coursehero-meta-content">
                                    <span className="coursehero-meta-label">Duration</span>
                                    <span className="coursehero-meta-value">{course.duration_hours || '0'} hours</span>
                                </div>
                            </div>
                            
                            <div className="coursehero-meta-card">
                                <div className="coursehero-meta-icon">
                                    <i className="fas fa-play-circle"></i>
                                </div>
                                <div className="coursehero-meta-content">
                                    <span className="coursehero-meta-label">Lessons</span>
                                    <span className="coursehero-meta-value">{course.total_lessons || '0'}</span>
                                </div>
                            </div>
                            
                            <div className="coursehero-meta-card">
                                <div className="coursehero-meta-icon">
                                    <i className="fas fa-globe"></i>
                                </div>
                                <div className="coursehero-meta-content">
                                    <span className="coursehero-meta-label">Language</span>
                                    <span className="coursehero-meta-value">{course.language ? course.language.charAt(0).toUpperCase() + course.language.slice(1) : 'English'}</span>
                                </div>
                            </div>
                        </div>

                        {course.certificate_available && (
                            <div className="coursehero-certificate-banner">
                                <i className="fas fa-award"></i>
                                <span>Certificate of Completion Included</span>
                            </div>
                        )}
                    </div>

                    <div className="coursehero-hero-actions">
                        <div className="coursehero-enterprise-pricing">
                            <div className="coursehero-pricing-header">
                                <h3>Enroll in this Course</h3>
                                <div className="coursehero-pricing-badge">
                                    <i className="fas fa-crown"></i>
                                    Premium
                                </div>
                            </div>
                            
                            <div className="coursehero-price-display">
                                {renderPricing()}
                            </div>
                            
                            <button className="coursehero-enterprise-enroll">
                                <i className="fas fa-rocket"></i>
                                Start Learning Now
                                <span className="coursehero-btn-arrow">→</span>
                            </button>
                            
                            <div className="coursehero-feature-list">
                                <div className="coursehero-feature">
                                    <i className="fas fa-check"></i>
                                    Lifetime Access
                                </div>
                                <div className="coursehero-feature">
                                    <i className="fas fa-check"></i>
                                    Project Files
                                </div>
                                <div className="coursehero-feature">
                                    <i className="fas fa-check"></i>
                                    Q&A Support
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CourseHero;