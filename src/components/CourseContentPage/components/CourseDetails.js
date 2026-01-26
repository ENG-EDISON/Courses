import ResourcesTab from './tabs/ResourcesTab';

const CourseDetails = (props) => {
    // Log all props received
    console.log("📦 CourseDetails - ALL PROPS:", props);
    
    // Destructure after logging
    const { course, activeVideo, activeLessonId } = props;
    
    // Log specific values
    console.log("📋 CourseDetails - Destructured values:", {
        hasCourse: !!course,
        courseTitle: course?.title,
        courseId: course?.id,
        activeVideo,
        activeLessonId,
        activeLessonIdType: typeof activeLessonId,
        isActiveLessonIdNumber: typeof activeLessonId === 'number',
        isActiveLessonIdNull: activeLessonId === null,
        isActiveLessonIdUndefined: activeLessonId === undefined
    });
    
    // Check where CourseDetails is being called from
    console.trace("📍 CourseDetails component called from:");
    
    return (
        <div className="course-details-section">
            <div className="resources-section">
                <ResourcesTab 
                    course={course} 
                    activeLessonId={activeLessonId}
                />
            </div>
        </div>
    );
};

export default CourseDetails;