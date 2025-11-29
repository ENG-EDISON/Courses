// LessonHeader.jsx
import React, { useState } from 'react';
import { createLesson, updateLesson, deleteLesson } from '../../../../api/LessonsApi';
import '../css/LessonHeader.css';

const LessonHeader = ({
  lesson,
  isExpanded,
  isExistingInDatabase,
  isAddingResource,
  onToggle,
  onOrderChange,
  onTitleChange,
  onAddResource,
  onDelete,
  onLessonUpdate,
  onLessonCreate,
  onLessonDelete,
  courseId,
  subsectionId,
  sectionIndex,
  subsectionIndex,
  lessonIndex
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle Create New Lesson
  // Handle Create New Lesson
  // Handle Create New Lesson
  const handleCreateLesson = async (e) => {
    e.stopPropagation();

    if (isExistingInDatabase(lesson)) {
      alert('This lesson already exists in the database. Use Update instead.');
      return;
    }

    // Enhanced validation
    const validationErrors = [];

    if (!lesson.title?.trim()) {
      validationErrors.push('Lesson title is required');
    }

    if (!courseId) {
      validationErrors.push('Course ID is missing. Please check your course structure.');
    }

    if (!subsectionId) {
      validationErrors.push('Subsection ID is missing. Please check your course structure.');
    }

    if (validationErrors.length > 0) {
      alert(`Please fix the following errors:\n• ${validationErrors.join('\n• ')}`);
      return;
    }

    setIsCreating(true);
    try {
      // ✅ FIX: Determine video_source based on actual content
      const determineVideoSource = () => {
        // If there's a video file, it's uploaded
        if (lesson.video_file instanceof File) {
          return 'uploaded';
        }
        // If there's a video URL, it's external
        if (lesson.video_url) {
          return 'external_url';
        }
        // Default to none if no video content
        return 'none';
      };

      // Prepare the data for creation
      const lessonData = {
        title: lesson.title.trim(),
        content: lesson.content || '',
        lesson_type: lesson.lesson_type || 'video',
        order: lesson.order !== undefined ? lesson.order : lessonIndex,
        is_preview: lesson.is_preview || false,
        subsection: subsectionId,
        course: courseId,
        video_url: lesson.video_url || '',
        video_duration: lesson.video_duration || 0,
        video_source: determineVideoSource(), // ✅ Use the smart determination
      };

      // Add video file if it exists and is a File object
      if (lesson.video_file instanceof File) {
        lessonData.video_file = lesson.video_file;
      }
      // Create the lesson using your API
      const response = await createLesson(lessonData);

      // Call the parent callback if provided
      if (onLessonCreate) {
        onLessonCreate(response.data, sectionIndex, subsectionIndex, lessonIndex);
      }

      alert('Lesson created successfully!');
    } catch (error) {
      console.error('Error creating lesson:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      alert(`Error creating lesson: ${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Update Lesson
// Handle Update Lesson
const handleUpdateLesson = async (e) => {
  e.stopPropagation();

  if (!isExistingInDatabase(lesson)) {
    alert('Cannot update a lesson that is not saved in the database. Please save the lesson first.');
    return;
  }

  if (!lesson.id) {
    alert('Lesson ID is required for update.');
    return;
  }

  setIsUpdating(true);
  try {
    // ✅ COMPREHENSIVE: Handle all video source transitions
    const determineVideoSource = () => {
      const hasNewFile = lesson.video_file instanceof File;
      const hasUrl = lesson.video_url && lesson.video_url.trim() !== '';
      const hadUploaded = lesson.video_source === 'uploaded';
      const hadExternal = lesson.video_source === 'external_url';

      // Case 1: Adding new uploaded file (from none or external)
      if (hasNewFile) {
        return 'uploaded';
      }
      
      // Case 2: Adding new URL (from none or uploaded)
      if (hasUrl) {
        return 'external_url';
      }
      
      // Case 3: Removing video entirely (explicit clear)
      if (lesson.video_file === null && lesson.video_url === '') {
        return 'none';
      }
      
      // Case 4: Switching from uploaded to none (file was cleared)
      if (hadUploaded && lesson.video_file === null) {
        return 'none';
      }
      
      // Case 5: Switching from external to none (URL was cleared)
      if (hadExternal && !hasUrl) {
        return 'none';
      }
      
      // Case 6: No changes to video content - set to 'none' if undefined
      return lesson.video_source || 'none'; // ✅ Always set to 'none' if undefined
    };

    // Prepare the data for update - ALWAYS include video_source
    const updateData = {
      title: lesson.title || '',
      content: lesson.content || '',
      lesson_type: lesson.lesson_type || 'video',
      order: lesson.order !== undefined ? lesson.order : lessonIndex,
      is_preview: lesson.is_preview || false,
      subsection: lesson.subsection || subsectionId,
      video_url: lesson.video_url || '',
      video_duration: lesson.video_duration || 0,
      video_source: determineVideoSource(), // ✅ This will always be set to 'none' if undefined
    };

    // ✅ COMPREHENSIVE: Handle file transitions for all cases
    const handleFileTransitions = () => {
      const hasNewFile = lesson.video_file instanceof File;
      const hasUrl = lesson.video_url && lesson.video_url.trim() !== '';
      const previousSource = lesson.video_source;

      // Case 1: Adding new uploaded file
      if (hasNewFile) {
        updateData.video_file = lesson.video_file;
        // Clear URL when switching to uploaded file
        if (hasUrl) {
          updateData.video_url = '';
        }
      }
      // Case 2: Switching from uploaded to external URL
      else if (previousSource === 'uploaded' && hasUrl) {
        updateData.video_file = null; // Clear the uploaded file
      }
      // Case 3: Switching from uploaded to none
      else if (previousSource === 'uploaded' && !hasUrl && !hasNewFile) {
        updateData.video_file = null; // Clear the uploaded file
      }
      // Case 4: Explicit file removal
      else if (lesson.video_file === null) {
        updateData.video_file = null;
      }
      // Case 5: If video_file is a string (existing file), don't include it
    };

    handleFileTransitions();
    // Update the lesson using your API
    const response = await updateLesson(lesson.id, updateData);

    // Call the parent callback if provided
    if (onLessonUpdate) {
      onLessonUpdate(lesson.id, response.data);
    }

    alert('Lesson updated successfully!');
  } catch (error) {
    console.error('Error updating lesson:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
    alert(`Error updating lesson: ${errorMessage}`);
  } finally {
    setIsUpdating(false);
  }
};

  // Handle Delete Lesson
  const handleDeleteLesson = async (e) => {
    e.stopPropagation();

    if (!isExistingInDatabase(lesson)) {
      // If it's not in database, use the existing onDelete function for local deletion
      if (onDelete) {
        onDelete();
      }
      return;
    }

    if (!lesson.id) {
      alert('Lesson ID is required for deletion.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      // Delete the lesson using your API
      await deleteLesson(lesson.id);

      // Call the parent callback if provided
      if (onLessonDelete) {
        onLessonDelete(lesson.id, sectionIndex, subsectionIndex, lessonIndex);
      }

      alert('Lesson deleted successfully!');
    } catch (error) {
      console.error('Error deleting lesson:', error);
      alert('Error deleting lesson. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Add/Update button text and functionality
  const getActionButton = () => {
    if (isExistingInDatabase(lesson)) {
      return (
        <button
          onClick={handleUpdateLesson}
          className="btn-primary"
          disabled={isUpdating}
          title="Update lesson in database"
        >
          {isUpdating ? 'Updating...' : 'Update Lesson'}
        </button>
      );
    } else {
      return (
        <button
          onClick={handleCreateLesson}
          className="btn-primary"
          disabled={isCreating}
          title="Save new lesson to database"
        >
          {isCreating ? 'Creating...' : 'Save New Lesson'}
        </button>
      );
    }
  };

  return (
    <div
      className={`lh-header ${isExpanded ? 'expanded' : ''}`}
      onClick={() => onToggle(sectionIndex, subsectionIndex, lessonIndex)}
    >
      <button
        className={`lh-toggle ${isExpanded ? 'expanded' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggle(sectionIndex, subsectionIndex, lessonIndex);
        }}
      >
        {isExpanded ? '▼' : '▶'}
      </button>

      <LhOrderInput
        value={lesson.order !== undefined ? lesson.order : lessonIndex}
        onChange={onOrderChange}
      />

      <input
        type="text"
        value={lesson.title}
        onChange={onTitleChange}
        className="lh-title-input"
        placeholder="Lesson title"
        onClick={(e) => e.stopPropagation()}
      />

      <LhLessonStatus
        isExisting={isExistingInDatabase(lesson)}
        hasVideoFile={!!lesson.video_file}
        lessonType={lesson.lesson_type}
        isPreview={lesson.is_preview}
        isCreating={isCreating}
        isUpdating={isUpdating}
      />

      <LhLessonActions
        onAddResource={onAddResource}
        onDelete={handleDeleteLesson}
        isAddingResource={isAddingResource}
        isDeleting={isDeleting}
        isExisting={isExistingInDatabase(lesson)}
        getActionButton={getActionButton}
      />
    </div>
  );
};

const LhOrderInput = ({ value, onChange }) => (
  <div className="lh-order-group">
    <label className="lh-order-label">ORDER</label>
    <input
      type="number"
      value={value}
      onChange={onChange}
      className="lh-order-input"
      min="0"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
);

const LhLessonStatus = ({ isExisting, hasVideoFile, lessonType, isPreview, isCreating, isUpdating }) => (
  <div className="lh-status">
    <span className={`lh-status-badge ${isExisting ? 'existing' : 'new'}`}>
      {isExisting ? 'EXISTING' : 'NEW'}
    </span>
    <span className={`lh-type-badge ${lessonType}`}>
      {lessonType?.toUpperCase() || 'LESSON'}
    </span>
    {hasVideoFile && <span className="lh-upload-badge">UPLOADED</span>}
    {isPreview && <span className="lh-preview-badge">PREVIEW</span>}
    {isCreating && <span className="creating-badge">CREATING...</span>}
    {isUpdating && <span className="updating-badge">UPDATING...</span>}
  </div>
);

const LhLessonActions = ({
  onAddResource,
  onDelete,
  isAddingResource,
  isDeleting,
  isExisting,
  getActionButton
}) => (
  <div className="lh-actions" onClick={(e) => e.stopPropagation()}>
    {/* Create/Update Button */}
    {getActionButton()}

    {/* Add Resource Button */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        onAddResource();
      }}
      className="btn-secondary"
      disabled={isAddingResource}
      title="Add resource to lesson"
    >
      {isAddingResource ? 'Adding...' : '+ Resource'}
    </button>

    {/* Delete Button */}
    <button
      onClick={onDelete}
      className="btn-danger"
      disabled={isDeleting}
      title={isExisting ? 'Delete lesson from database' : 'Remove lesson locally'}
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  </div>
);

export default LessonHeader;