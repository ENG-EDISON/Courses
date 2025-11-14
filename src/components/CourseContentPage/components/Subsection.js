import LessonItem from './LessonItem';

const Subsection = ({ 
    subsection, 
    sectionTitle, 
    activeVideo, 
    onVideoSelect, 
    completionStatus, 
    onMarkComplete 
}) => {
    return (
        <div className="subsection">
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