// LessonMeta.jsx
import React from 'react';

const LessonMeta = ({ lesson, onDurationChange, onPreviewChange }) => {
  return (
    <div className="lesson-meta-grid">
      <div className="meta-field">
        <label>Duration (minutes)</label>
        <input
          type="number"
          value={lesson.duration_minutes || 0}
          onChange={onDurationChange}
          min="0"
          className="meta-input"
        />
      </div>

      <div className="meta-field checkbox-field">
        <label>
          <input
            type="checkbox"
            checked={lesson.is_preview || false}
            onChange={onPreviewChange}
          />
          Preview Lesson
        </label>
      </div>
    </div>
  );
};

export default LessonMeta;