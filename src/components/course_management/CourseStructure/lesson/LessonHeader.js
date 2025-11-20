// LessonHeader.jsx
import React, { useState } from 'react';
import { createLesson, updateLesson, deleteLesson } from '../../../../api/LessonsApi';
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
  onLessonUpdate, // New prop for handling lesson updates
  onLessonCreate, // New prop for handling lesson creation
  onLessonDelete, // New prop for handling lesson deletion
  courseId, // Course ID for creating new lessons
  subsectionId, // Subsection ID for creating new lessons
  sectionIndex,
  subsectionIndex,
  lessonIndex
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle Create New Lesson
  // Enhanced validation in LessonHeader.jsx
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
    };

    // Add video file if it exists and is a File object
    if (lesson.video_file instanceof File) {
      lessonData.video_file = lesson.video_file;
    }

    console.log('Creating lesson with data:', {
      ...lessonData,
      video_file: lessonData.video_file ? `File: ${lessonData.video_file.name}` : 'No file'
    });

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
      // Prepare the data for update
      const updateData = {
        title: lesson.title,
        content: lesson.content || '',
        lesson_type: lesson.lesson_type || 'video',
        order: lesson.order !== undefined ? lesson.order : lessonIndex,
        is_preview: lesson.is_preview || false,
        subsection: lesson.subsection || subsectionId,
        video_url: lesson.video_url || '',
        video_duration: lesson.video_duration || 0,
      };

      // Add video file if it exists and is a File object
      if (lesson.video_file instanceof File) {
        updateData.video_file = lesson.video_file;
      }

      // Update the lesson using your API
      const response = await updateLesson(lesson.id, updateData);

      // Call the parent callback if provided
      if (onLessonUpdate) {
        onLessonUpdate(lesson.id, response.data);
      }

      alert('Lesson updated successfully!');
    } catch (error) {
      console.error('Error updating lesson:', error);
      alert('Error updating lesson. Please try again.');
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
          className="lesson-card"
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
        {isExpanded ? '▼' : '▶'}
      </button>

      <OrderInput 
        value={lesson.order !== undefined ? lesson.order : lessonIndex}
        onChange={onOrderChange}
      />

      <input
        type="text"
        value={lesson.title}
        onChange={onTitleChange}
        className="lesson-title-input"
        placeholder="Lesson title"
        onClick={(e) => e.stopPropagation()}
      />

      <LessonStatus 
        isExisting={isExistingInDatabase(lesson)}
        hasVideoFile={!!lesson.video_file}
        lessonType={lesson.lesson_type}
        isPreview={lesson.is_preview}
        isCreating={isCreating}
        isUpdating={isUpdating}
      />

      <LessonActions 
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

const OrderInput = ({ value, onChange }) => (
  <div className="order-input-group">
    <label>ORDER</label>
    <input
      type="number"
      value={value}
      onChange={onChange}
      className="order-input"
      min="0"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
);

const LessonStatus = ({ isExisting, hasVideoFile, lessonType, isPreview, isCreating, isUpdating }) => (
  <div className="lesson-status">
    <span className={`status-badge ${isExisting ? 'existing' : 'new'}`}>
      {isExisting ? 'EXISTING' : 'NEW'}
    </span>
    <span className={`type-badge ${lessonType}`}>
      {lessonType?.toUpperCase() || 'LESSON'}
    </span>
    {hasVideoFile && <span className="upload-badge">UPLOADED</span>}
    {isPreview && <span className="preview-badge">PREVIEW</span>}
    {isCreating && <span className="creating-badge">CREATING...</span>}
    {isUpdating && <span className="updating-badge">UPDATING...</span>}
  </div>
);

const LessonActions = ({ 
  onAddResource, 
  onDelete, 
  isAddingResource, 
  isDeleting,
  isExisting,
  getActionButton
}) => (
  <div className="lesson-actions" onClick={(e) => e.stopPropagation()}>
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