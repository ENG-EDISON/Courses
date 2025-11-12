// components/CourseLoading.js
function CourseLoading() {
    return (
        <div className="enterprise-loading">
            <div className="loading-animation">
                <div className="loading-spinner"></div>
                <div className="loading-pulse"></div>
            </div>
            <div className="loading-text">
                <h3>Loading Course Content</h3>
                <p>Preparing your learning experience...</p>
            </div>
        </div>
    );
}

export default CourseLoading;