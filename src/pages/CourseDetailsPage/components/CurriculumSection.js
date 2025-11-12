// components/course/CurriculumSection.js
import CurriculumSubsection from './CurriculumSubsection';
import { getTotalSectionDuration, formatDuration } from '../utils/courseUtils';

function CurriculumSection({ 
    section, 
    sectionIndex, 
    isExpanded, 
    expandedSubsections, 
    onToggleSection, 
    onToggleSubsection, 
    onPlayPreviewVideo 
}) {
    const sectionDuration = getTotalSectionDuration(section);

    return (
        <div className="curriculum-section">
            {/* Section Header */}
            <div
                className={`section-header-enterprise ${isExpanded ? 'expanded' : ''}`}
                onClick={onToggleSection}
            >
                <div className="section-header-main">
                    <div className="section-indicator">
                        <div className="section-number">
                            {String(sectionIndex + 1).padStart(2, '0')}
                        </div>
                        <div className="section-toggle">
                            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                        </div>
                    </div>
                    <div className="section-content-main">
                        <h3 className="section-title">{section.title}</h3>
                        <div className="section-meta">
                            <div className="meta-item">
                                <i className="fas fa-layer-group"></i>
                                {section.subsections?.length || 0} Subsections
                            </div>
                            <div className="meta-item">
                                <i className="fas fa-play-circle"></i>
                                {section.subsections?.reduce((total, sub) =>
                                    total + (sub.lessons?.length || 0), 0
                                ) || 0} Lessons
                            </div>
                            {sectionDuration > 0 && (
                                <div className="meta-item">
                                    <i className="fas fa-clock"></i>
                                    {formatDuration(sectionDuration)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Section Content */}
            <div className={`section-content-enterprise ${isExpanded ? 'expanded' : ''}`}>
                {section.subsections && section.subsections.map((subsection, subIndex) => (
                    <CurriculumSubsection
                        key={subsection.id}
                        subsection={subsection}
                        sectionIndex={sectionIndex}
                        subIndex={subIndex}
                        isExpanded={expandedSubsections.has(subsection.id)}
                        onToggleSubsection={() => onToggleSubsection(subsection.id)}
                        onPlayPreviewVideo={onPlayPreviewVideo}
                    />
                ))}
            </div>
        </div>
    );
}

export default CurriculumSection;