// VideoSettings.jsx
import React from 'react';
import '../css/VideoSettings.css';

const VideoSettings = ({
  lesson,
  videoSource,
  onVideoSourceChange,
  onFileChange,
  onVideoUrlChange,
  onVideoDurationChange // ✅ This prop is now being passed from Lesson component
}) => {
  return (
    <div className="vs-container">
      <label className="vs-section-label">Video Settings</label>

      <VideoSourceToggle
        videoSource={videoSource}
        onVideoSourceChange={onVideoSourceChange}
      />

      {videoSource === 'uploaded' && (
        <VideoUpload
          videoFile={lesson.video_file}
          onFileChange={onFileChange}
          onVideoDurationChange={onVideoDurationChange} // ✅ Pass the prop to VideoUpload
        />
      )}

      {videoSource === 'external_url' && (
        <VideoUrlInput
          videoUrl={lesson.video_url}
          onVideoUrlChange={onVideoUrlChange}
        />
      )}
    </div>
  );
};

const VideoSourceToggle = ({ videoSource, onVideoSourceChange }) => (
  <div className="vs-source-toggle">
    <label className="vs-toggle-option">
      <input
        type="radio"
        value="uploaded"
        checked={videoSource === 'uploaded'}
        onChange={(e) => onVideoSourceChange(e.target.value)}
      />
      <span className="vs-toggle-label">Upload Video File</span>
    </label>
    <label className="vs-toggle-option">
      <input
        type="radio"
        value="external_url"
        checked={videoSource === 'external_url'}
        onChange={(e) => onVideoSourceChange(e.target.value)}
      />
      <span className="vs-toggle-label">Use Video URL</span>
    </label>
  </div>
);

// UPDATED COMPONENT - Now captures and passes video duration
// UPDATED COMPONENT - Fixed re-rendering issue
const VideoUpload = ({ videoFile, onFileChange, onVideoDurationChange }) => {
  const videoRef = React.useRef(null);
  const [videoError, setVideoError] = React.useState(null);
  const [debugInfo, setDebugInfo] = React.useState('');
  const [seekTestResult, setSeekTestResult] = React.useState('');
  const [videoDuration, setVideoDuration] = React.useState(null);
  const [hasEmittedDuration, setHasEmittedDuration] = React.useState(false); // ✅ ADDED: Track if duration was emitted

  const handleVideoError = (e) => {
    console.error('Video error:', e);
    const video = e.target;
    const error = video.error;
    let errorMessage = 'Video error: ';
    
    if (error) {
      switch(error.code) {
        case error.MEDIA_ERR_ABORTED:
          errorMessage += 'Video playback was aborted';
          break;
        case error.MEDIA_ERR_NETWORK:
          errorMessage += 'Network error occurred';
          break;
        case error.MEDIA_ERR_DECODE:
          errorMessage += 'Video decoding error - file may be corrupt or format not supported';
          break;
        case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage += 'Video format not supported';
          break;
        default:
          errorMessage += 'Unknown error occurred';
      }
    } else {
      errorMessage += 'Unable to play video';
    }
    
    setVideoError(errorMessage);
  };

  const handleVideoLoad = () => {
    const video = videoRef.current;
    if (video && video.duration && video.duration !== Infinity) {
      const duration = Math.round(video.duration); // Round to nearest second
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      
      setVideoDuration(duration);
      
      const info = [
        `Duration: ${duration}s (${minutes}m ${seconds}s)`,
        `Seekable ranges: ${video.seekable.length}`,
        `Video dimensions: ${video.videoWidth}x${video.videoHeight}`,
        `Ready state: ${video.readyState}`
      ].join(' | ');
      
      setDebugInfo(info);
      console.log('Video debug info:', info);
      
      // ✅ FIXED: Only emit duration once per video file
      if (onVideoDurationChange && !hasEmittedDuration) {
        onVideoDurationChange(duration);
        setHasEmittedDuration(true); // Mark as emitted
        console.log('🎬 Video duration captured and emitted:', duration, 'seconds');
      } else if (hasEmittedDuration) {
        console.log('🔄 Video duration already emitted, skipping');
      } else {
        console.warn('⚠️ onVideoDurationChange prop is missing');
      }
      
      // Test if seeking is actually working
      testSeeking();
    } else {
      console.warn('⚠️ Video duration not available or invalid');
    }
  };

  const testSeeking = () => {
    const video = videoRef.current;
    if (!video) return;

    // Test seeking to different positions
    const testPositions = [0.1, 0.5, 0.9]; // 10%, 50%, 90% of duration
    let testsPassed = 0;
    
    testPositions.forEach((position, index) => {
      const testTime = video.duration * position;
      // eslint-disable-next-line
      const originalTime = video.currentTime;
      
      video.currentTime = testTime;
      
      // Check if the seek actually happened
      setTimeout(() => {
        const newTime = video.currentTime;
        const seekSuccessful = Math.abs(newTime - testTime) < 2; // Allow 2 second tolerance
        
        console.log(`Seek test ${index + 1}:`, {
          attempted: testTime,
          actual: newTime,
          successful: seekSuccessful
        });
        
        if (seekSuccessful) {
          testsPassed++;
        }
        
        // After all tests, show result
        if (index === testPositions.length - 1) {
          const result = `Seeking test: ${testsPassed}/${testPositions.length} passed`;
          setSeekTestResult(result);
          console.log(result);
        }
      }, 100);
    });
  };

  const handleSeek = (e) => {
    console.log('User clicked seek bar at time:', e.target.currentTime);
  };

  const handleProgress = () => {
    const video = videoRef.current;
    if (video && video.buffered.length > 0) {
      console.log('Buffered:', video.buffered.end(0).toFixed(2) + 's');
    }
  };

  // ✅ FIXED: Reset duration tracking when video file changes
  React.useEffect(() => {
    if (videoFile) {
      setVideoDuration(null);
      setVideoError(null);
      setHasEmittedDuration(false); // Reset emission tracking
      setDebugInfo('');
      setSeekTestResult('');
    }
  }, [videoFile]);

  // ✅ FIXED: Use useMemo for video URL to prevent unnecessary re-renders
  const videoSrc = React.useMemo(() => {
    if (!videoFile) return null;
    return typeof videoFile === 'string'
      ? videoFile
      : URL.createObjectURL(videoFile);
  }, [videoFile]);

  // ✅ FIXED: Clean up object URLs properly
  React.useEffect(() => {
    return () => {
      if (videoSrc && typeof videoFile !== 'string') {
        URL.revokeObjectURL(videoSrc);
      }
    };
  }, [videoSrc, videoFile]);

  return (
    <div className="vs-file-input">
      <input
        type="file"
        accept="video/mp4,video/mov,video/avi,video/mkv,video/webm"
        onChange={onFileChange}
        className="vs-file-input"
      />
      
      {videoFile && (
        <div className="vs-player-wrapper">
          {videoError && (
            <div className="vs-error-message" style={{ 
              color: 'red', 
              margin: '10px 0', 
              padding: '10px',
              backgroundColor: '#ffe6e6',
              borderRadius: '4px'
            }}>
              <strong>Video Error:</strong> {videoError}
            </div>
          )}
          
          <video
            ref={videoRef}
            controls
            width="400"
            src={videoSrc} // ✅ Use memoized URL
            style={{ 
              marginTop: '10px', 
              borderRadius: '8px',
              border: videoError ? '2px solid red' : '2px solid green'
            }}
            onError={handleVideoError}
            onLoadedMetadata={handleVideoLoad}
            onSeeked={handleSeek}
            onProgress={handleProgress}
            preload="auto"
            crossOrigin="anonymous"
            key={videoSrc} // ✅ ADDED: Key forces proper re-render when video changes
          >
            Your browser does not support the video tag.
          </video>

          {/* Debug information with duration highlight */}
          <div style={{ 
            fontSize: '11px', 
            color: '#666', 
            marginTop: '8px',
            padding: '8px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            fontFamily: 'monospace'
          }}>
            <div>
              <strong>Debug Info:</strong> {debugInfo}
            </div>
            {videoDuration && (
              <div style={{ 
                color: hasEmittedDuration ? 'green' : 'blue',
                marginTop: '5px',
                fontWeight: 'bold'
              }}>
                {hasEmittedDuration ? '✅' : '🔄'} Duration: {videoDuration}s ({Math.floor(videoDuration / 60)}m {videoDuration % 60}s)
                {hasEmittedDuration && ' (Emitted)'}
              </div>
            )}
            {seekTestResult && (
              <div style={{ 
                color: seekTestResult.includes('3/3') ? 'green' : 'orange',
                marginTop: '5px'
              }}>
                <strong>{seekTestResult}</strong>
              </div>
            )}
          </div>

          {/* Manual seek test buttons */}
          <div style={{ marginTop: '10px' }}>
            <h4>Test Seeking Manually:</h4>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              <button 
                type="button"
                onClick={() => seekToTime(0)}
                style={{ padding: '5px 10px', fontSize: '12px' }}
              >
                Start (0s)
              </button>
              <button 
                type="button"
                onClick={() => seekToTime(30)}
                style={{ padding: '5px 10px', fontSize: '12px' }}
              >
                30s
              </button>
              <button 
                type="button"
                onClick={() => seekToTime(60)}
                style={{ padding: '5px 10px', fontSize: '12px' }}
              >
                1:00
              </button>
              <button 
                type="button"
                onClick={() => seekToTime(90)}
                style={{ padding: '5px 10px', fontSize: '12px' }}
              >
                1:30
              </button>
            </div>
          </div>

          {/* Video file information */}
          {videoFile && (
            <div style={{ 
              fontSize: '12px', 
              color: '#888', 
              marginTop: '10px',
              padding: '8px',
              backgroundColor: '#f0f0f0',
              borderRadius: '4px'
            }}>
              <strong>Video File Info:</strong><br/>
              Type: {typeof videoFile === 'string' ? 'URL' : `File (${videoFile.type || 'unknown type'})`}<br/>
              Size: {videoFile.size ? `${(videoFile.size / (1024 * 1024)).toFixed(2)} MB` : 'unknown'}<br/>
              {videoDuration && (
                <>
                  Duration: {videoDuration} seconds<br/>
                  Formatted: {Math.floor(videoDuration / 60)}m {videoDuration % 60}s
                  {hasEmittedDuration && <><br/>✅ Duration saved to lesson</>}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  function seekToTime(timeInSeconds) {
    if (videoRef.current) {
      console.log(`Attempting to seek to: ${timeInSeconds}s`);
      videoRef.current.currentTime = timeInSeconds;
      
      // Verify the seek worked
      setTimeout(() => {
        const actualTime = videoRef.current.currentTime;
        console.log(`Actual time after seek: ${actualTime}s`);
        console.log(`Seek accuracy: ${Math.abs(actualTime - timeInSeconds).toFixed(2)}s difference`);
      }, 100);
    }
  }
};

const VideoUrlInput = ({ videoUrl, onVideoUrlChange }) => {
  const videoId = getYouTubeVideoId(videoUrl);

  return (
    <div className="form-group">
      <label>Video URL</label>
      <input
        type="url"
        value={videoUrl || ''}
        onChange={onVideoUrlChange}
        placeholder="https://youtube.com/watch?v=..."
        className="vs-url-input"
      />
      <small>Supports YouTube, Vimeo, or direct video links</small>

      {videoUrl && (
        videoId ? (
          <iframe
            width="400"
            height="225"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video preview"
            frameBorder="0"
            allowFullScreen
            style={{ marginTop: '10px', borderRadius: '8px' }}
          ></iframe>
        ) : (
          <video
            controls
            src={videoUrl}
            width="400"
            style={{ marginTop: '10px', borderRadius: '8px' }}
          />
        )
      )}
    </div>
  );
};

// Helper function
const getYouTubeVideoId = (url) => {
  if (!url) return null;
  // eslint-disable-next-line
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? match[1] : null;
};

export default VideoSettings;