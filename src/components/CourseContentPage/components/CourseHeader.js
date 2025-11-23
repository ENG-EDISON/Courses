import Breadcrumb from './Breadcrumb';
import ResumeBanner from './ResumeBanner';
import "../css/CourseHeader.css"

const CourseHeader = ({ 
    course, 
    lastPlayed, 
    activeVideo, 
    onResumeLastPlayed,
    findLessonInCourse 
}) => {
    const handleResumeLastPlayed = async () => {
        if (lastPlayed && lastPlayed.lesson_id) {
            const lesson = findLessonInCourse(course, lastPlayed.lesson_id);
            if (lesson) {
                onResumeLastPlayed(lesson, lastPlayed.section_title, lastPlayed.subsection_title);
            }
        }
    };

    return (
        <div className="course-content__header">
            <Breadcrumb courseTitle={course.title} />
            
            {lastPlayed && lastPlayed.lesson_id !== activeVideo?.id && (
                <ResumeBanner 
                    lastPlayed={lastPlayed} 
                    onResume={handleResumeLastPlayed} 
                />
            )}

            {/* Only the course title remains */}
            <h1 className="course-content__title">{course.title}</h1>
        </div>
    );
};

export default CourseHeader;