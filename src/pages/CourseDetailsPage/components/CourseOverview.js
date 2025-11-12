// components/course/CourseOverview.js
function CourseOverview({ description }) {
    return (
        <section className="content-section">
            <div className="section-header">
                <i className="fas fa-info-circle"></i>
                <h2>Course Overview</h2>
            </div>
            <div className="section-content">
                <p className="course-description">{description}</p>
            </div>
        </section>
    );
}

export default CourseOverview;