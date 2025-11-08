import React, { useCallback } from 'react';

const LessonResource = ({ 
  resource, 
  sectionIndex, 
  subsectionIndex, 
  lessonIndex, 
  resourceIndex, 
  sections, 
  setSections, 
  onUpdate,
  isExistingInDatabase 
}) => {
  const updateResource = useCallback((field, value) => {
    const updatedSections = sections.map((section, secIndex) => {
      if (secIndex === sectionIndex) {
        const updatedSubsections = section.subsections.map((sub, subIdx) => {
          if (subIdx === subsectionIndex) {
            const updatedLessons = sub.lessons.map((les, lesIdx) => {
              if (lesIdx === lessonIndex) {
                const updatedResources = les.resources.map((res, resIdx) =>
                  resIdx === resourceIndex ? { ...res, [field]: value } : res
                );
                return { ...les, resources: updatedResources };
              }
              return les;
            });
            return { ...sub, lessons: updatedLessons };
          }
          return sub;
        });
        return { ...section, subsections: updatedSubsections };
      }
      return section;
    });
    setSections(updatedSections);
    onUpdate(updatedSections);
  }, [sectionIndex, subsectionIndex, lessonIndex, resourceIndex, sections, setSections, onUpdate]);

  const deleteResource = useCallback(() => {
    const resourceToDelete = sections[sectionIndex]?.subsections[subsectionIndex]?.lessons[lessonIndex]?.resources[resourceIndex];
    
    if (resourceToDelete?.id) {
      if (window.confirm('This resource exists in the database. Do you want to delete it permanently?')) {
        console.log('Should delete existing resource from database:', resourceToDelete.id);
        // TODO: Call delete API for existing resource
      } else {
        return;
      }
    }
    
    const updatedSections = sections.map((section, secIndex) => {
      if (secIndex === sectionIndex) {
        const updatedSubsections = section.subsections.map((sub, subIdx) => {
          if (subIdx === subsectionIndex) {
            const updatedLessons = sub.lessons.map((les, lesIdx) => {
              if (lesIdx === lessonIndex) {
                const updatedResources = les.resources.filter((_, resIdx) => resIdx !== resourceIndex);
                return { ...les, resources: updatedResources };
              }
              return les;
            });
            return { ...sub, lessons: updatedLessons };
          }
          return sub;
        });
        return { ...section, subsections: updatedSubsections };
      }
      return section;
    });
    setSections(updatedSections);
    onUpdate(updatedSections);
  }, [sectionIndex, subsectionIndex, lessonIndex, resourceIndex, sections, setSections, onUpdate]);

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      updateResource('file', file);
      // Only set title from filename if title is empty or same as previous file
      if (!resource.title || resource.title === resource.file?.name) {
        updateResource('title', file.name);
      }
    }
  }, [resource, updateResource]);

  const handleTitleChange = useCallback((e) => {
    updateResource('title', e.target.value);
  }, [updateResource]);

  const handleResourceTypeChange = useCallback((e) => {
    updateResource('resource_type', e.target.value);
  }, [updateResource]);

  // Helper to get file info for display
  const getFileInfo = () => {
    // Case 1: New file selected but not uploaded yet
    if (resource.file && resource.file instanceof File) {
      const sizeInMB = resource.file.size ? (resource.file.size / (1024 * 1024)).toFixed(2) : 'Unknown';
      const fileType = resource.file.type || resource.file.name?.split('.').pop() || 'Unknown';
      
      return {
        name: resource.file.name,
        size: `${sizeInMB} MB`,
        type: fileType
      };
    }
    
    // Case 2: Existing file from database
    if (resource.file_name) {
      const fileName = resource.file_name.split('/').pop() || 'Unknown file';
      let sizeInMB = 'Unknown';
      
      if (resource.file_size) {
        sizeInMB = (resource.file_size / (1024 * 1024)).toFixed(2);
      }
      
      const fileType = resource.file_type || fileName.split('.').pop() || 'Unknown';
      
      return {
        name: fileName,
        size: `${sizeInMB} MB`,
        type: fileType
      };
    }
    
    // Case 3: No file info available
    return null;
  };

  const fileInfo = getFileInfo();

  return (
    <div className={`resource-card ${isExistingInDatabase(resource) ? 'existing-resource' : 'new-resource'}`}>
      <div className="resource-header">
        {/* Order Input for Resource */}
        <div className="order-input-group">
          <label>ORDER</label>
          <input
            type="number"
            value={resource.order !== undefined ? resource.order : resourceIndex}
            onChange={(e) => updateResource('order', parseInt(e.target.value) || 0)}
            className="order-input"
            min="0"
          />
        </div>

        <input
          type="text"
          value={resource.title}
          onChange={handleTitleChange}
          placeholder="Resource title"
          className="resource-title-input"
        />
        
        <select
          value={resource.resource_type || 'document'}
          onChange={handleResourceTypeChange}
          className="resource-type-select"
        >
          <option value="document">Document</option>
          <option value="presentation">Presentation</option>
          <option value="spreadsheet">Spreadsheet</option>
          <option value="image">Image</option>
          <option value="code">Code</option>
          <option value="link">External Link</option>
        </select>
        
        <div className="resource-status">
          <span className={`status-badge ${isExistingInDatabase(resource) ? 'existing' : 'new'}`}>
            {isExistingInDatabase(resource) ? 'EXISTING' : 'NEW'}
          </span>
        </div>
        
        <button onClick={deleteResource} className="btn-danger">
          Delete
        </button>
      </div>

      {/* File Upload Section */}
      <div className="file-upload-section">
        {!fileInfo ? (
          <div className="file-upload-area">
            <input
              type="file"
              onChange={handleFileUpload}
              className="file-upload-input"
              id={`resource-file-${sectionIndex}-${subsectionIndex}-${lessonIndex}-${resourceIndex}`}
            />
            <label 
              htmlFor={`resource-file-${sectionIndex}-${subsectionIndex}-${lessonIndex}-${resourceIndex}`}
              className="file-upload-label btn-secondary"
            >
              📁 Choose File
            </label>
          </div>
        ) : (
          <div className="file-info">
            <div className="file-name-display">
              <strong>File:</strong> {fileInfo.name}
            </div>
            <div className="file-details">
              <span className="file-size">Size: {fileInfo.size}</span>
              <span className="file-type">Type: {fileInfo.type}</span>
            </div>
            {!isExistingInDatabase(resource) && (
              <button 
                type="button" 
                onClick={() => {
                  updateResource('file', null);
                  if (resource.title === resource.file?.name) {
                    updateResource('title', '');
                  }
                }}
                className="btn-secondary btn-small"
              >
                Change File
              </button>
            )}
          </div>
        )}
      </div>

      {/* Show database indicator for existing resources */}
      {isExistingInDatabase(resource) && resource.file && (
        <div className="resource-database-indicator">
          <span className="database-icon">🗃️</span>
          <small>File stored in database</small>
        </div>
      )}
    </div>
  );
};

export default LessonResource;