export const getVideoSource = (lesson) => {
    if (!lesson) return { type: 'none', source: '', canTrack: false };

    // ✅ UPDATED: Use video_source field from API
    const videoSource = lesson.video_source;

    // Handle uploaded videos
    if (videoSource === 'uploaded' && lesson.video_file) {
        return {
            type: 'uploaded',
            source: lesson.video_file,
            canTrack: true
        };
    }

    // Handle external URLs
    if (videoSource === 'external_url' && lesson.video_url) {
        // Check if it's a YouTube URL
        const youtubeId = getYouTubeVideoId(lesson.video_url);
        if (youtubeId) {
            return {
                type: 'youtube',
                source: youtubeId,
                canTrack: false // YouTube doesn't support progress tracking
            };
        }
        
        // Other external video URLs
        return {
            type: 'external',
            source: lesson.video_url,
            canTrack: false
        };
    }

    // No video content
    if (videoSource === 'none') {
        return {
            type: 'none',
            source: '',
            canTrack: false
        };
    }

    // Fallback for legacy data or unknown sources
    return {
        type: 'none',
        source: '',
        canTrack: false
    };
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

// Helper function to extract YouTube video ID
const getYouTubeVideoId = (url) => {
    if (!url) return null;
    // eslint-disable-next-line 
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
};