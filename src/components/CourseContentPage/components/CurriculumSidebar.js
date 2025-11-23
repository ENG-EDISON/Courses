import SectionAccordion from './SectionAccordion';
import '../css/CurriculumSidebar.css';
const CurriculumSidebar = ({
    course,
    expandedSections,
    activeVideo,
    completionStatus,
    onVideoSelect,
    onToggleSection,
    onMarkComplete,
    progressSummary
}) => {
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
        <div className="curriculum-sidebar">
            <SidebarHeader 
                sectionCount={course.sections ? course.sections.length : 0}
                lessonCount={getTotalLessons()}
                progressPercentage={getProgressPercentage()}
            />
            
            <div className="curriculum-sections">
                {course.sections && course.sections.map(section => (
                    <SectionAccordion
                        key={section.id}
                        section={section}
                        isExpanded={expandedSections.has(section.id)}
                        onToggle={() => onToggleSection(section.id)}
                        activeVideo={activeVideo}
                        onVideoSelect={onVideoSelect}
                        completionStatus={completionStatus}
                        onMarkComplete={onMarkComplete}
                    />
                ))}
            </div>
        </div>
    );
};

const SidebarHeader = ({ sectionCount, lessonCount, progressPercentage }) => (
    <div className="sidebar-header">
        <h3>Course Curriculum</h3>
        <div className="curriculum-stats">
            <span>{sectionCount} sections</span>
            <span>•</span>
            <span>{lessonCount} lessons</span>
            <span>•</span>
            <span>{progressPercentage}% complete</span>
        </div>
    </div>
);

export default CurriculumSidebar;