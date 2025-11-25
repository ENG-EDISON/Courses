import { Link } from 'react-router-dom';
import "../css/CourseHero.css"

function CourseHero({ course }) {
    const renderPricing = () => {
        const regularPrice = parseFloat(course.price);
        const discountPrice = parseFloat(course.discount_price);
        const hasValidDiscount = discountPrice && discountPrice < regularPrice;

        if (hasValidDiscount) {
            return (
                <div className="coursehero-pricing-group">
                    <span className="coursehero-original-price">${course.price}</span>
                    <span className="coursehero-current-price">${course.discount_price}</span>
                    <span className="coursehero-discount-badge">
                        Save {Math.round(((regularPrice - discountPrice) / regularPrice) * 100)}%
                    </span>
                </div>
            );
        }
        return <span className="coursehero-current-price">${course.price}</span>;
    };

    return (
        <div className="coursehero-compact-hero">
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
                        <div className="coursehero-pricing-section">
                            {renderPricing()}
                        </div>
                        
                        <button className="coursehero-enroll-btn">
                            Enroll Now
                            <i className="fas fa-arrow-right"></i>
                        </button>
                        
                        <div className="coursehero-features">
                            <div className="coursehero-feature">
                                <i className="fas fa-check"></i>
                                Lifetime Access
                            </div>
                            <div className="coursehero-feature">
                                <i className="fas fa-check"></i>
                                Project Files
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CourseHero;