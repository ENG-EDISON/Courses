// StructureHeader.js - Updated version
import React from 'react';
// import "./css/BaseStyles.css"
import "./css/Structure.css"

const StructureHeader = ({
  course,
  courseId,
  counts,
  onAddSection,
  onSaveStructure,
  isAddingSection,
  isSubmitting,
  sectionsCount,
  onExpandAll,
  onCollapseAll,
  hasSections
}) => {
  return (
    <div className="structure-header">
      <div className="header-top">
        <h2>Course Structure</h2>
        {course && (
          <div className="course-info">
            <span className="course-name">{course.title}</span>
            <span className="course-id">ID: {course.id}</span>
          </div>
        )}
      </div>

      {courseId && (
        <div className="header-controls">
          <div className="controls-left">
            <button
              type="button"
              onClick={onAddSection}
              disabled={isAddingSection || !courseId}
              className="btn btn-primary"
            >
              {isAddingSection ? 'Adding...' : '+ Add Section'}
            </button>
            
            {hasSections && (
              <div className="collapse-controls">
                <button
                  type="button"
                  onClick={onExpandAll}
                  className="btn btn-secondary"
                >
                  Expand All
                </button>
                <button
                  type="button"
                  onClick={onCollapseAll}
                  className="btn btn-secondary"
                >
                  Collapse All
                </button>
              </div>
            )}
          </div>

          <div className="controls-right">
            <div className="counts-display">
              {counts.existingSections > 0 && (
                <span className="count-item">
                  Existing: {counts.existingSections}s {counts.existingSubsections}sub
                </span>
              )}
              {counts.newSections > 0 && (
                <span className="count-item new">
                  New: {counts.newSections}s {counts.newSubsections}sub
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onSaveStructure}
              disabled={isSubmitting || sectionsCount === 0}
              className="btn btn-success save-btn"
            >
              {isSubmitting ? 'Saving...' : 'Save Structure'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StructureHeader;