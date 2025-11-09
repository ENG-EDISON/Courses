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

const VideoUpload = ({ videoFile, onFileChange }) => (
  <div className="file-upload-section">
    <input
      type="file"
      accept="video/mp4,video/mov,video/avi,video/mkv,video/webm"
      onChange={onFileChange}
      className="file-input"
    />
    {videoFile && (
      <video
        controls
        width="400"
        src={
          typeof videoFile === 'string'
            ? videoFile
            : URL.createObjectURL(videoFile)
        }
        style={{ marginTop: '10px', borderRadius: '8px' }}
      />
    )}
  </div>
);

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