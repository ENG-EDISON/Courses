import { useState, useEffect, useRef } from 'react';
import { getVideoSource } from '../utils/videoUtils';
import { trackLessonProgress } from '../api/LessonProgressApi';

const EnhancedVideoPlayer = ({ video, isCompleted, onMarkComplete }) => {
    const videoRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const videoSource = getVideoSource(video);

    useEffect(() => {
        if (videoRef.current && video.lastPlayedTime && video.lastPlayedTime > 0) {
            videoRef.current.currentTime = video.lastPlayedTime;
        }
    }, [video.lastPlayedTime]);

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const newTime = videoRef.current.currentTime;
            setCurrentTime(newTime);

            if (Math.floor(newTime) % 10 === 0 && videoSource.canTrack) {
                trackProgress(newTime, false);
            }

            if (duration > 0 && newTime / duration > 0.95 && !isCompleted && videoSource.canTrack) {
                trackProgress(duration, true);
                onMarkComplete();
            }
        }
    };

    const handleVideoEnd = () => {
        if (videoSource.canTrack && !isCompleted) {
            trackProgress(duration, true);
            onMarkComplete();
        }
    };

    const handleVideoPause = () => {
        if (videoRef.current && videoSource.canTrack) {
            trackProgress(videoRef.current.currentTime, false);
        }
    };

    const trackProgress = async (currentTime, completed) => {
        try {
            const trackedTime = videoSource.canTrack ? Math.floor(currentTime) : 0;
            await trackLessonProgress(video.id, {
                current_time: trackedTime,
                completed: completed,
                total_duration: video?.video_duration || 0
            });
        } catch (error) {
            console.error('Error tracking lesson progress:', error);
        }
    };

    if (videoSource.type === 'youtube') {
        return <YouTubePlayer source={videoSource.source} title={video.title} />;
    }

    if (videoSource.type === 'uploaded' || videoSource.type === 'self-hosted') {
        return (
            <SelfHostedVideoPlayer
                ref={videoRef}
                source={videoSource.source}
                title={video.title}
                canTrack={videoSource.canTrack}
                currentTime={currentTime}
                duration={duration}
                lastPlayedTime={video.lastPlayedTime}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnd}
                onLoadedMetadata={handleLoadedMetadata}
                onPause={handleVideoPause}
            />
        );
    }

    if (videoSource.type === 'external') {
        return <ExternalVideoPlayer source={videoSource.source} />;
    }

    return <NoVideoContent video={video} />;
};

// Additional video player components would be split similarly...

export default EnhancedVideoPlayer;