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
    onPause
}, ref) => {
    
    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="self-hosted-container">
            <div className="self-hosted-video">
                <video
                    ref={ref}
                    controls
                    className="video-player__element"
                    onTimeUpdate={onTimeUpdate}
                    onEnded={onEnded}
                    onLoadedMetadata={onLoadedMetadata}
                    onPause={onPause}
                >
                    <source src={source} type="video/mp4" />
                    <source src={source} type="video/webm" />
                    <source src={source} type="video/ogg" />
                    Your browser does not support the video tag.
                </video>

                {/* Progress overlay for trackable videos */}
                {canTrack && (
                    <div className="video-progress-overlay">
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                            />
                        </div>
                        <div className="time-display">
                            {formatTime(currentTime)} / {formatTime(duration)}
                            {lastPlayedTime > 0 && (
                                <span className="resume-indicator"> (Resumed)</span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

SelfHostedVideoPlayer.displayName = 'SelfHostedVideoPlayer';

export default SelfHostedVideoPlayer;