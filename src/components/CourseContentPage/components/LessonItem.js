import { getVideoSource } from '../utils/videoUtils';
import "../css/LessonItem.css";

const LessonItem = ({ 
    lesson, 
    sectionTitle, 
    subsectionTitle, 
    isActive, 
    isCompleted, 
    onSelect, 
    onMarkComplete 
}) => {
    const videoSource = getVideoSource(lesson);
    
    const getVideoIcon = () => {
        const icons = {
            uploaded: '▶️',
            youtube: '▶️',
            'self-hosted': '▶️',
            none: '📝'
        };
        return icons[videoSource.type] || icons.none;
    };

    // Format duration from seconds to MM:SS
    const formatDuration = (seconds) => {
        if (!seconds) return '';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleLessonClick = (e) => {
        if (e.target.closest('.ls-item-mark-complete')) {
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
            className={`ls-item ${isActive ? 'ls-item--active' : ''} ${isCompleted ? 'ls-item--completed' : ''}`}
            onClick={handleLessonClick}
        >
            <div className="ls-item__status">
                {isCompleted ? (
                    <div className="ls-item-status-completed">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                ) : (
                    <div className="ls-item-status-pending">
                        <div className="ls-item-status-circle"></div>
                    </div>
                )}
            </div>

            <div className="ls-item__icon">
                <span className="ls-item-video-source-icon">{getVideoIcon()}</span>
            </div>

            <div className="ls-item__content">
                <h6 className="ls-item__title">
                    {lesson.title}
                </h6>
            </div>

            {/* Duration display */}
            {lesson.video_duration && (
                <div className="ls-item__duration">
                    {formatDuration(lesson.video_duration)}
                </div>
            )}

            {!isCompleted && (
                <button
                    className="ls-item-mark-complete"
                    onClick={handleMarkComplete}
                    title="Mark as completed"
                >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default LessonItem;