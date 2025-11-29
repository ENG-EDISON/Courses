import React, { useCallback, useState } from 'react';
import Lesson from './lesson/Lesson';
// import { createSubSection, updateSubsection,deleteSubsection } from '../../../../api/SubsectionApis'; // Import your APIs
import "./css/SubsectionEdit.css"
import { createSubSection, updateSubsection,deleteSubsection  } from '../../../api/SubsectionApi';
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
  onToggleLesson,
  isLessonExpanded,
  course,
  sectionId, // Add sectionId for creating/updating subsections
  // Add the missing callback props
  onSubsectionCreate,
  onSubsectionUpdate,
  onSubsectionDelete
}) => {
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle Create New Subsection
  const handleCreateSubsection = async (e) => {
    e.stopPropagation();
    
    if (isExistingInDatabase(subsection)) {
      alert('This subsection already exists in the database. Use Update instead.');
      return;
    }

    // Validate required fields
    if (!subsection.title?.trim()) {
      alert('Please enter a subsection title before saving.');
      return;
    }

    if (!sectionId) {
      alert('Section ID is required to create a subsection.');
      return;
    }

    setIsCreating(true);
    try {
      // Prepare the data for creation
      const subsectionData = {
        title: subsection.title.trim(),
        description: subsection.description || '',
        order: subsection.order !== undefined ? subsection.order : subsectionIndex,
        section: sectionId,
        // Include course if needed by your API
        ...(course?.id && { course: course.id })
      };

      // Create the subsection using your API
      const response = await createSubSection(subsectionData);

      // Call the parent callback if provided
      if (onSubsectionCreate) {
        onSubsectionCreate(response.data, sectionIndex, subsectionIndex);
      }

      alert('Subsection created successfully!');
    } catch (error) {
      console.error('Error creating subsection:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      alert(`Error creating subsection: ${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Update Subsection
  const handleUpdateSubsection = async (e) => {
    e.stopPropagation();
    
    if (!isExistingInDatabase(subsection)) {
      alert('Cannot update a subsection that is not saved in the database. Please save the subsection first.');
      return;
    }

    if (!subsection.id) {
      alert('Subsection ID is required for update.');
      return;
    }

    setIsUpdating(true);
    try {
      // Prepare the data for update
      const updateData = {
        title: subsection.title.trim(),
        description: subsection.description || '',
        order: subsection.order !== undefined ? subsection.order : subsectionIndex,
        section: subsection.section || sectionId,
      };

      // Update the subsection using your API
      const response = await updateSubsection(subsection.id, updateData);

      // Call the parent callback if provided
      if (onSubsectionUpdate) {
        onSubsectionUpdate(subsection.id, response.data);
      }

      alert('Subsection updated successfully!');
    } catch (error) {
      console.error('Error updating subsection:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      alert(`Error updating subsection: ${errorMessage}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Delete Subsection
  const handleDeleteSubsection = async (e) => {
    e.stopPropagation();
    
    if (!isExistingInDatabase(subsection)) {
      // If it's not in database, use the existing onDeleteSubsection function for local deletion
      if (onDeleteSubsection) {
        onDeleteSubsection(subsectionIndex);
      }
      return;
    }

    if (!subsection.id) {
      alert('Subsection ID is required for deletion.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this subsection? This will also delete all lessons within it. This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      // Delete the subsection using your API
      // Note: You'll need to add deleteSubsection to your API file
      await deleteSubsection(subsection.id);
      
      // Call the parent callback if provided
      if (onSubsectionDelete) {
        onSubsectionDelete(subsection.id, sectionIndex, subsectionIndex);
      }
      
      alert('Subsection deleted successfully!');
    } catch (error) {
      console.error('Error deleting subsection:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      alert(`Error deleting subsection: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Add/Update button text and functionality
  const getActionButton = () => {
    if (isExistingInDatabase(subsection)) {
      return (
        <button
          onClick={handleUpdateSubsection}
          className="btn-primary"
          disabled={isUpdating}
          title="Update subsection in database"
        >
          {isUpdating ? 'Updating...' : 'Update Subsection'}
        </button>
      );
    } else {
      return (
        <button
          onClick={handleCreateSubsection}
          className="btn-success"
          disabled={isCreating}
          title="Save new subsection to database"
        >
          {isCreating ? 'Creating...' : 'Save Subsection'}
        </button>
      );
    }
  };

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

  // Add the missing lesson functions
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
          {isExpanded ? '▼' : '▶'}
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
          {isCreating && <span className="creating-badge">CREATING...</span>}
          {isUpdating && <span className="updating-badge">UPDATING...</span>}
        </div>

        <div className="subsection-actions">
          {/* Create/Update Subsection Button */}
          {getActionButton()}

          <button 
            onClick={(e) => {
              e.stopPropagation();
              addLesson();
            }} 
            className="btn-secondary"
            disabled={isAddingLesson}
          >
            {isAddingLesson ? 'Adding...' : '+ Add Lesson'}
          </button>
          <button 
            onClick={handleDeleteSubsection}
            className="btn-danger"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
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
                  isExpanded={isLessonExpanded(sectionIndex, subsectionIndex, lessonIndex)}
                  onToggle={() => onToggleLesson(sectionIndex, subsectionIndex, lessonIndex)}
                  course={course}
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