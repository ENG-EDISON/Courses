// components/course/CourseSidebar.js
function CourseSidebar({ course }) {
    return (
        <div className="course-sidebar">
            {/* Instructor Card */}
            <div className="sidebar-card">
                <div className="card-header">
                    <h3>Instructor</h3>
                </div>
                <div className="instructor-info">
                    <div className="instructor-avatar">
                        <i className="fas fa-user-tie"></i>
                    </div>
                    <div className="instructor-details">
                        <h4>{course.instructor_name || 'Instructor'}</h4>
                        <div className="instructor-stats">
                            <div className="stat">
                                <strong>{course.instructor?.total_students || 0}</strong>
                                <span>Students</span>
                            </div>
                            <div className="stat">
                                <strong>{course.instructor?.instructor_rating || '5.0'}</strong>
                                <span>Rating</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Stats */}
            <div className="sidebar-card">
                <div className="card-header">
                    <h3>Course Statistics</h3>
                </div>
                <div className="stats-grid">
                    <div className="stat-item">
                        <div className="stat-icon">
                            <i className="fas fa-users"></i>
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{course.enrollment_count || 0}</div>
                            <div className="stat-label">Enrolled</div>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">
                            <i className="fas fa-star"></i>
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{course.average_rating || '0.0'}</div>
                            <div className="stat-label">Rating</div>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">
                            <i className="fas fa-comments"></i>
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{course.total_reviews || 0}</div>
                            <div className="stat-label">Reviews</div>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">
                            <i className="fas fa-calendar"></i>
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">
                                {course.published_at ? new Date(course.published_at).getFullYear() : 'N/A'}
                            </div>
                            <div className="stat-label">Published</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Actions */}
            <div className="sidebar-card">
                <div className="action-buttons">
                    <button className="action-btn secondary">
                        <i className="fas fa-heart"></i>
                        Add to Wishlist
                    </button>
                    <button className="action-btn secondary">
                        <i className="fas fa-share-alt"></i>
                        Share Course
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CourseSidebar;