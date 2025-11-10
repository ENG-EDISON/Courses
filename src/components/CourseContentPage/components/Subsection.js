import LessonItem from './LessonItem';

const Subsection = ({ 
    subsection, 
    sectionTitle, 
    activeVideo, 
    onVideoSelect, 
    completionStatus, 
    onMarkComplete 
}) => {
    const completedLessons = subsection.lessons ?
        subsection.lessons.filter(lesson => completionStatus[lesson.id]).length : 0;

    return (
        <div className="subsection">
            <div className="subsection__header">
                <div className="subsection-title">
                    <h5>{subsection.title}</h5>
                    {subsection.description && (
                        <p className="subsection-description">{subsection.description}</p>
                    )}
                </div>
                <div className="subsection-stats">
                    <span className="subsection-progress">{completedLessons}/{subsection.lessons ? subsection.lessons.length : 0}</span>
                </div>
            </div>

            {subsection.lessons && (
                <div className="subsection__lessons">
                    {subsection.lessons.map(lesson => (
                        <LessonItem
                            key={lesson.id}
                            lesson={lesson}
                            sectionTitle={sectionTitle}
                            subsectionTitle={subsection.title}
                            isActive={activeVideo?.id === lesson.id}
                            isCompleted={completionStatus[lesson.id]}
                            onSelect={onVideoSelect}
                            onMarkComplete={onMarkComplete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Subsection;