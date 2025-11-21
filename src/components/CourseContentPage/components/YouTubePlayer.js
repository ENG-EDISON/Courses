const YouTubePlayer = ({ source, title }) => (
    <div className="youtube-container">
        <iframe
            src={`https://www.youtube.com/embed/${source}`}  // ✅ Fixed: Add embed URL base
            title={title}
            className="video-player__iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
        />
    </div>
);

export default YouTubePlayer;