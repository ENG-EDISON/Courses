import React, { useCallback, useState } from 'react';
import LessonResource from './LessonResource';

const Lesson = ({ 
  lesson, 
  sectionIndex, 
  subsectionIndex, 
  lessonIndex, 
  sections, 
  setSections, 
  onUpdate,
  isExistingInDatabase,
  isExpanded,
  onToggle
}) => {
  const [isAddingResource, setIsAddingResource] = useState(false);

  const updateLesson = useCallback((field, value) => {
    const updatedSections = sections.map((section, secIndex) => {
      if (secIndex === sectionIndex) {
        const updatedSubsections = section.subsections.map((sub, subIdx) => {
          if (subIdx === subsectionIndex) {
            const updatedLessons = sub.lessons.map((les, lesIdx) =>
              lesIdx === lessonIndex ? { ...les, [field]: value } : les
            );
            return { ...sub, lessons: updatedLessons };
          }
          return sub;
        });
        return { ...section, subsections: updatedSubsections };
      }
      return section;
    });
    setSections(updatedSections);
    onUpdate(updatedSections);
  }, [sectionIndex, subsectionIndex, lessonIndex, sections, setSections, onUpdate]);

  const deleteLesson = useCallback(() => {
    const lessonToDelete = sections[sectionIndex]?.subsections[subsectionIndex]?.lessons[lessonIndex];
    
    if (lessonToDelete?.id) {
      if (window.confirm('This lesson exists in the database. Do you want to delete it permanently?')) {
        console.log('Should delete existing lesson from database:', lessonToDelete.id);
      } else {
        return;
      }
    }
    
    const updatedSections = sections.map((section, secIndex) => {
      if (secIndex === sectionIndex) {
        const updatedSubsections = section.subsections.map((sub, subIdx) => {
          if (subIdx === subsectionIndex) {
            const updatedLessons = sub.lessons.filter((_, lesIdx) => lesIdx !== lessonIndex);
            return { ...sub, lessons: updatedLessons };
          }
          return sub;
        });
        return { ...section, subsections: updatedSubsections };
      }
      return section;
    });
    setSections(updatedSections);
    onUpdate(updatedSections);
  }, [sectionIndex, subsectionIndex, lessonIndex, sections, setSections, onUpdate]);

  const addResource = useCallback(() => {
    if (isAddingResource) return;

    setIsAddingResource(true);
    try {
      const updatedSections = sections.map((section, secIndex) => {
        if (secIndex === sectionIndex) {
          const updatedSubsections = section.subsections.map((sub, subIdx) => {
            if (subIdx === subsectionIndex) {
              const updatedLessons = sub.lessons.map((les, lesIdx) => {
                if (lesIdx === lessonIndex) {
                  const newResource = {
                    title: `Resource ${(les.resources?.length || 0) + 1}`,
                    file: null,
                    resource_type: 'document',
                    order: les.resources?.length || 0,
                    lesson: lessonIndex,
                    isExisting: false
                  };
                  return { 
                    ...les, 
                    resources: [...(les.resources || []), newResource] 
                  };
                }
                return les;
              });
              return { ...sub, lessons: updatedLessons };
            }
            return sub;
          });
          return { ...section, subsections: updatedSubsections };
        }
        return section;
      });
      setSections(updatedSections);
      onUpdate(updatedSections);
    } finally {
      setTimeout(() => setIsAddingResource(false), 300);
    }
  }, [sectionIndex, subsectionIndex, lessonIndex, sections, setSections, onUpdate, isAddingResource]);

  return (
    <div className={`lesson-card ${isExistingInDatabase(lesson) ? 'existing-lesson' : 'new-lesson'}`}>
      {/* Lesson Header - Clickable for collapse/expand */}
      <div 
        className={`lesson-header ${isExpanded ? 'expanded' : ''}`}
        onClick={() => onToggle(sectionIndex, subsectionIndex, lessonIndex)}
      >
        <button 
          className={`lesson-toggle ${isExpanded ? 'expanded' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(sectionIndex, subsectionIndex, lessonIndex);
          }}
        >
          ▶
        </button>

        {/* Order Input for Lesson */}
        <div className="order-input-group">
          <label>ORDER</label>
          <input
            type="number"
            value={lesson.order !== undefined ? lesson.order : lessonIndex}
            onChange={(e) => updateLesson('order', parseInt(e.target.value) || 0)}
            className="order-input"
            min="0"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        <input
          type="text"
          value={lesson.title}
          onChange={(e) => updateLesson('title', e.target.value)}
          className="lesson-title-input"
          placeholder="Lesson title"
          onClick={(e) => e.stopPropagation()}
        />

        <div className="lesson-status">
          <span className={`status-badge ${isExistingInDatabase(lesson) ? 'existing' : 'new'}`}>
            {isExistingInDatabase(lesson) ? 'EXISTING' : 'NEW'}
          </span>
        </div>

        <div className="lesson-actions">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              addResource();
            }} 
            className="btn-secondary"
            disabled={isAddingResource}
          >
            + Add Resource
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              deleteLesson();
            }} 
            className="btn-danger"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Lesson Content - Only show when expanded */}
      {isExpanded && (
        <div className="lesson-content">
          <div><label className="section-label">Lesson Content</label></div>
          <div className="lesson-content-section">

            <textarea
              value={lesson.content}
              onChange={(e) => updateLesson('content', e.target.value)}
              placeholder="Enter lesson content (supports markdown)..."
              rows={4}
              className="lesson-content-textarea"
            />
          </div>

          <div className="lesson-content-section">
            <label className="section-label">Lesson Details</label>
            <div className="lesson-meta-grid">
              <div className="meta-field">
                <label>Video URL</label>
                <input
                  type="url"
                  value={lesson.video_url}
                  onChange={(e) => updateLesson('video_url', e.target.value)}
                  placeholder="https://example.com/video"
                  className="meta-input"
                />
              </div>
              
              <div className="meta-field">
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  value={lesson.duration_minutes}
                  onChange={(e) => updateLesson('duration_minutes', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                  className="meta-input"
                />
              </div>

              <div className="meta-field checkbox-field">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={lesson.is_preview}
                    onChange={(e) => updateLesson('is_preview', e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Preview lesson (free to watch)
                </label>
              </div>
            </div>
          </div>

          <div className="lesson-content-section">
            <div className="resources-header">
              <div className="resources-title">
                <h6>Lesson Resources</h6>
                <span className="resource-count">
                  {lesson.resources?.length || 0} resource(s)
                </span>
              </div>
              <button 
                onClick={addResource}
                className="btn-primary btn-sm"
                disabled={isAddingResource}
              >
                {isAddingResource ? 'Adding...' : '+ Add Resource'}
              </button>
            </div>

            {(!lesson.resources || lesson.resources.length === 0) ? (
              <div className="empty-resource-state">
                <div className="empty-resource-icon">📎</div>
                <p>No resources added yet</p>
                <small>Add supplementary materials like documents, presentations, or links</small>
                <button 
                  onClick={addResource}
                  className="btn-primary"
                  disabled={isAddingResource}
                >
                  {isAddingResource ? 'Adding...' : 'Add First Resource'}
                </button>
              </div>
            ) : (
              <div className="resources-grid">
                {lesson.resources.map((resource, resourceIndex) => (
                  <LessonResource
                    key={resource.id || resourceIndex}
                    resource={resource}
                    sectionIndex={sectionIndex}
                    subsectionIndex={subsectionIndex}
                    lessonIndex={lessonIndex}
                    resourceIndex={resourceIndex}
                    sections={sections}
                    setSections={setSections}
                    onUpdate={onUpdate}
                    isExistingInDatabase={isExistingInDatabase}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Lesson;