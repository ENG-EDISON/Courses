// components/course/LearningObjectives.js
function LearningObjectives({ objectives }) {
    const formatLearningObjectives = (objectives) => {
        if (!objectives || !Array.isArray(objectives)) return null;

        return (
            <div className="objectives-tight-grid">
                {objectives.map((obj, index) => (
                    <div key={obj.id || index} className="objective-tight">
                        <span className="icon-tight">{obj.icon || "✓"}</span>
                        <span className="text-tight">{obj.objective}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <section className="content-section">
            <div className="section-header">
                <i className="fas fa-bullseye"></i>
                <h2>What You'll Learn</h2>
            </div>
            <div className="section-content">
                {formatLearningObjectives(objectives)}
            </div>
        </section>
    );
}

export default LearningObjectives;