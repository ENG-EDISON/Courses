// LessonResourcesSection.jsx
import React, { useState } from 'react';
import LessonResourceCard from './LessonResourceCard ';
import '../css/LessonResourcesSection.css';
import '../css/Shared.css';

const LessonResourcesSection =({
  lesson,
  sectionIndex,
  subsectionIndex,
  lessonIndex,
  sections,
  setSections,
  onUpdate,
  isExistingInDatabase,
  isAddingResource,
  onAddResource,
  canAddResources,
  onResourceCreate,
  onResourceUpdate,
  onResourceDelete
}) => {
  const [isResourcesExpanded, setIsResourcesExpanded] = useState(true);

  React.useEffect(() => {
    console.log('📚 LessonResourcesSection props:', {
      lessonId: lesson.id,
      resourceCount: lesson.resources?.length || 0,
      hasCreateCallback: !!onResourceCreate,
      hasUpdateCallback: !!onResourceUpdate,
      hasDeleteCallback: !!onResourceDelete
    });
  }, [lesson.id, lesson.resources, onResourceCreate, onResourceUpdate, onResourceDelete]);

  const toggleResources = () => {
    setIsResourcesExpanded(!isResourcesExpanded);
  };

  return (
    <div className="lrs-section">
      <LrsResourcesHeader 
        resourceCount={lesson.resources?.length || 0}
        onAddResource={onAddResource}
        isAddingResource={isAddingResource}
        canAddResources={canAddResources}
        isExpanded={isResourcesExpanded}
        onToggle={toggleResources}
      />

      {isResourcesExpanded && (
        <>
          {(!lesson.resources || lesson.resources.length === 0) ? (
            <LrsEmptyResourcesState 
              onAddResource={onAddResource}
              isAddingResource={isAddingResource}
              canAddResources={canAddResources}
            />
          ) : (
            <LrsResourcesGrid 
              resources={lesson.resources}
              sectionIndex={sectionIndex}
              subsectionIndex={subsectionIndex}
              lessonIndex={lessonIndex}
              sections={sections}
              setSections={setSections}
              onUpdate={onUpdate}
              isExistingInDatabase={isExistingInDatabase}
              lessonId={lesson.id}
              onResourceCreate={onResourceCreate}
              onResourceUpdate={onResourceUpdate}
              onResourceDelete={onResourceDelete}
            />
          )}
        </>
      )}
    </div>
  );
};

const LrsResourcesHeader = ({ 
  resourceCount, 
  onAddResource, 
  isAddingResource, 
  canAddResources,
  isExpanded,
  onToggle 
}) => (
  <div className="lrs-header">
    <div className="lrs-title-section">
      <button 
        className={`lrs-toggle ${isExpanded ? 'expanded' : ''}`}
        onClick={onToggle}
        aria-label={isExpanded ? 'Collapse resources' : 'Expand resources'}
      >
        <span className="toggle-icon">{isExpanded ? '▼' : '►'}</span>
      </button>
      <h6 className="lrs-title">Lesson Resources</h6>
      <span className="lrs-count">{resourceCount} resource(s)</span>
      {!canAddResources && (
        <span className="lrs-warning">
          ⚠️ Save lesson to database before adding resources
        </span>
      )}
    </div>
    <button 
      onClick={onAddResource} 
      className="lrs-add-button" 
      disabled={isAddingResource || !canAddResources}
      title={!canAddResources ? "Save the lesson first to add resources" : "Add resource"}
    >
      {isAddingResource ? 'Adding...' : '+ Add Resource'}
    </button>
  </div>
);

const LrsEmptyResourcesState = ({ onAddResource, isAddingResource, canAddResources }) => (
  <div className="lrs-empty-state">
    <div className="lrs-empty-icon">📎</div>
    <p className="lrs-empty-text">No resources added yet</p>
    <p className="lrs-help-text">
      {!canAddResources 
        ? "Save the lesson to the database first to add resources" 
        : "Add your first resource to this lesson"
      }
    </p>
    <button 
      onClick={onAddResource} 
      className="lrs-add-button" 
      disabled={isAddingResource || !canAddResources}
    >
      {!canAddResources ? "Save Lesson First" : "Add First Resource"}
    </button>
  </div>
);

const LrsResourcesGrid =({
  resources,
  sectionIndex,
  subsectionIndex,
  lessonIndex,
  sections,
  setSections,
  onUpdate,
  isExistingInDatabase,
  lessonId,
  onResourceCreate,
  onResourceUpdate,
  onResourceDelete
}) => (
  <div className="lrs-grid">
    {resources.map((resource, resourceIndex) => (
      <LessonResourceCard
        key={resource.id || `resource-${resourceIndex}`}
        resource={resource}
        sectionIndex={sectionIndex}
        subsectionIndex={subsectionIndex}
        lessonIndex={lessonIndex}
        resourceIndex={resourceIndex}
        sections={sections}
        setSections={setSections}
        onUpdate={onUpdate}
        isExistingInDatabase={isExistingInDatabase}
        lessonId={lessonId}
        onResourceCreate={onResourceCreate}
        onResourceUpdate={onResourceUpdate}
        onResourceDelete={onResourceDelete}
      />
    ))}
  </div>
);

export default LessonResourcesSection;