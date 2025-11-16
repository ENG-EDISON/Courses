import "../css/CourseOverview.css"

// components/course/CourseOverview.js
function CourseOverview({ description }) {
    return (
        <section className="content-section enterprise-overview">
            <div className="section-header enterprise-header">
                <div className="header-icon-container">
                    <i className="fas fa-info-circle"></i>
                </div>
                <div className="header-content">
                    <h2>Course Overview</h2>
                    <p className="header-subtitle">What you'll learn and achieve</p>
                </div>
                <div className="header-decoration">
                    <div className="decoration-line"></div>
                </div>
            </div>
            <div className="section-content enterprise-content">
                <div className="description-container">
                    <div className="description-icon">
                        <i className="fas fa-graduation-cap"></i>
                    </div>
                    <div className="description-content">
                        <p className="course-description">{description}</p>
                    </div>
                </div>
                <div className="overview-features">
                    <div className="feature-item">
                        <i className="fas fa-rocket"></i>
                        <span>Hands-on Projects</span>
                    </div>
                    <div className="feature-item">
                        <i className="fas fa-code"></i>
                        <span>Real-world Skills</span>
                    </div>
                    <div className="feature-item">
                        <i className="fas fa-certificate"></i>
                        <span>Industry Recognized</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default CourseOverview;