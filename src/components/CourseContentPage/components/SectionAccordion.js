import Subsection from './Subsection';
import "../css/SectionAccordion.css";

const SectionAccordion = ({
    section,
    isExpanded,
    onToggle,
    activeVideo,
    onVideoSelect,
    completionStatus,
    onMarkComplete
}) => {
    const totalLessons = section.subsections ? section.subsections.reduce((total, subsection) =>
        total + (subsection.lessons ? subsection.lessons.length : 0), 0
    ) : 0;

    const completedLessons = section.subsections ? section.subsections.reduce((total, subsection) =>
        total + (subsection.lessons ? subsection.lessons.filter(lesson => completionStatus[lesson.id]).length : 0), 0
    ) : 0;

    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return (
        <div className="sa-section">
            <div
                className={`sa-section__header ${isExpanded ? 'sa-section__header--expanded' : ''}`}
                onClick={onToggle}
            >
                <div className="sa-section__icon">
                    <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'}`} />
                </div>
                <div className="sa-section__title">
                    <div className="sa-section-title-row">
                        <h4>{section.title}</h4>
                        <span className="sa-section-progress">{progressPercentage}%</span>
                    </div>
                    <div className="sa-section-meta-row">
                        <span className="sa-section-meta">
                            {section.subsections ? section.subsections.length : 0} topics • {totalLessons} lessons
                        </span>
                        <span className="sa-section-completion">
                            {completedLessons}/{totalLessons} completed
                        </span>
                    </div>
                    <div className="sa-section-progress-bar">
                        <div
                            className="sa-section-progress__fill"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {isExpanded && section.subsections && (
                <div className="sa-section__content">
                    {section.subsections.map(subsection => (
                        <Subsection
                            key={subsection.id}
                            subsection={subsection}
                            sectionTitle={section.title}
                            activeVideo={activeVideo}
                            onVideoSelect={onVideoSelect}
                            completionStatus={completionStatus}
                            onMarkComplete={onMarkComplete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SectionAccordion;