import ResourcesTab from './tabs/ResourcesTab';

const CourseDetails = (props) => {
    // Destructure after logging
    const { course, activeLessonId } = props;
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