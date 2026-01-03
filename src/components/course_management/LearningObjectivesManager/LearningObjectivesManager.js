import React, { useState, useEffect, useCallback } from 'react';
import './LearningObjectivesManager.css';
import { 
  createObjective, 
  updateObjective, 
  deleteObjective, 
  getObjectiveByCourseId 
}  from '../../../api/LearningObjectivesApis';

const LearningObjectivesManager = ({ 
  courseId, 
  courseTitle,
  initialObjectives = [],
  onObjectivesUpdated
}) => {
  const [objectives, setObjectives] = useState([]);
  const [newObjective, setNewObjective] = useState('');
  const [newIcon, setNewIcon] = useState('🎯');
  const [editingObjectiveId, setEditingObjectiveId] = useState(null);
  const [editingObjectiveText, setEditingObjectiveText] = useState('');
  const [editingIcon, setEditingIcon] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Wrap loadObjectives in useCallback to prevent unnecessary re-renders
  const loadObjectives = useCallback(async () => {
    if (!courseId) return;
    
    try {
      setIsLoading(true);
      setError('');
      const response = await getObjectiveByCourseId(courseId);
      setObjectives(response.data || []);
    } catch (error) {
      console.error('Error loading objectives:', error);
      setError('Failed to load learning objectives. Please try again.');
      // Fallback to initial objectives if API fails
      if (initialObjectives && initialObjectives.length > 0) {
        setObjectives(initialObjectives);
      }
    } finally {
      setIsLoading(false);
    }
  }, [courseId, initialObjectives]);

  // Load objectives when component mounts or courseId changes
  useEffect(() => {
    if (courseId) {
      loadObjectives();
    } else {
      setObjectives([]);
    }
  }, [courseId, loadObjectives]);

  // Initialize with initial objectives if provided (fallback)
  useEffect(() => {
    if (initialObjectives && initialObjectives.length > 0 && objectives.length === 0) {
      setObjectives(initialObjectives);
    }
  }, [initialObjectives, objectives.length]);

  const handleAddObjective = async () => {
    if (!newObjective.trim() || !courseId) return;

    const newObjectiveData = {
      objective: newObjective.trim(),
      order: objectives.length,
      icon: newIcon,
      course: courseId
    };

    try {
      setIsLoading(true);
      setError('');
      const response = await createObjective(newObjectiveData);
      
      // Add the new objective (with real ID from backend) to local state
      const addedObjective = response.data;
      const updatedObjectives = [...objectives, addedObjective];
      setObjectives(updatedObjectives);
      
      // Notify parent component if needed
      if (onObjectivesUpdated) {
        onObjectivesUpdated(updatedObjectives);
      }
      
      setNewObjective('');
      setNewIcon('🎯');
      
    } catch (error) {
      console.error('Error adding objective:', error);
      setError('Failed to add learning objective. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateObjective = async (objectiveId, newObjectiveText, newIcon) => {
    if (!newObjectiveText.trim()) return;

    const updateData = {
      objective: newObjectiveText.trim(),
      icon: newIcon
    };

    try {
      setIsLoading(true);
      setError('');
      await updateObjective(objectiveId, updateData);
      
      // Update local state
      const updatedObjectives = objectives.map(obj => 
        obj.id === objectiveId 
          ? { ...obj, objective: updateData.objective, icon: updateData.icon }
          : obj
      );
      
      setObjectives(updatedObjectives);
      
      // Notify parent component
      if (onObjectivesUpdated) {
        onObjectivesUpdated(updatedObjectives);
      }
      
      setEditingObjectiveId(null);
      setEditingObjectiveText('');
      setEditingIcon('');
      
    } catch (error) {
      console.error('Error updating objective:', error);
      setError('Failed to update learning objective. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteObjective = async (objectiveId) => {
    if (!window.confirm('Are you sure you want to delete this learning objective?')) {
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await deleteObjective(objectiveId);
      
      // Update local state
      const updatedObjectives = objectives.filter(obj => obj.id !== objectiveId);
      
      // Update order for remaining objectives
      const reorderedObjectives = updatedObjectives.map((obj, index) => ({
        ...obj,
        order: index
      }));
      
      // Update order on backend
      await Promise.all(
        reorderedObjectives.map(obj => 
          updateObjective(obj.id, { order: obj.order })
        )
      );
      
      setObjectives(reorderedObjectives);
      
      // Notify parent component
      if (onObjectivesUpdated) {
        onObjectivesUpdated(reorderedObjectives);
      }
      
    } catch (error) {
      console.error('Error deleting objective:', error);
      setError('Failed to delete learning objective. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateIconOnly = async (objectiveId, newIcon) => {
    try {
      setError('');
      await updateObjective(objectiveId, { icon: newIcon });
      
      // Update local state
      const updatedObjectives = objectives.map(obj => 
        obj.id === objectiveId 
          ? { ...obj, icon: newIcon }
          : obj
      );
      
      setObjectives(updatedObjectives);
      
      // Notify parent component
      if (onObjectivesUpdated) {
        onObjectivesUpdated(updatedObjectives);
      }
      
    } catch (error) {
      console.error('Error updating icon:', error);
      setError('Failed to update icon. Please try again.');
    }
  };

  const startEditingObjective = (objective) => {    
    setEditingObjectiveId(objective.id);
    setEditingObjectiveText(objective.objective);
    setEditingIcon(objective.icon || '🎯');
  };

  const cancelEditingObjective = () => {    
    setEditingObjectiveId(null);
    setEditingObjectiveText('');
    setEditingIcon('');
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  const handleReorder = async (fromIndex, toIndex) => {
    const reorderedObjectives = [...objectives];
    const [movedObjective] = reorderedObjectives.splice(fromIndex, 1);
    reorderedObjectives.splice(toIndex, 0, movedObjective);
    
    // Update order locally
    const updatedWithOrder = reorderedObjectives.map((obj, index) => ({
      ...obj,
      order: index
    }));
    
    setObjectives(updatedWithOrder);
    
    try {
      // Update order on backend
      await Promise.all(
        updatedWithOrder.map(obj => 
          updateObjective(obj.id, { order: obj.order })
        )
      );
      
      // Notify parent component
      if (onObjectivesUpdated) {
        onObjectivesUpdated(updatedWithOrder);
      }
    } catch (error) {
      console.error('Error reordering objectives:', error);
      setError('Failed to reorder objectives. Please try again.');
      // Revert on error
      loadObjectives();
    }
  };

  if (!courseId) {
    return (
      <div className="learning-objectives-manager">
        <div className="no-course-selected">
          <p>Please select a course to manage learning objectives.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="learning-objectives-manager">
      <div className="objectives-header">
        <h3>Learning Objectives</h3>
        <p>Manage what students will learn in "{courseTitle}"</p>
        <small>Objectives are saved automatically</small>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
          <button 
            onClick={() => setError('')}
            className="error-dismiss"
            type="button"
          >
            ×
          </button>
        </div>
      )}

      {/* Add New Objective */}
      <div className="add-objective-section">
        <div className="input-group">
          <div className="objective-inputs">
            <div className="icon-input-group">
              <label>Icon</label>
              <input
                type="text"
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                placeholder="🎯"
                className="icon-input"
                maxLength="2"
                disabled={isLoading}
              />
            </div>
            <div className="objective-input-group">
              <label>Objective</label>
              <input
                type="text"
                value={newObjective}
                onChange={(e) => setNewObjective(e.target.value)}
                placeholder="Add a new learning objective..."
                onKeyPress={(e) => handleKeyPress(e, handleAddObjective)}
                className="objective-input"
                disabled={isLoading}
              />
            </div>
          </div>
          <button 
            onClick={handleAddObjective}
            disabled={!newObjective.trim() || isLoading}
            className="btn-add"
            type="button"
          >
            {isLoading ? 'Adding...' : 'Add Objective'}
          </button>
        </div>
        <div className="icon-help">
          <small>💡 Tip: Paste any emoji or text as icon (e.g., 🎯, 📚, 💡, 1, 2, A, B)</small>
        </div>
      </div>

      {/* Objectives List */}
      <div className="objectives-list-section">
        <div className="objectives-count">
          {objectives.length} learning objective{objectives.length !== 1 ? 's' : ''}
          {isLoading && <span className="loading-indicator"> (Loading...)</span>}
        </div>
        
        <div className="objectives-list">
          {objectives.map((objective, index) => (
            <div key={objective.id} className="objective-item">
              <div className="objective-number">
                {index + 1}.
                <div className="reorder-controls">
                  <button
                    onClick={() => handleReorder(index, index - 1)}
                    disabled={index === 0 || isLoading}
                    className="btn-reorder btn-reorder-up"
                    title="Move up"
                    type="button"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleReorder(index, index + 1)}
                    disabled={index === objectives.length - 1 || isLoading}
                    className="btn-reorder btn-reorder-down"
                    title="Move down"
                    type="button"
                  >
                    ↓
                  </button>
                </div>
              </div>
              
              {editingObjectiveId === objective.id ? (
                <div className="objective-edit">
                  <div className="edit-inputs">
                    <div className="icon-input-group">
                      <label>Icon</label>
                      <input
                        type="text"
                        value={editingIcon}
                        onChange={(e) => setEditingIcon(e.target.value)}
                        className="icon-input"
                        maxLength="2"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="objective-input-group">
                      <label>Objective</label>
                      <input
                        type="text"
                        value={editingObjectiveText}
                        onChange={(e) => setEditingObjectiveText(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, () => handleUpdateObjective(objective.id, editingObjectiveText, editingIcon))}
                        className="edit-input"
                        autoFocus
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="edit-actions">
                    <button 
                      onClick={() => handleUpdateObjective(objective.id, editingObjectiveText, editingIcon)}
                      disabled={!editingObjectiveText.trim() || isLoading}
                      className="btn-save"
                      type="button"
                    >
                      {isLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button 
                      onClick={cancelEditingObjective}
                      disabled={isLoading}
                      className="btn-cancel"
                      type="button"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="objective-content">
                  <div className="objective-main">
                    <div className="objective-icon-display">
                      <span className="icon">{objective.icon || '🎯'}</span>
                    </div>
                    <span className="objective-text">{objective.objective}</span>
                    <div className="objective-icon-edit">
                      <input
                        type="text"
                        value={objective.icon || ''}
                        onChange={(e) => handleUpdateIconOnly(objective.id, e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            e.stopPropagation();
                          }
                        }}
                        placeholder="🎯"
                        className="icon-input-small"
                        maxLength="2"
                        disabled={isLoading}
                      />
                      <small className="icon-edit-hint">Click to edit icon</small>
                    </div>
                  </div>
                  <div className="objective-actions">
                    <button
                      onClick={() => startEditingObjective(objective)}
                      className="btn-edit"
                      title="Edit objective"
                      disabled={isLoading}
                      type="button"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteObjective(objective.id)}
                      className="btn-delete"
                      title="Delete objective"
                      disabled={isLoading}
                      type="button"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {objectives.length === 0 && !isLoading && (
            <div className="no-objectives">
              <div className="no-objectives-icon">🎯</div>
              <h4>No Learning Objectives Yet</h4>
              <p>Add learning objectives above to let students know what they'll learn in this course.</p>
            </div>
          )}
          
          {objectives.length === 0 && isLoading && (
            <div className="loading-objectives">
              <div className="loading-spinner"></div>
              <p>Loading objectives...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningObjectivesManager;