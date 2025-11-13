import React, { useState } from 'react';
import './DeleteConfirmationModal.css';

const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  itemName, 
  itemType = "course",
  isLoading = false 
}) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleTextChange = (e) => {
    const text = e.target.value;
    setConfirmationText(text);
    setIsConfirmed(text.trim() === itemName);
  };

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm();
      // Reset state when modal closes
      setConfirmationText('');
      setIsConfirmed(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset state when modal closes
    setConfirmationText('');
    setIsConfirmed(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="warning-icon">⚠️</div>
          <h3>Delete {itemType.charAt(0).toUpperCase() + itemType.slice(1)}</h3>
        </div>
        
        <div className="modal-body">
          <p className="warning-message">
            This action <strong>cannot be undone</strong>. This will permanently delete 
            the <strong>"{itemName}"</strong> {itemType} and all associated content.
          </p>
          
          <div className="confirmation-section">
            <label htmlFor="confirmation-input">
              Please type <strong>"{itemName}"</strong> to confirm:
            </label>
            <input
              id="confirmation-input"
              type="text"
              value={confirmationText}
              onChange={handleTextChange}
              placeholder={`Type "${itemName}" here`}
              className="confirmation-input"
              disabled={isLoading}
            />
          </div>

          {isConfirmed && (
            <div className="final-warning">
              ⚠️ You are about to permanently delete this {itemType}. This action cannot be reversed.
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="cancel-btn"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="delete-confirm-btn"
            onClick={handleConfirm}
            disabled={!isConfirmed || isLoading}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
                Deleting...
              </>
            ) : (
              'Yes, Delete Permanently'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;