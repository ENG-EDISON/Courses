import React, { useState, useEffect, useRef } from 'react';
import { 
  getAllTestimonials, 
  approveTestimonial, 
  rejectTestimonial, 
  featureTestimonial,
  deleteTestimonial,
  createTestimonial,
  updateTestimonial
} from '../api/TestimonialsApi';
import "../static/AdminTestimonials.css"

const TestimonialsManagement = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTestimonials, setSelectedTestimonials] = useState([]);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  
  // Confirmation popup state
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: null,
    onCancel: null,
  });
  
  // Form states
  const [newTestimonial, setNewTestimonial] = useState({
    quote: '',
    author_name: '',
    author_role: '',
    author_company: '',
    is_verified: false,
    status: 'pending'
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  
  const fileInputRef = useRef(null);

  // Fetch testimonials
  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await getAllTestimonials();
      // Map the API response to match our data structure
      const mappedTestimonials = response.data.map(item => ({
        id: item.id,
        quote: item.quote,
        author_name: item.author_name || item.author_info?.name,
        author_role: item.author_role || item.author_info?.role,
        author_company: item.author_company || item.author_info?.company,
        author_photo: item.author_photo,
        photo_url: item.photo_url || item.author_photo,
        is_verified: item.is_verified,
        status: item.status || 'pending',
        is_featured: item.is_featured || false,
        created_at: item.created_at
      }));
      setTestimonials(mappedTestimonials);
      setError(null);
    } catch (err) {
      setError('Failed to load testimonials');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Custom confirm function
  const showCustomConfirm = (config) => {
    return new Promise((resolve) => {
      setConfirmConfig({
        ...config,
        onConfirm: () => {
          setShowConfirm(false);
          resolve(true);
        },
        onCancel: () => {
          setShowConfirm(false);
          resolve(false);
        },
      });
      setShowConfirm(true);
    });
  };

  // Handle photo file selection
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
    }
  };

  // Remove photo
  const handleRemovePhoto = () => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Add Testimonial handlers
  const handleAddTestimonial = () => {
    setShowAddModal(true);
    setSubmitStatus(null);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingTestimonial(null);
    setNewTestimonial({
      quote: '',
      author_name: '',
      author_role: '',
      author_company: '',
      is_verified: false,
      status: 'pending'
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setSubmitStatus(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Edit Testimonial handlers
  const handleEditTestimonial = (testimonial) => {
    setEditingTestimonial(testimonial);
    setNewTestimonial({
      quote: testimonial.quote,
      author_name: testimonial.author_name,
      author_role: testimonial.author_role || '',
      author_company: testimonial.author_company || '',
      is_verified: testimonial.is_verified,
      status: testimonial.status
    });
    if (testimonial.photo_url) {
      setPhotoPreview(testimonial.photo_url);
    }
    setShowEditModal(true);
    setSubmitStatus(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewTestimonial(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Submit testimonial (Create or Update)
  const handleSubmitTestimonial = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!newTestimonial.quote.trim() || !newTestimonial.author_name.trim()) {
      setSubmitStatus({ type: 'error', message: 'Quote and Author Name are required' });
      return;
    }

    setSubmitting(true);
    
    try {
      // Create FormData to handle file upload
      const formData = new FormData();
      
      // Add text fields
      formData.append('quote', newTestimonial.quote);
      formData.append('author_name', newTestimonial.author_name);
      formData.append('author_role', newTestimonial.author_role || '');
      formData.append('author_company', newTestimonial.author_company || '');
      formData.append('is_verified', newTestimonial.is_verified);
      formData.append('status', newTestimonial.status);
      
      // Add photo file if exists (only if new file selected)
      if (photoFile) {
        formData.append('author_photo', photoFile);
      }
      
      let response;
      if (editingTestimonial) {
        // Update existing testimonial
        response = await updateTestimonial(editingTestimonial.id, formData);
        
        // Update in state
        setTestimonials(testimonials.map(t => 
          t.id === editingTestimonial.id ? {
            ...t,
            quote: response.data.quote,
            author_name: response.data.author_name,
            author_role: response.data.author_role,
            author_company: response.data.author_company,
            is_verified: response.data.is_verified,
            status: response.data.status,
            photo_url: response.data.author_photo || response.data.photo_url || t.photo_url
          } : t
        ));
        
        setSubmitStatus({ 
          type: 'success', 
          message: 'Testimonial updated successfully!' 
        });
      } else {
        // Create new testimonial
        response = await createTestimonial(formData);
        
        // Add the new testimonial to the list
        const newTestimonialData = {
          id: response.data.id,
          quote: response.data.quote,
          author_name: response.data.author_name,
          author_role: response.data.author_role,
          author_company: response.data.author_company,
          author_photo: response.data.author_photo,
          photo_url: response.data.author_photo || response.data.photo_url,
          is_verified: response.data.is_verified,
          status: response.data.status,
          is_featured: response.data.is_featured || false,
          created_at: response.data.created_at
        };
        
        setTestimonials(prev => [newTestimonialData, ...prev]);
        
        setSubmitStatus({ 
          type: 'success', 
          message: 'Testimonial added successfully!' 
        });
      }
      
      // Reset form and close modal after 1.5 seconds
      setTimeout(() => {
        handleCloseModal();
      }, 1500);
      
    } catch (err) {
      console.error('Error saving testimonial:', err);
      let errorMessage = `Failed to ${editingTestimonial ? 'update' : 'add'} testimonial. Please try again.`;
      
      if (err.response?.data) {
        // Handle Django validation errors
        if (typeof err.response.data === 'object') {
          const errors = Object.values(err.response.data).flat();
          errorMessage = errors.join(', ');
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        }
      }
      
      setSubmitStatus({ 
        type: 'error', 
        message: errorMessage 
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle testimonial status updates
  const handleApprove = async (id) => {
    try {
      await approveTestimonial(id);
      setTestimonials(testimonials.map(testimonial => 
        testimonial.id === id 
          ? { ...testimonial, status: 'approved' } 
          : testimonial
      ));
    } catch (err) {
      console.error('Error approving testimonial:', err);
      // Show error in custom popup
      showCustomConfirm({
        title: 'Error',
        message: 'Failed to approve testimonial. Please try again.',
        type: 'danger',
        confirmText: 'OK',
        cancelText: null,
      });
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectTestimonial(id);
      setTestimonials(testimonials.map(testimonial => 
        testimonial.id === id 
          ? { ...testimonial, status: 'rejected' } 
          : testimonial
      ));
    } catch (err) {
      console.error('Error rejecting testimonial:', err);
      showCustomConfirm({
        title: 'Error',
        message: 'Failed to reject testimonial. Please try again.',
        type: 'danger',
        confirmText: 'OK',
        cancelText: null,
      });
    }
  };

  const handleFeature = async (id) => {
    try {
      await featureTestimonial(id);
      setTestimonials(testimonials.map(testimonial => 
        testimonial.id === id 
          ? { ...testimonial, status: 'featured', is_featured: true } 
          : testimonial
      ));
    } catch (err) {
      console.error('Error featuring testimonial:', err);
      showCustomConfirm({
        title: 'Error',
        message: 'Failed to feature testimonial. Please try again.',
        type: 'danger',
        confirmText: 'OK',
        cancelText: null,
      });
    }
  };

  const handleUnfeature = async (id) => {
    const confirmed = await showCustomConfirm({
      title: 'Remove Featured Status',
      message: 'Are you sure you want to remove featured status from this testimonial?',
      type: 'warning',
      confirmText: 'Remove',
      cancelText: 'Cancel',
    });
    
    if (!confirmed) return;

    try {
      // Create a simple update to remove featured status
      const formData = new FormData();
      formData.append('status', 'approved');
      formData.append('is_featured', false);
      
      await updateTestimonial(id, formData);
      
      setTestimonials(testimonials.map(testimonial => 
        testimonial.id === id 
          ? { ...testimonial, status: 'approved', is_featured: false } 
          : testimonial
      ));
    } catch (err) {
      console.error('Error unfeaturing testimonial:', err);
      showCustomConfirm({
        title: 'Error',
        message: 'Failed to remove featured status. Please try again.',
        type: 'danger',
        confirmText: 'OK',
        cancelText: null,
      });
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showCustomConfirm({
      title: 'Delete Testimonial',
      message: 'Are you sure you want to delete this testimonial? This action cannot be undone.',
      type: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });
    
    if (!confirmed) return;

    try {
      await deleteTestimonial(id);
      setTestimonials(testimonials.filter(testimonial => testimonial.id !== id));
    } catch (err) {
      console.error('Error deleting testimonial:', err);
      showCustomConfirm({
        title: 'Error',
        message: 'Failed to delete testimonial. Please try again.',
        type: 'danger',
        confirmText: 'OK',
        cancelText: null,
      });
    }
  };

  // Bulk actions
  const handleBulkApprove = async () => {
    if (!selectedTestimonials.length) return;
    
    const confirmed = await showCustomConfirm({
      title: 'Approve Multiple Testimonials',
      message: `Are you sure you want to approve ${selectedTestimonials.length} selected testimonials?`,
      type: 'warning',
      confirmText: 'Approve All',
      cancelText: 'Cancel',
    });
    
    if (!confirmed) return;

    try {
      for (const id of selectedTestimonials) {
        await approveTestimonial(id);
      }
      
      setTestimonials(testimonials.map(testimonial => 
        selectedTestimonials.includes(testimonial.id)
          ? { ...testimonial, status: 'approved' }
          : testimonial
      ));
      
      setSelectedTestimonials([]);
    } catch (err) {
      console.error('Error bulk approving:', err);
      showCustomConfirm({
        title: 'Error',
        message: 'Failed to approve testimonials. Please try again.',
        type: 'danger',
        confirmText: 'OK',
        cancelText: null,
      });
    }
  };

  const handleBulkFeature = async () => {
    if (!selectedTestimonials.length) return;
    
    const confirmed = await showCustomConfirm({
      title: 'Feature Multiple Testimonials',
      message: `Are you sure you want to feature ${selectedTestimonials.length} selected testimonials?`,
      type: 'warning',
      confirmText: 'Feature All',
      cancelText: 'Cancel',
    });
    
    if (!confirmed) return;

    try {
      for (const id of selectedTestimonials) {
        await featureTestimonial(id);
      }
      
      setTestimonials(testimonials.map(testimonial => 
        selectedTestimonials.includes(testimonial.id)
          ? { ...testimonial, status: 'featured', is_featured: true }
          : testimonial
      ));
      
      setSelectedTestimonials([]);
    } catch (err) {
      console.error('Error bulk featuring:', err);
      showCustomConfirm({
        title: 'Error',
        message: 'Failed to feature testimonials. Please try again.',
        type: 'danger',
        confirmText: 'OK',
        cancelText: null,
      });
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedTestimonials.length) return;
    
    const confirmed = await showCustomConfirm({
      title: 'Delete Multiple Testimonials',
      message: `Are you sure you want to delete ${selectedTestimonials.length} selected testimonials? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete All',
      cancelText: 'Cancel',
    });
    
    if (!confirmed) return;

    try {
      for (const id of selectedTestimonials) {
        await deleteTestimonial(id);
      }
      
      setTestimonials(testimonials.filter(testimonial => 
        !selectedTestimonials.includes(testimonial.id)
      ));
      
      setSelectedTestimonials([]);
    } catch (err) {
      console.error('Error bulk deleting:', err);
      showCustomConfirm({
        title: 'Error',
        message: 'Failed to delete testimonials. Please try again.',
        type: 'danger',
        confirmText: 'OK',
        cancelText: null,
      });
    }
  };

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedTestimonials.length === filteredTestimonials.length) {
      setSelectedTestimonials([]);
    } else {
      setSelectedTestimonials(filteredTestimonials.map(t => t.id));
    }
  };

  const toggleSelectTestimonial = (id) => {
    setSelectedTestimonials(prev => 
      prev.includes(id)
        ? prev.filter(testimonialId => testimonialId !== id)
        : [...prev, id]
    );
  };

  // Filter testimonials
  const filteredTestimonials = testimonials.filter(testimonial => {
    // Status filter
    if (statusFilter !== 'all' && testimonial.status !== statusFilter) {
      return false;
    }
    
    // Featured filter
    if (featuredFilter === 'featured' && !testimonial.is_featured) {
      return false;
    }
    if (featuredFilter === 'not_featured' && testimonial.is_featured) {
      return false;
    }
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        testimonial.author_name?.toLowerCase().includes(searchLower) ||
        testimonial.quote?.toLowerCase().includes(searchLower) ||
        testimonial.author_role?.toLowerCase().includes(searchLower) ||
        testimonial.author_company?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Get counts for filters
  const stats = {
    total: testimonials.length,
    pending: testimonials.filter(t => t.status === 'pending').length,
    approved: testimonials.filter(t => t.status === 'approved').length,
    featured: testimonials.filter(t => t.is_featured).length,
    rejected: testimonials.filter(t => t.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="testimonial-loading">
        <div className="testimonial-loading-spinner"></div>
        <p>Loading testimonials...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="testimonial-error">
        <p className="testimonial-error-message">{error}</p>
        <button onClick={fetchTestimonials} className="testimonial-retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="testimonial-management">
      {/* Header with Add Button */}
      <div className="testimonial-header-actions">
        <div className="testimonial-header-content">
          <div className="testimonial-header">
            <h2>💬 Testimonials Management</h2>
            <p>Approve, feature, and manage user testimonials</p>
          </div>
        </div>
        <button 
          onClick={handleAddTestimonial}
          className="testimonial-add-button"
        >
          + Add Testimonial
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="testimonial-stats-cards">
        <div className="testimonial-stat-card">
          <span className="testimonial-stat-number">{stats.total}</span>
          <span className="testimonial-stat-label">Total</span>
        </div>
        <div className="testimonial-stat-card testimonial-pending">
          <span className="testimonial-stat-number">{stats.pending}</span>
          <span className="testimonial-stat-label">Pending</span>
        </div>
        <div className="testimonial-stat-card testimonial-approved">
          <span className="testimonial-stat-number">{stats.approved}</span>
          <span className="testimonial-stat-label">Approved</span>
        </div>
        <div className="testimonial-stat-card testimonial-featured">
          <span className="testimonial-stat-number">{stats.featured}</span>
          <span className="testimonial-stat-label">Featured</span>
        </div>
      </div>

      {/* Controls */}
      <div className="testimonial-controls-bar">
        <div className="testimonial-search-box">
          <input
            type="text"
            placeholder="Search testimonials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="testimonial-search-input"
          />
          <span className="testimonial-search-icon">🔍</span>
        </div>

        <div className="testimonial-filter-controls">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="testimonial-filter-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="featured">Featured</option>
            <option value="rejected">Rejected</option>
          </select>

          <select 
            value={featuredFilter} 
            onChange={(e) => setFeaturedFilter(e.target.value)}
            className="testimonial-filter-select"
          >
            <option value="all">All Featured</option>
            <option value="featured">Featured Only</option>
            <option value="not_featured">Not Featured</option>
          </select>

          <button 
            onClick={fetchTestimonials} 
            className="testimonial-refresh-button"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedTestimonials.length > 0 && (
        <div className="testimonial-bulk-actions">
          <div className="testimonial-bulk-info">
            <span className="testimonial-selected-count">
              {selectedTestimonials.length} selected
            </span>
          </div>
          <div className="testimonial-bulk-buttons">
            <button 
              onClick={handleBulkApprove}
              className="testimonial-bulk-button testimonial-approve-button"
            >
              Approve Selected
            </button>
            <button 
              onClick={handleBulkFeature}
              className="testimonial-bulk-button testimonial-feature-button"
            >
              Feature Selected
            </button>
            <button 
              onClick={handleBulkDelete}
              className="testimonial-bulk-button testimonial-delete-button"
            >
              Delete Selected
            </button>
            <button 
              onClick={() => setSelectedTestimonials([])}
              className="testimonial-bulk-button testimonial-cancel-button"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Testimonials Table */}
      <div className="testimonial-table-container">
        <table className="testimonial-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedTestimonials.length === filteredTestimonials.length && filteredTestimonials.length > 0}
                  onChange={toggleSelectAll}
                  className="testimonial-select-checkbox"
                />
              </th>
              <th>Author</th>
              <th>Testimonial</th>
              <th>Status</th>
              <th>Verified</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTestimonials.length === 0 ? (
              <tr>
                <td colSpan="7" className="testimonial-no-results">
                  No testimonials found
                </td>
              </tr>
            ) : (
              filteredTestimonials.map((testimonial) => (
                <tr key={testimonial.id} className="testimonial-row">
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedTestimonials.includes(testimonial.id)}
                      onChange={() => toggleSelectTestimonial(testimonial.id)}
                      className="testimonial-row-checkbox"
                    />
                  </td>
                  <td>
                    <div className="testimonial-author-cell">
                      <div className="testimonial-author-avatar-small">
                        {testimonial.photo_url ? (
                          <img 
                            src={testimonial.photo_url} 
                            alt={testimonial.author_name}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = 
                                `<div class="testimonial-avatar-placeholder">${testimonial.author_name?.charAt(0) || '?'}</div>`;
                            }}
                          />
                        ) : (
                          <div className="testimonial-avatar-placeholder">
                            {testimonial.author_name?.charAt(0) || '?'}
                          </div>
                        )}
                      </div>
                      <div className="testimonial-author-info">
                        <div className="testimonial-author-name">{testimonial.author_name}</div>
                        <div className="testimonial-author-details">
                          {testimonial.author_role}
                          {testimonial.author_company && ` • ${testimonial.author_company}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="testimonial-quote-cell">
                      <div className="testimonial-quote-text">
                        {testimonial.quote}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`testimonial-status-badge testimonial-status-${testimonial.status || 'pending'}`}>
                      {testimonial.status || 'pending'}
                      {testimonial.is_featured && ' ★'}
                    </span>
                  </td>
                  <td>
                    {testimonial.is_verified ? (
                      <span className="testimonial-verified-status">✓ Verified</span>
                    ) : (
                      <span className="testimonial-not-verified-status">Not Verified</span>
                    )}
                  </td>
                  <td>
                    {new Date(testimonial.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="testimonial-action-buttons">
                      <button
                        onClick={() => handleEditTestimonial(testimonial)}
                        className="testimonial-action-button testimonial-edit-button"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      
                      {testimonial.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(testimonial.id)}
                            className="testimonial-action-button testimonial-approve-button"
                            title="Approve"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => handleReject(testimonial.id)}
                            className="testimonial-action-button testimonial-reject-button"
                            title="Reject"
                          >
                            ✗
                          </button>
                        </>
                      )}
                      
                      {testimonial.status === 'approved' && !testimonial.is_featured && (
                        <button
                          onClick={() => handleFeature(testimonial.id)}
                          className="testimonial-action-button testimonial-feature-button"
                          title="Feature"
                        >
                          ⭐
                        </button>
                      )}
                      
                      {testimonial.is_featured && (
                        <button
                          onClick={() => handleUnfeature(testimonial.id)}
                          className="testimonial-action-button testimonial-unfeature-button"
                          title="Remove Featured"
                        >
                          ⭐
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDelete(testimonial.id)}
                        className="testimonial-action-button testimonial-delete-button"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="testimonial-table-footer">
        <div className="testimonial-footer-info">
          Showing {filteredTestimonials.length} of {testimonials.length} testimonials
        </div>
      </div>

      {/* Add/Edit Testimonial Modal */}
      {(showAddModal || showEditModal) && (
        <div className="testimonial-modal-overlay" onClick={handleCloseModal}>
          <div className="testimonial-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="testimonial-modal-header">
              <h3>{editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}</h3>
              <button onClick={handleCloseModal} className="testimonial-close-button">
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmitTestimonial}>
              <div className="testimonial-modal-body">
                {submitStatus && (
                  <div className={`testimonial-status-message testimonial-${submitStatus.type}`}>
                    {submitStatus.type === 'success' ? '✓' : '✗'}
                    {submitStatus.message}
                  </div>
                )}
                
                <div className="testimonial-form-group">
                  <label htmlFor="quote">Testimonial Quote *</label>
                  <textarea
                    id="quote"
                    name="quote"
                    value={newTestimonial.quote}
                    onChange={handleInputChange}
                    className="testimonial-form-control"
                    placeholder="Enter the testimonial quote..."
                    required
                    maxLength="500"
                  />
                  <div className="testimonial-form-hint">
                    Maximum 500 characters. {newTestimonial.quote.length}/500
                  </div>
                </div>
                
                <div className="testimonial-form-row">
                  <div className="testimonial-form-group">
                    <label htmlFor="author_name">Author Name *</label>
                    <input
                      type="text"
                      id="author_name"
                      name="author_name"
                      value={newTestimonial.author_name}
                      onChange={handleInputChange}
                      className="testimonial-form-control"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  
                  <div className="testimonial-form-group">
                    <label htmlFor="author_role">Role/Position</label>
                    <input
                      type="text"
                      id="author_role"
                      name="author_role"
                      value={newTestimonial.author_role}
                      onChange={handleInputChange}
                      className="testimonial-form-control"
                      placeholder="e.g., CEO, Developer, Student"
                    />
                  </div>
                </div>
                
                <div className="testimonial-form-group">
                  <label htmlFor="author_company">Company/Organization</label>
                  <input
                    type="text"
                    id="author_company"
                    name="author_company"
                    value={newTestimonial.author_company}
                    onChange={handleInputChange}
                    className="testimonial-form-control"
                    placeholder="e.g., Google, University of..."
                  />
                </div>
                
                {/* File Upload Section */}
                <div className="testimonial-form-group">
                  <label>Profile Photo (Optional)</label>
                  
                  <div className="testimonial-file-upload-wrapper">
                    {/* Hidden file input */}
                    <input
                      type="file"
                      id="author_photo"
                      ref={fileInputRef}
                      onChange={handlePhotoChange}
                      className="testimonial-file-input-hidden"
                      accept="image/*"
                    />
                    
                    {/* Custom file upload button */}
                    <label htmlFor="author_photo" className="testimonial-file-upload-label">
                      <div className="testimonial-file-upload-text">
                        <strong>Click to upload</strong> or drag and drop
                      </div>
                      <div className="testimonial-file-upload-text" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        JPG, PNG, or WebP (Recommended: 150×150px)
                      </div>
                    </label>
                    
                    {/* Show file info when selected */}
                    {photoFile && (
                      <div className="testimonial-file-info">
                        <div className="testimonial-file-icon">📷</div>
                        <div className="testimonial-file-details">
                          <div className="testimonial-file-name">{photoFile.name}</div>
                          <div className="testimonial-file-size">
                            {(photoFile.size / 1024).toFixed(1)} KB
                          </div>
                        </div>
                        <button 
                          type="button" 
                          onClick={handleRemovePhoto}
                          className="testimonial-remove-file-btn"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Photo Preview */}
                  {photoPreview && (
                    <div className="testimonial-photo-preview">
                      <div className="testimonial-photo-preview-title">Preview</div>
                      <img src={photoPreview} alt="Profile preview" />
                    </div>
                  )}
                  
                  <div className="testimonial-form-hint">
                    Square photos work best. Maximum file size: 5MB
                    {editingTestimonial?.photo_url && " (Leave empty to keep current photo)"}
                  </div>
                </div>
                
                <div className="testimonial-form-group">
                  <div className="testimonial-checkbox-group">
                    <input
                      type="checkbox"
                      id="is_verified"
                      name="is_verified"
                      checked={newTestimonial.is_verified}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="is_verified">Mark as Verified</label>
                  </div>
                  <div className="testimonial-form-hint">
                    Verified testimonials show a checkmark next to the author's name
                  </div>
                </div>
                
                <div className="testimonial-form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={newTestimonial.status}
                    onChange={handleInputChange}
                    className="testimonial-form-control"
                  >
                    <option value="pending">Pending Review</option>
                    <option value="approved">Approved</option>
                    <option value="featured">Featured</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
              
              <div className="testimonial-modal-footer">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="testimonial-cancel-button"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="testimonial-submit-button"
                  disabled={submitting}
                >
                  {submitting 
                    ? (editingTestimonial ? 'Updating...' : 'Adding...') 
                    : (editingTestimonial ? 'Update Testimonial' : 'Add Testimonial')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Popup */}
      {showConfirm && (
        <div className="testimonial-confirm-overlay" onClick={() => confirmConfig.onCancel?.()}>
          <div className="testimonial-confirm-popup" onClick={(e) => e.stopPropagation()}>
            <div className="testimonial-confirm-header">
              <div className={`testimonial-confirm-icon testimonial-${confirmConfig.type}`}>
                {confirmConfig.type === 'danger' ? '🗑️' : 
                 confirmConfig.type === 'success' ? '✓' : '⚠️'}
              </div>
              <h3 className="testimonial-confirm-title">{confirmConfig.title}</h3>
            </div>
            <div className="testimonial-confirm-body">
              {confirmConfig.message}
            </div>
            <div className="testimonial-confirm-actions">
              {confirmConfig.cancelText && (
                <button 
                  onClick={confirmConfig.onCancel}
                  className="testimonial-confirm-button testimonial-cancel"
                >
                  {confirmConfig.cancelText}
                </button>
              )}
              <button 
                onClick={confirmConfig.onConfirm}
                className={`testimonial-confirm-button testimonial-${confirmConfig.type}`}
              >
                {confirmConfig.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialsManagement;