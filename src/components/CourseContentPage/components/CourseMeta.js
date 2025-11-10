const CourseMeta = ({ course, progressSummary }) => {
    const formatTimeSpent = (seconds) => {
        if (!seconds) return '0m';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    return (
        <div className="course-meta-grid">
            <MetaItem icon="📚" label="Level" value={course.level} />
            <MetaItem icon="🗂️" label="Category" value={course.category} />
            <MetaItem 
                icon="⭐" 
                label="Rating" 
                value={`${course.average_rating}/5 (${course.total_reviews} reviews)`} 
            />
            {progressSummary && (
                <MetaItem 
                    icon="🕒" 
                    label="Time Spent" 
                    value={formatTimeSpent(progressSummary.total_watched_seconds)} 
                />
            )}
        </div>
    );
};

const MetaItem = ({ icon, label, value }) => (
    <div className="meta-item">
        <div className="meta-icon">{icon}</div>
        <div className="meta-content">
            <span className="meta-label">{label}</span>
            <span className="meta-value">{value}</span>
        </div>
    </div>
);

export default CourseMeta;