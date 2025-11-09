// VideoSettings.jsx
import React from 'react';

const VideoSettings = ({
    lesson,
    videoSource,
    onVideoSourceChange,
    onFileChange,
    onVideoUrlChange
}) => {
    return (
        <div className="lesson-content-section">
            <label className="section-label">Video Settings</label>

            <VideoSourceToggle
                videoSource={videoSource}
                onVideoSourceChange={onVideoSourceChange}
            />

            {videoSource === 'upload' && (
                <VideoUpload
                    videoFile={lesson.video_file}
                    onFileChange={onFileChange}
                />
            )}

            {videoSource === 'url' && (
                <VideoUrlInput
                    videoUrl={lesson.video_url}
                    onVideoUrlChange={onVideoUrlChange}
                />
            )}
        </div>
    );
};

const VideoSourceToggle = ({ videoSource, onVideoSourceChange }) => (
    <div className="video-source-toggle">
        <label className="toggle-option">
            <input
                type="radio"
                value="upload"
                checked={videoSource === 'upload'}
                onChange={(e) => onVideoSourceChange(e.target.value)}
            />
            <span className="toggle-label">Upload Video File</span>
        </label>
        <label className="toggle-option">
            <input
                type="radio"
                value="url"
                checked={videoSource === 'url'}
                onChange={(e) => onVideoSourceChange(e.target.value)}
            />
            <span className="toggle-label">Use Video URL</span>
        </label>
    </div>
);

// REPLACE THIS COMPONENT - Enhanced VideoUpload with debugging
const VideoUpload = ({ videoFile, onFileChange }) => {
  const videoRef = React.useRef(null);
  const [videoError, setVideoError] = React.useState(null);
  const [debugInfo, setDebugInfo] = React.useState('');
  const [seekTestResult, setSeekTestResult] = React.useState('');

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
    if (video) {
      const info = [
        `Duration: ${video.duration.toFixed(2)}s`,
        `Seekable ranges: ${video.seekable.length}`,
        `Video dimensions: ${video.videoWidth}x${video.videoHeight}`,
        `Ready state: ${video.readyState}`
      ].join(' | ');
      
      setDebugInfo(info);
      console.log('Video debug info:', info);
      
      // Test if seeking is actually working
      testSeeking();
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

  // Clean up object URLs
  React.useEffect(() => {
    return () => {
      if (videoFile && typeof videoFile !== 'string') {
        const videoSrc = URL.createObjectURL(videoFile);
        URL.revokeObjectURL(videoSrc);
      }
    };
  }, [videoFile]);

  return (
    <div className="file-upload-section">
      <input
        type="file"
        accept="video/mp4,video/mov,video/avi,video/mkv,video/webm"
        onChange={onFileChange}
        className="file-input"
      />
      
      {videoFile && (
        <div className="video-player-wrapper">
          {videoError && (
            <div className="video-error-message" style={{ 
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
            src={
              typeof videoFile === 'string'
                ? videoFile
                : URL.createObjectURL(videoFile)
            }
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
          >
            Your browser does not support the video tag.
          </video>

          {/* Debug information */}
          <div style={{ 
            fontSize: '11px', 
            color: '#666', 
            marginTop: '8px',
            padding: '8px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            fontFamily: 'monospace'
          }}>
            <div><strong>Debug Info:</strong> {debugInfo}</div>
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
              Size: {videoFile.size ? `${(videoFile.size / (1024 * 1024)).toFixed(2)} MB` : 'unknown'}
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
                className="meta-input"
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
    const match = url.match(
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    );
    return match ? match[1] : null;
};

export default VideoSettings;