// components/course/LessonItem.js
import { 
    hasPreviewContent, 
    getLessonIcon, 
    getLessonIconColor, 
    getVideoBadgeType, 
    formatDuration 
} from '../utils/courseUtils';
import "../css/LessonItem.css"

function LessonItem({ lesson, onPlayPreviewVideo }) {
    return (
        <div className={`lesson-item-enterprise ${hasPreviewContent(lesson) ? 'preview-available' : ''}`}>
            <div className="lesson-icon" style={{ color: getLessonIconColor(lesson.lesson_type) }}>
                <i className={getLessonIcon(lesson.lesson_type)}></i>
            </div>

            <div className="lesson-content-horizontal">
                <div className="lesson-order">
                    {lesson.order + 1}
                </div>

                <div className="lesson-title">{lesson.title}</div>
                <div className="lesson-meta-horizontal">
                    <span className="lesson-type">{lesson.lesson_type}</span>
                    {lesson.video_duration > 0 && (
                        <span className="lesson-duration">{formatDuration(lesson.video_duration)}</span>
                    )}
                    {getVideoBadgeType(lesson) && (
                        <span
                            className="video-source-mini-badge"
                            style={{ color: getVideoBadgeType(lesson).color }}
                        >
                            <i className={getVideoBadgeType(lesson).icon}></i>
                        </span>
                    )}
                </div>
                <div className="lesson-actions">
                    {hasPreviewContent(lesson) ? (
                        <span
                            className="preview-badge clickable"
                            onClick={(e) => {
                                e.stopPropagation();
                                onPlayPreviewVideo(lesson);
                            }}
                        >
                            <i className="fas fa-eye"></i>
                            Preview
                        </span>
                    ) : (
                        <span className="locked-badge">
                            <i className="fas fa-lock"></i>
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LessonItem;