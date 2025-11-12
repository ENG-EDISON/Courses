// components/course/CurriculumSubsection.js
import LessonItem from './LessonItem';
import { getTotalSubsectionDuration, formatDuration } from '../utils/courseUtils';

function CurriculumSubsection({ 
    subsection, 
    sectionIndex, 
    subIndex, 
    isExpanded, 
    onToggleSubsection, 
    onPlayPreviewVideo 
}) {
    const subsectionDuration = getTotalSubsectionDuration(subsection);

    return (
        <div className="subsection-enterprise">
            {/* Subsection Header */}
            <div
                className={`subsection-header-enterprise ${isExpanded ? 'expanded' : ''}`}
                onClick={onToggleSubsection}
            >
                <div className="subsection-indicator">
                    <div className="subsection-number">
                        {sectionIndex + 1}.{subIndex + 1}
                    </div>
                    <div className="subsection-toggle">
                        <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                    </div>
                </div>
                <div className="subsection-content-main">
                    <div className="subsection-title">{subsection.title}</div>
                    <div>{subsection.lessons?.length || 0} Lectures&nbsp; • {formatDuration(subsectionDuration)}</div>
                </div>
            </div>

            {/* Lessons List */}
            <div className={`lessons-list-enterprise ${isExpanded ? 'expanded' : ''}`}>
                {subsection.lessons && subsection.lessons.length > 0 ? (
                    subsection.lessons.map((lesson) => (
                        <LessonItem
                            key={lesson.id}
                            lesson={lesson}
                            onPlayPreviewVideo={onPlayPreviewVideo}
                        />
                    ))
                ) : (
                    <div className="no-lessons-message">
                        <i className="fas fa-info-circle"></i>
                        <span>No lessons available in this subsection yet.</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CurriculumSubsection;