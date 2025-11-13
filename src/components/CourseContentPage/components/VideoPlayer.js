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

    // 🔍 ADDED: Debug the video object
    useEffect(() => {
        console.log('🔍 EnhancedVideoPlayer - video object:', video);
        console.log('🔍 EnhancedVideoPlayer - video.id:', video?.id);
        console.log('🔍 EnhancedVideoPlayer - video.id type:', typeof video?.id);
    }, [video]);

    // ✅ MODIFIED: Only track when video is completed
    const trackProgress = useCallback(async (completed) => {
        try {
            if (!completed) {
                console.log('⏸️ Progress tracking skipped - video not completed');
                return;
            }

            // 🔍 ADDED: Debug the video ID before tracking
            console.log('🔍 trackProgress - video.id:', video?.id);
            console.log('🔍 trackProgress - video.id type:', typeof video?.id);
            
            if (!video?.id || isNaN(video.id)) {
                console.error('❌ Cannot track progress: Invalid video ID', video?.id);
                return;
            }

            // ✅ Only track completion with full duration
            const trackedTime = Math.floor(duration);
            const progressPercentage = 100; // Always 100% when completed
            
            console.log('🎯 Tracking video completion:', { 
                videoId: video.id,
                trackedTime, 
                completed, 
                progressPercentage,
                duration 
            });
            
            await trackLessonProgress(video.id, {
                tracked_time: trackedTime,
                completed: true, // Always true for completion tracking
                progress_percentage: progressPercentage,
                total_duration: Math.round(duration) || video?.video_duration || 0
            });
            
            console.log('✅ Progress tracked successfully');
            
            // ✅ FIXED: Pass the video object to onMarkComplete
            if (onMarkComplete) {
                console.log('🔍 Calling onMarkComplete with video:', video);
                onMarkComplete(video); // Pass the full video object
            }
        } catch (error) {
            console.error('❌ Error tracking lesson progress:', error);
        }
    }, [video, duration, onMarkComplete]);

    // Set initial time
    useEffect(() => {
        console.log('🎯 Setting initial time:', video.lastPlayedTime);
        if (videoRef.current && video.lastPlayedTime && video.lastPlayedTime > 0) {
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
            console.log('📊 Video metadata loaded - Duration:', videoDuration);
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
                
                console.log('✅ Auto-completing video');
                setHasAutoCompleted(true);
                trackProgress(true); // ✅ Only track completion
                // ✅ REMOVED: onMarkComplete call here - it's now in trackProgress
            }
        }
    }, [videoSource.canTrack, isCompleted, hasAutoCompleted, trackProgress]);

    // ✅ MODIFIED: Only track on video end
    const handleVideoEnd = useCallback(() => {
        console.log('🏁 Video ended');
        if (videoSource.canTrack && !isCompleted && !hasAutoCompleted) {
            setHasAutoCompleted(true);
            trackProgress(true); // ✅ Only track completion
            // ✅ REMOVED: onMarkComplete call here - it's now in trackProgress
        }
    }, [videoSource.canTrack, isCompleted, hasAutoCompleted, trackProgress]);

    // ✅ MODIFIED: Remove progress tracking on pause
    const handleVideoPause = useCallback(() => {
        const currentVideoTime = videoRef.current?.currentTime;
        console.log('⏸️ Video paused at:', currentVideoTime);
        // ✅ REMOVED: Progress tracking on pause
    }, []);

    // ✅ MODIFIED: Remove progress tracking on seek
    const handleSeek = useCallback(() => {
        const currentVideoTime = videoRef.current?.currentTime;
        console.log('🎯 Video seeked to:', currentVideoTime);
        // ✅ REMOVED: Progress tracking on seek
    }, []);

    useEffect(() => {
        console.log('🎬 EnhancedVideoPlayer mounted - Progress tracking: ONLY ON COMPLETION');
    }, []);

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
                onSeek={handleSeek}
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