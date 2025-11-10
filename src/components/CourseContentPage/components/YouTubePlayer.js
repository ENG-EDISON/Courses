const YouTubePlayer = ({ source, title }) => (
    <div className="youtube-container">
        <iframe
            src={source}
            title={title}
            className="video-player__iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
        />
    </div>
);

export default YouTubePlayer;