// utils/courseUtils.js
export const formatDuration = (seconds) => {
    if (!seconds) return "0 min";
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
};

export const getTotalSectionDuration = (section) => {
    if (!section.subsections) return 0;
    return section.subsections.reduce((total, subsection) => {
        if (!subsection.lessons) return total;
        return total + subsection.lessons.reduce((subTotal, lesson) =>
            subTotal + (lesson.video_duration || 0), 0
        );
    }, 0);
};

export const getTotalSubsectionDuration = (subsection) => {
    if (!subsection.lessons) return 0;
    return subsection.lessons.reduce((total, lesson) =>
        total + (lesson.video_duration || 0), 0
    );
};

export const getLessonIcon = (lessonType) => {
    const icons = {
        video: "fas fa-play-circle",
        article: "fas fa-file-alt",
        quiz: "fas fa-question-circle",
        assignment: "fas fa-tasks"
    };
    return icons[lessonType] || "fas fa-circle";
};

export const getLessonIconColor = (lessonType) => {
    const colors = {
        video: "var(--primary-color)",
        article: "var(--success-color)",
        quiz: "var(--warning-color)",
        assignment: "var(--accent-color)"
    };
    return colors[lessonType] || "var(--text-secondary)";
};

// Re-export video utils
export { 
    getVideoSource, 
    getYouTubeVideoId, 
    isYouTubeVideo, 
    isLocalVideo, 
    hasPreviewContent, 
    getVideoBadgeType 
} from './videoUtils';