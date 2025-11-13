import React, { useCallback, useState } from 'react';

import { createLessonResource, updateLessonResource, deleteLessonResource  } from '../../../api/LessonResourcesApis';
const LessonResource = ({ 
  resource, 
  sectionIndex, 
  subsectionIndex, 
  lessonIndex, 
  resourceIndex, 
  sections, 
  setSections, 
  onUpdate,
  isExistingInDatabase,
  onResourceCreate, // New callback for resource creation
  onResourceUpdate, // New callback for resource update
  onResourceDelete, // New callback for resource deletion
  lessonId // Add lessonId for API calls
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle Create New Resource
  const handleCreateResource = async () => {
    if (isExistingInDatabase(resource)) {
      alert('This resource already exists in the database. Use Update instead.');
      return;
    }

    // Validate required fields
    if (!resource.title?.trim()) {
      alert('Please enter a resource title before saving.');
      return;
    }

    if (!lessonId) {
      alert('Lesson ID is required to create a resource.');
      return;
    }

    if (!resource.file && resource.resource_type !== 'link') {
      alert('Please select a file for this resource.');
      return;
    }

    setIsCreating(true);
    try {
      // Prepare the data for creation
      const resourceData = {
        title: resource.title.trim(),
        resource_type: resource.resource_type || 'document',
        order: resource.order !== undefined ? resource.order : resourceIndex,
        lesson: lessonId,
        // Only include file if it exists and is a File object
        ...(resource.file instanceof File && { file: resource.file })
      };

      console.log('Creating resource with data:', {
        ...resourceData,
        file: resourceData.file ? `File: ${resourceData.file.name}` : 'No file'
      });

      // Create the resource using your API
      const response = await createLessonResource(resourceData);

      // Call the parent callback if provided
      if (onResourceCreate) {
        onResourceCreate(response.data, sectionIndex, subsectionIndex, lessonIndex, resourceIndex);
      }

      alert('Resource created successfully!');
    } catch (error) {
      console.error('Error creating resource:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      alert(`Error creating resource: ${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Update Resource
  const handleUpdateResource = async () => {
    if (!isExistingInDatabase(resource)) {
      alert('Cannot update a resource that is not saved in the database. Please save the resource first.');
      return;
    }

    if (!resource.id) {
      alert('Resource ID is required for update.');
      return;
    }

    setIsUpdating(true);
    try {
      // Prepare the data for update
      const updateData = {
        title: resource.title.trim(),
        resource_type: resource.resource_type || 'document',
        order: resource.order !== undefined ? resource.order : resourceIndex,
        lesson: resource.lesson || lessonId,
        // Only include file if it exists and is a new File object
        ...(resource.file instanceof File && { file: resource.file })
      };

      console.log('Updating resource with data:', {
        ...updateData,
        file: updateData.file ? `File: ${updateData.file.name}` : 'No file'
      });

      // Update the resource using your API
      const response = await updateLessonResource(resource.id, updateData);

      // Call the parent callback if provided
      if (onResourceUpdate) {
        onResourceUpdate(resource.id, response.data);
      }

      alert('Resource updated successfully!');
    } catch (error) {
      console.error('Error updating resource:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      alert(`Error updating resource: ${errorMessage}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Delete Resource
  const handleDeleteResource = async () => {
    if (!isExistingInDatabase(resource)) {
      // If it's not in database, use local deletion
      deleteResourceLocal();
      return;
    }

    if (!resource.id) {
      alert('Resource ID is required for deletion.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      // Delete the resource using your API
      await deleteLessonResource(resource.id);
      
      // Call the parent callback if provided
      if (onResourceDelete) {
        onResourceDelete(resource.id, sectionIndex, subsectionIndex, lessonIndex, resourceIndex);
      }
      
      alert('Resource deleted successfully!');
    } catch (error) {
      console.error('Error deleting resource:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      alert(`Error deleting resource: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Local resource deletion (for resources not in database)
  const deleteResourceLocal = useCallback(() => {
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

  // Local update function (for immediate UI updates)
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

  // Get action button based on resource state
  const getActionButton = () => {
    if (isExistingInDatabase(resource)) {
      return (
        <button
          onClick={handleUpdateResource}
          className="btn-primary btn-small"
          disabled={isUpdating}
          title="Update resource in database"
        >
          {isUpdating ? 'Updating...' : 'Update'}
        </button>
      );
    } else {
      return (
        <button
          onClick={handleCreateResource}
          className="btn-success btn-small"
          disabled={isCreating}
          title="Save new resource to database"
        >
          {isCreating ? 'Creating...' : 'Save'}
        </button>
      );
    }
  };

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
    if (resource.file_name || resource.file) {
      const fileName = resource.file_name || resource.file?.split('/').pop() || 'Unknown file';
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
          {isCreating && <span className="creating-badge">CREATING...</span>}
          {isUpdating && <span className="updating-badge">UPDATING...</span>}
        </div>

        {/* Action Buttons */}
        <div className="resource-actions">
          {getActionButton()}
          <button 
            onClick={handleDeleteResource} 
            className="btn-danger btn-small"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
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
      {isExistingInDatabase(resource) && (resource.file || resource.file_name) && (
        <div className="resource-database-indicator">
          <span className="database-icon">🗃️</span>
          <small>File stored in database</small>
        </div>
      )}
    </div>
  );
};

// Add default props for optional callbacks
LessonResource.defaultProps = {
  onResourceCreate: () => {},
  onResourceUpdate: () => {},
  onResourceDelete: () => {}
};

export default LessonResource;