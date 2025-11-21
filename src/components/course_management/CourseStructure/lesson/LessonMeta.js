// LessonMeta.jsx
import React from 'react';
import '../css/LessonMeta.css';

const LessonMeta = ({ lesson, onDurationChange, onPreviewChange }) => {
  return (
    <div className="lm-compact">
      <div className="lm-compact-group">
        <div className="lm-compact-field">
          <label className="lm-compact-label">Duration (min)</label>
          <input
            type="number"
            value={lesson.duration_minutes || 0}
            onChange={onDurationChange}
            min="0"
            className="lm-compact-input"
            placeholder="0"
          />
        </div>

        <div className="lm-compact-checkbox">
          <label className="lm-checkbox-label">
            <input
              type="checkbox"
              checked={lesson.is_preview || false}
              onChange={onPreviewChange}
            />
            <span className="lm-checkmark"></span>
            Preview Lesson
          </label>
        </div>
      </div>
    </div>
  );
};

export default LessonMeta;