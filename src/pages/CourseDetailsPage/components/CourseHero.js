// components/CourseHero.js
function CourseHero({ course }) {
    const renderPricing = () => {
        const regularPrice = parseFloat(course.price);
        const discountPrice = parseFloat(course.discount_price);
        const hasValidDiscount = discountPrice && discountPrice < regularPrice;

        if (hasValidDiscount) {
            return (
                <div className="discount-price-group">
                    <span className="original-price">${course.price}</span>
                    <span className="current-price">${course.discount_price}</span>
                    <span className="discount-tag">
                        Save {Math.round(((regularPrice - discountPrice) / regularPrice) * 100)}%
                    </span>
                </div>
            );
        }
        return <span className="current-price">${course.price}</span>;
    };

    return (
        <div className="course-hero">
            <div className="hero-background"></div>
            <div className="hero-content">
                <div className="course-breadcrumb">
                    <span>Courses</span>
                    <span className="breadcrumb-divider">/</span>
                    <span>{course.category || 'Uncategorized'}</span>
                    <span className="breadcrumb-divider">/</span>
                    <span className="current-course">{course.title}</span>
                </div>

                <div className="hero-main">
                    <div className="hero-text">
                        <h1 className="course-title">{course.title}</h1>
                        <p className="course-subtitle">{course.short_description}</p>

                        <div className="hero-meta">
                            <div className="meta-item">
                                <i className="fas fa-signal"></i>
                                <span className="level-badge">
                                    {course.level ? course.level.charAt(0).toUpperCase() + course.level.slice(1) : 'Beginner'}
                                </span>
                            </div>
                            <div className="meta-item">
                                <i className="fas fa-clock"></i>
                                <span>{course.duration_hours || '0'} hours • {course.total_lessons || '0'} lessons</span>
                            </div>
                            <div className="meta-item">
                                <i className="fas fa-globe-americas"></i>
                                <span>{course.language ? course.language.charAt(0).toUpperCase() + course.language.slice(1) : 'English'}</span>
                            </div>
                            {course.certificate_available && (
                                <div className="meta-item certificate">
                                    <i className="fas fa-award"></i>
                                    <span>Includes Certificate</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="hero-actions">
                        <div className="pricing-card">
                            <div className="price-display">
                                {renderPricing()}
                            </div>
                            <button className="enroll-btn-primary">
                                <i className="fas fa-lock"></i>
                                Enroll Now
                            </button>
                            <div className="money-back">
                                <i className="fas fa-shield-alt"></i>
                                30-day money-back guarantee
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CourseHero;