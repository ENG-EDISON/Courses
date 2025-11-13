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
    onSeek // ✅ ADDED: onSeek prop
}, ref) => {
    
    // ✅ ADDED: Handle seek events
    const handleSeeked = () => {
        console.log('🎯 Video seeked, triggering onSeek callback');
        onSeek && onSeek();
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
                    onSeeked={handleSeeked} // ✅ ADDED: onSeeked event handler
                >
                    <source src={source} type="video/mp4" />
                    <source src={source} type="video/webm" />
                    <source src={source} type="video/ogg" />
                    Your browser does not support the video tag.
                </video>
            </div>
            
            {/* ✅ ADDED: Debug info for testing */}
            <div style={{
                fontSize: '12px',
                color: '#666',
                marginTop: '10px',
                padding: '8px',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px'
            }}>
                <strong>Video Debug Info:</strong><br/>
                Current Time: {Math.round(currentTime)}s<br/>
                Duration: {Math.round(duration)}s<br/>
                Last Played: {lastPlayedTime}s<br/>
                Can Track: {canTrack ? 'Yes' : 'No'}<br/>
                Source: {source ? 'Loaded' : 'Missing'}
            </div>
        </div>
    );
});

SelfHostedVideoPlayer.displayName = 'SelfHostedVideoPlayer';

export default SelfHostedVideoPlayer;