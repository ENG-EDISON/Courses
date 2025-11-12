// components/CourseCurriculum.js
import CurriculumSection from "./CurriculumSection";

function CourseCurriculum({ 
    course, 
    expandedSections, 
    expandedSubsections, 
    onToggleSection, 
    onToggleSubsection, 
    onPlayPreviewVideo 
}) {
    const totalSections = course.sections?.length || 0;
    const totalSubsections = course.sections?.reduce((total, section) => 
        total + (section.subsections?.length || 0), 0
    ) || 0;
    const totalLessons = course.sections?.reduce((total, section) =>
        total + (section.subsections?.reduce((subTotal, subsection) =>
            subTotal + (subsection.lessons?.length || 0), 0
        ) || 0), 0
    ) || 0;

    return (
        <section className="content-section">
            <div className="section-header">
                <i className="fas fa-book-open"></i>
                <h2>Course Curriculum</h2>
                <span className="section-count">
                    {totalSections} sections • {totalSubsections} subsections • {totalLessons} lessons
                </span>
            </div>
            <div className="section-content">
                {course.sections && course.sections.length > 0 ? (
                    <div className="curriculum-enterprise">
                        {course.sections.map((section, sectionIndex) => (
                            <CurriculumSection
                                key={section.id}
                                section={section}
                                sectionIndex={sectionIndex}
                                isExpanded={expandedSections.has(section.id)}
                                expandedSubsections={expandedSubsections}
                                onToggleSection={() => onToggleSection(section.id)}
                                onToggleSubsection={onToggleSubsection}
                                onPlayPreviewVideo={onPlayPreviewVideo}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <i className="fas fa-book"></i>
                        <h4>Curriculum Coming Soon</h4>
                        <p>The course content is being prepared by the instructor.</p>
                    </div>
                )}
            </div>
        </section>
    );
}

export default CourseCurriculum;