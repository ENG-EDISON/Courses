// components/CourseMainContent.js
import CourseOverview from "./CourseOverview";
import LearningObjectives from "./LearningObjectives";
import CourseCurriculum from "./CourseCurriculum";
import Requirements from "./Requirements";

function CourseMainContent({ 
    course, 
    expandedSections, 
    expandedSubsections, 
    onToggleSection, 
    onToggleSubsection, 
    onPlayPreviewVideo 
}) {
    return (
        <div className="course-main-content">
            <CourseOverview description={course.description} />
            
            {course.learning_objectives && course.learning_objectives.length > 0 && (
                <LearningObjectives objectives={course.learning_objectives} />
            )}
            
            <CourseCurriculum 
                course={course}
                expandedSections={expandedSections}
                expandedSubsections={expandedSubsections}
                onToggleSection={onToggleSection}
                onToggleSubsection={onToggleSubsection}
                onPlayPreviewVideo={onPlayPreviewVideo}
            />
            
            {course.requirements && (
                <Requirements requirements={course.requirements} />
            )}
        </div>
    );
}

export default CourseMainContent;