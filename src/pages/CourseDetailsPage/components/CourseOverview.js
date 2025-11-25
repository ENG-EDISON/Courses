import "../css/CourseOverview.css"

// components/course/CourseOverview.js
function CourseOverview({ description }) {
    return (
        <section className="co-content-section">
            <div className="co-section-header">
                <div className="co-header-icon-container">
                    <i className="fas fa-info-circle"></i>
                </div>
                <div className="co-header-content">
                    <h2>Course Overview</h2>
                    <p className="co-header-subtitle">What you'll learn and achieve</p>
                </div>
                <div className="co-header-decoration">
                    <div className="co-decoration-line"></div>
                </div>
            </div>
            <div className="co-section-content">
                <div className="co-description-container">
                    <div className="co-description-icon">
                        <i className="fas fa-graduation-cap"></i>
                    </div>
                    <div className="co-description-content">
                        <p className="co-course-description">{description}</p>
                    </div>
                </div>
                <div className="co-overview-features">
                    <div className="co-feature-item">
                        <i className="fas fa-rocket"></i>
                        <span>Hands-on Projects</span>
                    </div>
                    <div className="co-feature-item">
                        <i className="fas fa-code"></i>
                        <span>Real-world Skills</span>
                    </div>
                    <div className="co-feature-item">
                        <i className="fas fa-certificate"></i>
                        <span>Industry Recognized</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default CourseOverview;