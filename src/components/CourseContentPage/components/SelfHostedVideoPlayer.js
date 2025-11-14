import { forwardRef } from 'react';

const SelfHostedVideoPlayer = forwardRef(({
    source,
    title,
    canTrack,
    currentTime,
    duration,
    lastPlayedTime,
    onTimeUpdate,
    onEnded,
    onLoadedMetadata,
    onPause,
    onSeek // Keep for potential future use, but won't trigger progress updates
}, ref) => {
    
    // ✅ MODIFIED: Handle seek events without triggering progress updates
    const handleSeeked = () => {
        console.log('🎯 Video seeked (progress tracking disabled during seeking)');
        onSeek && onSeek();
    };

    return (
            <div className="self-hosted-container">
                <div className="self-hosted-video">
                    <video
                        ref={ref}
                        controls
                        controlsList="nodownload"
                        className="video-player__element"
                        onTimeUpdate={onTimeUpdate}
                        onEnded={onEnded}
                        onLoadedMetadata={onLoadedMetadata}
                        onPause={onPause}
                        onSeeked={handleSeeked}
                    >
                        <source src={source} type="video/mp4" />
                        <source src={source} type="video/webm" />
                        <source src={source} type="video/ogg" />
                        Your browser does not support the video tag.
                    </video>
                </div>
            </div>
    );
});

SelfHostedVideoPlayer.displayName = 'SelfHostedVideoPlayer';

export default SelfHostedVideoPlayer;