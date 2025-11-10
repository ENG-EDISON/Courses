const ExternalVideoPlayer = ({ source }) => (
    <div className="self-hosted-container">
        <div className="video-player__placeholder">
            <div className="placeholder-icon">🎬</div>
            <p>External video content</p>
            <a href={source} target="_blank" rel="noopener noreferrer" className="external-video-link">
                Open video in new tab
            </a>
        </div>
    </div>
);

export default ExternalVideoPlayer;