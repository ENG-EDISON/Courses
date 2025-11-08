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

    console.log('=== DEBUG: Adding New Objective ===');
    console.log('Current objectives count:', learningObjectives.length);
    console.log('New objective text:', newObjective.trim());
    console.log('Selected icon:', newIcon);
    console.log('Course ID:', courseId);

    const newObjectiveObj = {
      id: Date.now(), // Temporary ID for new objectives
      objective: newObjective.trim(),
      order: learningObjectives.length, // Set order based on current count
      icon: newIcon, // Use the icon from input
      course: courseId
    };

    console.log('Created objective object:', newObjectiveObj);

    const updatedObjectives = [...learningObjectives, newObjectiveObj];
    console.log('Updated objectives array:', updatedObjectives);

    onObjectivesChange(updatedObjectives);
    setNewObjective('');
    setNewIcon('🎯'); // Reset to default icon

    console.log('=== DEBUG: Objective Added Successfully ===');
  };

  const handleUpdateObjective = (objectiveId, newObjectiveText, newIcon) => {
    if (!newObjectiveText.trim()) return;

    console.log('=== DEBUG: Updating Objective ===');
    console.log('Objective ID:', objectiveId);
    console.log('New text:', newObjectiveText.trim());
    console.log('New icon:', newIcon);

    const updatedObjectives = learningObjectives.map(obj => 
      obj.id === objectiveId 
        ? { 
            ...obj, 
            objective: newObjectiveText.trim(),
            icon: newIcon 
          }
        : obj
    );

    console.log('Updated objectives:', updatedObjectives);
    onObjectivesChange(updatedObjectives);
    setEditingObjectiveId(null);
    setEditingObjectiveText('');
    setEditingIcon('');

    console.log('=== DEBUG: Objective Updated Successfully ===');
  };

  const handleDeleteObjective = (objectiveId) => {
    if (!window.confirm('Are you sure you want to delete this learning objective?')) {
      return;
    }

    console.log('=== DEBUG: Deleting Objective ===');
    console.log('Objective ID to delete:', objectiveId);

    const updatedObjectives = learningObjectives.filter(obj => obj.id !== objectiveId);
    console.log('Objectives after deletion:', updatedObjectives);
    
    onObjectivesChange(updatedObjectives);

    console.log('=== DEBUG: Objective Deleted Successfully ===');
  };

  const handleUpdateIconOnly = (objectiveId, newIcon) => {
    console.log('=== DEBUG: Updating Objective Icon Only ===');
    console.log('Objective ID:', objectiveId);
    console.log('New icon:', newIcon);

    const updatedObjectives = learningObjectives.map(obj => 
      obj.id === objectiveId 
        ? { ...obj, icon: newIcon }
        : obj
    );

    console.log('Objectives after icon update:', updatedObjectives);
    onObjectivesChange(updatedObjectives);

    console.log('=== DEBUG: Icon Updated Successfully ===');
  };

  const startEditingObjective = (objective) => {
    console.log('=== DEBUG: Starting Objective Edit ===');
    console.log('Editing objective:', objective);
    
    setEditingObjectiveId(objective.id);
    setEditingObjectiveText(objective.objective);
    setEditingIcon(objective.icon || '🎯');

    console.log('=== DEBUG: Edit Mode Activated ===');
  };

  const cancelEditingObjective = () => {
    console.log('=== DEBUG: Canceling Objective Edit ===');
    
    setEditingObjectiveId(null);
    setEditingObjectiveText('');
    setEditingIcon('');

    console.log('=== DEBUG: Edit Mode Canceled ===');
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      console.log('=== DEBUG: Enter Key Pressed - Triggering Action ===');
      action();
    }
  };

  // Debug current state
  useEffect(() => {
    console.log('=== DEBUG: LearningObjectivesManager State Update ===');
    console.log('Course ID:', courseId);
    console.log('Course Title:', courseTitle);
    console.log('Current Objectives:', learningObjectives);
    console.log('Objectives Count:', learningObjectives.length);
    console.log('New Objective Input:', newObjective);
    console.log('New Icon Input:', newIcon);
    console.log('Editing Objective ID:', editingObjectiveId);
    console.log('Editing Objective Text:', editingObjectiveText);
    console.log('Editing Icon:', editingIcon);
    console.log('=== DEBUG: State Update Complete ===');
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
                  console.log('=== DEBUG: New Icon Input Change ===');
                  console.log('New icon value:', e.target.value);
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
                  console.log('=== DEBUG: Objective Input Change ===');
                  console.log('New objective value:', e.target.value);
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
              console.log('=== DEBUG: Add Objective Button Clicked ===');
              console.log('Button enabled:', !newObjective.trim());
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
                          console.log('=== DEBUG: Edit Icon Input Change ===');
                          console.log('New edit icon value:', e.target.value);
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
                          console.log('=== DEBUG: Edit Input Change ===');
                          console.log('New edit value:', e.target.value);
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
                        console.log('=== DEBUG: Save Edit Button Clicked ===');
                        handleUpdateObjective(objective.id, editingObjectiveText, editingIcon);
                      }}
                      disabled={!editingObjectiveText.trim()}
                      className="btn-save"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => {
                        console.log('=== DEBUG: Cancel Edit Button Clicked ===');
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
                          console.log('=== DEBUG: Quick Icon Edit ===');
                          console.log('New quick icon:', e.target.value);
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
                        console.log('=== DEBUG: Edit Button Clicked ===');
                        startEditingObjective(objective);
                      }}
                      className="btn-edit"
                      title="Edit objective"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => {
                        console.log('=== DEBUG: Delete Button Clicked ===');
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