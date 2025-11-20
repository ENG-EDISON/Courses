// LessonMeta.jsx
import React from 'react';

const LessonMeta = ({ lesson, onDurationChange, onPreviewChange }) => {
  return (
    <div className="lesson-meta-compact">
      <div className="meta-compact-group">
        <div className="meta-compact-field">
          <label>Duration (min)</label>
          <input
            type="number"
            value={lesson.duration_minutes || 0}
            onChange={onDurationChange}
            min="0"
            className="meta-compact-input"
            placeholder="0"
          />
        </div>

        <div className="meta-compact-checkbox">
          <label className="compact-checkbox-label">
            <input
              type="checkbox"
              checked={lesson.is_preview || false}
              onChange={onPreviewChange}
            />
            <span className="compact-checkmark"></span>
            Preview Lesson
          </label>
        </div>
      </div>
    </div>
  );
};

export default LessonMeta;