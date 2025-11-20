// LessonResources.jsx
import React, { useState } from 'react';
import LessonResource from '../LessonResource';

const LessonResources =({
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
    console.log('📚 LessonResources props:', {
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
    <div className="resources-lesson-content-section">
      <ResourcesHeader 
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
            <EmptyResourcesState 
              onAddResource={onAddResource}
              isAddingResource={isAddingResource}
              canAddResources={canAddResources}
            />
          ) : (
            <ResourcesGrid 
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

const ResourcesHeader = ({ 
  resourceCount, 
  onAddResource, 
  isAddingResource, 
  canAddResources,
  isExpanded,
  onToggle 
}) => (
  <div className="resources-header">
    <div className="resources-title">
      <button 
        className={`resources-toggle ${isExpanded ? 'expanded' : ''}`}
        onClick={onToggle}
        aria-label={isExpanded ? 'Collapse resources' : 'Expand resources'}
      >
        <span className="toggle-icon">{isExpanded ? '▼' : '►'}</span>
      </button>
      <h6>Lesson Resources</h6>
      <span className="resource-count">{resourceCount} resource(s)</span>
      {!canAddResources && (
        <span className="resource-warning">
          ⚠️ Save lesson to database before adding resources
        </span>
      )}
    </div>
    <button 
      onClick={onAddResource} 
      className="btn-add-resource" 
      disabled={isAddingResource || !canAddResources}
      title={!canAddResources ? "Save the lesson first to add resources" : "Add resource"}
    >
      {isAddingResource ? 'Adding...' : '+ Add Resource'}
    </button>
  </div>
);

const EmptyResourcesState = ({ onAddResource, isAddingResource, canAddResources }) => (
  <div className="empty-resource-state">
    <div className="empty-resource-icon">📎</div>
    <p>No resources added yet</p>
    <p className="resource-help-text">
      {!canAddResources 
        ? "Save the lesson to the database first to add resources" 
        : "Add your first resource to this lesson"
      }
    </p>
    <button 
      onClick={onAddResource} 
      className="btn-add-resource" 
      disabled={isAddingResource || !canAddResources}
    >
      {!canAddResources ? "Save Lesson First" : "Add First Resource"}
    </button>
  </div>
);

const ResourcesGrid =({
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
  <div className="resources-grid">
    {resources.map((resource, resourceIndex) => (
      <LessonResource
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

export default LessonResources;