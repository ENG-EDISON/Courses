import React, { useState, useEffect } from 'react';
import './LearningObjectivesManager.css';

const LearningObjectivesManager = ({ 
  courseId, 
  courseTitle, 
  learningObjectives = [], 
  onObjectivesChange 
}) => {
  const [newObjective, setNewObjective] = useState('');
  const [newIcon, setNewIcon] = useState('🎯'); // Default icon
  const [editingObjectiveId, setEditingObjectiveId] = useState(null);
  const [editingObjectiveText, setEditingObjectiveText] = useState('');
  const [editingIcon, setEditingIcon] = useState('');

  // Learning Objectives Management - Now working with the object structure
  const handleAddObjective = () => {
    if (!newObjective.trim() || !courseId) return;

    const newObjectiveObj = {
      id: Date.now(), // Temporary ID for new objectives
      objective: newObjective.trim(),
      order: learningObjectives.length, // Set order based on current count
      icon: newIcon, // Use the icon from input
      course: courseId
    };


    const updatedObjectives = [...learningObjectives, newObjectiveObj];

    onObjectivesChange(updatedObjectives);
    setNewObjective('');
    setNewIcon('🎯'); // Reset to default icon
  };

  const handleUpdateObjective = (objectiveId, newObjectiveText, newIcon) => {
    if (!newObjectiveText.trim()) return;
    const updatedObjectives = learningObjectives.map(obj => 
      obj.id === objectiveId 
        ? { 
            ...obj, 
            objective: newObjectiveText.trim(),
            icon: newIcon 
          }
        : obj
    );

    onObjectivesChange(updatedObjectives);
    setEditingObjectiveId(null);
    setEditingObjectiveText('');
    setEditingIcon('');

  };

  const handleDeleteObjective = (objectiveId) => {
    if (!window.confirm('Are you sure you want to delete this learning objective?')) {
      return;
    }


    const updatedObjectives = learningObjectives.filter(obj => obj.id !== objectiveId);

    onObjectivesChange(updatedObjectives);
  };

  const handleUpdateIconOnly = (objectiveId, newIcon) => {
    const updatedObjectives = learningObjectives.map(obj => 
      obj.id === objectiveId 
        ? { ...obj, icon: newIcon }
        : obj
    );

    onObjectivesChange(updatedObjectives);
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

  // Debug current state
  useEffect(() => {
  }, [learningObjectives, newObjective, newIcon, editingObjectiveId, editingObjectiveText, editingIcon, courseId, courseTitle]);

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
        <small>Objectives will be saved when you update the course</small>
      </div>

      {/* Add New Objective */}
      <div className="add-objective-section">
        <div className="input-group">
          <div className="objective-inputs">
            <div className="icon-input-group">
              <label>Icon</label>
              <input
                type="text"
                value={newIcon}
                onChange={(e) => {
                  setNewIcon(e.target.value);
                }}
                placeholder="🎯"
                className="icon-input"
                maxLength="2"
              />
            </div>
            <div className="objective-input-group">
              <label>Objective</label>
              <input
                type="text"
                value={newObjective}
                onChange={(e) => {
                  setNewObjective(e.target.value);
                }}
                placeholder="Add a new learning objective..."
                onKeyPress={(e) => handleKeyPress(e, handleAddObjective)}
                className="objective-input"
              />
            </div>
          </div>
          <button 
            onClick={() => {
              handleAddObjective();
            }}
            disabled={!newObjective.trim()}
            className="btn-add"
          >
            Add Objective
          </button>
        </div>
        <div className="icon-help">
          <small>💡 Tip: Paste any emoji or text as icon (e.g., 🎯, 📚, 💡, 1, 2, A, B)</small>
        </div>
      </div>

      {/* Objectives List */}
      <div className="objectives-list-section">
        <div className="objectives-count">
          {learningObjectives.length} learning objective{learningObjectives.length !== 1 ? 's' : ''}
        </div>
        
        <div className="objectives-list">
          {learningObjectives.map((objective, index) => (
            <div key={objective.id} className="objective-item">
              <div className="objective-number">{index + 1}.</div>
              
              {editingObjectiveId === objective.id ? (
                <div className="objective-edit">
                  <div className="edit-inputs">
                    <div className="icon-input-group">
                      <label>Icon</label>
                      <input
                        type="text"
                        value={editingIcon}
                        onChange={(e) => {
                          setEditingIcon(e.target.value);
                        }}
                        className="icon-input"
                        maxLength="2"
                      />
                    </div>
                    <div className="objective-input-group">
                      <label>Objective</label>
                      <input
                        type="text"
                        value={editingObjectiveText}
                        onChange={(e) => {
                          setEditingObjectiveText(e.target.value);
                        }}
                        onKeyPress={(e) => handleKeyPress(e, () => handleUpdateObjective(objective.id, editingObjectiveText, editingIcon))}
                        className="edit-input"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="edit-actions">
                    <button 
                      onClick={() => {
                        handleUpdateObjective(objective.id, editingObjectiveText, editingIcon);
                      }}
                      disabled={!editingObjectiveText.trim()}
                      className="btn-save"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => {
                        cancelEditingObjective();
                      }}
                      className="btn-cancel"
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
                        onChange={(e) => {
                          handleUpdateIconOnly(objective.id, e.target.value);
                        }}
                        placeholder="🎯"
                        className="icon-input-small"
                        maxLength="2"
                      />
                    </div>
                  </div>
                  <div className="objective-actions">
                    <button
                      onClick={() => {
                        startEditingObjective(objective);
                      }}
                      className="btn-edit"
                      title="Edit objective"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteObjective(objective.id);
                      }}
                      className="btn-delete"
                      title="Delete objective"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {learningObjectives.length === 0 && (
            <div className="no-objectives">
              <div className="no-objectives-icon">🎯</div>
              <h4>No Learning Objectives Yet</h4>
              <p>Add learning objectives above to let students know what they'll learn in this course.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningObjectivesManager;