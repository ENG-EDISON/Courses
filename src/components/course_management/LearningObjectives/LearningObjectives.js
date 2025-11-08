// src/components/course-management/LearningObjectives/LearningObjectives.js
import React, { useState } from 'react';
// import './LearningObjectives.css';

const LearningObjectives = ({ courseId, objectives = [], onUpdate }) => {
  const [learningObjectives, setLearningObjectives] = useState(objectives);
  const [newObjective, setNewObjective] = useState('');

  const addObjective = () => {
    if (newObjective.trim()) {
      const objective = {
        objective: newObjective.trim(),
        order: learningObjectives.length,
        icon: '✔',
        course: courseId
      };
      const updatedObjectives = [...learningObjectives, objective];
      setLearningObjectives(updatedObjectives);
      setNewObjective('');
      onUpdate(updatedObjectives);
    }
  };

  const removeObjective = (index) => {
    const updatedObjectives = learningObjectives.filter((_, i) => i !== index);
    setLearningObjectives(updatedObjectives);
    onUpdate(updatedObjectives);
  };

  const updateObjective = (index, newText) => {
    const updatedObjectives = learningObjectives.map((obj, i) => 
      i === index ? { ...obj, objective: newText } : obj
    );
    setLearningObjectives(updatedObjectives);
    onUpdate(updatedObjectives);
  };

  return (
    <div className="learning-objectives">
      <h3>Learning Objectives</h3>
      <p>What will students learn in this course?</p>
      
      <div className="objectives-list">
        {learningObjectives.map((objective, index) => (
          <div key={index} className="objective-item">
            <span className="objective-icon">{objective.icon}</span>
            <input
              type="text"
              value={objective.objective}
              onChange={(e) => updateObjective(index, e.target.value)}
              className="objective-input"
              placeholder="Enter learning objective"
            />
            <button
              onClick={() => removeObjective(index)}
              className="remove-objective"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="add-objective">
        <input
          type="text"
          value={newObjective}
          onChange={(e) => setNewObjective(e.target.value)}
          placeholder="Add a new learning objective"
          onKeyPress={(e) => e.key === 'Enter' && addObjective()}
        />
        <button onClick={addObjective} className="btn-primary">
          Add Objective
        </button>
      </div>
    </div>
  );
};

export default LearningObjectives;