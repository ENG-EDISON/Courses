import "../css/LearningObjectives.css";

// components/course/LearningObjectives.js
function LearningObjectives({ objectives }) {
    const formatLearningObjectives = (objectives) => {
        if (!objectives || !Array.isArray(objectives)) return null;

        return (
            <div className="lo-objectives-tight-grid">
                {objectives.map((obj, index) => (
                    <div key={obj.id || index} className="lo-objective-tight">
                        <span className="lo-icon-tight">{obj.icon || "✓"}</span>
                        <span className="lo-text-tight">{obj.objective}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <section className="lo-content-section">
            <div className="lo-section-header">
                <i className="fas fa-bullseye"></i>
                <h2 className="lo-what-you-will-learn">What You'll Learn</h2>
            </div>
            <div className="lo-section-content">
                {formatLearningObjectives(objectives)}
            </div>
        </section>
    );
}

export default LearningObjectives;