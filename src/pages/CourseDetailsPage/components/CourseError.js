// components/CourseError.js
function CourseError({ error, type = "load-error" }) {
    const errorConfig = {
        "load-error": {
            icon: "⚠️",
            title: "Unable to Load Course",
            message: error || "Failed to load course. Please try again.",
            showRetry: true
        },
        "not-found": {
            icon: "🔍",
            title: "Course Not Found",
            message: "The requested course could not be found.",
            showRetry: false
        }
    };

    const config = errorConfig[type];

    return (
        <div className="enterprise-error">
            <div className="error-icon">{config.icon}</div>
            <div className="error-content">
                <h3>{config.title}</h3>
                <p>{config.message}</p>
                {config.showRetry && (
                    <button className="retry-btn" onClick={() => window.location.reload()}>
                        Retry
                    </button>
                )}
            </div>
        </div>
    );
}

export default CourseError;