import VideoPlayer from './VideoPlayer';
import VideoHeader from './VideoHeader';
import "../css/VideoSection.css"

const VideoSection = ({ activeVideo, completionStatus, onMarkComplete }) => (
    <div className="video-section">
        <div className="video-player">
            {activeVideo ? (
                <>
                    <VideoHeader 
                        activeVideo={activeVideo}
                        completionStatus={completionStatus}
                        onMarkComplete={onMarkComplete}
                    />
                    <div className="video-player__container">
                        <VideoPlayer
                            video={activeVideo}
                            isCompleted={completionStatus[activeVideo.id]}
                            onMarkComplete={onMarkComplete}
                        />
                    </div>
                </>
            ) : (
                <EmptyVideoState />
            )}
        </div>
    </div>
);

const EmptyVideoState = () => (
    <div className="video-player__empty">
        <div className="empty-state">
            <div className="empty-icon">📺</div>
            <h3>Select a Lesson</h3>
            <p>Choose a lesson from the course curriculum to start learning</p>
        </div>
    </div>
);

export default VideoSection;