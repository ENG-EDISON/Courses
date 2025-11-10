const ResumeBanner = ({ lastPlayed, onResume }) => (
    <div className="resume-banner">
        <div className="resume-content">
            <span>📺 Continue from where you left off:</span>
            <strong> "{lastPlayed.lesson_title}"</strong>
            {lastPlayed.current_time > 0 && (
                <span> ({(lastPlayed.current_time / 60).toFixed(0)}m watched)</span>
            )}
        </div>
        <button
            className="btn btn--primary btn--sm"
            onClick={onResume}
        >
            Resume
        </button>
    </div>
);

export default ResumeBanner;