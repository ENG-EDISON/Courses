import { Link, useNavigate } from 'react-router-dom';
import "../css/CourseHero.css"
import { EnrollToCourse } from '../../../api/EnrollmentApis';

function CourseHero({ course }) {
    const isFree = parseFloat(course.price) === 0;
    const navigate = useNavigate();

    const renderPricing = () => {
        if (isFree) {
            return <span className="coursehero-free-price">Free</span>;
        }
        return <span className="coursehero-current-price">${course.price}</span>;
    };

    const handleEnroll = async () => {
        if (isFree) {
            try {
                const response = await EnrollToCourse(course.id);
                if (response.data.success) {
                    alert('Successfully enrolled in the course!');
                    // Redirect to course content page
                    window.location.href = `/course-content/${course.id}`;
                }
            } catch (error) {
                if (error.response?.data?.message === "You are already enrolled in this course") {
                    alert('You are already enrolled in this course!');
                    // Redirect to course content page
                    window.location.href = `/course-content/${course.id}`;
                } else {
                    alert('Enrollment failed. Please try again.');
                    console.error('Enrollment error:', error);
                }
            }
        } else {
            // Redirect to contact admin page for paid courses
            navigate(`/course/${course.id}/contact-admin`);
        }
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

                        <button
                            className={`coursehero-enroll-btn ${isFree ? 'coursehero-free-btn' : 'coursehero-paid-btn'}`}
                            onClick={handleEnroll}
                        >
                            {isFree ? 'Enroll for Free' : 'Purchase Course'}
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
                            {isFree && (
                                <div className="coursehero-feature">
                                    <i className="fas fa-check"></i>
                                    Free Forever
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