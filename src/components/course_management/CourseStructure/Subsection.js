import React, { useCallback, useState } from 'react';
import Lesson from './Lesson';

const Subsection = ({ 
  subsection, 
  sectionIndex, 
  subsectionIndex, 
  sections, 
  setSections, 
  onUpdate,
  isExistingInDatabase,
  onUpdateSubsection,
  onDeleteSubsection,
  isExpanded,
  onToggle,
  onToggleLesson,  // Add this prop
  isLessonExpanded  // Add this prop
}) => {
  const [isAddingLesson, setIsAddingLesson] = useState(false);

  const addLesson = useCallback(() => {
    if (isAddingLesson) return;

    setIsAddingLesson(true);
    try {
      const newLesson = {
        title: `Lesson ${subsection.lessons.length + 1}`,
        order: subsection.lessons.length,
        content: '',
        video_url: '',
        duration_minutes: 0,
        is_preview: false,
        subsection: subsectionIndex,
        isExisting: false
      };

      const updatedSections = sections.map((section, secIndex) => {
        if (secIndex === sectionIndex) {
          const updatedSubsections = section.subsections.map((sub, subIdx) => {
            if (subIdx === subsectionIndex) {
              return { ...sub, lessons: [...sub.lessons, newLesson] };
            }
            return sub;
          });
          return { ...section, subsections: updatedSubsections };
        }
        return section;
      });

      setSections(updatedSections);
      if (onUpdate) {
        onUpdate(updatedSections);
      }
    } finally {
      setTimeout(() => setIsAddingLesson(false), 300);
    }
  }, [sectionIndex, subsectionIndex, sections, setSections, onUpdate, subsection, isAddingLesson]);

  const updateLesson = useCallback((lessonIndex, field, value) => {
    const updatedSections = sections.map((section, secIndex) => {
      if (secIndex === sectionIndex) {
        const updatedSubsections = section.subsections.map((sub, subIdx) => {
          if (subIdx === subsectionIndex) {
            const updatedLessons = sub.lessons.map((lesson, lesIdx) =>
              lesIdx === lessonIndex ? { ...lesson, [field]: value } : lesson
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
    if (onUpdate) {
      onUpdate(updatedSections);
    }
  }, [sectionIndex, subsectionIndex, sections, setSections, onUpdate]);

  const deleteLesson = useCallback((lessonIndex) => {
    const lessonToDelete = subsection.lessons[lessonIndex];

    if (isExistingInDatabase(lessonToDelete)) {
      if (!window.confirm('This lesson exists in the database. Do you want to delete it permanently?')) {
        return;
      }
    }

    const updatedSections = sections.map((section, secIndex) => {
      if (secIndex === sectionIndex) {
        const updatedSubsections = section.subsections.map((sub, subIdx) => {
          if (subIdx === subsectionIndex) {
            return {
              ...sub,
              lessons: sub.lessons.filter((_, lesIdx) => lesIdx !== lessonIndex)
            };
          }
          return sub;
        });
        return { ...section, subsections: updatedSubsections };
      }
      return section;
    });

    setSections(updatedSections);
    if (onUpdate) {
      onUpdate(updatedSections);
    }
  }, [sectionIndex, subsectionIndex, sections, setSections, onUpdate, subsection, isExistingInDatabase]);

  const addResource = useCallback((lessonIndex) => {
    const updatedSections = sections.map((section, secIndex) => {
      if (secIndex === sectionIndex) {
        const updatedSubsections = section.subsections.map((sub, subIdx) => {
          if (subIdx === subsectionIndex) {
            const updatedLessons = sub.lessons.map((lesson, lesIdx) => {
              if (lesIdx === lessonIndex) {
                const newResource = {
                  title: `Resource ${lesson.resources.length + 1}`,
                  resource_type: 'document',
                  file: null,
                  order: lesson.resources.length,
                  lesson: lesson.id,
                  isExisting: false
                };
                return {
                  ...lesson,
                  resources: [...(lesson.resources || []), newResource]
                };
              }
              return lesson;
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
    if (onUpdate) {
      onUpdate(updatedSections);
    }
  }, [sectionIndex, subsectionIndex, sections, setSections, onUpdate]);

  const updateResource = useCallback((lessonIndex, resourceIndex, field, value) => {
    const updatedSections = sections.map((section, secIndex) => {
      if (secIndex === sectionIndex) {
        const updatedSubsections = section.subsections.map((sub, subIdx) => {
          if (subIdx === subsectionIndex) {
            const updatedLessons = sub.lessons.map((lesson, lesIdx) => {
              if (lesIdx === lessonIndex) {
                const updatedResources = lesson.resources.map((resource, resIdx) =>
                  resIdx === resourceIndex ? { ...resource, [field]: value } : resource
                );
                return { ...lesson, resources: updatedResources };
              }
              return lesson;
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
    if (onUpdate) {
      onUpdate(updatedSections);
    }
  }, [sectionIndex, subsectionIndex, sections, setSections, onUpdate]);

  const deleteResource = useCallback((lessonIndex, resourceIndex) => {
    const resourceToDelete = subsection.lessons[lessonIndex]?.resources[resourceIndex];

    if (isExistingInDatabase(resourceToDelete)) {
      if (!window.confirm('This resource exists in the database. Do you want to delete it permanently?')) {
        return;
      }
    }

    const updatedSections = sections.map((section, secIndex) => {
      if (secIndex === sectionIndex) {
        const updatedSubsections = section.subsections.map((sub, subIdx) => {
          if (subIdx === subsectionIndex) {
            const updatedLessons = sub.lessons.map((lesson, lesIdx) => {
              if (lesIdx === lessonIndex) {
                return {
                  ...lesson,
                  resources: lesson.resources.filter((_, resIdx) => resIdx !== resourceIndex)
                };
              }
              return lesson;
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
    if (onUpdate) {
      onUpdate(updatedSections);
    }
  }, [sectionIndex, subsectionIndex, sections, setSections, onUpdate, subsection, isExistingInDatabase]);

  const handleFileUpload = useCallback((lessonIndex, resourceIndex, file) => {
    const updatedSections = sections.map((section, secIndex) => {
      if (secIndex === sectionIndex) {
        const updatedSubsections = section.subsections.map((sub, subIdx) => {
          if (subIdx === subsectionIndex) {
            const updatedLessons = sub.lessons.map((lesson, lesIdx) => {
              if (lesIdx === lessonIndex) {
                const updatedResources = lesson.resources.map((resource, resIdx) => {
                  if (resIdx === resourceIndex) {
                    return {
                      ...resource,
                      file: file,
                      title: file.name
                    };
                  }
                  return resource;
                });
                return { ...lesson, resources: updatedResources };
              }
              return lesson;
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
    if (onUpdate) {
      onUpdate(updatedSections);
    }
  }, [sectionIndex, subsectionIndex, sections, setSections, onUpdate]);

  return (
    <div className={`subsection-card ${isExistingInDatabase(subsection) ? 'existing-subsection' : 'new-subsection'}`}>
      {/* Subsection Header - Clickable for collapse/expand */}
      <div 
        className={`subsection-header ${isExpanded ? 'expanded' : ''}`}
        onClick={() => onToggle(sectionIndex, subsectionIndex)}
      >
        <button 
          className={`subsection-toggle ${isExpanded ? 'expanded' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(sectionIndex, subsectionIndex);
          }}
        >
          ▶
        </button>

        {/* Order Input for Subsection */}
        <div className="order-input-group">
          <label>ORDER</label>
          <input
            type="number"
            value={subsection.order !== undefined ? subsection.order : subsectionIndex}
            onChange={(e) => onUpdateSubsection(subsectionIndex, 'order', parseInt(e.target.value) || 0)}
            className="order-input"
            min="0"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        <input
          type="text"
          value={subsection.title}
          onChange={(e) => onUpdateSubsection(subsectionIndex, 'title', e.target.value)}
          className="subsection-title-input"
          placeholder="Subsection title"
          onClick={(e) => e.stopPropagation()}
        />


        <div className="subsection-status">
          <span className={`status-badge ${isExistingInDatabase(subsection) ? 'existing' : 'new'}`}>
            {isExistingInDatabase(subsection) ? 'EXISTING' : 'NEW'}
          </span>
        </div>

        <div className="subsection-actions">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              addLesson();
            }} 
            className="btn-secondary"
            disabled={isAddingLesson}
          >
            + Add Lesson
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDeleteSubsection(subsectionIndex);
            }} 
            className="btn-danger"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Subsection Content - Only show when expanded */}
      {isExpanded && (
        <div className="subsection-content">
        <textarea
          value={subsection.description}
          onChange={(e) => onUpdateSubsection(subsectionIndex, 'description', e.target.value)}
          className="subsection-description"
          placeholder="Subsection description"
          rows={2}
        />


          <div className="lessons">
            <div className="lesson-header-row">
              <h5>Lessons</h5>
              <span className="lesson-count">
                {subsection.lessons.length} lesson(s)
              </span>
            </div>

            {subsection.lessons.length === 0 ? (
              <div className="empty-lesson">
                No lessons yet. Click "Add Lesson" to create one.
              </div>
            ) : (
              subsection.lessons.map((lesson, lessonIndex) => (
                <Lesson
                  key={lesson.id || lessonIndex}
                  lesson={lesson}
                  sectionIndex={sectionIndex}
                  subsectionIndex={subsectionIndex}
                  lessonIndex={lessonIndex}
                  sections={sections}
                  setSections={setSections}
                  onUpdate={onUpdate}
                  isExistingInDatabase={isExistingInDatabase}
                  onUpdateLesson={updateLesson}
                  onDeleteLesson={deleteLesson}
                  onAddResource={addResource}
                  onUpdateResource={updateResource}
                  onDeleteResource={deleteResource}
                  onFileUpload={handleFileUpload}
                  isExpanded={isLessonExpanded(sectionIndex, subsectionIndex, lessonIndex)}  // Use the prop
                  onToggle={() => onToggleLesson(sectionIndex, subsectionIndex, lessonIndex)}  // Use the prop
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Subsection;