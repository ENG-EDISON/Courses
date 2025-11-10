export const getVideoSource = (lesson) => {
    if (!lesson) return { type: 'none', source: '', canTrack: false };

    if (lesson.video_file) {
        return {
            type: 'uploaded',
            source: lesson.video_file,
            canTrack: true
        };
    }

    const videoUrl = lesson.video_url;
    if (!videoUrl) return { type: 'none', source: '', canTrack: false };

    // ... rest of the video source detection logic
};

export const getVideoSourceBadge = (videoSource) => {
    const badges = {
        uploaded: { text: 'Uploaded Video', icon: '📁', color: '#10b981' },
        youtube: { text: 'YouTube', icon: '📺', color: '#ff0000' },
        'self-hosted': { text: 'Hosted Video', icon: '🎬', color: '#3b82f6' },
        external: { text: 'External Video', icon: '🔗', color: '#8b5cf6' },
        none: { text: 'No Video', icon: '❌', color: '#6b7280' }
    };

    const badge = badges[videoSource.type] || badges.none;
    return badge;
};