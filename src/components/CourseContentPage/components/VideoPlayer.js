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
    const videoSource = getVideoSource(video);

    // ✅ FIXED: Use useCallback to prevent unnecessary re-renders
    const trackProgress = useCallback(async (currentTime, completed) => {
        try {
            const trackedTime = videoSource.canTrack ? Math.floor(currentTime) : 0;
            console.log('📡 Tracking progress:', { trackedTime, completed });
            
            // ✅ FIXED: Send tracked_time instead of current_time
            await trackLessonProgress(video.id, {
                tracked_time: trackedTime, // ✅ CHANGED: current_time → tracked_time
                completed: completed,
                total_duration: video?.video_duration || 0
            });
        } catch (error) {
            console.error('Error tracking lesson progress:', error);
        }
    }, [video.id, video?.video_duration, videoSource.canTrack]);

    // ✅ FIXED: Only set initial time once when component mounts or video changes
    useEffect(() => {
        console.log('🎯 Setting initial time:', video.lastPlayedTime, 'for video:', videoSource.source);
        if (videoRef.current && video.lastPlayedTime && video.lastPlayedTime > 0) {
            // Wait for video to be ready
            const checkVideoReady = () => {
                if (videoRef.current && videoRef.current.readyState > 0) {
                    videoRef.current.currentTime = video.lastPlayedTime;
                    console.log('✅ Initial time set to:', video.lastPlayedTime);
                } else {
                    setTimeout(checkVideoReady, 100);
                }
            };
            checkVideoReady();
        }
    }, [video.lastPlayedTime, videoSource.source]);

    // ✅ FIXED: Reset state when video changes
    useEffect(() => {
        setCurrentTime(0);
        setDuration(0);
        setHasAutoCompleted(false);
    }, [videoSource.source]);

    const handleLoadedMetadata = useCallback(() => {
        if (videoRef.current) {
            const videoDuration = videoRef.current.duration;
            setDuration(videoDuration);
            console.log('📊 Video metadata loaded - Duration:', videoDuration);
        }
    }, []);

    const handleTimeUpdate = useCallback(() => {
        if (videoRef.current) {
            const newTime = videoRef.current.currentTime;
            setCurrentTime(newTime);

            // ✅ FIXED: More efficient tracking with debouncing
            if (Math.floor(newTime) % 10 === 0 && videoSource.canTrack) {
                trackProgress(newTime, false);
            }

            // ✅ FIXED: Only check for completion near the actual end
            const currentDuration = videoRef.current.duration;
            if (currentDuration > 0 && 
                newTime > currentDuration - 5 && // Last 5 seconds
                !isCompleted && 
                !hasAutoCompleted &&
                videoSource.canTrack) {
                
                console.log('✅ Auto-completing video near end');
                setHasAutoCompleted(true);
                trackProgress(currentDuration, true);
                onMarkComplete && onMarkComplete();
            }
        }
    }, [videoSource.canTrack, isCompleted, hasAutoCompleted, trackProgress, onMarkComplete]);

    const handleVideoEnd = useCallback(() => {
        console.log('🏁 Video ended, marking as complete');
        if (videoSource.canTrack && !isCompleted && !hasAutoCompleted) {
            setHasAutoCompleted(true);
            trackProgress(duration, true);
            onMarkComplete && onMarkComplete();
        }
    }, [videoSource.canTrack, isCompleted, hasAutoCompleted, duration, trackProgress, onMarkComplete]);

    const handleVideoPause = useCallback(() => {
        console.log('⏸️ Video paused at:', videoRef.current?.currentTime);
        if (videoRef.current && videoSource.canTrack) {
            trackProgress(videoRef.current.currentTime, false);
        }
    }, [videoSource.canTrack, trackProgress]);

    // ✅ ADDED: Handle seek events for immediate progress updates
    const handleSeek = useCallback(() => {
        console.log('🎯 Video seeked to:', videoRef.current?.currentTime);
        if (videoRef.current && videoSource.canTrack) {
            // Track immediately after seeking
            setTimeout(() => {
                trackProgress(videoRef.current.currentTime, false);
            }, 500);
        }
    }, [videoSource.canTrack, trackProgress]);

    // ✅ ADDED: Debug info with reduced frequency
    useEffect(() => {
        console.log('🎬 EnhancedVideoPlayer mounted:', {
            videoSource: videoSource.type,
            source: videoSource.source,
            canTrack: videoSource.canTrack,
            lastPlayedTime: video.lastPlayedTime,
            isCompleted,
            hasAutoCompleted
        });
    }, [videoSource.type, videoSource.source, videoSource.canTrack, video.lastPlayedTime, isCompleted, hasAutoCompleted]);

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
                onSeek={handleSeek} // ✅ ADDED: Pass seek handler
                key={videoSource.source}
            />
        );
    }

    if (videoSource.type === 'external') {
        return <ExternalVideoPlayer source={videoSource.source} />;
    }

    return <NoVideoContent video={video} />;
};

export default EnhancedVideoPlayer;