import React, { useCallback, useState } from 'react';
import Subsection from './Subsection';
import "./css/SectionEdit.css"
import { createSection, updateSection, deleteSection } from '../../../api/SectionApi';
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
  onToggleLesson,
  isLessonExpanded,
  course,
  sectionId,
  onSubsectionCreate,
  onSubsectionUpdate,
  onSubsectionDelete,
  onSectionCreate,
  onSectionUpdate,
  onSectionDelete
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ✅ SECTION API FUNCTIONS
  const handleCreateSection = async (e) => {
    e?.stopPropagation();
    
    if (isExistingInDatabase(section)) {
      alert('This section already exists in the database. Use Update instead.');
      return;
    }

    if (!section.title?.trim()) {
      alert('Please enter a section title before saving.');
      return;
    }

    if (!course?.id) {
      alert('Course ID is required to create a section.');
      return;
    }

    setIsCreating(true);
    try {
      const sectionData = {
        title: section.title.trim(),
        description: section.description || '',
        order: section.order !== undefined ? section.order : sectionIndex,
        course: course.id,
      };

      const response = await createSection(sectionData);

      if (onSectionCreate) {
        onSectionCreate(response.data, sectionIndex);
      }

      alert('Section created successfully!');
    } catch (error) {
      console.error('Error creating section:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      alert(`Error creating section: ${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateSection = async (e) => {
    e?.stopPropagation();
    
    if (!isExistingInDatabase(section)) {
      alert('Cannot update a section that is not saved in the database. Please save the section first.');
      return;
    }

    if (!section.id) {
      alert('Section ID is required for update.');
      return;
    }

    setIsUpdating(true);
    try {
      const updateData = {
        title: section.title.trim(),
        description: section.description || '',
        order: section.order !== undefined ? section.order : sectionIndex,
        course: section.course || course?.id,
      };

      const response = await updateSection(section.id, updateData);

      if (onSectionUpdate) {
        onSectionUpdate(section.id, response.data);
      }

      alert('Section updated successfully!');
    } catch (error) {
      console.error('Error updating section:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      alert(`Error updating section: ${errorMessage}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteSection = async (e) => {
    e?.stopPropagation();
    
    if (!isExistingInDatabase(section)) {
      if (onDeleteSection) {
        onDeleteSection(sectionIndex);
      }
      return;
    }

    if (!section.id) {
      alert('Section ID is required for deletion.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this section? This will also delete all subsections and lessons within it. This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteSection(section.id);
      
      if (onSectionDelete) {
        onSectionDelete(section.id, sectionIndex);
      }
      
      alert('Section deleted successfully!');
    } catch (error) {
      console.error('Error deleting section:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      alert(`Error deleting section: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const getActionButton = () => {
    if (isExistingInDatabase(section)) {
      return (
        <button
          onClick={handleUpdateSection}
          className="btn-primary"
          disabled={isUpdating}
          title="Update section in database"
        >
          {isUpdating ? 'Updating...' : 'Update Section'}
        </button>
      );
    } else {
      return (
        <button
          onClick={handleCreateSection}
          className="btn-success"
          disabled={isCreating}
          title="Save new section to database"
        >
          {isCreating ? 'Creating...' : 'Save Section'}
        </button>
      );
    }
  };

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
          {isExpanded ? '▼' : '▶'}
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
          {isCreating && <span className="creating-badge">CREATING...</span>}
          {isUpdating && <span className="updating-badge">UPDATING...</span>}
        </div>

        <div className="section-actions">
          {getActionButton()}

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
            onClick={handleDeleteSection}
            className="btn-danger"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

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
                  onToggleLesson={onToggleLesson}
                  isLessonExpanded={isLessonExpanded}
                  course={course}
                  sectionId={sectionId}
                  onSubsectionCreate={onSubsectionCreate}
                  onSubsectionUpdate={onSubsectionUpdate}
                  onSubsectionDelete={onSubsectionDelete}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

Section.defaultProps = {
  onSectionCreate: () => {},
  onSectionUpdate: () => {},
  onSectionDelete: () => {},
  onSubsectionCreate: () => {},
  onSubsectionUpdate: () => {},
  onSubsectionDelete: () => {}
};

export default Section;