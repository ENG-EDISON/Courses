// VideoSettings.jsx
import React from 'react';
import '../css/VideoSettings.css';

const VideoSettings = ({
  lesson,
  videoSource,
  onVideoSourceChange,
  onFileChange,
  onVideoUrlChange,
  onVideoDurationChange
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
          // Don't pass onVideoDurationChange for uploaded files - backend handles it
        />
      )}

      {videoSource === 'external_url' && (
        <VideoUrlInput
          videoUrl={lesson.video_url}
          onVideoUrlChange={onVideoUrlChange}
          onVideoDurationChange={onVideoDurationChange}
          videoDuration={lesson.video_duration}
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

// For uploaded files - backend automatically calculates duration
const VideoUpload = ({ videoFile, onFileChange }) => {
  const videoRef = React.useRef(null);
  const [videoError, setVideoError] = React.useState(null);

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

  React.useEffect(() => {
    if (videoFile) {
      setVideoError(null);
    }
  }, [videoFile]);

  const videoSrc = React.useMemo(() => {
    if (!videoFile) return null;
    return typeof videoFile === 'string'
      ? videoFile
      : URL.createObjectURL(videoFile);
  }, [videoFile]);

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
            <div className="vs-error-message">
              <strong>Video Error:</strong> {videoError}
            </div>
          )}
          
          <video
            ref={videoRef}
            controls
            width="400"
            src={videoSrc}
            style={{ 
              marginTop: '10px', 
              borderRadius: '8px',
              border: videoError ? '2px solid red' : '2px solid green'
            }}
            onError={handleVideoError}
            preload="auto"
            key={videoSrc}
          >
            Your browser does not support the video tag.
          </video>

          <div className="vs-upload-info">
            <strong>Video File Uploaded</strong><br/>
            <em>Duration will be automatically calculated by the server</em>
          </div>
        </div>
      )}
    </div>
  );
};

// For external URLs - user needs to input duration manually
const VideoUrlInput = ({ videoUrl, onVideoUrlChange, onVideoDurationChange, videoDuration }) => {
  const videoId = getYouTubeVideoId(videoUrl);
  const [manualDuration, setManualDuration] = React.useState(videoDuration || '');

  // ✅ FIXED: Handle URL change with automatic source detection
  const handleUrlChange = (e) => {
    const url = e.target.value;
    
    // Call the parent handler
    onVideoUrlChange(e);
    
    // ✅ Automatically set video_source to external_url when URL is entered
    // This ensures video_source is updated even if user doesn't click the radio button
    if (url && !videoUrl) {

      // Note: The actual video_source update happens in Lesson.jsx handleVideoUrlChange
    }
  };

  const handleDurationChange = (e) => {
    const value = e.target.value;
    setManualDuration(value);
    
    // Convert to seconds and send to parent
    if (value && !isNaN(value)) {
      const durationInSeconds = parseInt(value) * 60; // Convert minutes to seconds
      onVideoDurationChange(durationInSeconds);
    } else if (value === '') {
      onVideoDurationChange(0);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0 minutes';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="form-group">
      <label>Video URL</label>
      <input
        type="url"
        value={videoUrl || ''}
        onChange={handleUrlChange} // ✅ Use the fixed handler
        placeholder="https://youtube.com/watch?v=..."
        className="vs-url-input"
      />
      <small>Supports YouTube, Vimeo, or direct video links</small>

      {/* Duration input for external URLs */}
      <div className="vs-duration-input" style={{ marginTop: '15px' }}>
        <label>Video Duration (minutes)</label>
        <input
          type="number"
          value={manualDuration ? Math.floor(manualDuration / 60) : ''}
          onChange={handleDurationChange}
          placeholder="Enter duration in minutes"
          className="vs-duration-field"
          min="1"
          max="1000"
        />
        <small>
          {videoDuration 
            ? `Current duration: ${formatDuration(videoDuration)}` 
            : 'Please enter the video duration in minutes'
          }
        </small>
      </div>

      {videoUrl && (
        <div className="vs-player-wrapper">
          {videoId ? (
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
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
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