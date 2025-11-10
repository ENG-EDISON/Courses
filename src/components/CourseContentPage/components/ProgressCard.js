const ProgressCard = ({ progressPercentage, completedLessons, totalLessons, progressSummary }) => {
    const formatTimeSpent = (seconds) => {
        if (!seconds) return '0m';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    return (
        <div className="progress-card">
            <div className="progress-card__header">
                <h4>Your Progress</h4>
                <span className="progress-percentage">{progressPercentage}%</span>
            </div>
            <div className="progress-bar">
                <div
                    className="progress-bar__fill"
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>
            <div className="progress-stats">
                <span>{completedLessons} of {totalLessons} lessons completed</span>
                {progressSummary && (
                    <span className="progress-time">
                        {formatTimeSpent(progressSummary.total_watched_seconds)} spent
                    </span>
                )}
            </div>
        </div>
    );
};

export default ProgressCard;