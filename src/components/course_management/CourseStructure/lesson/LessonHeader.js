// LessonHeader.jsx
import React from 'react';

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
  sectionIndex,
  subsectionIndex,
  lessonIndex
}) => {
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
        ▶
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
      />

      <LessonActions 
        onAddResource={onAddResource}
        onDelete={onDelete}
        isAddingResource={isAddingResource}
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

const LessonStatus = ({ isExisting, hasVideoFile }) => (
  <div className="lesson-status">
    <span className={`status-badge ${isExisting ? 'existing' : 'new'}`}>
      {isExisting ? 'EXISTING' : 'NEW'}
    </span>
    {hasVideoFile && <span className="upload-badge">UPLOADED</span>}
  </div>
);

const LessonActions = ({ onAddResource, onDelete, isAddingResource }) => (
  <div className="lesson-actions">
    <button
      onClick={(e) => {
        e.stopPropagation();
        onAddResource();
      }}
      className="btn-secondary"
      disabled={isAddingResource}
    >
      + Add Resource
    </button>
    <button
      onClick={(e) => {
        e.stopPropagation();
        onDelete();
      }}
      className="btn-danger"
    >
      Delete
    </button>
  </div>
);

export default LessonHeader;