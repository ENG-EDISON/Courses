const ObjectivesTab = ({ course }) => {
    if (!course.learning_objectives || course.learning_objectives.length === 0) {
        return null;
    }

    return (
        <div className="learning-objectives">
            <h3>What You'll Learn</h3>
            <div className="objectives-grid">
                {course.learning_objectives.map((objective) => (
                    <ObjectiveCard key={objective.id} objective={objective} />
                ))}
            </div>
        </div>
    );
};

const ObjectiveCard = ({ objective }) => (
    <div className="objective-card">
        <div className="objective-content">
            <p>
                {objective.icon && (
                    <span className="icon">{objective.icon}</span>
                )}
                {objective.objective}
            </p>
        </div>
    </div>
);

export default ObjectivesTab;