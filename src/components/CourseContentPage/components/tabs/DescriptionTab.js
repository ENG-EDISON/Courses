const DescriptionTab = ({ course }) => (
    <div className="course-description">
        <h3>Course Overview</h3>
        <p>{course.description}</p>

        {course.requirements && (
            <RequirementsSection requirements={course.requirements} />
        )}
    </div>
);

const RequirementsSection = ({ requirements }) => (
    <div className="requirements-section">
        <h4>Requirements</h4>
        <div className="requirements-list">
            {requirements.split('\r\n').map((requirement, index) => (
                requirement.trim() && (
                    <div key={index} className="requirement-item">
                        <span className="requirement-bullet">•</span>
                        <span>{requirement}</span>
                    </div>
                )
            ))}
        </div>
    </div>
);

export default DescriptionTab;