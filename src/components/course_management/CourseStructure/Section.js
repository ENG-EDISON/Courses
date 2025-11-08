import React, { useCallback } from 'react';
import Subsection from './Subsection';

const Section = ({ 
  section, 
  sectionIndex, 
  sections, 
  setSections, 
  onUpdate, 
  onUpdateSection, 
  onDeleteSection,
  isExistingInDatabase,
  isExpanded,
  onToggleSection,
  onToggleSubsection,
  isSubsectionExpanded,
  onToggleLesson,  // Add this prop
  isLessonExpanded  // Add this prop
}) => {
  const addSubsection = useCallback(() => {
    const sectionData = sections[sectionIndex];
    const newSubsection = {
      title: `Subsection ${sectionData.subsections.length + 1}`,
      order: sectionData.subsections.length,
      description: '',
      lessons: [],
      section: sectionIndex,
      isExisting: false
    };
    
    const updatedSections = sections.map((sec, index) =>
      index === sectionIndex 
        ? { 
            ...sec, 
            subsections: [...sec.subsections, newSubsection]
          }
        : sec
    );
    setSections(updatedSections);
    onUpdate(updatedSections);
  }, [sectionIndex, sections, setSections, onUpdate]);

  const updateOrder = useCallback((newOrder) => {
    onUpdateSection(sectionIndex, 'order', newOrder);
  }, [sectionIndex, onUpdateSection]);

  const updateSubsection = useCallback((subsectionIndex, field, value) => {
    const updatedSections = sections.map((sec, idx) => {
      if (idx === sectionIndex) {
        const updatedSubsections = sec.subsections.map((sub, subIdx) =>
          subIdx === subsectionIndex ? { ...sub, [field]: value } : sub
        );
        return { ...sec, subsections: updatedSubsections };
      }
      return sec;
    });

    setSections(updatedSections);
    if (onUpdate) {
      onUpdate(updatedSections);
    }
  }, [sectionIndex, sections, setSections, onUpdate]);

  const deleteSubsection = useCallback((subsectionIndex) => {
    const subsectionToDelete = section.subsections[subsectionIndex];

    if (isExistingInDatabase(subsectionToDelete)) {
      if (!window.confirm('This subsection exists in the database. Do you want to delete it permanently?')) {
        return;
      }
    }

    const updatedSections = sections.map((sec, idx) =>
      idx === sectionIndex
        ? { ...sec, subsections: sec.subsections.filter((_, subIdx) => subIdx !== subsectionIndex) }
        : sec
    );

    setSections(updatedSections);
    if (onUpdate) {
      onUpdate(updatedSections);
    }
  }, [section, sectionIndex, sections, setSections, onUpdate, isExistingInDatabase]);

  return (
    <div className={`section-card ${isExistingInDatabase(section) ? 'existing-section' : 'new-section'}`}>
      {/* Section Header - Clickable for collapse/expand */}
      <div 
        className={`section-header ${isExpanded ? 'expanded' : ''}`}
        onClick={() => onToggleSection(sectionIndex)}
      >
        <button 
          className={`section-toggle ${isExpanded ? 'expanded' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSection(sectionIndex);
          }}
        >
          ▶
        </button>
        
        <div className="order-input-group">
          <label>ORDER</label>
          <input
            type="number"
            className="order-input"
            value={section.order !== undefined ? section.order : sectionIndex}
            onChange={(e) => updateOrder(parseInt(e.target.value) || 0)}
            onClick={(e) => e.stopPropagation()}
            min="0"
          />
        </div>

        <input
          type="text"
          value={section.title}
          onChange={(e) => onUpdateSection(sectionIndex, 'title', e.target.value)}
          className="section-title-input"
          placeholder="Section title"
          onClick={(e) => e.stopPropagation()}
        />

        <div className="section-status">
          <span className={`status-badge ${isExistingInDatabase(section) ? 'existing' : 'new'}`}>
            {isExistingInDatabase(section) ? 'EXISTING' : 'NEW'}
          </span>
        </div>

        <div className="section-actions">
          <button
            onClick={(e) => {
              e.stopPropagation();
              addSubsection();
            }}
            className="btn-secondary"
          >
            + Add Subsection
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteSection(sectionIndex);
            }}
            className="btn-danger"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Section Content - Only show when expanded */}
      {isExpanded && (
        <div className="section-content">
          <textarea
            value={section.description}
            onChange={(e) => onUpdateSection(sectionIndex, 'description', e.target.value)}
            className="section-description"
            placeholder="Section description"
            rows={2}
          />

          <div className="subsections">
            <div className="subsection-header-row">
              <h4>Subsections</h4>
              <span className="subsection-count">
                {section.subsections.length} subsection(s)
              </span>
            </div>

            {section.subsections.length === 0 ? (
              <div className="empty-subsection">
                No subsections yet. Click "Add Subsection" to create one.
              </div>
            ) : (
              section.subsections.map((subsection, subIndex) => (
                <Subsection
                  key={subsection.id || subIndex}
                  subsection={subsection}
                  sectionIndex={sectionIndex}
                  subsectionIndex={subIndex}
                  sections={sections}
                  setSections={setSections}
                  onUpdate={onUpdate}
                  isExistingInDatabase={isExistingInDatabase}
                  onUpdateSubsection={updateSubsection}
                  onDeleteSubsection={deleteSubsection}
                  isExpanded={isSubsectionExpanded(sectionIndex, subIndex)}
                  onToggle={() => onToggleSubsection(sectionIndex, subIndex)}
                  onToggleLesson={onToggleLesson}  // Pass down
                  isLessonExpanded={isLessonExpanded}  // Pass down
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Section;