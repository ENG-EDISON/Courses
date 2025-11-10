const ErrorState = ({ error, navigate }) => (
    <div className="course-content">
        <div className="course-content__error">
            <h2>Unable to load course</h2>
            <p>{error || 'Course not found'}</p>
            <button
                onClick={() => navigate('/enrolled-courses')}
                className="btn btn--primary"
            >
                Back to My Courses
            </button>
        </div>
    </div>
);

export default ErrorState;