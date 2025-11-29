import { useState, useEffect, useRef, useCallback } from 'react';
import { getVideoSource } from '../utils/videoUtils';
import { trackLessonProgress } from '../../../api/LessonProgressApi';
import YouTubePlayer from './YouTubePlayer';
import SelfHostedVideoPlayer from './SelfHostedVideoPlayer';
import ExternalVideoPlayer from './ExternalVideoPlayer';
import NoVideoContent from './NoVideoContent';

const EnhancedVideoPlayer = ({ video, isCompleted = false, onMarkComplete }) => {
    const videoRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [hasAutoCompleted, setHasAutoCompleted] = useState(false);
    
    // ✅ UPDATED: Use video_source from API response
    const videoSource = getVideoSource(video);

    // ✅ MODIFIED: Only track when video is completed
    const trackProgress = useCallback(async (completed) => {
        try {
            if (!completed) {
                return;
            }            
            if (!video?.id || isNaN(video.id)) {
                console.error('❌ Cannot track progress: Invalid video ID', video?.id);
                return;
            }

            // ✅ Only track completion with full duration
            const trackedTime = Math.floor(duration);
            const progressPercentage = 100; // Always 100% when completed
            
            await trackLessonProgress(video.id, {
                tracked_time: trackedTime,
                completed: true, // Always true for completion tracking
                progress_percentage: progressPercentage,
                total_duration: Math.round(duration) || video?.video_duration || 0
            });
            
            // ✅ FIXED: Pass the video object to onMarkComplete
            if (onMarkComplete) {
                onMarkComplete(video); // Pass the full video object
            }
        } catch (error) {
            console.error('❌ Error tracking lesson progress:', error);
        }
    }, [video, duration, onMarkComplete]);

    // Set initial time
    useEffect(() => {
        if (videoRef.current && video.lastPlayedTime && video.lastPlayedTime > 0) {
            const checkVideoReady = () => {
                if (videoRef.current && videoRef.current.readyState > 0) {
                    videoRef.current.currentTime = video.lastPlayedTime;
                } else {
                    setTimeout(checkVideoReady, 100);
                }
            };
            checkVideoReady();
        }
    }, [video.lastPlayedTime, videoSource.source]);

    // Reset state when video changes
    useEffect(() => {
        setCurrentTime(0);
        setDuration(0);
        setHasAutoCompleted(false);
    }, [videoSource.source]);

    const handleLoadedMetadata = useCallback(() => {
        if (videoRef.current) {
            const videoDuration = videoRef.current.duration;
            setDuration(videoDuration);
        }
    }, []);

    // ✅ MODIFIED: Handle time update without tracking progress
    const handleTimeUpdate = useCallback(() => {
        if (videoRef.current) {
            const newTime = videoRef.current.currentTime;
            setCurrentTime(newTime);

            // Auto-complete near end (only triggers completion tracking)
            const currentDuration = videoRef.current.duration;
            if (currentDuration > 0 && 
                newTime > currentDuration - 5 && 
                !isCompleted && 
                !hasAutoCompleted &&
                videoSource.canTrack) {
                
                setHasAutoCompleted(true);
                trackProgress(true); // ✅ Only track completion
            }
        }
    }, [videoSource.canTrack, isCompleted, hasAutoCompleted, trackProgress]);

    // ✅ MODIFIED: Only track on video end
    const handleVideoEnd = useCallback(() => {
        if (videoSource.canTrack && !isCompleted && !hasAutoCompleted) {
            setHasAutoCompleted(true);
            trackProgress(true); // ✅ Only track completion
        }
    }, [videoSource.canTrack, isCompleted, hasAutoCompleted, trackProgress]);

    // ✅ MODIFIED: Remove progress tracking on pause
    const handleVideoPause = useCallback(() => {
        // Pause handler available for future use
    }, []);

    // ✅ MODIFIED: Remove progress tracking on seek
    const handleSeek = useCallback(() => {
        // Seek handler available for future use
    }, []);

    // ✅ UPDATED: Video source logic based on video_source field
    if (videoSource.type === 'youtube') {
        return <YouTubePlayer source={videoSource.source} title={video.title} />;
    }

    // ✅ UPDATED: Handle uploaded videos (video_source: 'uploaded')
    if (videoSource.type === 'uploaded') {
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
                onSeek={handleSeek}
                key={videoSource.source}
            />
        );
    }

    // ✅ UPDATED: Handle external URL videos (video_source: 'external_url')
    if (videoSource.type === 'external_url') {
        return <ExternalVideoPlayer source={videoSource.source} />;
    }

    // ✅ UPDATED: Handle no video case (video_source: 'none')
    if (videoSource.type === 'none') {
        return <NoVideoContent video={video} />;
    }

    // Fallback for unknown video source types
    return <NoVideoContent video={video} />;
};

export default EnhancedVideoPlayer;