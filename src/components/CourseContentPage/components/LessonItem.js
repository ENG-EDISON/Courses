import { getVideoSource } from '../utils/videoUtils';

const LessonItem = ({ 
    lesson, 
    sectionTitle, 
    subsectionTitle, 
    isActive, 
    isCompleted, 
    onSelect, 
    onMarkComplete 
}) => {
    const formatDuration = (minutes) => {
        if (!minutes) return '';
        return `${minutes} min`;
    };

    const videoSource = getVideoSource(lesson);
    
    const getVideoIcon = () => {
        const icons = {
            uploaded: '📁',
            youtube: '📺',
            'self-hosted': '🎬',
            none: '📝'
        };
        return icons[videoSource.type] || icons.none;
    };

    const handleLessonClick = (e) => {
        if (e.target.closest('.lesson-mark-complete')) {
            return;
        }
        onSelect(lesson, sectionTitle, subsectionTitle);
    };

    const handleMarkComplete = (e) => {
        e.stopPropagation();
        onMarkComplete(lesson.id);
    };

    return (
        <div
            className={`lesson-item ${isActive ? 'lesson-item--active' : ''} ${isCompleted ? 'lesson-item--completed' : ''}`}
            onClick={handleLessonClick}
        >
            <div className="lesson-item__status">
                {isCompleted ? (
                    <div className="status-completed">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                ) : (
                    <div className="status-pending">
                        <div className="status-circle"></div>
                    </div>
                )}
            </div>

            <div className="lesson-item__icon">
                <span className="video-source-icon">{getVideoIcon()}</span>
            </div>

            <div className="lesson-item__content">
                <h6 className="lesson-item__title">{lesson.title}</h6>
                <div className="lesson-item__meta">
                    {lesson.video_duration && (
                        <span className="lesson-item__duration">
                            {formatDuration(lesson.video_duration)}
                        </span>
                    )}
                    {lesson.is_preview && (
                        <span className="lesson-item__preview">Preview</span>
                    )}
                    <span className="lesson-item__source">
                        {videoSource.type === 'uploaded' && 'Uploaded'}
                        {videoSource.type === 'youtube' && 'YouTube'}
                        {videoSource.type === 'self-hosted' && 'Video'}
                        {videoSource.type === 'none' && 'Content'}
                    </span>
                </div>
            </div>

            {!isCompleted && (
                <button
                    className="lesson-mark-complete"
                    onClick={handleMarkComplete}
                    title="Mark as completed"
                >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                </button>
            )}

            {isActive && (
                <div className="lesson-item__playing">
                    <div className="playing-indicator"></div>
                </div>
            )}
        </div>
    );
};

export default LessonItem;