import VideoSection from './VideoSection';
import CourseDetails from './CourseDetails';
import CurriculumSidebar from './CurriculumSidebar';

const CourseLayout = ({
    course,
    activeVideo,
    expandedSections,
    completionStatus,
    progressSummary,
    onVideoSelect,
    onToggleSection,
    onMarkComplete
}) => (
    <div className="course-content__layout">
        <div className="course-content__main">
            <VideoSection
                activeVideo={activeVideo}
                completionStatus={completionStatus}
                onMarkComplete={onMarkComplete}
            />
        </div>

        <div className="course-content__sidebar">
            <CurriculumSidebar
                course={course}
                expandedSections={expandedSections}
                activeVideo={activeVideo}
                completionStatus={completionStatus}
                onVideoSelect={onVideoSelect}
                onToggleSection={onToggleSection}
                onMarkComplete={onMarkComplete}
                progressSummary={progressSummary}
            />
        </div>
        <CourseDetails course={course} />
    </div>
);

export default CourseLayout;