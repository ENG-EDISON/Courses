// utils/videoUtils.js
export const getVideoSource = (lesson) => {
    // Priority: uploaded video file over URL
    if (lesson.video_file) {
        return {
            type: 'uploaded',
            src: lesson.video_file,
            isExternal: false
        };
    } else if (lesson.video_url) {
        if (isYouTubeVideo(lesson.video_url)) {
            return {
                type: 'youtube',
                src: lesson.video_url,
                isExternal: true
            };
        } else if (isLocalVideo(lesson.video_url)) {
            return {
                type: 'external',
                src: lesson.video_url,
                isExternal: false
            };
        } else {
            return {
                type: 'unknown',
                src: lesson.video_url,
                isExternal: true
            };
        }
    }
    return null;
};

export const getYouTubeVideoId = (url) => {
    if (!url) return null;
    // eslint-disable-next-line 
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
};

export const isYouTubeVideo = (url) => {
    return url && (url.includes('youtube.com') || url.includes('youtu.be'));
};

export const isLocalVideo = (url) => {
    return url && (url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg') || url.includes('.mov') || url.includes('.avi'));
};

export const hasPreviewContent = (lesson) => {
    return lesson.is_preview && (lesson.video_url || lesson.video_file);
};

export const getVideoBadgeType = (lesson) => {
    const videoSource = getVideoSource(lesson);
    if (!videoSource) return null;

    const badges = {
        uploaded: { text: 'Uploaded Video', icon: 'fas fa-video', color: 'var(--success-color)' },
        youtube: { text: 'YouTube', icon: 'fab fa-youtube', color: 'var(--youtube-red)' },
        external: { text: 'External Video', icon: 'fas fa-external-link-alt', color: 'var(--info-color)' },
        unknown: { text: 'Video Link', icon: 'fas fa-link', color: 'var(--warning-color)' }
    };

    return badges[videoSource.type] || badges.unknown;
};