// LessonResources.jsx
import React from 'react';
import LessonResource from '../LessonResource';

const LessonResources = ({
  lesson,
  sectionIndex,
  subsectionIndex,
  lessonIndex,
  sections,
  setSections,
  onUpdate,
  isExistingInDatabase,
  isAddingResource,
  onAddResource
}) => {
  return (
    <div className="lesson-content-section">
      <ResourcesHeader 
        resourceCount={lesson.resources?.length || 0}
        onAddResource={onAddResource}
        isAddingResource={isAddingResource}
      />

      {(!lesson.resources || lesson.resources.length === 0) ? (
        <EmptyResourcesState 
          onAddResource={onAddResource}
          isAddingResource={isAddingResource}
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
        />
      )}
    </div>
  );
};

const ResourcesHeader = ({ resourceCount, onAddResource, isAddingResource }) => (
  <div className="resources-header">
    <div className="resources-title">
      <h6>Lesson Resources</h6>
      <span className="resource-count">{resourceCount} resource(s)</span>
    </div>
    <button onClick={onAddResource} className="btn-primary btn-sm" disabled={isAddingResource}>
      {isAddingResource ? 'Adding...' : '+ Add Resource'}
    </button>
  </div>
);

const EmptyResourcesState = ({ onAddResource, isAddingResource }) => (
  <div className="empty-resource-state">
    <div className="empty-resource-icon">📎</div>
    <p>No resources added yet</p>
    <button onClick={onAddResource} className="btn-primary" disabled={isAddingResource}>
      Add First Resource
    </button>
  </div>
);

const ResourcesGrid = ({
  resources,
  sectionIndex,
  subsectionIndex,
  lessonIndex,
  sections,
  setSections,
  onUpdate,
  isExistingInDatabase
}) => (
  <div className="resources-grid">
    {resources.map((resource, resourceIndex) => (
      <LessonResource
        key={resource.id || resourceIndex}
        resource={resource}
        sectionIndex={sectionIndex}
        subsectionIndex={subsectionIndex}
        lessonIndex={lessonIndex}
        resourceIndex={resourceIndex}
        sections={sections}
        setSections={setSections}
        onUpdate={onUpdate}
        isExistingInDatabase={isExistingInDatabase}
      />
    ))}
  </div>
);

export default LessonResources;