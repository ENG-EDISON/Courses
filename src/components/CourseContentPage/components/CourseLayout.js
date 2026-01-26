import VideoSection from './VideoSection';
import CourseDetails from './CourseDetails';
import CurriculumSidebar from './CurriculumSidebar';

const CourseLayout = ({
    course,
    activeVideo,
    activeLessonId, // Add this prop
    expandedSections,
    completionStatus,
    progressSummary,
    onVideoSelect,
    onToggleSection,
    onMarkComplete
}) => {
    console.log("🏗️ CourseLayout rendered with:", {
        activeVideo,
        activeLessonId,
        courseTitle: course?.title
    });
    
    return (
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
            <CourseDetails 
                course={course} 
                activeVideo={activeVideo}
                activeLessonId={activeLessonId} // Pass it here
            />
        </div>
    );
};

export default CourseLayout;