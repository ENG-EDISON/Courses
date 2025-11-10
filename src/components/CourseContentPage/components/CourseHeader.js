import Breadcrumb from './Breadcrumb';
import ResumeBanner from './ResumeBanner';
import ProgressCard from './ProgressCard';
import CourseMeta from './CourseMeta';

const CourseHeader = ({ 
    course, 
    progressSummary, 
    lastPlayed, 
    activeVideo, 
    completionStatus,
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

    const getTotalLessons = () => {
        if (!course?.sections) return 0;
        return course.sections.reduce((total, section) =>
            total + section.subsections.reduce((subTotal, subsection) =>
                subTotal + (subsection.lessons ? subsection.lessons.length : 0), 0
            ), 0
        );
    };

    const getCompletedLessons = () => Object.keys(completionStatus).length;
    const getProgressPercentage = () => {
        const total = getTotalLessons();
        return total > 0 ? Math.round((getCompletedLessons() / total) * 100) : 0;
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

            <div className="course-header__main">
                <div className="course-header__info">
                    <h1 className="course-content__title">{course.title}</h1>
                    <p className="course-content__instructor">By {course.instructor_name}</p>
                    
                    <CourseMeta 
                        course={course} 
                        progressSummary={progressSummary} 
                    />
                </div>

                <ProgressCard 
                    progressPercentage={getProgressPercentage()}
                    completedLessons={getCompletedLessons()}
                    totalLessons={getTotalLessons()}
                    progressSummary={progressSummary}
                />
            </div>
        </div>
    );
};

export default CourseHeader;