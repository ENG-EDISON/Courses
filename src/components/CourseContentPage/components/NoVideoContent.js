const NoVideoContent = ({ video }) => (
    <div className="self-hosted-container">
        <div className="video-player__placeholder">
            <div className="placeholder-icon">📝</div>
            <h4>No Video Content</h4>
            <p>This lesson doesn't have any video content.</p>
            {video.content && (
                <div className="lesson-content-preview">
                    <h5>Lesson Content:</h5>
                    <p>{video.content.substring(0, 200)}...</p>
                </div>
            )}
        </div>
    </div>
);

export default NoVideoContent;