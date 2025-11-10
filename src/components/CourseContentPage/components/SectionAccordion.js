import Subsection from './Subsection';

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
        <div className="section-accordion">
            <div
                className={`section-accordion__header ${isExpanded ? 'section-accordion__header--expanded' : ''}`}
                onClick={onToggle}
            >
                <div className="section-accordion__title">
                    <div className="section-title-row">
                        <h4>{section.title}</h4>
                        <span className="section-progress">{progressPercentage}%</span>
                    </div>
                    <div className="section-meta-row">
                        <span className="section-meta">
                            {section.subsections ? section.subsections.length : 0} topics • {totalLessons} lessons
                        </span>
                        <span className="section-completion">
                            {completedLessons}/{totalLessons} completed
                        </span>
                    </div>
                    <div className="section-progress-bar">
                        <div
                            className="section-progress__fill"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div>
                <div className="section-accordion__icon">
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d={isExpanded ? "M4 10L8 6L12 10" : "M6 4L10 8L6 12"}
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            </div>

            {isExpanded && section.subsections && (
                <div className="section-accordion__content">
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